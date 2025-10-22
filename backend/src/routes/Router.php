<?php
// src/routes/Router.php

class Router {
    private $uri;
    private $method;
    private $db;

    public function __construct(string $uri, string $method, $db) {
        $this->uri = parse_url($uri, PHP_URL_PATH);
        $this->method = $method;
        $this->db = $db;
    }

    public function dispatch(): array {
        // normalize and explode path
        $path = trim($this->uri, '/');
        $parts = explode('/', $path);

        // ============================================
        // USERS ROUTES
        // ============================================
        if (count($parts) >= 1 && $parts[0] === 'users') {
            // load controller
            require_once __DIR__ . '/../controllers/UserController.php';
            $controller = new UserController($this->db);

            // POST /users/register
            if ($this->method === 'POST' && count($parts) === 2 && $parts[1] === 'register') {
                $payload = json_decode(file_get_contents("php://input"), true) ?? [];
                return $controller->register($payload);
            }

            // POST /users/login
            if ($this->method === 'POST' && count($parts) === 2 && $parts[1] === 'login') {
                $payload = json_decode(file_get_contents("php://input"), true) ?? [];
                return $controller->login($payload);
            }

            // GET /users -> get all users
            if ($this->method === 'GET' && count($parts) === 1) {
                return $controller->getAllUsers();
            }

            // GET /users/{id} -> get user by id
            if ($this->method === 'GET' && count($parts) === 2 && is_numeric($parts[1])) {
                return $controller->getProfile((int)$parts[1]);
            }

            return Response::error("Invalid users endpoint", 404);
        }

        // ============================================
        // SENSORS ROUTES
        // ============================================
        if (count($parts) >= 1 && $parts[0] === 'sensors') {
            // load controller
            require_once __DIR__ . '/../controllers/SensorController.php';
            $controller = new SensorController($this->db);

            // GET /sensors -> all sensors (historical list)
            if ($this->method === 'GET' && count($parts) === 1) {
                return $controller->getAllSensors();
            }

            // GET /sensors/latest or /sensors/latest?orchid_id=1
            if ($this->method === 'GET' && count($parts) === 2 && $parts[1] === 'latest') {
                $orchid_id = isset($_GET['orchid_id']) ? (int)$_GET['orchid_id'] : 1;
                return $controller->getLatestByOrchid($orchid_id);
            }

            // GET /sensors/{orchid_id}
            if ($this->method === 'GET' && count($parts) === 2 && is_numeric($parts[1])) {
                return $controller->getLatestByOrchid((int)$parts[1]);
            }

            // GET /sensors/{orchid_id}/chart
            if ($this->method === 'GET' && count($parts) === 3 && is_numeric($parts[1]) && $parts[2] === 'chart') {
                $hours = isset($_GET['hours']) ? (int)$_GET['hours'] : 24;
                return $controller->getChartData((int)$parts[1], $hours);
            }

            // POST /sensors
            if ($this->method === 'POST' && count($parts) === 1) {
                $payload = json_decode(file_get_contents("php://input"), true) ?? [];
                return $controller->createSensorReading($payload);
            }

            return Response::error("Invalid sensors endpoint", 404);
        }

        // other resources can be added similarly
        return Response::error("Invalid endpoint", 404);
    }
}