<?php
// backend/api/register.php
require_once 'config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Method not allowed', 405);
}

$input = getJsonInput();

// Validate Input
$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$phone = trim($input['phone'] ?? ''); // Optional

if (empty($username) || empty($email) || empty($password)) {
    sendResponse(false, null, 'Username, email, dan password harus diisi', 400);
}

// Validate Username
if (strlen($username) < 3) {
    sendResponse(false, null, 'Username minimal 3 karakter', 400);
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    sendResponse(false, null, 'Username hanya boleh huruf, angka, dan underscore', 400);
}

// Validate Email
if (!isValidEmail($email)) {
    sendResponse(false, null, 'Format email tidak valid', 400);
}

// Validate Password
if (strlen($password) < 6) {
    sendResponse(false, null, 'Password minimal 6 karakter', 400);
}

try {
    $pdo = getDBConnection();
    
    // Check if username exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendResponse(false, null, 'Username sudah digunakan', 400);
    }
    
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendResponse(false, null, 'Email sudah terdaftar', 400);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, phone) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$username, $email, $hashedPassword, $phone]);
    
    $userId = $pdo->lastInsertId();
    
    sendResponse(true, [
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email
        ],
        'message' => 'Registrasi berhasil'
    ]);
    
} catch(PDOException $e) {
    error_log('Register error: ' . $e->getMessage());
    sendResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
?>