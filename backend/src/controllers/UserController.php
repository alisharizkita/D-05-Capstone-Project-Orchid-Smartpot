<?php
// =============================================
// File: backend/api/controllers/UserController.php
// Controller untuk handle user API requests
// =============================================

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Users.php';

class UserController {
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    // POST /api/users/register
    public function register($data) {
        if (empty($data['username']) || empty($data['email']) || empty($data['password']) || empty($data['phone_number'])) {
            return ["status" => "error", "message" => "All fields are required"];
        }

        $this->user->username = $data['username'];
        $this->user->email = $data['email'];
        $this->user->password = $data['password'];
        $this->user->phone_number = $data['phone_number'];

        if ($this->user->register()) {
            return ["status" => "success", "message" => "User registered successfully"];
        } else {
            return ["status" => "error", "message" => "Failed to register user"];
        }
    }

    // POST /api/users/login
    public function login($data) {
        if (empty($data['username']) || empty($data['password'])) {
            return ["status" => "error", "message" => "Username and password are required"];
        }

        $this->user->username = $data['username'];
        $this->user->password = $data['password'];

        $user = $this->user->login();
        if ($user) {
            return [
                "status" => "success",
                "message" => "Login successful",
                "data" => [
                    "user_id" => $user['user_id'],
                    "username" => $user['username'],
                    "email" => $user['email'],
                    "phone_number" => $user['phone_number'],
                    "created_at" => $user['created_at']
                ]
            ];
        } else {
            return ["status" => "error", "message" => "Invalid username or password"];
        }
    }

    // GET /api/users/{id}
    public function getProfile($id) {
        if (!is_numeric($id)) {
            return ["status" => "error", "message" => "Invalid user ID"];
        }

        $user = $this->user->getUserById($id);
        if ($user) {
            return [
                "status" => "success",
                "message" => "User profile retrieved",
                "data" => $user
            ];
        } else {
            return ["status" => "error", "message" => "User not found"];
        }
    }
}
