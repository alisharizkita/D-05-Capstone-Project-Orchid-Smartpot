<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../controllers/UserController.php';

$database = new Database();
$db = $database->connect();

$controller = new UserController($db);

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'register') {
    $data = json_decode(file_get_contents("php://input"), true);
    echo json_encode($controller->register($data));
} elseif ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    echo json_encode($controller->login($data));
} elseif ($method === 'GET' && $action === 'profile' && isset($_GET['id'])) {
    echo json_encode($controller->profile($_GET['id']));
} else {
    echo json_encode(["status" => "error", "message" => "Invalid endpoint"]);
}
