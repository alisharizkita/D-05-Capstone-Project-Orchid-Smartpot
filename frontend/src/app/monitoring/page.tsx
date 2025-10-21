'use client'; // Wajib karena kita pakai hooks

import React, { Suspense, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ------------------ Interfaces ------------------
interface MonitoringData {
  temperature: number;
  humidity: number;
  light_intensity: number;
  soil_moisture: number;
  lastWatering: string;
  connectionStatus: string;
}

interface Alert {
  id: number;
  type: 'warning' | 'info';
  message: string;
  time: string;
}

// Interface sesuai API
interface SensorRecord {
  temperature: number;
  humidity: number;
  light_intensity: number;
  soil_moisture: number;
  formatted_time: string;
}

interface HistoricalData {
  labels: string[];
  temperature: number[];
  humidity: number[];
  light_intensity: number[];
  soil_moisture: number[];
}

// ------------------ CSS Inline ------------------
const PageStyles = () => (
  <style>{`
    .dashboard-container { padding: 2rem; background-color: #f3f4f6; min-height: 100vh; font-family: sans-serif; }
    .dashboard-header { background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1rem; margin-bottom: 2rem; border-radius: 0.5rem; }
    .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1280px; margin: auto; }
    .widget-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .widget { background-color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .chart-section { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 2rem; }
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

// ------------------ Component ------------------
function MonitoringDashboard() {
  const [name, setName] = useState('Anggrek');
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    temperature: 0,
    humidity: 0,
    light_intensity: 0,
    soil_moisture: 0,
    lastWatering: '',
    connectionStatus: 'Connected'
  });
  const [historicalData, setHistoricalData] = useState<HistoricalData>({
    labels: [],
    temperature: [],
    humidity: [],
    light_intensity: [],
    soil_moisture: []
  });
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'warning', message: 'Kelembaban tanah rendah', time: '5 menit lalu' },
    { id: 2, type: 'info', message: 'Penyiraman otomatis aktif', time: '2 jam lalu' }
  ]);
  const [showCharts, setShowCharts] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // ------------------ Fetch Sensor Data ------------------
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch("http://localhost/sensors");
        const json = await res.json();

        if (json.status === "success" && json.data?.data?.length) {
          const allData: SensorRecord[] = json.data.data;

          const latest = allData[allData.length - 1];

          setMonitoringData({
            temperature: latest.temperature ?? 0,
            humidity: latest.humidity ?? 0,
            light_intensity: latest.light_intensity ?? 0,
            soil_moisture: latest.soil_moisture ?? 0,
            lastWatering: latest.formatted_time ?? '',
            connectionStatus: 'Connected'
          });

          const labels = allData.map(d => d.formatted_time);
          const temps = allData.map(d => d.temperature ?? 0);
          const hums = allData.map(d => d.humidity ?? 0);
          const lights = allData.map(d => d.light_intensity ?? 0);
          const moistures = allData.map(d => d.soil_moisture ?? 0);

          setHistoricalData({ labels, temperature: temps, humidity: hums, light_intensity: lights, soil_moisture: moistures });
        } else {
          console.error("Invalid API response structure", json);
        }
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 300000); // refresh tiap 5 menit
    return () => clearInterval(interval);
  }, []);

  // ------------------ Current Time ------------------
  useEffect(() => {
    const formatTime = () =>
      new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setCurrentTime(formatTime());
    const timer = setInterval(() => setCurrentTime(formatTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ------------------ Chart Options ------------------
  const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: false } } };
  const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: true } } };

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
      { label: 'Kelembaban Udara (%)', data: historicalData.humidity, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.1)', borderWidth: 2, fill: false },
      { label: 'Kelembaban Media (%)', data: historicalData.soil_moisture, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.1)', borderWidth: 2, fill: false }
    ]
  };

  const lightChartData = {
    labels: historicalData.labels.slice(-12),
    datasets: [{
      label: 'Intensitas Cahaya (lux)',
      data: historicalData.light_intensity.slice(-12),
      backgroundColor: 'rgba(255, 206, 86, 0.8)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1
    }]
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

  // ------------------ Helpers ------------------
  const getStatusColor = (value: number, min: number, max: number): string => {
    if (value < min || value > max) return '#ef4444';
    if (value < min + (max-min)*0.1 || value > max - (max-min)*0.1) return '#f97316';
    return '#22c55e';
  };

  const dismissAlert = (alertId: number) => setAlerts(alerts.filter(alert => alert.id !== alertId));

  // ------------------ JSX ------------------
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
            <span style={{
              height: '0.75rem',
              width: '0.75rem',
              backgroundColor: monitoringData.connectionStatus === 'Connected' ? '#3b82f6' : '#ef4444',
              borderRadius: '9999px',
              animation: monitoringData.connectionStatus === 'Connected' ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none'
            }}></span>
            <span style={{color: '#374151', fontWeight: '500'}}>{monitoringData.connectionStatus || '...'}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Widget Grid */}
        <div className="widget-grid">
          <Widget title="Suhu" icon="🌡️" value={monitoringData.temperature} unit="°C" statusColor={getStatusColor(monitoringData.temperature, 20, 30)} statusText="Normal"/>
          <Widget title="Kelembaban" icon="💧" value={monitoringData.humidity} unit="%" statusColor={getStatusColor(monitoringData.humidity, 60, 80)} statusText="Optimal"/>
          <Widget title="Intensitas Cahaya" icon="☀️" value={monitoringData.light_intensity} unit="lux" statusColor={getStatusColor(monitoringData.light_intensity, 300, 600)} statusText="Baik"/>
          <Widget title="Kelembaban Media" icon="🌱" value={monitoringData.soil_moisture} unit="%" statusColor={getStatusColor(monitoringData.soil_moisture, 40, 70)} statusText="Normal"/>
        </div>

        {/* Charts Section */}
        <ChartSection showCharts={showCharts} setShowCharts={setShowCharts} temperatureChartData={temperatureChartData} environmentChartData={environmentChartData} lightChartData={lightChartData} statusChartData={statusChartData} />

        {/* Alerts */}
        <AlertSection alerts={alerts} dismissAlert={dismissAlert} />

        {/* Quick Actions */}
        <QuickActions />
      </main>
    </div>
  );
}

// ------------------ Subcomponents ------------------
interface WidgetProps {
  title: string;
  icon: string;
  value: number;
  unit: string;
  statusColor: string;
  statusText: string;
}
const Widget = ({title, icon, value, unit, statusColor, statusText}: WidgetProps) => (
  <div className="widget">
    <div className="widget-header"><span className="widget-icon">{icon}</span><h3 className="widget-title">{title}</h3></div>
    <div className="widget-body">
      <div className="widget-value-container"><span className="widget-value">{value ?? '...'}</span><span className="widget-unit">{unit}</span></div>
      <div className="widget-status">
        <div className="status-bar" style={{ backgroundColor: statusColor }}></div>
        <span>{statusText}</span>
      </div>
    </div>
  </div>
);

interface ChartSectionProps {
  showCharts: boolean;
  setShowCharts: React.Dispatch<React.SetStateAction<boolean>>;
  temperatureChartData: any;
  environmentChartData: any;
  lightChartData: any;
  statusChartData: any;
}
const ChartSection = ({showCharts, setShowCharts, temperatureChartData, environmentChartData, lightChartData, statusChartData}: ChartSectionProps) => (
  <div className="chart-section">
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
      <h2 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937'}}>📊 Visualisasi Data Historis</h2>
      <button style={{backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem'}} onClick={() => setShowCharts(!showCharts)}>{showCharts ? 'Sembunyikan' : 'Tampilkan'} Grafik</button>
    </div>
    {showCharts && (
      <div className="chart-grid">
        <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
          <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Grafik Suhu (24 Jam Terakhir)</h3>
          <div style={{height: '16rem'}}><Line data={temperatureChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: false } } }} /></div>
        </div>
        <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
          <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Kelembaban Udara vs Media</h3>
          <div style={{height: '16rem'}}><Line data={environmentChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: false } } }} /></div>
        </div>
        <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
          <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Intensitas Cahaya (12 Jam Terakhir)</h3>
          <div style={{height: '16rem'}}><Bar data={lightChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: true } } }} /></div>
        </div>
        <div style={{border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem'}}>
          <h3 style={{fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem'}}>Status Kesehatan Keseluruhan</h3>
          <div style={{height: '16rem', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '12rem', height: '12rem'}}>
              <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

interface AlertSectionProps {
  alerts: Alert[];
  dismissAlert: (id: number) => void;
}
const AlertSection = ({alerts, dismissAlert}: AlertSectionProps) => (
  <div className="widget" style={{marginTop: '2rem'}}>
    <h3 style={{fontWeight: '600', marginBottom: '1rem'}}>🔔 Notifikasi</h3>
    {alerts.length === 0 && <p>Tidak ada notifikasi.</p>}
    {alerts.map(alert => (
      <div key={alert.id} className={`alert ${alert.type === 'warning' ? 'alert-warning' : 'alert-info'}`} style={{marginBottom: '0.5rem'}}>
        <span>{alert.message} ({alert.time})</span>
        <button onClick={() => dismissAlert(alert.id)} style={{fontWeight: '700'}}>×</button>
      </div>
    ))}
  </div>
);

const QuickActions = () => (
  <div className="widget" style={{marginTop: '2rem'}}>
    <h3 style={{fontWeight: '600', marginBottom: '1rem'}}>⚡ Aksi Cepat</h3>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
      <button style={{backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem'}}>Sirami Sekarang</button>
      <button style={{backgroundColor: '#f97316', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem'}}>Reset Sensor</button>
      <button style={{backgroundColor: '#22c55e', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem'}}>Aktifkan Auto</button>
    </div>
  </div>
);

export default function MonitoringPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <MonitoringDashboard />
    </Suspense>
  );
}
