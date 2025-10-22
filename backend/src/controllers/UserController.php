<?php
// src/controllers/UserController.php
// Controller untuk handle user API requests

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../config/jwt_config.php';

// Pastikan path ke vendor autoload sesuai dengan struktur project kamu
// Jika composer ada di root project, path-nya mungkin: __DIR__ . '/../../vendor/autoload.php'
$vendorPath = __DIR__ . '/../../vendor/autoload.php';
if (file_exists($vendorPath)) {
    require_once $vendorPath;
}

use Firebase\JWT\JWT;

class UserController {
    private $db;
    private $user;

    // Constructor menerima $db dari Router
    public function __construct($db) {
        $this->db = $db;
        $this->user = new User($this->db);
    }

    // GET /users - Get all users
    public function getAllUsers() {
        try {
            $users = $this->user->getAllUsers();
            
            if ($users) {
                return Response::success("Daftar users berhasil diambil", $users, 200);
            } else {
                return Response::success("Tidak ada users ditemukan", [], 200);
            }
        } catch (Exception $e) {
            return Response::error("Gagal mengambil data users: " . $e->getMessage(), 500);
        }
    }

    // POST /users/register
    public function register($data) {
        // Validasi input dasar
        if (empty($data['username']) || empty($data['email']) || empty($data['password']) || empty($data['phone_number'])) {
            return Response::error("Semua kolom wajib diisi", 400);
        }

        $this->user->username = $data['username'];
        $this->user->email = $data['email'];
        $this->user->password = $data['password']; // Password akan di-hash di Model
        $this->user->phone_number = $data['phone_number'];

        try {
            if ($this->user->register()) {
                return Response::success("Pendaftaran user berhasil", [], 201);
            } else {
                return Response::error("Gagal mendaftarkan user. Mungkin username atau email sudah terdaftar.", 409);
            }
        } catch (Exception $e) {
            return Response::error("Error saat registrasi: " . $e->getMessage(), 500);
        }
    }

    // POST /users/login
    public function login($data) {
        if (empty($data['username']) || empty($data['password'])) {
            return Response::error("Username dan password wajib diisi", 400);
        }

        $this->user->username = $data['username'];
        $this->user->password = $data['password'];

        try {
            $user = $this->user->login();
            
            if ($user) {
                $issuedAt = time();
                $expirationTime = $issuedAt + JWT_EXPIRY_SECONDS;
                
                // Payload Token
                $payload = [
                    'iat'  => $issuedAt,
                    'exp'  => $expirationTime,
                    'iss'  => JWT_ISSUER,
                    'aud'  => JWT_AUDIENCE,
                    'data' => [
                        'user_id' => $user['user_id'],
                        'username' => $user['username'],
                        'email' => $user['email']
                    ]
                ];

                // Encode Payload menjadi JWT
                if (class_exists('Firebase\JWT\JWT')) {
                    $jwt = JWT::encode($payload, JWT_SECRET_KEY, 'HS256');
                } else {
                    return Response::error("JWT library tidak tersedia", 500);
                }

                return Response::success("Login berhasil", [
                    "token" => $jwt,
                    "user" => [ 
                        "user_id" => $user['user_id'],
                        "username" => $user['username'],
                        "email" => $user['email']
                    ]
                ], 200);
            } else {
                return Response::error("Username atau password tidak valid", 401);
            }
        } catch (Exception $e) {
            return Response::error("Error saat login: " . $e->getMessage(), 500);
        }
    }

    // GET /users/{id}
    public function getProfile($id) {
        if (!is_numeric($id)) {
            return Response::error("ID user tidak valid", 400);
        }

        try {
            $user = $this->user->getUserById($id);
            
            if ($user) {
                return Response::success("Profil user ditemukan", $user, 200);
            } else {
                return Response::error("User tidak ditemukan", 404);
            }
        } catch (Exception $e) {
            return Response::error("Error saat mengambil profil: " . $e->getMessage(), 500);
        }
    }
}