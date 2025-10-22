<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing Router...<br><br>";

require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/helpers/Response.php';
require_once __DIR__ . '/../src/routes/Router.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    echo "✅ Database connected<br>";
    
    // Test router with /users
    $router = new Router('/users', 'GET', $db);
    echo "✅ Router instantiated<br>";
    
    $response = $router->dispatch();
    echo "✅ Router dispatched<br><br>";
    
    echo "<pre>";
    print_r($response);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}