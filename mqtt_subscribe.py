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
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPICS = [
    ("D05smartpotCaps/data", 0),
    ("D05smartpotCaps/orchid", 0),
    ("D05smartpotCaps/notif", 0)
]

# ====== Fungsi untuk insert ke database ======
def insert_sensor_data(data):
    try:
        conn = psycopg2.connect(
            host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT
        )
        cursor = conn.cursor()

        orchid_id = 6  # kamu bisa ubah ini sesuai ID tanaman yang sesuai di database

        query = """
            INSERT INTO sensordata (
                orchid_id,
                timestamp,
                soil_moisture1,
                soil_moisture2,
                temperature,
                humidity,
                water_level,
                light_intensity
            ) VALUES (
                %(orchid_id)s,
                CURRENT_TIMESTAMP,
                %(soil_moisture1)s,
                %(soil_moisture2)s,
                %(temperature)s,
                %(humidity)s,
                %(water_level)s,
                %(light_intensity)s
            )
        """

        data_mapping = {
            "orchid_id": orchid_id,
            "soil_moisture1": data.get("kelembapan_tanah1"),
            "soil_moisture2": data.get("kelembapan_tanah2"),
            "temperature": data.get("suhu"),
            "humidity": data.get("kelembapan_udara"),
            "water_level": data.get("level_air_persen"),
            "light_intensity": data.get("cahaya")
        }

        cursor.execute(query, data_mapping)
        conn.commit()

        print("✅ Data sensor berhasil disimpan ke database:", data_mapping)

    except Exception as e:
        print("❌ Error saat insert ke database:", e)
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ====== MQTT Callback ======
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Terhubung ke broker MQTT!")
        client.subscribe(MQTT_TOPICS)
        print("Subscribe ke topics:")
        for topic, _ in MQTT_TOPICS:
            print(" -", topic)
    else:
        print("Gagal connect, code:", rc)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        print(f"\n📩 Pesan diterima dari topic [{msg.topic}]: {payload}")

        data = json.loads(payload)

        if msg.topic == "D05smartpotCaps/data":
            insert_sensor_data(data)
        else:
            print("ℹ️ Data dari topic lain disimpan untuk log/keperluan lain (belum diinsert ke DB).")

    except json.JSONDecodeError:
        print("❌ Payload bukan format JSON valid:", msg.payload)
    except Exception as e:
        print("❌ Error saat proses pesan MQTT:", e)

# ====== Main ======
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("Menghubungkan ke broker MQTT...")
client.connect(MQTT_BROKER, MQTT_PORT, 60)

client.loop_forever()
