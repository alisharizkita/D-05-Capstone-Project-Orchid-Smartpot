<?php
// File: generate_key.php

// Panjang kunci yang direkomendasikan adalah 32 byte (menghasilkan 64 karakter hex)
$length = 32; 

try {
    // 1. Menghasilkan data biner acak yang aman secara kriptografi
    $binaryKey = random_bytes($length); 
    
    // 2. Mengubah data biner menjadi string heksadesimal yang mudah dibaca/disimpan
    $secretKey = bin2hex($binaryKey); 
    
    echo "========================================================\n";
    echo "🔑 JWT SECRET KEY GENERATED (Panjang: " . strlen($secretKey) . " karakter)\n";
    echo "========================================================\n";
    echo $secretKey . "\n";
    echo "========================================================\n";
    echo "SALIN kunci ini dan masukkan ke file jwt_config.php Anda.\n";
    echo "JANGAN bagikan kunci ini.\n";
    
} catch (Exception $e) {
    die("❌ Gagal menghasilkan kunci acak: " . $e->getMessage() . "\n");
}

?>