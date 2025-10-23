<?php
require_once 'config.php';

setCorsHeaders();

sendResponse(true, [
    'message' => 'Backend is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        'login' => '/api/login.php',
        'register' => '/api/register.php',
        'test' => '/api/test.php'
    ]
]);
?>