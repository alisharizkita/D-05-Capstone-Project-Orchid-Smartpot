-- Skrip Database untuk Orchid Smart Monitoring (Versi PostgreSQL)

-- Membuat tipe ENUM kustom sebelum digunakan di tabel
CREATE TYPE plant_type_enum AS ENUM ('Calanthe', 'Phaius', 'Spathoglottis');
CREATE TYPE watering_type_enum AS ENUM ('manual', 'auto');
CREATE TYPE alert_type_enum AS ENUM ('warning', 'critical', 'info');

-- Table: users
-- Menyimpan data akun pengguna
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, -- Menggunakan SERIAL untuk auto-increment
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Simpan HASH yang kuat, bukan MD5
    full_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Menggunakan TIMESTAMP WITH TIME ZONE
    last_login TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Membuat index terpisah (alternatif selain di dalam CREATE TABLE)
CREATE INDEX IF NOT EXISTS idx_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_email ON users (email);

-- Table: plants
-- Menyimpan data tanaman anggrek per user
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    plant_name VARCHAR(100) NOT NULL,
    plant_type plant_type_enum NOT NULL, -- Menggunakan tipe ENUM kustom
    device_id VARCHAR(50) UNIQUE NOT NULL, -- ID unik dari IoT device
    location VARCHAR(100), -- Lokasi fisik tanaman
    notes TEXT, -- Catatan khusus dari user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Perlu trigger/logika aplikasi untuk update otomatis
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON plants (user_id);
CREATE INDEX IF NOT EXISTS idx_device_id ON plants (device_id);

