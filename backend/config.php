<?php
// backend/api/config.php

// --- PERBAIKAN: Konfigurasi Database untuk PostgreSQL ---
define('DB_HOST', 'localhost');
define('DB_PORT', '5432'); // Port default PostgreSQL
define('DB_NAME', 'smartpot'); // Nama database PostgreSQL Anda
define('DB_USER', 'postgres'); // Username default PostgreSQL
define('DB_PASS', 'Bintangharry123'); // Password Anda

// CORS Headers
function setCorsHeaders() {
    // Ganti '*' dengan 'http://localhost:3000' saat produksi
    header("Access-Control-Allow-Origin: *"); 
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Database Connection
function getDBConnection() {
    try {
        // --- PERBAIKAN: Menggunakan string koneksi (DSN) untuk PostgreSQL ---
        $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
        $pdo = new PDO(
            $dsn,
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit();
    }
}

// Send JSON Response
function sendResponse($success, $data = null, $message = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Get JSON Input
function getJsonInput() {
    $json = file_get_contents('php://input');
    $decoded = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, null, 'Invalid JSON input', 400);
    }
    
    return $decoded;
}

// Validate Email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Generate Token
function generateToken($userId, $username) {
    return base64_encode($userId . ':' . $username . ':' . time() . ':' . bin2hex(random_bytes(16)));
}
?>
