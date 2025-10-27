<?php
// public/index.php
declare(strict_types=1);

// Basic CORS + headers (sesuaikan origin di production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE,PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$post_paths = ['/users/register', '/users/login'];
$current_uri = $_SERVER['REQUEST_URI'];
$current_method = $_SERVER['REQUEST_METHOD'];

// Lakukan override dari GET ke POST jika path POST yang dicurigai ditemukan
foreach ($post_paths as $path) {
    // strpos() mencari '/users/register' atau '/users/login' di dalam URI Lengkap
    if ($current_method === 'GET' && strpos($current_uri, $path) !== false) {
        
        // Secara paksa ganti metode HTTP
        $_SERVER['REQUEST_METHOD'] = 'POST';
        break; // Hentikan loop setelah ditemukan
    }
}
// simple autoload (jika kamu sudah pakai composer, gunakan autoload composer)
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/../src/controllers/' . $class . '.php',
        __DIR__ . '/../src/models/' . $class . '.php',
        __DIR__ . '/../src/config/' . $class . '.php',
        __DIR__ . '/../src/helpers/' . $class . '.php',
        __DIR__ . '/../src/' . $class . '.php',
        __DIR__ . '/../backend/src/controllers/' . $class . '.php', // fallback (jika struktur lama)
        __DIR__ . '/../backend/src/models/' . $class . '.php',
        __DIR__ . '/../backend/src/config/' . $class . '.php',
    ];
    foreach ($paths as $p) {
        if (file_exists($p)) {
            require_once $p;
            return;
        }
    }
});

// load Database (pastikan file path sesuai)
try {
    // file Database.php harus define class Database dengan method getConnection()
    require_once __DIR__ . '/../src/config/Database.php';
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

// load helper Response
require_once __DIR__ . '/../src/helpers/Response.php';
require_once __DIR__ . '/../src/routes/Router.php';

// instantiate router and dispatch
$router = new Router($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD'], $db);
$response = $router->dispatch();

// output response (should already be an array)
if (is_array($response)) {
    echo json_encode($response, JSON_PRETTY_PRINT);
} else {
    // fallback
    echo json_encode(["status" => "error", "message" => "Invalid response from router"]);
}
