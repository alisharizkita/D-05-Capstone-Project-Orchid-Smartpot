<?php
// src/Router.php

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

        // Expecting e.g. api/sensors or api/sensors/1/chart
        if (count($parts) >= 1 && $parts[0] === 'sensors') {
            // load controller
            require_once __DIR__ . '/../controllers/SensorController.php'; // ensure loaded
            $controller = new SensorController($this->db);

            // GET /api/sensors  -> all sensors (historical list)
            if ($this->method === 'GET' && count($parts) === 1) {
                return $controller->getAllSensors(); // returns array response
            }

            // GET /api/sensors/latest or /api/sensors/latest?orchid_id=1
            if ($this->method === 'GET' && count($parts) === 2 && $parts[1] === 'latest') {
                $orchid_id = isset($_GET['orchid_id']) ? (int)$_GET['orchid_id'] : 1;
                return $controller->getLatestByOrchid($orchid_id);
            }

            // GET /api/sensors/{orchid_id}
            if ($this->method === 'GET' && count($parts) === 2 && is_numeric($parts[1])) {
                return $controller->getLatestByOrchid((int)$parts[1]);
            }

            // GET /api/sensors/{orchid_id}/chart
            if ($this->method === 'GET' && count($parts) === 3 && is_numeric($parts[1]) && $parts[2] === 'chart') {
                $hours = isset($_GET['hours']) ? (int)$_GET['hours'] : 24;
                return $controller->getChartData((int)$parts[1], $hours);
            }


            // POST /api/sensors
            if ($this->method === 'POST' && count($parts) === 1) {
                $payload = json_decode(file_get_contents("php://input"), true) ?? [];
                return $controller->createSensorReading($payload);
            }

            return Response::error("Invalid sensors endpoint", 404);
        }

        // other resources can be added similarly (users, orchids, etc)
        return Response::error("Invalid endpoint", 404);
    }
}
