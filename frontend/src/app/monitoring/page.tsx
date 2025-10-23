'use client';

import React, { Suspense, useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
);

interface MonitoringData {
  temperature: number; 
  humidity: number; 
  light_intensity: number; 
  soil_moisture: number; 
  water_level: number;
  lastWatering: string; 
  connectionStatus: string;
}

interface Alert {
  id: number; 
  type: 'warning' | 'info'; 
  message: string; 
  time: string;
}

const PageStyles = () => (
    <style>{`
        .dashboard-container { padding: 2rem; background-color: #f3f4f6; min-height: 100vh; font-family: sans-serif; }
        .dashboard-header { background-color: white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); padding: 1rem; margin-bottom: 2rem; border-radius: 0.5rem; }
        .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1280px; margin: auto; }
        .backButton { color: #3b82f6; text-decoration: none; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background 0.2s; }
        .backButton:hover { background: #eff6ff; }
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
        
        .water-level-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .water-tank {
            position: relative;
            width: 150px;
            height: 300px;
            border: 3px solid #3b82f6;
            border-radius: 15px;
            background: linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 100%);
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .water-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(to top, #0ea5e9 0%, #38bdf8 100%);
            transition: height 0.5s ease;
        }
        .water-wave {
            position: absolute;
            top: -10px;
            left: 0;
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: wave 2s ease-in-out infinite;
        }
        @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); }
        }
        .water-percentage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            color: #1e3a8a;
            z-index: 10;
            text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
        }
        .water-status-text {
            text-align: center;
            margin-top: 1rem;
            font-weight: 600;
            font-size: 1.1rem;
        }
        .water-status-low { color: #dc2626; }
        .water-status-medium { color: #f59e0b; }
        .water-status-high { color: #10b981; }
    `}</style>
);

