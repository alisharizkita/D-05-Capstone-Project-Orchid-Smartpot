import json
import psycopg2
import paho.mqtt.client as mqtt

# ====== PostgreSQL Config ======
DB_HOST = "localhost"
DB_NAME = "smartpot"
DB_USER = "postgres"
DB_PASS = "lisha"
DB_PORT = "5432"

# ====== MQTT Config ======
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883
MQTT_TOPIC = "proyek/smartpot/D05/data"

# ====== Fungsi untuk insert ke database ======
def insert_sensor_data(data):
    try:
        conn = psycopg2.connect(
            host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT
        )
        cursor = conn.cursor()

        query = """
            INSERT INTO sensordata 
            (orchid_id, timestamp, soil_moisture, temperature, humidity, water_level, light_intensity)
            VALUES (%s, CURRENT_TIMESTAMP, %s, %s, %s, %s, %s)
        """

        values = (
            1,  # orchid_id (sementara default = 1, bisa diganti sesuai kebutuhan)
            data.get("kelembapan_tanah"),
            data.get("suhu"),
            data.get("kelembapan_udara"),
            data.get("level_air"),
            data.get("cahaya")
        )

        cursor.execute(query, values)
        conn.commit()

        print("✅ Data sensor berhasil disimpan ke database:", values)

        cursor.close()
        conn.close()

    except Exception as e:
        print("❌ Error saat insert ke database:", e)

# ====== MQTT Callback ======
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Terhubung ke broker MQTT!")
        client.subscribe(MQTT_TOPIC)
        print("Subscribe ke topic:", MQTT_TOPIC)
    else:
        print("Gagal connect, code:", rc)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        print("📩 Pesan diterima:", payload)

        data = json.loads(payload)
        insert_sensor_data(data)

    except Exception as e:
        print("❌ Error parsing pesan MQTT:", e)

# ====== Main ======
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("Menghubungkan ke broker MQTT...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Loop forever
client.loop_forever()
