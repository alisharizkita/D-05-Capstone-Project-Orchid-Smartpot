<?php
// =============================================
// File: backend/api/config/config.php
// FILE TERPISAH UNTUK HELPER FUNCTIONS
// =============================================

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Asia/Jakarta');

// CORS Headers for API
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=UTF-8');
}

// Response helper function
function sendJsonResponse($data, $http_code = 200) {
    http_response_code($http_code);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Error handler for API
function handleApiError($message, $code = 500) {
    sendJsonResponse([
        'status' => 'error',
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'code' => $code
    ], $code);
}

// Success response helper
function sendSuccess($data = null, $message = 'Success') {
    $response = [
        'status' => 'success',
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    sendJsonResponse($response);
}

// Validation helper
function validateRequired($data, $required_fields) {
    $missing = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    return $missing;
}

// Sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}

// Log function
function logActivity($message, $level = 'INFO') {
    $log_file = __DIR__ . '/../logs/' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
    
    // Create logs directory if not exists
    $log_dir = dirname($log_file);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);
}

// Security: Generate secure password hash
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Security: Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate UUID for unique identifiers
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// =============================================
// Constants untuk aplikasi
// =============================================

// Alert levels
define('ALERT_INFO', 'info');
define('ALERT_WARNING', 'warning'); 
define('ALERT_CRITICAL', 'critical');
define('ALERT_EMERGENCY', 'emergency');

// Watering status
define('WATERING_PENDING', 'pending');
define('WATERING_COMPLETED', 'completed');
define('WATERING_FAILED', 'failed');
define('WATERING_SCHEDULED', 'scheduled');

// Trigger types
define('TRIGGER_MANUAL', 'manual');
define('TRIGGER_AUTO_MOISTURE', 'auto_moisture');
define('TRIGGER_AUTO_SCHEDULE', 'auto_schedule');
define('TRIGGER_EMERGENCY', 'emergency');

// Default thresholds (bisa di-override per orchid)
define('DEFAULT_MIN_MOISTURE', 40.0);
define('DEFAULT_MAX_MOISTURE', 70.0);
define('DEFAULT_MIN_TEMPERATURE', 18.0);
define('DEFAULT_MAX_TEMPERATURE', 35.0);
define('DEFAULT_MIN_WATER_LEVEL', 20.0);
define('DEFAULT_MIN_LIGHT', 500);
define('DEFAULT_MAX_LIGHT', 3000);
?>