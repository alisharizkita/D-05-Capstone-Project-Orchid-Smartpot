<?php
class User {
    private $conn;
    private $table = "users";

    public $user_id;
    public $username;
    public $email;
    public $password;
    public $phone_number;
    public $created_at;
    public $updated_at;
    public $is_active;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Register user
    public function register() {
        $sql = "INSERT INTO users (username, email, password, phone_number, created_at, updated_at, is_active)
        VALUES (:username, :email, :password, :phone_number, NOW(), NOW(), TRUE)";


        $stmt = $this->conn->prepare($sql);

        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        $this->phone_number = htmlspecialchars(strip_tags($this->phone_number));

        $stmt->bindValue(":username", $this->username);
        $stmt->bindValue(":email", $this->email);
        $stmt->bindValue(":password", $this->password);
        $stmt->bindValue(":phone_number", $this->phone_number);

        return $stmt->execute();
    }

    // Login user
    public function login() {
        $query = "SELECT * FROM " . $this->table . " WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":username", $this->username);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($this->password, $user['password'])) {
            return $user;
        }
        return false;
    }

    // Get user by ID
    public function getUserById($id) {
        $query = "SELECT user_id, username, email, phone_number, created_at, updated_at, is_active 
                  FROM " . $this->table . " WHERE user_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
