<?php
// plants.php - API untuk mengelola tanaman (CRUD) - Versi PostgreSQL
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- PERBAIKAN: Konfigurasi Database untuk PostgreSQL ---
$host = 'localhost';
$port = '5432'; // Port default PostgreSQL
$dbname = 'smartpot'; // Nama database PostgreSQL Anda
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
    case 'PUT':
        handlePut($pdo);
        break;
    case 'DELETE':
        handleDelete($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}

// GET: Ambil daftar tanaman atau detail satu tanaman
function handleGet($pdo) {
    try {
        if (isset($_GET['id'])) {
            // Get single plant detail
            $plantId = $_GET['id'];
            
            // --- PERBAIKAN: Query diubah menggunakan LATERAL JOIN untuk efisiensi ---
            $stmt = $pdo->prepare("
                SELECT 
                    p.*,
                    ps.temp_min, ps.temp_max, ps.humidity_min, ps.humidity_max, 
                    ps.soil_moisture_min, ps.soil_moisture_max, ps.light_min, ps.light_max,
                    sd.temperature,
                    sd.humidity,
                    sd.light_intensity,
                    sd.soil_moisture,
                    sd.water_level,
                    sd.timestamp as last_update,
                    CASE 
                        WHEN sd.water_level < 20 THEN 'critical'
                        WHEN sd.water_level < 50 OR sd.temperature < ps.temp_min OR sd.temperature > ps.temp_max THEN 'warning'
                        ELSE 'healthy'
                    END as status
                FROM plants p
                LEFT JOIN plant_settings ps ON p.id = ps.plant_id
                LEFT JOIN LATERAL (
                    SELECT * FROM sensor_data 
                    WHERE plant_id = p.id 
                    ORDER BY timestamp DESC 
                    LIMIT 1
                ) sd ON true
                WHERE p.id = ?
            ");
            // --- AKHIR PERBAIKAN ---
            
            $stmt->execute([$plantId]);
            $plant = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($plant) {
                echo json_encode([
                    'status' => 'success',
                    'data' => $plant
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Plant not found'
                ]);
            }
            
        } elseif (isset($_GET['user_id'])) {
            // Get all plants for a user
            $userId = $_GET['user_id'];
            
            // --- PERBAIKAN: Query diubah menggunakan LATERAL JOIN untuk efisiensi ---
            $stmt = $pdo->prepare("
                SELECT 
                    p.id, p.plant_name, p.plant_type, p.device_id,
                    sd.temperature,
                    sd.humidity,
                    sd.water_level,
                    sd.timestamp as last_update,
                    CASE 
                        WHEN sd.water_level < 20 THEN 'critical'
                        WHEN sd.water_level < 50 OR sd.temperature < ps.temp_min OR sd.temperature > ps.temp_max THEN 'warning'
                        ELSE 'healthy'
                    END as status
                FROM plants p
                LEFT JOIN plant_settings ps ON p.id = ps.plant_id
                LEFT JOIN LATERAL (
                    SELECT * FROM sensor_data 
                    WHERE plant_id = p.id 
                    ORDER BY timestamp DESC 
                    LIMIT 1
                ) sd ON true
                WHERE p.user_id = ?
                ORDER BY p.created_at DESC
            ");
            // --- AKHIR PERBAIKAN ---

            $stmt->execute([$userId]);
            $plants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'status' => 'success',
                'data' => $plants,
                'count' => count($plants)
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing required parameter: user_id or id'
            ]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

// POST: Tambah tanaman baru
function handlePost($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validasi input
        if (!isset($input['user_id']) || !isset($input['plant_name']) || 
            !isset($input['plant_type']) || !isset($input['device_id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing required fields: user_id, plant_name, plant_type, device_id'
            ]);
            return;
        }
        
        // Cek apakah device_id sudah digunakan
        $stmt = $pdo->prepare("SELECT id FROM plants WHERE device_id = ?");
        $stmt->execute([$input['device_id']]);
        if ($stmt->fetch()) {
            http_response_code(409); // Conflict
            echo json_encode([
                'status' => 'error',
                'message' => 'Device ID already in use'
            ]);
            return;
        }
        
        // Insert new plant
        // --- PERBAIKAN: Menghapus `created_at` dan `NOW()` agar menggunakan DEFAULT DARI PostgreSQL ---
        $stmt = $pdo->prepare("
            INSERT INTO plants (user_id, plant_name, plant_type, device_id, location, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['user_id'],
            $input['plant_name'],
            $input['plant_type'], // Tipe ENUM akan di-cast otomatis oleh PostgreSQL
            $input['device_id'],
            $input['location'] ?? null, // Menambahkan field opsional
            $input['notes'] ?? null      // Menambahkan field opsional
        ]);
        
        // --- PERBAIKAN: Mendapatkan ID terakhir menggunakan sequence PostgreSQL ---
        // Nama sequence default adalah nama_tabel_nama_kolom_id_seq
        $plantId = $pdo->lastInsertId('plants_id_seq');
        // --- AKHIR PERBAIKAN ---

        // Menambahkan pengaturan default untuk tanaman baru
        $settingStmt = $pdo->prepare("INSERT INTO plant_settings (plant_id) VALUES (?)");
        $settingStmt->execute([$plantId]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Plant added successfully with default settings',
            'plant_id' => $plantId
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

// PUT: Update data tanaman (Kode ini sebagian besar kompatibel)
function handlePut($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing required field: id'
            ]);
            return;
        }
        
        $plantId = $input['id'];
        
        // Build update query dynamically
        $updateFields = [];
        $params = [];
        
        if (isset($input['plant_name'])) {
            $updateFields[] = "plant_name = ?";
            $params[] = $input['plant_name'];
        }
        if (isset($input['plant_type'])) {
            $updateFields[] = "plant_type = ?";
            $params[] = $input['plant_type'];
        }
        if (isset($input['device_id'])) {
            $updateFields[] = "device_id = ?";
            $params[] = $input['device_id'];
        }
         if (isset($input['location'])) {
            $updateFields[] = "location = ?";
            $params[] = $input['location'];
        }
         if (isset($input['notes'])) {
            $updateFields[] = "notes = ?";
            $params[] = $input['notes'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'No fields to update'
            ]);
            return;
        }
        
        $params[] = $plantId;
        
        // Menambahkan updated_at secara manual
        $updateFields[] = "updated_at = NOW()";
        
        $query = "UPDATE plants SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Plant updated successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Plant not found or no changes made'
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

// DELETE: Hapus tanaman (Kode ini sudah kompatibel)
function handleDelete($pdo) {
    try {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Missing required parameter: id'
            ]);
            return;
        }
        
        $plantId = $_GET['id'];
        
        // Transaksi tidak diperlukan karena ON DELETE CASCADE sudah diatur di schema
        // $pdo->beginTransaction(); 
        
        // Skema Anda memiliki ON DELETE CASCADE, jadi kita hanya perlu menghapus dari tabel 'plants'
        // Tabel 'sensor_data', 'watering_history', 'alerts', 'plant_settings' akan terhapus otomatis.
        
        $stmt = $pdo->prepare("DELETE FROM plants WHERE id = ?");
        $stmt->execute([$plantId]);
        
        if ($stmt->rowCount() > 0) {
            // $pdo->commit();
            echo json_encode([
                'status' => 'success',
                'message' => 'Plant and all related data deleted successfully'
            ]);
        } else {
            // $pdo->rollBack();
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Plant not found'
            ]);
        }
        
    } catch(PDOException $e) {
        // if ($pdo->inTransaction()) {
        //     $pdo->rollBack();
        // }
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>
