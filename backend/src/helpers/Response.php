<?php
// src/helpers/Response.php

class Response {
    public static function success($message = "OK", $data = [], $statusCode = 200): array {
        http_response_code($statusCode);
        return [
            "status" => "success",
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ];
    }

    public static function error($message = "Error", $statusCode = 400, $data = []): array {
        http_response_code($statusCode);
        return [
            "status" => "error",
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ];
    }

    public static function info($message = "Info", $data = []): array {
        http_response_code(200);
        return [
            "status" => "info",
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ];
    }
}
