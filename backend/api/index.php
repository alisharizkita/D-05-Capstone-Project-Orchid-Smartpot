<?php
// =============================================
// File: backend/api/index.php
// Router utama untuk API SmartPot - Minimal Version
// =============================================

// Headers untuk API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Autoload class (atau bisa require manual kalau belum pakai composer)
require_once __DIR__ . "/config/Database.php";
require_once __DIR__ . "/models/Sensor.php";
require_once __DIR__ . "/controllers/SensorController.php";

// Simple routing
$request_method = $_SERVER["REQUEST_METHOD"];
$uri = explode("/", trim($_SERVER["REQUEST_URI"], "/"));

// DEBUG: Tampilin URI untuk debugging
echo json_encode(["debug_uri" => $uri, "count" => count($uri)]);

// ==========================
// SENSORS ENDPOINT (COPY EXACT dari yang berhasil)
// ==========================
if (count($uri) >= 2 && $uri[1] === "sensors") {
    $sensorController = new SensorController();
    
    // Endpoint handling
    switch ($request_method) {
        case "GET":
            // /api/sensors
            if (count($uri) === 2) {
                $response = $sensorController->getAllSensors();
            }
            // /api/sensors/{orchid_id}
            elseif (count($uri) === 3 && is_numeric($uri[2])) {
                $response = $sensorController->getLatestByOrchid((int)$uri[2]);
            }
            // /api/sensors/{orchid_id}/chart?hours=48
            elseif (count($uri) === 4 && $uri[3] === "chart" && is_numeric($uri[2])) {
                $hours = isset($_GET['hours']) ? (int)$_GET['hours'] : 24;
                $response = $sensorController->getChartData((int)$uri[2], $hours);
            }
            else {
                http_response_code(404);
                $response = [
                    "status" => "error",
                    "message" => "Invalid GET endpoint"
                ];
            }
            break;
        case "POST":
            // /api/sensors
            if (count($uri) === 2) {
                $data = json_decode(file_get_contents("php://input"), true);
                $response = $sensorController->createSensorReading($data);
            } else {
                http_response_code(404);
                $response = [
                    "status" => "error",
                    "message" => "Invalid POST endpoint"
                ];
            }
            break;
        default:
            http_response_code(405);
            $response = [
                "status" => "error",
                "message" => "Method not allowed"
            ];
            break;
    }
}

// ==========================  
// USERS ENDPOINT (Pattern yang sama)
// ==========================
elseif (count($uri) >= 2 && $uri[1] === "users") {
    // Cek apakah file Users controller ada
    if (file_exists(__DIR__ . "/models/Users.php") && file_exists(__DIR__ . "/controllers/UserController.php")) {
        require_once __DIR__ . "/models/Users.php";
        require_once __DIR__ . "/controllers/UserController.php";
        
        $database = new Database();
        $db = $database->connect();
        $userController = new UserController($db);
        
        switch ($request_method) {
            case "GET":
                // /api/users/{id}
                if (count($uri) === 3 && is_numeric($uri[2])) {
                    $response = $userController->getProfile((int)$uri[2]);
                } else {
                    http_response_code(404);
                    $response = ["status" => "error", "message" => "Invalid GET endpoint for users"];
                }
                break;
                
            case "POST":
                // /api/users/register
                if (count($uri) === 3 && $uri[2] === "register") {
                    $data = json_decode(file_get_contents("php://input"), true);
                    $response = $userController->register($data);
                }
                // /api/users/login
                elseif (count($uri) === 3 && $uri[2] === "login") {
                    $data = json_decode(file_get_contents("php://input"), true);
                    $response = $userController->login($data);
                } else {
                    http_response_code(404);
                    $response = ["status" => "error", "message" => "Invalid POST endpoint for users"];
                }
                break;
                
            default:
                http_response_code(405);
                $response = ["status" => "error", "message" => "Method not allowed for users"];
                break;
        }
    } else {
        $response = [
            "status" => "info",
            "message" => "Users endpoint available but controllers not implemented yet",
            "required_files" => [
                "models/Users.php",
                "controllers/UserController.php"
            ]
        ];
    }
}

// ==========================
// TEST ENDPOINTS untuk development
// ==========================
elseif (count($uri) >= 2 && $uri[1] === "orchids") {
    $response = [
        "status" => "ok", 
        "message" => "Orchids endpoint reached - ready for implementation",
        "uri_debug" => $uri
    ];
}
elseif (count($uri) >= 2 && $uri[1] === "wateringhistory") {
    $response = [
        "status" => "ok",
        "message" => "Watering history endpoint reached - ready for implementation", 
        "uri_debug" => $uri
    ];
}

// ==========================
// INVALID ENDPOINT
// ==========================
else {
    http_response_code(404);
    $response = [
        "status" => "error",
        "message" => "Invalid endpoint",
        "debug" => [
            "uri_received" => $uri,
            "uri_count" => count($uri),
            "request_method" => $request_method,
            "request_uri" => $_SERVER["REQUEST_URI"]
        ],
        "available_endpoints" => [
            "sensors" => "GET/POST /api/sensors",
            "users" => "GET/POST /api/users (if implemented)",
            "orchids" => "GET /api/orchids (test endpoint)",
            "wateringhistory" => "GET /api/wateringhistory (test endpoint)"
        ]
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>