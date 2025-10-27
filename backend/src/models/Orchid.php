<?php
// src/models/Orchid.php

class Orchid {
    private $conn;
    private $table_name = "orchid";

    public $orchid_id;
    public $user_id;
    public $orchid_name;
    public $min_moisture;
    public $max_moisture;
    public $orchid_type;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllByUser($user_id) {
        $query = "SELECT * FROM {$this->table_name} WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create() {
        $query = "INSERT INTO {$this->table_name} (user_id, orchid_name, min_moisture, max_moisture, orchid_type)
                  VALUES (:user_id, :orchid_name, :min_moisture, :max_moisture, :orchid_type)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":orchid_name", $this->orchid_name);
        $stmt->bindParam(":min_moisture", $this->min_moisture);
        $stmt->bindParam(":max_moisture", $this->max_moisture);
        $stmt->bindParam(":orchid_type", $this->orchid_type);
        return $stmt->execute();
    }

    public function getById($orchid_id) {
        $query = "SELECT * FROM {$this->table_name} WHERE orchid_id = :orchid_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":orchid_id", $orchid_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
