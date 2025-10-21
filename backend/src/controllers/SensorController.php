<?php
// src/controllers/SensorController.php

require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../models/Sensor.php';

class SensorController {
    private $db;
    private $sensor;

    // sekarang menerima $db sebagai dependency
    public function __construct($db) {
        $this->db = $db;
        $this->sensor = new Sensor($this->db);
    }

    // GET /api/sensors
    public function getAllSensors() {
        try {
            $stmt = $this->sensor->getAllSensorData();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $num = count($rows);

            if ($num > 0) {
                // Model meng-ORDER BY DESC; kita ubah ke ASC agar chronological (lama->baru)
                // sehingga frontend bisa gunakan element terakhir sebagai latest
                $rowsChron = array_reverse($rows);

                $sensors_arr = [
                    "total" => $num,
                    "data" => []
                ];

                foreach ($rowsChron as $row) {
                    $sensor_item = [
                        "data_id" => (int)$row['data_id'],
                        "orchid_id" => (int)$row['orchid_id'],
                        "orchid_name" => $row['orchid_name'] ?? null,
                        "orchid_type" => $row['orchid_type'] ?? null,
                        "soil_moisture" => isset($row['soil_moisture']) ? (float)$row['soil_moisture'] : null,
                        "temperature" => isset($row['temperature']) ? (float)$row['temperature'] : null,
                        "humidity" => isset($row['humidity']) ? (float)$row['humidity'] : null,
                        "water_level" => isset($row['water_level']) ? (float)$row['water_level'] : null,
                        "light_intensity" => isset($row['light_intensity']) ? (int)$row['light_intensity'] : null,
                        "timestamp" => $row['timestamp'],
                        "formatted_time" => date('d/m/Y H:i', strtotime($row['timestamp']))
                    ];
                    $sensors_arr["data"][] = $sensor_item;
                }

                return Response::success("Sensor data retrieved successfully", $sensors_arr);
            } else {
                return Response::success("No sensor data found", ["total" => 0, "data" => []]);
            }
        } catch (Exception $e) {
            return Response::error("Failed to retrieve sensor data: " . $e->getMessage(), 500);
        }
    }

