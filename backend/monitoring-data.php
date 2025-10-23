<?php
// monitoring-data.php - API untuk mengambil data monitoring (Versi PostgreSQL)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- PERBAIKAN: Konfigurasi Database untuk PostgreSQL ---
$host = 'localhost';
$port = '5432'; // Port default PostgreSQL
$dbname = 'smartpot'; // Pastikan nama DB Anda benar
$username = 'postgres'; // Username default PostgreSQL
$password = 'Bintangharry123'; // GANTI DENGAN PASSWORD POSTGRESQL ANDA

try {
    // Menggunakan string koneksi (DSN) untuk PostgreSQL
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}
// --- AKHIR PERBAIKAN ---

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        handlePost($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}

// GET: Ambil data monitoring untuk plant tertentu
function handleGet($pdo) {
    try {
        if (!isset($_GET['plant_id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing required parameter: plant_id'
            ]);
            return;
        }
        
        $plantId = $_GET['plant_id'];
        
        // Cek apakah plant exists
        $stmt = $pdo->prepare("SELECT id, plant_name, plant_type FROM plants WHERE id = ?");
        $stmt->execute([$plantId]);
        $plant = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$plant) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Plant not found'
            ]);
            return;
        }
        
        // Get latest data
        // --- PERBAIKAN: Mengganti DATE_FORMAT dengan to_char ---
        $stmt = $pdo->prepare("
            SELECT 
                temperature,
                humidity,
                light_intensity,
                soil_moisture,
                water_level,
                timestamp,
                to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as lastWatering
            FROM sensor_data
            WHERE plant_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
        ");
        // --- AKHIR PERBAIKAN ---
        $stmt->execute([$plantId]);
        $latestData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$latestData) {
            // No sensor data yet, return dummy data
            $latestData = [
                'temperature' => 25.0,
                'humidity' => 70.0,
                'light_intensity' => 450,
                'soil_moisture' => 55.0,
                'water_level' => 80,
                'lastWatering' => date('Y-m-d H:i:s')
            ];
        }
        
        // Get historical data (last 24 hours)
        // --- PERBAIKAN: Mengganti DATE_FORMAT dan DATE_SUB ---
        $stmt = $pdo->prepare("
            SELECT 
                to_char(timestamp, 'HH24:MI') as time_label,
                temperature,
                humidity,
                light_intensity,
                soil_moisture
            FROM sensor_data
            WHERE plant_id = ? 
            AND timestamp >= NOW() - INTERVAL '24 hour'
            ORDER BY timestamp ASC
        ");
        // --- AKHIR PERBAIKAN ---
        $stmt->execute([$plantId]);
        $historyData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format historical data
        $labels = [];
        $tempData = [];
        $humidData = [];
        $lightData = [];
        $soilData = [];
        
        if (empty($historyData)) {
            // Generate dummy data if no history
            for ($i = 23; $i >= 0; $i--) {
                $time = date('H:i', strtotime("-$i hours"));
                $labels[] = $time;
                $tempData[] = 25 + (rand(-20, 20) / 10);
                $humidData[] = 70 + (rand(-50, 50) / 10);
                $lightData[] = 450 + rand(-50, 50);
                $soilData[] = 55 + (rand(-50, 50) / 10);
            }
        } else {
            foreach ($historyData as $row) {
                $labels[] = $row['time_label'];
                $tempData[] = floatval($row['temperature']);
                $humidData[] = floatval($row['humidity']);
                $lightData[] = intval($row['light_intensity']);
                $soilData[] = floatval($row['soil_moisture']);
            }
        }
        
        // Response
        echo json_encode([
            'status' => 'success',
            'data' => [
                'plant_info' => $plant,
                'latest' => $latestData,
                'history' => [
                    'labels' => $labels,
                    'datasets' => [
                        'temperature' => $tempData,
                        'humidity' => $humidData,
                        'light_intensity' => $lightData,
                        'soil_moisture' => $soilData
                    ]
                ]
            ]
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

// POST: Insert sensor data baru (dari IoT device)
function handlePost($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validasi input
        $requiredFields = ['plant_id', 'temperature', 'humidity', 'light_intensity', 'soil_moisture', 'water_level'];
        // ... (Logika validasi Anda tetap sama) ...
        
        // Alternatif: bisa juga pakai device_id untuk identifikasi
        if (isset($input['device_id']) && !isset($input['plant_id'])) {
            // ... (Logika lookup device_id Anda tetap sama) ...
        }
        
        // Insert sensor data
        // --- PERBAIKAN: NOW() valid di PostgreSQL, tidak perlu diubah ---
        $stmt = $pdo->prepare("
            INSERT INTO sensor_data 
            (plant_id, temperature, humidity, light_intensity, soil_moisture, water_level, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $input['plant_id'],
            $input['temperature'],
            $input['humidity'],
            $input['light_intensity'],
            $input['soil_moisture'],
            $input['water_level']
        ]);
        
        // --- PERBAIKAN: Mendapatkan ID terakhir menggunakan sequence PostgreSQL ---
        // Skema Anda menggunakan 'id BIGSERIAL', sequence-nya adalah 'sensor_data_id_seq'
        $dataId = $pdo->lastInsertId('sensor_data_id_seq');
        // --- AKHIR PERBAIKAN ---

        echo json_encode([
            'status' => 'success',
            'message' => 'Sensor data recorded successfully',
            'data_id' => $dataId
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>

