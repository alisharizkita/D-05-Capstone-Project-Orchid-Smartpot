'use client'; // Wajib ada karena kita menggunakan hooks (useState, useEffect)

// Menggabungkan semua logika ke dalam satu file untuk mengatasi error impor
import React, { Suspense, useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
);

// Interface untuk tipe data
interface MonitoringData {
  temperature: number; humidity: number; lightIntensity: number; soilMoisture: number; ph: number; lastWatering: string; batteryLevel: number; connectionStatus: string;
}
interface Alert {
  id: number; type: 'warning' | 'info'; message: string; time: string;
}

// Komponen CSS yang disematkan untuk memastikan styling berjalan
const PageStyles = () => (
  <style>{`
    .dashboard-container {
      padding: 2rem;
      background-color: #f3f4f6;
      min-height: 100vh;
      font-family: sans-serif;
    }
    .dashboard-header {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      margin-bottom: 2rem;
      border-radius: 0.5rem;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1280px;
      margin: auto;
    }
    .widget-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    @media (min-width: 768px) {
      .widget-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .widget-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .widget {
      background-color: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .chart-section {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-top: 2rem;
    }
    .chart-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
    }
    @media (min-width: 1024px) {
        .chart-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    .alert {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-radius: 0.5rem;
    }
    .alert-warning {
        background-color: #fef3c7;
        color: #92400e;
    }
    .alert-info {
        background-color: #dbeafe;
        color: #1e40af;
    }
    .main-content {
        max-width: 1280px;
        margin: auto;
    }
  `}</style>
);


