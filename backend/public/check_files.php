<?php
$files = [
    'Database' => __DIR__ . '/../src/config/Database.php',
    'User Model' => __DIR__ . '/../src/models/User.php',
    'UserController' => __DIR__ . '/../src/controllers/UserController.php',
    'Response' => __DIR__ . '/../src/helpers/Response.php',
    'Router' => __DIR__ . '/../src/routes/Router.php',
    'JWT Config' => __DIR__ . '/../src/config/jwt_config.php',
];

echo "<h3>File Check:</h3>";
foreach ($files as $name => $path) {
    $exists = file_exists($path) ? '✅ EXISTS' : '❌ MISSING';
    echo "$name: $exists<br>Path: $path<br><br>";
}