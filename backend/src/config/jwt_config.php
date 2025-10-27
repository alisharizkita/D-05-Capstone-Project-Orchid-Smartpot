<?php
// Ganti dengan string random, panjang, dan kompleks hasil dari bin2hex(random_bytes(32))
define('JWT_SECRET_KEY', getenv('JWT_SECRET') ?: 'kunci_fallback_khusus_dev_aman_12345');
define('JWT_ISSUER', 'http://localhost:80');
define('JWT_AUDIENCE', 'http://localhost:3000');
define('JWT_EXPIRY_SECONDS', 3600 * 24); // 24 jam