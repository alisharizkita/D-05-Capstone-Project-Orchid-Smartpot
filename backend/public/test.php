<?php
echo "PHP is working!<br>";

require_once __DIR__ . '/../src/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    echo "Database connected!<br>";
    
    // Test query
    $stmt = $conn->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Total users: " . $count;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}