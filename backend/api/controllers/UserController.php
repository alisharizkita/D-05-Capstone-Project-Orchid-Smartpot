<?php
// =============================================
// File: backend/api/users.php
// RESTful API untuk User
// =============================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/Database.php";
require_once __DIR__ . "/../models/Users.php";
require_once __DIR__ . "/../controllers/UserController.php";

$request_method = $_SERVER["REQUEST_METHOD"];
$uri = explode("/", trim(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH), "/"));

// /api/users
if (count($uri) < 2 || $uri[1] !== "users") {
    http_response_code(404);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid endpoint"
    ]);
    exit;
}

// koneksi db
$database = new Database();
$db = $database->getConnection();
$userController = new UserController($db);

// endpoint handling
switch ($request_method) {
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
        }
        else {
            http_response_code(404);
            $response = ["status" => "error", "message" => "Invalid POST endpoint"];
        }
        break;

    case "GET":
        // /api/users/{id}
        if (count($uri) === 3 && is_numeric($uri[2])) {
            $response = $userController->getProfile((int)$uri[2]);
        } else {
            http_response_code(404);
            $response = ["status" => "error", "message" => "Invalid GET endpoint"];
        }
        break;

    default:
        http_response_code(405);
        $response = ["status" => "error", "message" => "Method not allowed"];
        break;
}

echo json_encode($response, JSON_PRETTY_PRINT);
