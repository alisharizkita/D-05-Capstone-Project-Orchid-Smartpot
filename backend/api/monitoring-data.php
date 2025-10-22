<?php
// Header keamanan (CORS) agar frontend bisa mengakses
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- PERBAIKAN 1: Memuat file yang dibutuhkan untuk notifikasi ---
// Pastikan path ini benar. Ini mengasumsikan file ini ada di 'backend/api/'
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/services/NotificationService.php';


// --- PERBAIKAN 2: Mengubah rentang acak agar notifikasi bisa terpicu ---
$latest_data = [
    "temperature" => round(27.5 + (rand(0, 30) / 10), 1),
    "humidity" => 70 + rand(0, 15),
    "light_intensity" => 400 + rand(0, 200),
    // Rentang diubah menjadi 20-75 agar bisa di bawah 30
    "soil_moisture" => rand(20, 75), 
    "lastWatering" => date('d/m/Y H:i:s')
];


// --- PERBAIKAN 3: Menambahkan logika untuk memeriksa dan mengirim notifikasi ---
$notification_status = "Not triggered";
$soil_moisture_threshold = 30; // Atur ambang batas kekeringan

if ($latest_data['soil_moisture'] < $soil_moisture_threshold) {
    try {
        $notificationService = new NotificationService();
        
        // GANTI DENGAN NOMOR WA ANDA YANG SUDAH TERVERIFIKASI DI TWILIO SANDBOX
        $recipientNumber = 'whatsapp:+6282134060927'; 
        
        $message = "PERINGATAN DUMMY! 💧 Kelembaban tanah Anggrek Anda kritis: " . $latest_data['soil_moisture'] . "%. Segera siram!";
          
        // Kirim notifikasi
        if ($notificationService->sendWhatsappAlert($recipientNumber, $message)) {
            $notification_status = "Alert sent successfully to " . $recipientNumber;
        } else {
            $notification_status = "Failed to send alert.";
        }
    } catch (Exception $e) {
         $notification_status = "Error initializing notification service: " . $e->getMessage();
    }
}


// --- Membuat data 'history' untuk grafik (tidak berubah) ---
$history_labels = []; $history_temps = []; $history_hums = []; $history_lights = []; $history_soils = [];
for ($i = 23; $i >= 0; $i--) {
    $time = strtotime("-$i hour");
    $history_labels[] = date('H:i', $time);
    $history_temps[] = round(27.5 + (rand(0, 30) / 10), 1);
    $history_hums[] = 70 + rand(0, 15);
    $history_lights[] = 400 + rand(0, 200);
    $history_soils[] = rand(20, 75);
}
$history_data = [ "labels" => $history_labels, "datasets" => [ "temperature" => $history_temps, "humidity" => $history_hums, "light_intensity" => $history_lights, "soil_moisture" => $history_soils ] ];


// Gabungkan ke dalam format respons
$response = [
    "status" => "success",
    "message" => "Data monitoring dummy berhasil diambil",
    "notification_check" => $notification_status, // Menambahkan status notifikasi untuk debugging
    "data" => [ "latest" => $latest_data, "history" => $history_data ]
];

// Mengirimkan data sebagai JSON
echo json_encode($response);