    // GET /api/sensors/{orchid_id} or /api/sensors/latest?orchid_id=1
    public function getLatestByOrchid($orchid_id) {
        try {
            if (!is_numeric($orchid_id) || $orchid_id <= 0) {
                return Response::error("Invalid orchid ID", 400);
            }

            $stmt = $this->sensor->getLatestByOrchid($orchid_id);
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                $moisture_status = "normal";
                if (isset($row['min_moisture'], $row['max_moisture'])) {
                    if ($row['soil_moisture'] < $row['min_moisture']) $moisture_status = "low";
                    elseif ($row['soil_moisture'] > $row['max_moisture']) $moisture_status = "high";
                }

                $sensor_data = [
                    "data_id" => (int)$row['data_id'],
                    "orchid_id" => (int)$row['orchid_id'],
                    "orchid_name" => $row['orchid_name'] ?? null,
                    "orchid_type" => $row['orchid_type'] ?? null,
                    "thresholds" => [
                        "min_moisture" => isset($row['min_moisture']) ? (float)$row['min_moisture'] : null,
                        "max_moisture" => isset($row['max_moisture']) ? (float)$row['max_moisture'] : null
                    ],
                    "readings" => [
                        "soil_moisture" => isset($row['soil_moisture']) ? (float)$row['soil_moisture'] : null,
                        "temperature" => isset($row['temperature']) ? (float)$row['temperature'] : null,
                        "humidity" => isset($row['humidity']) ? (float)$row['humidity'] : null,
                        "water_level" => isset($row['water_level']) ? (float)$row['water_level'] : null,
                        "light_intensity" => isset($row['light_intensity']) ? (int)$row['light_intensity'] : null
                    ],
                    "status" => [
                        "moisture" => $moisture_status
                    ],
                    "timestamp" => $row['timestamp'],
                    "formatted_time" => date('d/m/Y H:i:s', strtotime($row['timestamp']))
                ];

                return Response::success("Latest sensor data retrieved successfully", $sensor_data);
            } else {
                return Response::error("No sensor data found for orchid ID: " . $orchid_id, 404);
            }
        } catch (Exception $e) {
            return Response::error("Failed to retrieve sensor data: " . $e->getMessage(), 500);
        }
    }

    // POST /api/sensors
    public function createSensorReading($data) {
        try {
            $required_fields = ['orchid_id', 'soil_moisture', 'temperature', 'humidity', 'water_level', 'light_intensity'];
            $missing_fields = [];

            foreach ($required_fields as $field) {
                if (!isset($data[$field]) || $data[$field] === '') {
                    $missing_fields[] = $field;
                }
            }

            if (!empty($missing_fields)) {
                return Response::error("Missing required fields: " . implode(', ', $missing_fields), 400);
            }

            $this->sensor->orchid_id = (int)$data['orchid_id'];
            $this->sensor->soil_moisture = (float)$data['soil_moisture'];
            $this->sensor->temperature = (float)$data['temperature'];
            $this->sensor->humidity = (float)$data['humidity'];
            $this->sensor->water_level = (float)$data['water_level'];
            $this->sensor->light_intensity = (int)$data['light_intensity'];

            $validation_errors = $this->sensor->validateData();
            if (!empty($validation_errors)) {
                return Response::error("Validation failed", 400, ['errors' => $validation_errors]);
            }

            if (!$this->sensor->orchidExists($this->sensor->orchid_id)) {
                return Response::error("Orchid with ID " . $this->sensor->orchid_id . " not found", 404);
            }

            if ($this->sensor->create()) {
                return Response::success("Sensor reading created successfully", [
                    "data_id" => $this->sensor->data_id,
                    "orchid_id" => $this->sensor->orchid_id,
                    "readings" => [
                        "soil_moisture" => $this->sensor->soil_moisture,
                        "temperature" => $this->sensor->temperature,
                        "humidity" => $this->sensor->humidity,
                        "water_level" => $this->sensor->water_level,
                        "light_intensity" => $this->sensor->light_intensity
                    ]
                ], 201);
            } else {
                return Response::error("Unable to create sensor reading", 500);
            }
        } catch (Exception $e) {
            return Response::error("Failed to create sensor reading: " . $e->getMessage(), 500);
        }
    }

    // GET /api/sensors/{orchid_id}/chart
    public function getChartData($orchid_id, $hours = 24) {
        try {
            if (!is_numeric($orchid_id) || $orchid_id <= 0) {
                return Response::error("Invalid orchid ID", 400);
            }

            $stmt = $this->sensor->getChartData($orchid_id, $hours);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $num = count($rows);

            if ($num > 0) {
                $chart_data = [
                    "labels" => [],
                    "datasets" => [
                        'soil_moisture' => [],
                        'temperature' => [],
                        'humidity' => [],
                        'water_level' => [],
                        'light_intensity' => []
                    ],
                    "total_points" => $num,
                    "time_range_hours" => $hours
                ];

                foreach ($rows as $row) {
                    $chart_data["labels"][] = $row['time_label'];
                    $chart_data["datasets"]['soil_moisture'][] = (float)$row['soil_moisture'];
                    $chart_data["datasets"]['temperature'][] = (float)$row['temperature'];
                    $chart_data["datasets"]['humidity'][] = (float)$row['humidity'];
                    $chart_data["datasets"]['water_level'][] = (float)$row['water_level'];
                    $chart_data["datasets"]['light_intensity'][] = (int)$row['light_intensity'];
                }

                return Response::success("Chart data retrieved successfully", $chart_data);
            } else {
                return Response::success("No chart data found for the specified time range", [
                    "labels" => [],
                    "datasets" => [
                        'soil_moisture' => [],
                        'temperature' => [],
                        'humidity' => [],
                        'water_level' => [],
                        'light_intensity' => []
                    ],
                    "total_points" => 0,
                    "time_range_hours" => $hours
                ]);
            }
        } catch (Exception $e) {
            return Response::error("Failed to retrieve chart data: " . $e->getMessage(), 500);
        }
    }
}