function MonitoringDashboard() {
  const [plantId, setPlantId] = useState<string | null>(null);
  const [plantName, setPlantName] = useState('Anggrek');
  const [monitoringData, setMonitoringData] = useState<Partial<MonitoringData>>({});
  const [historicalData, setHistoricalData] = useState<{ 
    labels: string[]; 
    temperature: number[]; 
    humidity: number[]; 
    light_intensity: number[]; 
    soil_moisture: number[]; 
  }>({ 
    labels: [], 
    temperature: [], 
    humidity: [], 
    light_intensity: [], 
    soil_moisture: [] 
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  const fetchSensorData = async () => {
    if (!plantId) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

      // Fetch dengan plant_id
      const response = await fetch(`${apiUrl}/monitoring-data.php?plant_id=${plantId}`);
      if (!response.ok) {
        throw new Error(`Gagal mengambil data: ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        const latestData = result.data.latest;
        setMonitoringData({
          temperature: parseFloat(latestData.temperature),
          humidity: parseFloat(latestData.humidity),
          light_intensity: parseInt(latestData.light_intensity, 10),
          soil_moisture: parseFloat(latestData.soil_moisture),
          water_level: parseInt(latestData.water_level, 10),
          connectionStatus: 'Connected',
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

        // Generate alerts based on conditions
        const currentWaterLevel = parseInt(latestData.water_level, 10);
        if (currentWaterLevel < 20) {
          setAlerts(prev => {
            const exists = prev.some(alert => alert.message.includes('level air'));
            if (!exists) {
              return [...prev, {
                id: Date.now(),
                type: 'warning',
                message: 'Peringatan: Level air sangat rendah! Segera isi ulang.',
                time: 'Baru saja'
              }];
            }
            return prev;
          });
        }

      } else {
        throw new Error(result.error || 'Format data dari API tidak sesuai');
      }

    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setMonitoringData(prev => ({ ...prev, connectionStatus: 'Error' }));
    }
  };

  useEffect(() => {
    // Get plant_id and name from URL
    const params = new URLSearchParams(window.location.search);
    const urlPlantId = params.get('plant_id');
    const urlName = params.get('name');
    
    if (urlPlantId) {
      setPlantId(urlPlantId);
    }
    if (urlName) {
      setPlantName(urlName);
    }
    
    // Format time
    const formatTime = () => new Date().toLocaleString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
    setCurrentTime(formatTime());
    const timer = setInterval(() => setCurrentTime(formatTime()), 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Fetch data when plantId is available
  useEffect(() => {
    if (plantId) {
      fetchSensorData();
      const dataFetchInterval = setInterval(fetchSensorData, 5000);
      
      return () => {
        clearInterval(dataFetchInterval);
      };
    }
  }, [plantId]);

  // Chart Options
  const lineChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { position: 'top' as const } 
    }, 
    scales: { 
      y: { beginAtZero: false } 
    } 
  };
  
  const temperatureChartData = { 
    labels: historicalData.labels, 
    datasets: [{ 
      label: 'Suhu (°C)', 
      data: historicalData.temperature, 
      borderColor: 'rgb(255, 99, 132)', 
      backgroundColor: 'rgba(255, 99, 132, 0.1)', 
      borderWidth: 2, 
      fill: true, 
      tension: 0.4 
    }]
  };
  
  const environmentChartData = { 
    labels: historicalData.labels, 
    datasets: [ 
      { 
        label: 'Kelembaban Udara (%)', 
        data: historicalData.humidity, 
        borderColor: 'rgb(54, 162, 235)', 
        backgroundColor: 'rgba(54, 162, 235, 0.1)', 
        borderWidth: 2, 
        fill: false 
      }, 
      { 
        label: 'Kelembaban Media (%)', 
        data: historicalData.soil_moisture, 
        borderColor: 'rgb(75, 192, 192)', 
        backgroundColor: 'rgba(75, 192, 192, 0.1)', 
        borderWidth: 2, 
        fill: false 
      } 
    ]
  };
  
  const statusChartData = { 
    labels: ['Optimal', 'Perlu Perhatian', 'Normal'], 
    datasets: [{ 
      data: [65, 15, 20], 
      backgroundColor: ['#22c55e', '#f97316', '#3b82f6'], 
      borderColor: '#ffffff', 
      borderWidth: 2 
    }]
  };
  
  const getStatusColor = (value: number, min: number, max: number): string => { 
    if (value < min || value > max) return '#ef4444'; 
    if (value < min + (max-min)*0.1 || value > max - (max-min)*0.1) return '#f97316'; 
    return '#22c55e'; 
  };
  
  const dismissAlert = (alertId: number) => setAlerts(alerts.filter(alert => alert.id !== alertId));

  const getWaterLevelStatus = (level: number) => {
    if (level < 20) return { text: 'Rendah - Perlu Isi Ulang!', class: 'water-status-low' };
    if (level < 50) return { text: 'Sedang', class: 'water-status-medium' };
    return { text: 'Tinggi - Optimal', class: 'water-status-high' };
  };

  const waterLevel = monitoringData.water_level ?? 0;
  const waterStatus = getWaterLevelStatus(waterLevel);

  // Show loading if no plantId
  if (!plantId) {
    return (
      <>
        <PageStyles />
        <div style={{ 
          display: 'flex', 
          height: '100vh', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Plant ID tidak ditemukan</h2>
          <a href="/selection" style={{color: '#3b82f6', textDecoration: 'underline'}}>
            Kembali ke Selection
          </a>
        </div>
      </>
    );
  }

  return (
    <div className="dashboard-container">
        <PageStyles />
        <header className="dashboard-header">
             <div className="header-content">
                <a href="/selection" className="backButton">← Kembali</a>
                <div style={{textAlign: 'center'}}>
                    <h1 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937'}}>
                      Monitoring {plantName}
                    </h1>
                    <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                      Plant ID: {plantId} | Update terakhir: {currentTime}
                    </p>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{
                      height: '0.75rem', 
                      width: '0.75rem', 
                      backgroundColor: monitoringData.connectionStatus === 'Connected' ? '#3b82f6' : '#ef4444', 
                      borderRadius: '9999px', 
                      animation: monitoringData.connectionStatus === 'Connected' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                    }}></span>
                    <span style={{color: '#374151', fontWeight: '500'}}>
                      {monitoringData.connectionStatus || 'Connecting...'}
                    </span>
                </div>
            </div>
        </header>
        
        <main className="main-content">
            <div className="widget-grid">
                <div className="widget">
                  <div className="widget-header">
                    <span className="widget-icon">🌡️</span>
                    <h3 className="widget-title">Suhu</h3>
                  </div>
                  <div className="widget-body">
                    <div className="widget-value-container">
                      <span className="widget-value">{monitoringData.temperature ?? '...'}</span>
                      <span className="widget-unit">°C</span>
                    </div>
                    <div className="widget-status">
                      <div className="status-bar" style={{ 
                        backgroundColor: getStatusColor(monitoringData.temperature ?? 25, 20, 30) 
                      }}></div>
                      <span>Normal</span>
                    </div>
                  </div>
                </div>
                
                <div className="widget">
                  <div className="widget-header">
                    <span className="widget-icon">💧</span>
                    <h3 className="widget-title">Kelembaban</h3>
                  </div>
                  <div className="widget-body">
                    <div className="widget-value-container">
                      <span className="widget-value">{monitoringData.humidity ?? '...'}</span>
                      <span className="widget-unit">%</span>
                    </div>
                    <div className="widget-status">
                      <div className="status-bar" style={{ 
                        backgroundColor: getStatusColor(monitoringData.humidity ?? 70, 60, 80) 
                      }}></div>
                      <span>Optimal</span>
                    </div>
                  </div>
                </div>
                
                <div className="widget">
                  <div className="widget-header">
                    <span className="widget-icon">☀️</span>
                    <h3 className="widget-title">Intensitas Cahaya</h3>
                  </div>
                  <div className="widget-body">
                    <div className="widget-value-container">
                      <span className="widget-value">{monitoringData.light_intensity ?? '...'}</span>
                      <span className="widget-unit">lux</span>
                    </div>
                    <div className="widget-status">
                      <div className="status-bar" style={{ 
                        backgroundColor: getStatusColor(monitoringData.light_intensity ?? 450, 300, 600) 
                      }}></div>
                      <span>Baik</span>
                    </div>
                  </div>
                </div>
                
                <div className="widget">
                  <div className="widget-header">
                    <span className="widget-icon">🌱</span>
                    <h3 className="widget-title">Kelembaban Media</h3>
                  </div>
                  <div className="widget-body">
                    <div className="widget-value-container">
                      <span className="widget-value">{monitoringData.soil_moisture ?? '...'}</span>
                      <span className="widget-unit">%</span>
                    </div>
                    <div className="widget-status">
                      <div className="status-bar" style={{ 
                        backgroundColor: getStatusColor(monitoringData.soil_moisture ?? 55, 40, 70) 
                      }}></div>
                      <span>Normal</span>
                    </div>
                  </div>
                </div>
            </div>
            
            <div className="chart-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937'}}>
                      📊 Visualisasi Data Monitoring
                    </h2>
                </div>
                <div className="chart-grid">
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
                      <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>
                        Grafik Suhu (24 Jam Terakhir)
                      </h3>
                      <div style={{height: '16rem'}}>
                        <Line data={temperatureChartData} options={lineChartOptions} />
                      </div>
                    </div>
                    
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
                      <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>
                        Kelembaban Udara vs Media
                      </h3>
                      <div style={{height: '16rem'}}>
                        <Line data={environmentChartData} options={lineChartOptions} />
                      </div>
                    </div>
                    
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
                      <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>
                        🚰 Visualisasi Tangki Air
                      </h3>
                      <div className="water-level-container">
                        <div className="water-tank">
                          <div 
                            className="water-fill" 
                            style={{ height: `${waterLevel}%` }}
                          >
                            <div className="water-wave"></div>
                          </div>
                          <div className="water-percentage">{waterLevel}%</div>
                        </div>
                      </div>
                      <div className={`water-status-text ${waterStatus.class}`}>
                        {waterStatus.text}
                      </div>
                    </div>
                    
                    <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
                      <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '5rem'}}>
                        Status Kesehatan Keseluruhan
                      </h3>
                      <div style={{height: '16rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <div style={{width: '18rem', height: '18rem'}}>
                          <Doughnut 
                            data={statusChartData} 
                            options={{ 
                              responsive: true, 
                              maintainAspectRatio: false, 
                              plugins: { 
                                legend: { position: 'bottom' as const } 
                              } 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
                  🔔 Notifikasi & Alert
                </h2>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                    {alerts.length === 0 ? (
                      <div style={{
                        textAlign: 'center', 
                        padding: '2rem', 
                        color: '#6b7280',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem'
                      }}>
                        <p>✅ Tidak ada alert. Semua sistem berjalan normal.</p>
                      </div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className={`alert ${alert.type === 'warning' ? 'alert-warning' : 'alert-info'}`}>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <span style={{fontSize: '1.25rem', marginRight: '0.75rem'}}>
                              {alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                            </span>
                            <div>
                              <p style={{fontWeight: '600'}}>{alert.message}</p>
                              <small>{alert.time}</small>
                            </div>
                          </div>
                          <button 
                            style={{
                              background: 'transparent', 
                              border: 'none', 
                              fontSize: '1.5rem', 
                              cursor: 'pointer', 
                              fontWeight: '700', 
                              opacity: '0.5'
                            }} 
                            onClick={() => dismissAlert(alert.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                </div>
            </div>
            
            <div className="chart-section">
                <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem'}}>
                  ⚡ Aksi Cepat
                </h2>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                    <button style={{
                      backgroundColor: '#3b82f6', 
                      color: 'white',
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '0.5rem', 
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      💧 Siram Manual
                    </button>
                    <button style={{
                      backgroundColor: '#10b981', 
                      color: 'white',
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '0.5rem', 
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      💦 Isi Water Tank
                    </button>
                    <button style={{
                      backgroundColor: '#6b7280', 
                      color: 'white',
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '0.5rem', 
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      ⚙️ Pengaturan
                    </button>
                    <button style={{
                      backgroundColor: '#f59e0b', 
                      color: 'white',
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '0.5rem', 
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      📱 Kirim Laporan
                    </button>
                </div>
            </div>
        </main>
    </div>
  );
}

export default function MonitoringPage() {
  const Loading = () => (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <h2>Memuat Data Monitoring...</h2>
    </div>
  );
  
  return (
    <Suspense fallback={<Loading />}>
      <MonitoringDashboard />
    </Suspense>
  );
}