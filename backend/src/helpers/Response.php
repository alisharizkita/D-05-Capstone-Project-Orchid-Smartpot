<?php
// src/helpers/Response.php

class Response {
    public static function success($message = "OK", $data = [], $statusCode = 200): array {
        http_response_code($statusCode);
        return [
            "success" => true,
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ];
    }

    public static function error($message = "Error", $statusCode = 400, $data = []): array {
        http_response_code($statusCode);
        return [
            "success" => "false",
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ];
    }

    public static function info($message = "Info", $data = []): array {
        http_response_code(200);
        return [
            "success" => null,
            "message" => $message,
            "data" => $data,
            "timestamp" => date('Y-m-d H:i:s')
        ];
    }
}
