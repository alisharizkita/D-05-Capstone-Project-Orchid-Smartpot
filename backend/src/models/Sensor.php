<?php
// =============================================
// File: backend/api/models/Sensor.php
// Model untuk sensor data (PostgreSQL)
// =============================================

class Sensor {
    private $conn;
    private $table_name = "sensordata";

    public $data_id;
    public $orchid_id;
    public $soil_moisture;
    public $temperature;
    public $humidity;
    public $water_level;
    public $light_intensity;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Ambil semua sensor data dengan join orchid
    public function getAllSensorData() {
        $query = "
            SELECT s.data_id, s.orchid_id, s.timestamp,
                   s.soil_moisture, s.temperature, s.humidity,
                   s.water_level, s.light_intensity,
                   o.orchid_name, o.orchid_type
            FROM {$this->table_name} s
            JOIN orchid o ON s.orchid_id = o.orchid_id
            ORDER BY s.timestamp DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Ambil data terbaru untuk orchid tertentu
    public function getLatestByOrchid($orchid_id) {
        $query = "
            SELECT s.data_id, s.orchid_id, s.timestamp,
                   s.soil_moisture, s.temperature, s.humidity,
                   s.water_level, s.light_intensity,
                   o.orchid_name, o.orchid_type,
                   o.min_moisture, o.max_moisture
            FROM {$this->table_name} s
            JOIN orchid o ON s.orchid_id = o.orchid_id
            WHERE s.orchid_id = :orchid_id
            ORDER BY s.timestamp DESC
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':orchid_id', $orchid_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // Insert sensor data baru
    public function create() {
        $query = "
            INSERT INTO {$this->table_name}
                (orchid_id, soil_moisture, temperature, humidity, water_level, light_intensity, timestamp)
            VALUES
                (:orchid_id, :soil_moisture, :temperature, :humidity, :water_level, :light_intensity, NOW())
            RETURNING data_id
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':orchid_id', $this->orchid_id, PDO::PARAM_INT);
        $stmt->bindParam(':soil_moisture', $this->soil_moisture);
        $stmt->bindParam(':temperature', $this->temperature);
        $stmt->bindParam(':humidity', $this->humidity);
        $stmt->bindParam(':water_level', $this->water_level);
        $stmt->bindParam(':light_intensity', $this->light_intensity, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->data_id = $result['data_id'];
            return true;
        }
        return false;
    }

    // Validasi data sensor (contoh sederhana)
    public function validateData() {
        $errors = [];
        if ($this->soil_moisture < 0 || $this->soil_moisture > 100) {
            $errors[] = "Soil moisture must be between 0 and 100";
        }
        if ($this->temperature < -10 || $this->temperature > 60) {
            $errors[] = "Temperature out of range";
        }
        if ($this->humidity < 0 || $this->humidity > 100) {
            $errors[] = "Humidity must be between 0 and 100";
        }
        if ($this->water_level < 0) {
            $errors[] = "Water level cannot be negative";
        }
        if ($this->light_intensity < 0) {
            $errors[] = "Light intensity cannot be negative";
        }
        return $errors;
    }

    // Cek apakah orchid ada
    public function orchidExists($orchid_id) {
        $query = "SELECT orchid_id FROM orchid WHERE orchid_id = :orchid_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':orchid_id', $orchid_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    // Ambil data chart berdasarkan jam
    public function getChartData($orchid_id, $hours) {
        $query = "
            SELECT 
                s.timestamp,
                TO_CHAR(s.timestamp, 'HH24:MI') as time_label,
                s.soil_moisture,
                s.temperature,
                s.humidity,
                s.water_level,
                s.light_intensity
            FROM {$this->table_name} s
            WHERE s.orchid_id = :orchid_id
            AND s.timestamp >= NOW() - (:hours || ' hours')::INTERVAL
            ORDER BY s.timestamp ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':orchid_id', $orchid_id, PDO::PARAM_INT);
        $stmt->bindValue(':hours', $hours, PDO::PARAM_STR); // pakai STR karena di-concat
        $stmt->execute();

        return $stmt;
    }

}
