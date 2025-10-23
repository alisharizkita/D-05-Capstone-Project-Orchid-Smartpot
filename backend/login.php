<?php
// backend/api/login.php
require_once 'config.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, null, 'Method not allowed', 405);
}

$input = getJsonInput();

// Validate Input
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    sendResponse(false, null, 'Username dan password harus diisi', 400);
}

try {
    $pdo = getDBConnection();
    
    // Find user by username or email
    $stmt = $pdo->prepare("
        SELECT id, username, email, password, is_active 
        FROM users 
        WHERE username = ? OR email = ?
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(false, null, 'Username atau password salah', 401);
    }
    
    if (!$user['is_active']) {
        sendResponse(false, null, 'Akun tidak aktif', 403);
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendResponse(false, null, 'Username atau password salah', 401);
    }
    
    // Update last login
    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Generate token
    $token = generateToken($user['id'], $user['username']);
    
    sendResponse(true, [
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ],
        'token' => $token,
        'message' => 'Login berhasil'
    ]);
    
} catch(PDOException $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
}
?>