-- Table: sensor_data
-- Menyimpan data sensor dari IoT device
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY, -- Menggunakan BIGSERIAL untuk auto-increment bigint
    plant_id INT NOT NULL,
    temperature DECIMAL(5,2) NOT NULL, -- Suhu dalam Celsius
    humidity DECIMAL(5,2) NOT NULL, -- Kelembaban udara dalam %
    light_intensity INT NOT NULL, -- Intensitas cahaya dalam lux
    soil_moisture DECIMAL(5,2) NOT NULL, -- Kelembaban media tanam dalam %
    water_level INT NOT NULL, -- Level air dalam tangki (%)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plant_timestamp ON sensor_data (plant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_timestamp ON sensor_data (timestamp);

-- Table: watering_history
-- Log riwayat penyiraman (manual atau otomatis)
CREATE TABLE IF NOT EXISTS watering_history (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL,
    watering_type watering_type_enum NOT NULL, -- Menggunakan tipe ENUM kustom
    duration_seconds INT, -- Durasi penyiraman dalam detik
    water_amount_ml INT, -- Estimasi jumlah air (ml)
    triggered_by VARCHAR(50), -- User ID atau "system"
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plant_watering FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_watering_plant_timestamp ON watering_history (plant_id, timestamp);

-- Table: alerts
-- Menyimpan notifikasi dan alert untuk kondisi abnormal
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL,
    alert_type alert_type_enum NOT NULL, -- Menggunakan tipe ENUM kustom
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_plant_alert FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alert_plant_read ON alerts (plant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_alert_created_at ON alerts (created_at);

-- Table: plant_settings
-- Pengaturan threshold dan parameter per tanaman
CREATE TABLE IF NOT EXISTS plant_settings (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL UNIQUE, -- Unique constraint
    temp_min DECIMAL(5,2) DEFAULT 20.0,
    temp_max DECIMAL(5,2) DEFAULT 30.0,
    humidity_min DECIMAL(5,2) DEFAULT 60.0,
    humidity_max DECIMAL(5,2) DEFAULT 80.0,
    soil_moisture_min DECIMAL(5,2) DEFAULT 40.0,
    soil_moisture_max DECIMAL(5,2) DEFAULT 70.0,
    light_min INT DEFAULT 300,
    light_max INT DEFAULT 600,
    auto_watering_enabled BOOLEAN DEFAULT TRUE,
    watering_schedule TIME, -- Jadwal penyiraman otomatis
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Perlu trigger/logika aplikasi
    CONSTRAINT fk_plant_settings FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- =========================================
-- INSERT SAMPLE DATA
-- =========================================

-- Sample User (Password is 'password', gunakan hashing yang lebih baik di aplikasi nyata)
INSERT INTO users (username, email, password, full_name, phone) VALUES
('demo_user', 'demo@orchid.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', '081234567890'),
('john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '081298765432');

-- Sample Plants
-- Pastikan user_id mengacu pada ID yang ada di tabel users
INSERT INTO plants (user_id, plant_name, plant_type, device_id, location, notes) VALUES
(1, 'Anggrek Taman Depan', 'Calanthe', 'ESP32-001', 'Taman Depan', 'Ditanam sejak Januari 2025'),
(1, 'Anggrek Balkon', 'Phaius', 'ESP32-002', 'Balkon Lantai 2', 'Memerlukan perhatian ekstra'),
(1, 'Anggrek Koleksi Spesial', 'Spathoglottis', 'ESP32-003', 'Ruang Tamu', 'Hadiah dari teman'),
(2, 'Orchid Garden 1', 'Calanthe', 'ESP32-004', 'Greenhouse', 'Untuk kompetisi');

-- Sample Sensor Data untuk Plant 1 (Last 24 hours simulation)
-- Menggunakan NOW() - INTERVAL 'x hour'
INSERT INTO sensor_data (plant_id, temperature, humidity, light_intensity, soil_moisture, water_level, timestamp) VALUES
(1, 25.5, 72.0, 450, 58.0, 85, NOW() - INTERVAL '23 hour'),
(1, 26.0, 71.5, 480, 57.5, 85, NOW() - INTERVAL '22 hour'),
(1, 26.5, 70.0, 520, 57.0, 84, NOW() - INTERVAL '21 hour'),
(1, 27.0, 69.5, 550, 56.5, 84, NOW() - INTERVAL '20 hour'),
(1, 27.5, 69.0, 580, 56.0, 83, NOW() - INTERVAL '19 hour'),
(1, 28.0, 68.5, 600, 55.5, 83, NOW() - INTERVAL '18 hour'),
(1, 27.5, 69.0, 580, 55.0, 82, NOW() - INTERVAL '17 hour'),
(1, 27.0, 70.0, 550, 54.5, 82, NOW() - INTERVAL '16 hour'),
(1, 26.5, 71.0, 520, 54.0, 81, NOW() - INTERVAL '15 hour'),
(1, 26.0, 72.0, 490, 60.0, 81, NOW() - INTERVAL '14 hour'),
(1, 25.5, 72.5, 460, 61.0, 80, NOW() - INTERVAL '13 hour'),
(1, 25.0, 73.0, 440, 62.0, 80, NOW() - INTERVAL '12 hour'),
(1, 24.5, 73.5, 420, 63.0, 79, NOW() - INTERVAL '11 hour'),
(1, 24.0, 74.0, 400, 64.0, 79, NOW() - INTERVAL '10 hour'),
(1, 24.5, 73.5, 430, 63.5, 78, NOW() - INTERVAL '9 hour'),
(1, 25.0, 73.0, 450, 63.0, 78, NOW() - INTERVAL '8 hour'),
(1, 25.5, 72.5, 470, 62.5, 77, NOW() - INTERVAL '7 hour'),
(1, 26.0, 72.0, 490, 62.0, 77, NOW() - INTERVAL '6 hour'),
(1, 26.5, 71.5, 510, 61.5, 76, NOW() - INTERVAL '5 hour'),
(1, 27.0, 71.0, 530, 61.0, 76, NOW() - INTERVAL '4 hour'),
(1, 26.5, 71.5, 520, 60.5, 75, NOW() - INTERVAL '3 hour'),
(1, 26.0, 72.0, 500, 60.0, 75, NOW() - INTERVAL '2 hour'),
(1, 25.5, 72.5, 480, 59.5, 74, NOW() - INTERVAL '1 hour'),
(1, 25.0, 73.0, 460, 59.0, 74, NOW());

-- Sample Sensor Data untuk Plant 2
INSERT INTO sensor_data (plant_id, temperature, humidity, light_intensity, soil_moisture, water_level, timestamp) VALUES
(2, 24.0, 75.0, 380, 52.0, 45, NOW()),
(2, 24.5, 74.5, 390, 51.5, 45, NOW() - INTERVAL '1 hour');

-- Sample Sensor Data untuk Plant 3
INSERT INTO sensor_data (plant_id, temperature, humidity, light_intensity, soil_moisture, water_level, timestamp) VALUES
(3, 26.0, 68.0, 520, 58.0, 15, NOW()),
(3, 25.5, 68.5, 510, 58.5, 16, NOW() - INTERVAL '1 hour');

-- Sample Watering History
INSERT INTO watering_history (plant_id, watering_type, duration_seconds, water_amount_ml, triggered_by) VALUES
(1, 'auto', 60, 200, 'system'),
(1, 'manual', 30, 100, '1'), -- Asumsi user_id 1
(2, 'auto', 45, 150, 'system');

-- Sample Alerts
INSERT INTO alerts (plant_id, alert_type, title, message, is_read) VALUES
(2, 'warning', 'Level Air Rendah', 'Water level di bawah 50%. Pertimbangkan untuk mengisi ulang.', FALSE),
(3, 'critical', 'Level Air Sangat Rendah!', 'Water level di bawah 20%! Segera isi ulang.', FALSE);

-- Sample Plant Settings
INSERT INTO plant_settings (plant_id, temp_min, temp_max, humidity_min, humidity_max, watering_schedule) VALUES
(1, 20.0, 30.0, 60.0, 80.0, '06:00:00'),
(2, 18.0, 28.0, 65.0, 85.0, '07:00:00'),
(3, 22.0, 32.0, 70.0, 90.0, '06:30:00');

-- =========================================
-- USEFUL QUERIES (PostgreSQL Syntax)
-- =========================================

-- Get all plants with latest sensor data for a user (user_id = 1)
/*
SELECT 
    p.id, p.plant_name, p.plant_type, p.device_id,
    sd.temperature, sd.humidity, sd.water_level, sd.timestamp
FROM plants p
LEFT JOIN LATERAL (
    SELECT * FROM sensor_data 
    WHERE plant_id = p.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) sd ON true
WHERE p.user_id = 1
ORDER BY p.created_at DESC;
*/

-- Get hourly average sensor data for a plant (plant_id = 1, last 24 hours)
/*
SELECT 
    date_trunc('hour', timestamp) as hour,
    AVG(temperature) as avg_temp,
    AVG(humidity) as avg_humidity,
    AVG(soil_moisture) as avg_soil
FROM sensor_data
WHERE plant_id = 1
AND timestamp >= NOW() - INTERVAL '24 hour'
GROUP BY hour
ORDER BY hour ASC;
*/

-- Clean up old sensor data (keep only last 30 days)
/*
DELETE FROM sensor_data 
WHERE timestamp < NOW() - INTERVAL '30 day';
*/

-- Grant privileges (adjust username and password)
/*
CREATE USER orchid_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE orchid_monitoring TO orchid_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO orchid_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO orchid_user; -- Penting untuk SERIAL
*/
