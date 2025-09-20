<?php
// =============================================
// File: backend/api/controllers/SensorController.php
// Controller untuk handle sensor API requests
// =============================================

class SensorController {
    private $db;
    private $sensor;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->sensor = new Sensor($this->db);
    }

    // GET /api/sensors
    public function getAllSensors() {
        try {
            $stmt = $this->sensor->getAllSensorData();
            $num = $stmt->rowCount();

            if ($num > 0) {
                $sensors_arr = [];
                $sensors_arr["total"] = $num;
                $sensors_arr["data"] = [];

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $sensor_item = [
                        "data_id" => (int)$row['data_id'],
                        "orchid_id" => (int)$row['orchid_id'],
                        "orchid_name" => $row['orchid_name'],
                        "orchid_type" => $row['orchid_type'],
                        "soil_moisture" => (float)$row['soil_moisture'],
                        "temperature" => (float)$row['temperature'],
                        "humidity" => (float)$row['humidity'],
                        "water_level" => (float)$row['water_level'],
                        "light_intensity" => (int)$row['light_intensity'],
                        "timestamp" => $row['timestamp'],
                        "formatted_time" => date('d/m/Y H:i', strtotime($row['timestamp']))
                    ];
                    array_push($sensors_arr["data"], $sensor_item);
                }

                return [
                    "status" => "success",
                    "message" => "Sensor data retrieved successfully",
                    "data" => $sensors_arr
                ];
            } else {
                return [
                    "status" => "success",
                    "message" => "No sensor data found",
                    "data" => ["total" => 0, "data" => []]
                ];
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to retrieve sensor data: " . $e->getMessage()
            ];
        }
    }

    // GET /api/sensors/{orchid_id}
    public function getLatestByOrchid($orchid_id) {
        try {
            if (!is_numeric($orchid_id) || $orchid_id <= 0) {
                return ["status" => "error", "message" => "Invalid orchid ID"];
            }

            $stmt = $this->sensor->getLatestByOrchid($orchid_id);
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                $moisture_status = "normal";
                if ($row['soil_moisture'] < $row['min_moisture']) {
                    $moisture_status = "low";
                } elseif ($row['soil_moisture'] > $row['max_moisture']) {
                    $moisture_status = "high";
                }

                $sensor_data = [
                    "data_id" => (int)$row['data_id'],
                    "orchid_id" => (int)$row['orchid_id'],
                    "orchid_name" => $row['orchid_name'],
                    "orchid_type" => $row['orchid_type'],
                    "thresholds" => [
                        "min_moisture" => (float)$row['min_moisture'],
                        "max_moisture" => (float)$row['max_moisture']
                    ],
                    "readings" => [
                        "soil_moisture" => (float)$row['soil_moisture'],
                        "temperature" => (float)$row['temperature'],
                        "humidity" => (float)$row['humidity'],
                        "water_level" => (float)$row['water_level'],
                        "light_intensity" => (int)$row['light_intensity']
                    ],
                    "status" => [
                        "moisture" => $moisture_status
                    ],
                    "timestamp" => $row['timestamp'],
                    "formatted_time" => date('d/m/Y H:i:s', strtotime($row['timestamp']))
                ];

                return [
                    "status" => "success",
                    "message" => "Latest sensor data retrieved successfully",
                    "data" => $sensor_data
                ];
            } else {
                return [
                    "status" => "error",
                    "message" => "No sensor data found for orchid ID: " . $orchid_id
                ];
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to retrieve sensor data: " . $e->getMessage()
            ];
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
                return [
                    "status" => "error",
                    "message" => "Missing required fields: " . implode(', ', $missing_fields)
                ];
            }

            $this->sensor->orchid_id = (int)$data['orchid_id'];
            $this->sensor->soil_moisture = (float)$data['soil_moisture'];
            $this->sensor->temperature = (float)$data['temperature'];
            $this->sensor->humidity = (float)$data['humidity'];
            $this->sensor->water_level = (float)$data['water_level'];
            $this->sensor->light_intensity = (int)$data['light_intensity'];

            $validation_errors = $this->sensor->validateData();
            if (!empty($validation_errors)) {
                return [
                    "status" => "error",
                    "message" => "Validation failed",
                    "errors" => $validation_errors
                ];
            }

            if (!$this->sensor->orchidExists($this->sensor->orchid_id)) {
                return [
                    "status" => "error",
                    "message" => "Orchid with ID " . $this->sensor->orchid_id . " not found"
                ];
            }

            if ($this->sensor->create()) {
                return [
                    "status" => "success",
                    "message" => "Sensor reading created successfully",
                    "data" => [
                        "data_id" => $this->sensor->data_id,
                        "orchid_id" => $this->sensor->orchid_id,
                        "readings" => [
                            "soil_moisture" => $this->sensor->soil_moisture,
                            "temperature" => $this->sensor->temperature,
                            "humidity" => $this->sensor->humidity,
                            "water_level" => $this->sensor->water_level,
                            "light_intensity" => $this->sensor->light_intensity
                        ]
                    ]
                ];
            } else {
                return [
                    "status" => "error",
                    "message" => "Unable to create sensor reading"
                ];
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to create sensor reading: " . $e->getMessage()
            ];
        }
    }

    // GET /api/sensors/{orchid_id}/chart
    public function getChartData($orchid_id, $hours = 24) {
        try {
            if (!is_numeric($orchid_id) || $orchid_id <= 0) {
                return ["status" => "error", "message" => "Invalid orchid ID"];
            }

            $stmt = $this->sensor->getChartData($orchid_id, $hours);
            $num = $stmt->rowCount();

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

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $chart_data["labels"][] = $row['time_label'];
                    $chart_data["datasets"]['soil_moisture'][] = (float)$row['soil_moisture'];
                    $chart_data["datasets"]['temperature'][] = (float)$row['temperature'];
                    $chart_data["datasets"]['humidity'][] = (float)$row['humidity'];
                    $chart_data["datasets"]['water_level'][] = (float)$row['water_level'];
                    $chart_data["datasets"]['light_intensity'][] = (int)$row['light_intensity'];
                }

                return [
                    "status" => "success",
                    "message" => "Chart data retrieved successfully",
                    "data" => $chart_data
                ];
            } else {
                return [
                    "status" => "success",
                    "message" => "No chart data found for the specified time range",
                    "data" => [
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
                    ]
                ];
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to retrieve chart data: " . $e->getMessage()
            ];
        }
    }
}
