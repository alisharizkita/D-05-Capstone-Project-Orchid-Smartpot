<?php
// File: backend/api/services/NotificationService.php

// Memuat autoloader dari Composer agar bisa menggunakan library Twilio
require_once __DIR__ . '/../../vendor/autoload.php';

use Twilio\Rest\Client;

class NotificationService {
    private $client;
    private $twilio_whatsapp_number;

    public function __construct() {
        // --- KREDENSIAL TWILIO ANDA ---
        // SID dari snippet Anda sudah dimasukkan.
        $sid    = getenv('TWILIO_ACCOUNT_SID');
        $token  = getenv('TWILIO_AUTH_TOKEN');            
        // ------------------------------------------

        $this->client = new Client($sid, $token);
        
        // Nomor WhatsApp yang diberikan oleh Twilio Sandbox.
        $this->twilio_whatsapp_number = 'whatsapp:+14155238886'; 
    }

    /**
     * Mengirim notifikasi peringatan ke nomor WhatsApp yang dituju.
     * @param string $recipient_number Nomor penerima (cth: 'whatsapp:+6281234567890')
     * @param string $message Isi pesan yang akan dikirim.
     * @return bool Mengembalikan true jika berhasil, false jika gagal.
     */
    public function sendWhatsappAlert(string $recipient_number, string $message): bool {
        try {
            // --- PERBAIKAN: Menggunakan logika dari snippet Twilio Anda ---
            $this->client->messages->create(
                $recipient_number, // Nomor tujuan (diambil dari parameter fungsi)
                [
                    "from" => $this->twilio_whatsapp_number, // Nomor WhatsApp Twilio Anda
                    "body" => $message                      // Isi pesan (diambil dari parameter fungsi)
                ]
            );
            // Jika tidak ada error, pengiriman berhasil
            return true;
        } catch (Exception $e) {
            // Jika terjadi error, catat ke dalam log server untuk debugging.
            error_log('Twilio WhatsApp Error: ' . $e->getMessage());
            return false;
        }
    }
}

