<?php
// =============================================
// File: backend/api/index.php
// Router utama untuk API SmartPot
// =============================================

// Headers untuk API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Autoload class (atau require manual kalau belum pakai composer)
require_once __DIR__ . "/config/Database.php";
require_once __DIR__ . "/models/Sensor.php";
require_once __DIR__ . "/controllers/SensorController.php";

// Parsing URL (biar query string ?hours=144 gak ikut ke path)
$parsedUrl = parse_url($_SERVER["REQUEST_URI"]);
$uri = explode("/", trim($parsedUrl["path"], "/"));
$request_method = $_SERVER["REQUEST_METHOD"];

$sensorController = new SensorController();

// Pastikan path minimal: api/sensors
if (count($uri) < 2 || $uri[0] !== "api" || $uri[1] !== "sensors") {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid endpoint"
    ]);
    exit;
}

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

echo json_encode($response, JSON_PRETTY_PRINT);
