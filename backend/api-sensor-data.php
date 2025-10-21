<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Untuk development, ganti domain di production
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===== PostgreSQL Configuration =====
$host = 'localhost';
$port = '5432';
$dbname = 'smartpot';
$user = 'postgres';
$password = 'lisha';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $orchid_id = isset($_GET['orchid_id']) ? intval($_GET['orchid_id']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    $action = $_GET['action'] ?? 'latest';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        // ===== Data Terbaru =====
        if ($action === 'latest') {
            $stmt = $pdo->prepare("
                SELECT 
                    temperature,
                    humidity,
                    light_intensity,
                    soil_moisture,
                    timestamp
                FROM sensordata 
                WHERE orchid_id = :orchid_id
                ORDER BY timestamp DESC
                LIMIT 1
            ");
            $stmt->bindParam(':orchid_id', $orchid_id, PDO::PARAM_INT);
            $stmt->execute();
            $latestData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($latestData) {
                // Sesuaikan nama properti dengan interface React
                $latestData['lastWatering'] = '2 jam yang lalu'; // placeholder
                $latestData['connectionStatus'] = 'Connected';

                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'data' => [$latestData] // React mengharapkan array
                    ]
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No data found for orchid_id: ' . $orchid_id
                ]);
            }
        } 

        // ===== Data Historis =====
        elseif ($action === 'historical') {
            $hours = isset($_GET['hours']) ? intval($_GET['hours']) : 24;
            $stmt = $pdo->prepare("
                SELECT 
                    timestamp,
                    temperature,
                    humidity,
                    light_intensity,
                    soil_moisture
                FROM sensordata
                WHERE orchid_id = :orchid_id
                AND timestamp >= NOW() - INTERVAL '$hours hours'
                ORDER BY timestamp ASC
            ");
            $stmt->bindParam(':orchid_id', $orchid_id, PDO::PARAM_INT);
            $stmt->execute();
            $historicalData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $labels = [];
            $temperature = [];
            $humidity = [];
            $light_intensity = [];
            $soil_moisture = [];

            foreach ($historicalData as $row) {
                $labels[] = date('H:i', strtotime($row['timestamp']));
                $temperature[] = floatval($row['temperature']);
                $humidity[] = floatval($row['humidity']);
                $light_intensity[] = floatval($row['light_intensity']);
                $soil_moisture[] = floatval($row['soil_moisture']);
            }

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'labels' => $labels,
                    'temperature' => $temperature,
                    'humidity' => $humidity,
                    'light_intensity' => $light_intensity,
                    'soil_moisture' => $soil_moisture
                ]
            ]);
        } 

        else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid action'
            ]);
        }

    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