// Komponen utama yang berisi semua logika dan tampilan dashboard
function MonitoringDashboard() {
  const [name, setName] = useState('Anggrek');
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({ temperature: 28.5, humidity: 75, lightIntensity: 450, soilMoisture: 65, ph: 6.2, lastWatering: '2 jam yang lalu', batteryLevel: 85, connectionStatus: 'Connected' });
  const [historicalData, setHistoricalData] = useState<{ labels: string[]; temperature: number[]; humidity: number[]; lightIntensity: number[]; soilMoisture: number[]; }>({ labels: [], temperature: [], humidity: [], lightIntensity: [], soilMoisture: [] });
  const [alerts, setAlerts] = useState<Alert[]>([ { id: 1, type: 'warning', message: 'Kelembaban tanah rendah', time: '5 menit lalu' }, { id: 2, type: 'info', message: 'Penyiraman otomatis aktif', time: '2 jam lalu' } ]);
  const [showCharts, setShowCharts] = useState(false);
  
  // PERBAIKAN: State untuk menyimpan waktu yang hanya diatur di client
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Mengambil nama dari URL menggunakan Web API standar yang stabil
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    if (urlName) {
        setName(urlName);
    }

    // Mengisi data historis awal
    const now = new Date();
    const labels: string[] = [], temperature: number[] = [], humidity: number[] = [], lightIntensity: number[] = [], soilMoisture: number[] = [];
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        temperature.push(parseFloat((25 + Math.random() * 8).toFixed(1)));
        humidity.push(parseInt((65 + Math.random() * 20).toFixed(0), 10));
        lightIntensity.push(parseInt((300 + Math.random() * 400).toFixed(0), 10));
        soilMoisture.push(parseInt((40 + Math.random() * 40).toFixed(0), 10));
    }
    setHistoricalData({ labels, temperature, humidity, lightIntensity, soilMoisture });

    // PERBAIKAN: Mengatur waktu awal dan interval update hanya di client
    const formatTime = () => new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit'});
    setCurrentTime(formatTime());
    const timer = setInterval(() => setCurrentTime(formatTime()), 1000);

    return () => clearInterval(timer); // Membersihkan interval saat komponen unmount
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        const newTemp = parseFloat((25 + Math.random() * 8).toFixed(1));
        const newHumidity = parseInt((65 + Math.random() * 20).toFixed(0), 10);
        const newLight = parseInt((400 + Math.random() * 200).toFixed(0), 10);
        const newSoil = parseInt((50 + Math.random() * 30).toFixed(0), 10);

        setMonitoringData(prev => ({ ...prev, temperature: newTemp, humidity: newHumidity, lightIntensity: newLight, soilMoisture: newSoil }));
        setHistoricalData(prev => ({
            labels: [...prev.labels.slice(1), new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })],
            temperature: [...prev.temperature.slice(1), newTemp],
            humidity: [...prev.humidity.slice(1), newHumidity],
            lightIntensity: [...prev.lightIntensity.slice(1), newLight],
            soilMoisture: [...prev.soilMoisture.slice(1), newSoil]
        }));
    }, 300000);
    return () => clearInterval(interval);
  }, []);
  
  // Konfigurasi Chart
  const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: false } } };
  const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: true } } };
  const temperatureChartData = { labels: historicalData.labels, datasets: [{ label: 'Suhu (°C)', data: historicalData.temperature, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }]};
  const environmentChartData = { labels: historicalData.labels, datasets: [ { label: 'Kelembaban Udara (%)', data: historicalData.humidity, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.1)', borderWidth: 2, fill: false }, { label: 'Kelembaban Media (%)', data: historicalData.soilMoisture, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.1)', borderWidth: 2, fill: false } ]};
  const lightChartData = { labels: historicalData.labels.slice(-12), datasets: [{ label: 'Intensitas Cahaya (lux)', data: historicalData.lightIntensity.slice(-12), backgroundColor: 'rgba(255, 206, 86, 0.8)', borderColor: 'rgba(255, 206, 86, 1)', borderWidth: 1 }]};
  const statusChartData = { labels: ['Optimal', 'Perlu Perhatian', 'Normal'], datasets: [{ data: [65, 15, 20], backgroundColor: ['#22c55e', '#f97316', '#3b82f6'], borderColor: '#ffffff', borderWidth: 2 }]};

  // Fungsi utilitas
  const getStatusColor = (value: number, min: number, max: number): string => { if (value < min || value > max) return '#ef4444'; if (value < min + (max-min)*0.1 || value > max - (max-min)*0.1) return '#f97316'; return '#22c55e'; };
  const dismissAlert = (alertId: number) => setAlerts(alerts.filter(alert => alert.id !== alertId));

  return (
    <div className="dashboard-container">
        <PageStyles />
        <header className="dashboard-header">
            <div className="header-content">
                <a href="/" style={{color: '#3b82f6', textDecoration: 'none', fontWeight: '600'}}>← Kembali</a>
                <div style={{textAlign: 'center'}}>
                    <h1 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937'}}>Monitoring {name}</h1>
                    {/* PERBAIKAN: Menampilkan waktu dari state, bukan memanggil fungsi langsung */}
                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Update terakhir: {currentTime}</p>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{height: '0.75rem', width: '0.75rem', backgroundColor: '#22c55e', borderRadius: '9999px'}}></span>
                    <span style={{color: '#374151', fontWeight: '500'}}>{monitoringData.connectionStatus}</span>
                </div>
            </div>
        </header>

        <main className="main-content">
            <div className="widget-grid">
                {/* Widget Suhu */}
                <div className="widget">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem', marginRight: '0.75rem'}}>🌡️</span>
                    <h3 style={{fontWeight: '600', color: '#374151'}}>Suhu</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'baseline'}}>
                        <span style={{fontSize: '1.875rem', fontWeight: '700'}}>{monitoringData.temperature}</span>
                        <span style={{color: '#6b7280', marginLeft: '0.25rem'}}>°C</span>
                        </div>
                        <div style={{textAlign: 'right', fontSize: '0.875rem'}}>
                          <div style={{height: '0.5rem', width: '4rem', borderRadius: '9999px', backgroundColor: getStatusColor(monitoringData.temperature, 20, 30) }}></div>
                          <span>Normal</span></div></div></div>
                {/* Widget Kelembaban */}
                <div className="widget">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem', marginRight: '0.75rem'}}>💧</span>
                    <h3 style={{fontWeight: '600', color: '#374151'}}>Kelembaban</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'baseline'}}>
                        <span style={{fontSize: '1.875rem', fontWeight: '700'}}>{monitoringData.humidity}</span>
                        <span style={{color: '#6b7280', marginLeft: '0.25rem'}}>%</span>
                        </div>
                        <div style={{textAlign: 'right', fontSize: '0.875rem'}}>
                          <div style={{height: '0.5rem', width: '4rem', borderRadius: '9999px', backgroundColor: getStatusColor(monitoringData.humidity, 60, 80) }}></div>
                          <span>Optimal</span></div></div></div>
                {/* Widget Intensitas Cahaya */}
                <div className="widget">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem', marginRight: '0.75rem'}}>☀️</span>
                    <h3 style={{fontWeight: '600', color: '#374151'}}>Intensitas Cahaya</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'baseline'}}>
                        <span style={{fontSize: '1.875rem', fontWeight: '700'}}>{monitoringData.lightIntensity}</span>
                        <span style={{color: '#6b7280', marginLeft: '0.25rem'}}>lux</span>
                        </div>
                        <div style={{textAlign: 'right', fontSize: '0.875rem'}}>
                          <div style={{height: '0.5rem', width: '4rem', borderRadius: '9999px', backgroundColor: getStatusColor(monitoringData.lightIntensity, 300, 600) }}></div>
                          <span>Baik</span></div></div></div>
                {/* Widget Kelembaban Media */}
                <div className="widget">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem', marginRight: '0.75rem'}}>🌱</span>
                    <h3 style={{fontWeight: '600', color: '#374151'}}>Kelembaban Media</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'baseline'}}>
                        <span style={{fontSize: '1.875rem', fontWeight: '700'}}>{monitoringData.soilMoisture}</span>
                        <span style={{color: '#6b7280', marginLeft: '0.25rem'}}>%</span>
                        </div>
                        <div style={{textAlign: 'right', fontSize: '0.875rem'}}>
                          <div style={{height: '0.5rem', width: '4rem', borderRadius: '9999px', backgroundColor: getStatusColor(monitoringData.soilMoisture, 40, 70) }}></div>
                          <span>Normal</span></div></div></div>
                {/* Widget pH Media */}
                <div className="widget">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem', marginRight: '0.75rem'}}>⚗️</span>
                    <h3 style={{fontWeight: '600', color: '#374151'}}>pH Media</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'baseline'}}>
                        <span style={{fontSize: '1.875rem', fontWeight: '700'}}>{monitoringData.ph}</span>
                        <span style={{color: '#6b7280', marginLeft: '0.25rem'}}>pH</span>
                        </div>
                        <div style={{textAlign: 'right', fontSize: '0.875rem'}}>
                          <div style={{height: '0.5rem', width: '4rem', borderRadius: '9999px', backgroundColor: getStatusColor(monitoringData.ph, 5.5, 6.5) }}></div>
                          <span>Optimal</span></div></div></div>
                {/* Widget Baterai */}
                <div className="widget">
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem', marginRight: '0.75rem'}}>🔋</span>
                    <h3 style={{fontWeight: '600', color: '#374151'}}>Baterai Sensor</h3>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'baseline'}}>
                        <span style={{fontSize: '1.875rem', fontWeight: '700'}}>{monitoringData.batteryLevel}</span>
                        <span style={{color: '#6b7280', marginLeft: '0.25rem'}}>%</span>
                        </div>
                        <div style={{width: '5rem'}}>
                          <div style={{height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden'}}>
                            <div style={{height: '100%', borderRadius: '9999px', width: `${monitoringData.batteryLevel}%`, backgroundColor: monitoringData.batteryLevel > 20 ? '#22c55e' : '#ef4444' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
            </div>

            {/* Bagian Grafik */}
            <div className="chart-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937'}}>📊 Visualisasi Data Historis</h2>
                    <button style={{backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem'}} onClick={() => setShowCharts(!showCharts)}>{showCharts ? 'Sembunyikan' : 'Tampilkan'} Grafik</button>
                </div>
                {showCharts && (
                <div className="chart-grid">
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}><h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Grafik Suhu (24 Jam Terakhir)</h3><div style={{height: '16rem'}}><Line data={temperatureChartData} options={lineChartOptions} /></div></div>
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}><h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Kelembaban Udara vs Media</h3><div style={{height: '16rem'}}><Line data={environmentChartData} options={lineChartOptions} /></div></div>
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}><h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Intensitas Cahaya (12 Jam Terakhir)</h3><div style={{height: '16rem'}}><Bar data={lightChartData} options={barChartOptions} /></div></div>
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}><h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Status Kesehatan Keseluruhan</h3><div style={{height: '16rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><div style={{width: '12rem', height: '12rem'}}><Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} /></div></div></div>
                </div>
                )}
            </div>

            {/* Bagian Notifikasi */}
            <div className="chart-section">
                <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>Notifikasi & Alert</h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {alerts.map(alert => (
                    <div key={alert.id} className={`alert ${alert.type === 'warning' ? 'alert-warning' : 'alert-info'}`}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{fontSize: '1.25rem', marginRight: '0.75rem'}}>{alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <div><p style={{fontWeight: '600'}}>{alert.message}</p><small>{alert.time}</small></div>
                    </div>
                    <button style={{background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', fontWeight: '700', opacity: '0.5'}} onClick={() => dismissAlert(alert.id)}>×</button>
                    </div>
                ))}
                </div>
            </div>
            
            {/* Bagian Aksi Cepat */}
            <div className="chart-section">
                <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>Aksi Cepat</h2>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                    <button style={{backgroundColor: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600'}}>💧 Siram Manual</button>
                    <button style={{backgroundColor: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600'}}>⚙️ Pengaturan</button>
                    <button style={{backgroundColor: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600'}}>📱 Kirim Laporan</button>
                </div>
            </div>
        </main>
    </div>
  );
}


// Ini adalah default export untuk halaman /monitoring
export default function MonitoringPage() {
  // Komponen fallback untuk Suspense
  const Loading = () => (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <h2>Memuat Data Monitoring...</h2>
    </div>
  );

  return (
    // <Suspense> tetap digunakan sebagai praktik terbaik
    <Suspense fallback={<Loading />}>
      <MonitoringDashboard />
    </Suspense>
  );
}

