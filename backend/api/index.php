<?php
// =============================================
// File: backend/api/index.php
// Front Controller API (sensors, users, orchids, wateringhistory)
// =============================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Require Database
require_once __DIR__ . "/config/Database.php";

// Require Models & Controllers
require_once __DIR__ . "/models/Sensor.php";
require_once __DIR__ . "/controllers/SensorController.php";

require_once __DIR__ . "/models/Users.php";
require_once __DIR__ . "/controllers/UserController.php";

require_once __DIR__ . "/models/Orchid.php";
require_once __DIR__ . "/controllers/OrchidController.php";

require_once __DIR__ . "/models/WateringHistory.php";
require_once __DIR__ . "/controllers/WateringController.php";

// Koneksi DB
$database = new Database();
$db = $database->connect();

// Simple routing
$request_method = $_SERVER["REQUEST_METHOD"];
$uri = explode("/", trim($_SERVER["REQUEST_URI"], "/"));

// URI segments: ["backend", "api", "sensors", "1"]
// Jadi resource ada di index 2, bukan index 1!

// ==========================
// Routing untuk setiap resource
// ==========================

// SENSORS - cek $uri[2] bukan $uri[1]
if (count($uri) >= 3 && $uri[2] === "sensors") {
    $sensorController = new SensorController();

    switch ($request_method) {
        case "GET":
            // /backend/api/sensors
            if (count($uri) === 3) {
                $response = $sensorController->getAllSensors();
            }
            // /backend/api/sensors/{orchid_id}
            elseif (count($uri) === 4 && is_numeric($uri[3])) {
                $response = $sensorController->getLatestByOrchid((int)$uri[3]);
            }
            // /backend/api/sensors/{orchid_id}/chart?hours=48
            elseif (count($uri) === 5 && $uri[4] === "chart" && is_numeric($uri[3])) {
                $hours = isset($_GET['hours']) ? (int)$_GET['hours'] : 24;
                $response = $sensorController->getChartData((int)$uri[3], $hours);
            }
            else {
                http_response_code(404);
                $response = ["status" => "error", "message" => "Invalid GET endpoint for sensors"];
            }
            break;

        case "POST":
            // /backend/api/sensors
            if (count($uri) === 3) {
                $data = json_decode(file_get_contents("php://input"), true);
                $response = $sensorController->createSensorReading($data);
            } else {
                http_response_code(404);
                $response = ["status" => "error", "message" => "Invalid POST endpoint for sensors"];
            }
            break;

        default:
            http_response_code(405);
            $response = ["status" => "error", "message" => "Method not allowed for sensors"];
            break;
    }
}

// USERS - cek $uri[2] bukan $uri[1]
elseif (count($uri) >= 3 && $uri[2] === "users") {
    $userController = new UserController($db);

    switch ($request_method) {
        case "POST":
            // /backend/api/users/register
            if (count($uri) === 4 && $uri[3] === "register") {
                $data = json_decode(file_get_contents("php://input"), true);
                $response = $userController->register($data);
            }
            // /backend/api/users/login
            elseif (count($uri) === 4 && $uri[3] === "login") {
                $data = json_decode(file_get_contents("php://input"), true);
                $response = $userController->login($data);
            }
            else {
                http_response_code(404);
                $response = ["status" => "error", "message" => "Invalid POST endpoint for users"];
            }
            break;

        case "GET":
            // /backend/api/users/{id}
            if (count($uri) === 4 && is_numeric($uri[3])) {
                $response = $userController->getProfile((int)$uri[3]);
            }
            else {
                http_response_code(404);
                $response = ["status" => "error", "message" => "Invalid GET endpoint for users"];
            }
            break;

        case "PUT":
            // /backend/api/users/{id}
            if (count($uri) === 4 && is_numeric($uri[3])) {
                $data = json_decode(file_get_contents("php://input"), true);
                $response = method_exists($userController, 'updateUser')
                    ? $userController->updateUser((int)$uri[3], $data)
                    : ["status" => "error", "message" => "Update method not implemented for users"];
            }
            else {
                http_response_code(404);
                $response = ["status" => "error", "message" => "Invalid PUT endpoint for users"];
            }
            break;

        case "DELETE":
            // /backend/api/users/{id}
            if (count($uri) === 4 && is_numeric($uri[3])) {
                $response = method_exists($userController, 'deleteUser')
                    ? $userController->deleteUser((int)$uri[3])
                    : ["status" => "error", "message" => "Delete method not implemented for users"];
            }
            else {
                http_response_code(404);
                $response = ["status" => "error", "message" => "Invalid DELETE endpoint for users"];
            }
            break;

        default:
            http_response_code(405);
            $response = ["status" => "error", "message" => "Method not allowed for users"];
            break;
    }
}

// ORCHIDS - cek $uri[2] bukan $uri[1]
elseif (count($uri) >= 3 && $uri[2] === "orchids") {
    $orchidController = new OrchidController($db);
    $response = ["status" => "ok", "message" => "Orchid endpoints ready, implement methods in controller"];
}

// WATERING HISTORY - cek $uri[2] bukan $uri[1]
elseif (count($uri) >= 3 && $uri[2] === "wateringhistory") {
    $wateringController = new WateringController($db);
    $response = ["status" => "ok", "message" => "WateringHistory endpoints ready, implement methods in controller"];
}

// INVALID ENDPOINT
else {
    http_response_code(404);
    $response = [
        "status" => "error",
        "message" => "Invalid endpoint",
        "debug" => [
            "uri_segments" => $uri,
            "expected_format" => "Expected: /backend/api/{resource}/{id}"
        ],
        "available_endpoints" => [
            "sensors" => "/backend/api/sensors, /backend/api/sensors/{id}, /backend/api/sensors/{id}/chart",
            "users" => "/backend/api/users/register, /backend/api/users/login, /backend/api/users/{id}",
            "orchids" => "/backend/api/orchids (coming soon)",
            "wateringhistory" => "/backend/api/wateringhistory (coming soon)"
        ]
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>