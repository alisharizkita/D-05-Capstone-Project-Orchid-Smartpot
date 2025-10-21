<?php
// =============================================
// File: backend/api/config/database.php
// HANYA KODE INI SAJA YANG MASUK KE database.php
// =============================================

class Database {
    // Database credentials - SESUAIKAN DENGAN SETUP POSTGRESQL ANDA
    private $host = 'localhost';
    private $db_name = 'smartpot';
    private $username = 'postgres';
    private $password = 'lisha'; // GANTI DENGAN PASSWORD POSTGRESQL ANDA
    private $port = '5432';
    private $charset = 'utf8';
    
    public $conn;
    
    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            // PostgreSQL DSN (Data Source Name)
            $dsn = "pgsql:host=" . $this->host . 
                   ";port=" . $this->port . 
                   ";dbname=" . $this->db_name . 
                   ";options='--client_encoding=" . $this->charset . "'";
            
            // Create PDO connection
            $this->conn = new PDO($dsn, $this->username, $this->password);
            
            // Set PDO attributes
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
            // Set timezone (optional)
            $this->conn->exec("SET timezone = 'Asia/Jakarta'");
            
        } catch(PDOException $exception) {
            echo "Database connection error: " . $exception->getMessage();
            die();
        }
        
        return $this->conn;
    }
    
    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }
    
    /**
     * Test database connection
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            if ($conn) {
                // Test query
                $stmt = $conn->query("SELECT version()");
                $version = $stmt->fetchColumn();
                
                return [
                    'status' => 'success',
                    'message' => 'Database connected successfully!',
                    'postgresql_version' => $version,
                    'database_name' => $this->db_name,
                    'host' => $this->host,
                    'port' => $this->port
                ];
            }
        } catch(Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Database connection failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get database statistics
     */
    public function getDatabaseStats() {
        try {
            $conn = $this->getConnection();
            
            // Count records in each table
            $stats = [];
            $tables = ['users', 'orchid', 'wateringhistory', 'sensordata'];
            
            foreach ($tables as $table) {
                $stmt = $conn->query("SELECT COUNT(*) as count FROM {$table}");
                $stats[$table] = $stmt->fetchColumn();
            }
            
            return [
                'status' => 'success',
                'statistics' => $stats
            ];
            
        } catch(Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to get database stats: ' . $e->getMessage()
            ];
        }
    }
}
?>