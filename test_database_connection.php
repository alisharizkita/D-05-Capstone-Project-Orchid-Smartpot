<?php
// =============================================
// File: test_database_connection.php
// FILE TERPISAH UNTUK TEST KONEKSI DATABASE
// Simpan di root folder project
// =============================================

require_once 'backend/api/config/database.php';

echo "<h2>🔍 Testing Database Connection</h2>";
echo "<hr>";

$database = new Database();

// Test basic connection
echo "<h3>📡 Connection Test:</h3>";
$test_result = $database->testConnection();

if ($test_result['status'] === 'success') {
    echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px;'>";
    echo "<strong>✅ " . $test_result['message'] . "</strong><br>";
    echo "PostgreSQL Version: " . $test_result['postgresql_version'] . "<br>";
    echo "Database: " . $test_result['database_name'] . "<br>";
    echo "Host: " . $test_result['host'] . ":" . $test_result['port'];
    echo "</div>";
    
    // Test database stats
    echo "<h3>📊 Database Statistics:</h3>";
    $stats = $database->getDatabaseStats();
    
    if ($stats['status'] === 'success') {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
        echo "<tr><th>Table Name</th><th>Record Count</th></tr>";
        
        foreach ($stats['statistics'] as $table => $count) {
            echo "<tr>";
            echo "<td><strong>" . ucfirst($table) . "</strong></td>";
            echo "<td>$count records</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;'>";
        echo "❌ " . $stats['message'];
        echo "</div>";
    }
    
    // Test sample queries
    echo "<h3>🔍 Sample Data Preview:</h3>";
    
    try {
        $conn = $database->getConnection();
        
        // Get all users
        $stmt = $conn->query("SELECT user_id, username, email FROM users LIMIT 3");
        $users = $stmt->fetchAll();
        
        if (count($users) > 0) {
            echo "<h4>👥 Users:</h4>";
            echo "<ul>";
            foreach ($users as $user) {
                echo "<li>ID: {$user['user_id']} - {$user['username']} ({$user['email']})</li>";
            }
            echo "</ul>";
        }
        
        // Get orchids
        $stmt = $conn->query("
            SELECT o.orchid_name, o.orchid_type, u.username as owner 
            FROM orchid o 
            JOIN users u ON o.user_id = u.user_id 
            LIMIT 3
        ");
        $orchids = $stmt->fetchAll();
        
        if (count($orchids) > 0) {
            echo "<h4>🌺 Orchids:</h4>";
            echo "<ul>";
            foreach ($orchids as $orchid) {
                echo "<li>{$orchid['orchid_name']} ({$orchid['orchid_type']}) - Owner: {$orchid['owner']}</li>";
            }
            echo "</ul>";
        }
        
    } catch(Exception $e) {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;'>";
        echo "❌ Query Error: " . $e->getMessage();
        echo "</div>";
    }
    
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;'>";
    echo "<strong>❌ Database Connection Failed!</strong><br>";
    echo $test_result['message'];
    echo "</div>";
    
    echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 15px;'>";
    echo "<strong>🔧 Troubleshooting:</strong><br>";
    echo "1. Pastikan PostgreSQL service berjalan<br>";
    echo "2. Cek username/password di backend/api/config/database.php<br>";
    echo "3. Pastikan database 'smart_pot_orchid' sudah dibuat<br>";
    echo "4. Test manual: <code>psql -U postgres -h localhost smart_pot_orchid</code>";
    echo "</div>";
}
?>