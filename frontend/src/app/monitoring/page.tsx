  'use client'; // Wajib ada karena kita menggunakan hooks (useState, useEffect)

  import React, { Suspense, useState, useEffect } from 'react';
  import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
  } from 'chart.js';
  import { Line, Bar, Doughnut } from 'react-chartjs-2';

  ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
  );

  // --- PERBAIKAN: Interface disesuaikan ke snake_case agar cocok dengan database ---
  interface MonitoringData {
    temperature: number; 
    humidity: number; 
    light_intensity: number; 
    soil_moisture: number; 
    lastWatering: string; 
    connectionStatus: string;
  }
  interface Alert {
    id: number; type: 'warning' | 'info'; message: string; time: string;
  }

  // Komponen CSS yang disematkan
  const PageStyles = () => (
      <style>{`
          .dashboard-container { padding: 2rem; background-color: #f3f4f6; min-height: 100vh; font-family: sans-serif; }
          .dashboard-header { background-color: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); padding: 1rem; margin-bottom: 2rem; border-radius: 0.5rem; }
          .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1280px; margin: auto; }
          .widget-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
          .widget { background-color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
          .chart-section { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); margin-top: 2rem; }
          .chart-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 1rem; }
          @media (min-width: 1024px) { .chart-grid { grid-template-columns: repeat(2, 1fr); } }
          .alert { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-radius: 0.5rem; }
          .alert-warning { background-color: #fef3c7; color: #92400e; }
          .alert-info { background-color: #dbeafe; color: #1e40af; }
          .main-content { max-width: 1280px; margin: auto; }
          .widget-header { display: flex; align-items: center; margin-bottom: 0.5rem; }
          .widget-icon { font-size: 1.5rem; margin-right: 0.75rem; }
          .widget-title { font-weight: 600; color: #374151; }
          .widget-body { display: flex; justify-content: space-between; align-items: flex-end; }
          .widget-value-container { display: flex; align-items: baseline; }
          .widget-value { font-size: 1.875rem; font-weight: 700; }
          .widget-unit { color: #6b7280; margin-left: 0.25rem; }
          .widget-status { text-align: right; font-size: 0.875rem; }
          .status-bar { height: 0.5rem; width: 4rem; border-radius: 9999px; }
      `}</style>
  );


  function MonitoringDashboard() {
    const [name, setName] = useState('Anggrek');
    const [monitoringData, setMonitoringData] = useState<Partial<MonitoringData>>({});
    const [historicalData, setHistoricalData] = useState<{ 
      labels: string[]; 
      temperature: number[]; 
      humidity: number[]; 
      light_intensity: number[]; 
      soil_moisture: number[]; }>({ labels: [], temperature: [], humidity: [], light_intensity: [], soil_moisture: [] });
    const [alerts, setAlerts] = useState<Alert[]>([ { id: 1, type: 'warning', message: 'Kelembaban tanah rendah', time: '5 menit lalu' }, { id: 2, type: 'info', message: 'Penyiraman otomatis aktif', time: '2 jam lalu' } ]);
    const [showCharts, setShowCharts] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    const fetchSensorData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured in .env.local");

        const response = await fetch(`${apiUrl}/monitoring-data.php`);
        if (!response.ok) throw new Error(`Gagal mengambil data: ${response.statusText}`);
        
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          const latestData = result.data.latest;
          setMonitoringData({
            temperature: parseFloat(latestData.temperature),
            humidity: parseFloat(latestData.humidity),
            light_intensity: parseInt(latestData.light_intensity, 10),
            soil_moisture: parseFloat(latestData.soil_moisture),
            connectionStatus: 'Connected (Dummy)',
            lastWatering: latestData.lastWatering,
          });

          const historyData = result.data.history;
          
          setHistoricalData({
              labels: historyData.labels,
              temperature: historyData.datasets.temperature,
              humidity: historyData.datasets.humidity,
              light_intensity: historyData.datasets.light_intensity,
              soil_moisture: historyData.datasets.soil_moisture,
          });

        } else {
          throw new Error(result.error || 'Format data dari API tidak sesuai');
        }

      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setMonitoringData(prev => ({ ...prev, connectionStatus: 'Error' }));
      }
    };

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get('name');
      if (urlName) setName(urlName);
      fetchSensorData();
      const dataFetchInterval = setInterval(fetchSensorData, 5000);
      const formatTime = () => new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit'});
      setCurrentTime(formatTime());
      const timer = setInterval(() => setCurrentTime(formatTime()), 1000);
      return () => {
        clearInterval(dataFetchInterval);
        clearInterval(timer);
      };
    }, []);

    const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: false } } };
    const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: true } } };
    
    const temperatureChartData = { labels: historicalData.labels, datasets: [{ label: 'Suhu (°C)', data: historicalData.temperature, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }]};
    const environmentChartData = { labels: historicalData.labels, datasets: [ { label: 'Kelembaban Udara (%)', data: historicalData.humidity, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.1)', borderWidth: 2, fill: false }, { label: 'Kelembaban Media (%)', data: historicalData.soil_moisture, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.1)', borderWidth: 2, fill: false } ]};
    const lightChartData = { labels: historicalData.labels.slice(-12), datasets: [{ label: 'Intensitas Cahaya (lux)', data: historicalData.light_intensity.slice(-12), backgroundColor: 'rgba(255, 206, 86, 0.8)', borderColor: 'rgba(255, 206, 86, 1)', borderWidth: 1 }]};
    const statusChartData = { labels: ['Optimal', 'Perlu Perhatian', 'Normal'], datasets: [{ data: [65, 15, 20], backgroundColor: ['#22c55e', '#f97316', '#3b82f6'], borderColor: '#ffffff', borderWidth: 2 }]};
    
    const getStatusColor = (value: number, min: number, max: number): string => { if (value < min || value > max) return '#ef4444'; if (value < min + (max-min)*0.1 || value > max - (max-min)*0.1) return '#f97316'; return '#22c55e'; };
    const dismissAlert = (alertId: number) => setAlerts(alerts.filter(alert => alert.id !== alertId));

    return (
      <div className="dashboard-container">
          <PageStyles />
          <header className="dashboard-header">
              <div className="header-content">
                  <a href="/selection" style={{color: '#3b82f6', textDecoration: 'none', fontWeight: '600'}}>← Kembali</a>
                  <div style={{textAlign: 'center'}}>
                      <h1 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937'}}>Monitoring {name}</h1>
                      <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Update terakhir: {currentTime}</p>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{height: '0.75rem', width: '0.75rem', backgroundColor: monitoringData.connectionStatus === 'Connected (Dummy)' ? '#3b82f6' : '#ef4444', borderRadius: '9999px', animation: monitoringData.connectionStatus === 'Connected (Dummy)' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'}}></span>
                      <span style={{color: '#374151', fontWeight: '500'}}>{monitoringData.connectionStatus || '...'}</span>
                  </div>
              </div>
          </header>
          <main className="main-content">
              <div className="widget-grid">
                  <div className="widget"><div className="widget-header"><span className="widget-icon">🌡️</span><h3 className="widget-title">Suhu</h3></div><div className="widget-body"><div className="widget-value-container"><span className="widget-value">{monitoringData.temperature ?? '...'}</span><span className="widget-unit">°C</span></div><div className="widget-status"><div className="status-bar" style={{ backgroundColor: getStatusColor(monitoringData.temperature ?? 25, 20, 30) }}></div><span>Normal</span></div></div></div>
                  <div className="widget"><div className="widget-header"><span className="widget-icon">💧</span><h3 className="widget-title">Kelembaban</h3></div><div className="widget-body"><div className="widget-value-container"><span className="widget-value">{monitoringData.humidity ?? '...'}</span><span className="widget-unit">%</span></div><div className="widget-status"><div className="status-bar" style={{ backgroundColor: getStatusColor(monitoringData.humidity ?? 70, 60, 80) }}></div><span>Optimal</span></div></div></div>
                  <div className="widget"><div className="widget-header"><span className="widget-icon">☀️</span><h3 className="widget-title">Intensitas Cahaya</h3></div><div className="widget-body"><div className="widget-value-container"><span className="widget-value">{monitoringData.light_intensity ?? '...'}</span><span className="widget-unit">lux</span></div><div className="widget-status"><div className="status-bar" style={{ backgroundColor: getStatusColor(monitoringData.light_intensity ?? 450, 300, 600) }}></div><span>Baik</span></div></div></div>
                  <div className="widget"><div className="widget-header"><span className="widget-icon">🌱</span><h3 className="widget-title">Kelembaban Media</h3></div><div className="widget-body"><div className="widget-value-container"><span className="widget-value">{monitoringData.soil_moisture ?? '...'}</span><span className="widget-unit">%</span></div><div className="widget-status"><div className="status-bar" style={{ backgroundColor: getStatusColor(monitoringData.soil_moisture ?? 55, 40, 70) }}></div><span>Normal</span></div></div></div>
              </div>
              
              {/* --- PERBAIKAN: Mengembalikan bagian chart, alert, dan aksi --- */}
              <div className="chart-section">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937'}}>📊 Visualisasi Data Historis</h2>
                      <button style={{backgroundColor: '#3b82f6', color: 'white', padding : '0.5rem 1rem', borderRadius: '0.5rem'}} onClick={() => setShowCharts(!showCharts)}>{showCharts ? 'Sembunyikan' : 'Tampilkan'} Grafik</button>
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


  export default function MonitoringPage() {
    const Loading = () => <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><h2>Memuat Data Monitoring...</h2></div>;
    return (<Suspense fallback={<Loading />}><MonitoringDashboard /></Suspense>);
  }

