<?php
require_once __DIR__ . '/../models/Orchid.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../config/jwt_config.php';

$vendorPath = __DIR__ . '/../../vendor/autoload.php';
if (file_exists($vendorPath)) {
    require_once $vendorPath;
}

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// MULAI BUNGKUS SEMUA DALAM CLASS INI
class OrchidController {
    private $db;
    private $orchid;

    public function __construct($db) {
        $this->db = $db;
        $this->orchid = new Orchid($db);
    }

    private function decodeToken($headers) {
        $normalized = [];
        foreach ($headers as $k => $v) {
            $normalized[strtolower($k)] = $v;
        }

        $auth = $normalized['authorization'] ?? null;
        if (!$auth) return null;

        if (!preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) return null;
        $token = trim($matches[1]);

        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
            return $decoded->data->user_id ?? null;
        } catch (\Throwable $e) {
            error_log("JWT decode error: " . $e->getMessage());
            return null;
        }
    }

    public function getAllOrchids($headers) {
        $user_id = $this->decodeToken($headers);
        if (!$user_id) return Response::error("Token tidak valid", 401);

        $data = $this->orchid->getAllByUser($user_id);
        return Response::success("Daftar anggrek berhasil diambil", $data, 200);
    }

    public function createOrchid($headers, $data) {
        $user_id = $this->decodeToken($headers);
        if (!$user_id) return Response::error("Token tidak valid", 401);

        if (empty($data['orchid_name']) || empty($data['orchid_type'])) {
            return Response::error("Nama dan jenis anggrek wajib diisi", 400);
        }

        $this->orchid->user_id = $user_id;
        $this->orchid->orchid_name = $data['orchid_name'];
        $this->orchid->orchid_type = $data['orchid_type'];

        $thresholds = [
            "calanthe" => [25, 80],
            "phaius" => [30, 40],
            "spathoglottis" => [30, 70]
        ];

        $type = strtolower($data['orchid_type']);
        if (isset($thresholds[$type])) {
            [$this->orchid->min_moisture, $this->orchid->max_moisture] = $thresholds[$type];
        } else {
            $this->orchid->min_moisture = 40;
            $this->orchid->max_moisture = 60;
        }

        $success = $this->orchid->create();
        return $success
            ? Response::success("Anggrek berhasil ditambahkan", [], 201)
            : Response::error("Gagal menambahkan anggrek", 500);
    }
}
// SELESAI BUNGKUS
