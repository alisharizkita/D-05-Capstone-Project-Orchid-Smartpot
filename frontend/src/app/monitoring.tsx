// Perhatikan nama file baru
'use client';
// Perbaikan: Menghapus impor 'next/navigation', 'page.module.css', dan 'next/link'
import React, { useState, useEffect } from 'react';
// import Link from 'next/link'; // Dihapus karena menyebabkan error
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
  lightIntensity: number;
  soilMoisture: number;
  ph: number;
  lastWatering: string;
  batteryLevel: number;
  connectionStatus: string;
}

interface Alert {
  id: number;
  type: 'warning' | 'info';
  message: string;
  time: string;
}

export default function MonitoringComponent() {
  // Perbaikan: Menggunakan useEffect dan window.location.search untuk mendapatkan parameter URL
  const [name, setName] = useState('Anggrek');
  
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({ temperature: 28.5, humidity: 75, lightIntensity: 450, soilMoisture: 65, ph: 6.2, lastWatering: '2 jam yang lalu', batteryLevel: 85, connectionStatus: 'Connected' });
  const [historicalData, setHistoricalData] = useState<{ labels: string[]; temperature: number[]; humidity: number[]; lightIntensity: number[]; soilMoisture: number[]; }>({ labels: [], temperature: [], humidity: [], lightIntensity: [], soilMoisture: [] });
  const [alerts, setAlerts] = useState<Alert[]>([ { id: 1, type: 'warning', message: 'Kelembaban tanah rendah', time: '5 menit lalu' }, { id: 2, type: 'info', message: 'Penyiraman otomatis aktif', time: '2 jam lalu' } ]);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    // Kode ini hanya berjalan di sisi client, setelah komponen ter-mount
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    if (urlName) {
      setName(urlName);
    }

    // Logika untuk data historis awal
    const now = new Date();
    const labels = [];
    const temperature = [];
    const humidity = [];
    const lightIntensity = [];
    const soilMoisture = [];

    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        temperature.push(parseFloat((25 + Math.random() * 8).toFixed(1)));
        humidity.push(parseInt((65 + Math.random() * 20).toFixed(0)));
        lightIntensity.push(parseInt((300 + Math.random() * 400).toFixed(0)));
        soilMoisture.push(parseInt((40 + Math.random() * 40).toFixed(0)));
    }
    setHistoricalData({ labels, temperature, humidity, lightIntensity, soilMoisture });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        const newTemp = parseFloat((25 + Math.random() * 8).toFixed(1));
        const newHumidity = parseInt((65 + Math.random() * 20).toFixed(0));
        const newLight = parseInt((400 + Math.random() * 200).toFixed(0));
        const newSoil = parseInt((50 + Math.random() * 30).toFixed(0));

        setMonitoringData(prev => ({ ...prev, temperature: newTemp, humidity: newHumidity, lightIntensity: newLight, soilMoisture: newSoil }));
        setHistoricalData(prev => ({
            labels: [...prev.labels.slice(1), new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })],
            temperature: [...prev.temperature.slice(1), newTemp],
            humidity: [...prev.humidity.slice(1), newHumidity],
            lightIntensity: [...prev.lightIntensity.slice(1), newLight],
            soilMoisture: [...prev.soilMoisture.slice(1), newSoil]
        }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const temperatureChartData = {
    labels: historicalData.labels,
    datasets: [{ label: 'Suhu (°C)', data: historicalData.temperature, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.1)', borderWidth: 2, fill: true, tension: 0.4, }],
  };
  const environmentChartData = {
    labels: historicalData.labels,
    datasets: [
        { label: 'Kelembaban (%)', data: historicalData.humidity, borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgba(54, 162, 235, 0.1)', borderWidth: 2, fill: false },
        { label: 'Kelembaban Media (%)', data: historicalData.soilMoisture, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.1)', borderWidth: 2, fill: false },
    ],
  };
  const lightChartData = {
    labels: historicalData.labels.slice(-12),
    datasets: [{ label: 'Intensitas Cahaya (lux)', data: historicalData.lightIntensity.slice(-12), backgroundColor: 'rgba(255, 206, 86, 0.8)', borderColor: 'rgba(255, 206, 86, 1)', borderWidth: 1 }],
  };
  const statusChartData = {
    labels: ['Optimal', 'Perlu Perhatian', 'Normal'],
    datasets: [{ data: [65, 15, 20], backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(54, 162, 235, 0.8)'], borderColor: ['#fff'], borderWidth: 2 }],
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const, } }, scales: { y: { beginAtZero: false, } } };
  const getStatusColor = (value: number, min: number, max: number): string => { if (value < min || value > max) return '#ef4444'; if (value < min + 5 || value > max - 5) return '#f97316'; return '#22c55e'; };
  const formatTime = (): string => new Date().toLocaleString('id-ID');
  const dismissAlert = (alertId: number) => setAlerts(alerts.filter(alert => alert.id !== alertId));

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 mb-8 rounded-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Perbaikan: Mengganti Link dengan tag <a> standar */}
          <a href="/" className="text-blue-600 hover:underline font-semibold no-underline">← Kembali</a>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Monitoring {name}</h1>
            <p className="text-sm text-gray-500">Update terakhir: {formatTime()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-gray-700 font-medium">{monitoringData.connectionStatus}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Widgets */}
          <div className="bg-white p-4 rounded-lg shadow-md"><div className="flex items-center mb-2"><span className="text-2xl mr-3">🌡️</span><h3 className="font-semibold text-gray-700">Suhu</h3></div><div className="flex justify-between items-end"><div className="flex items-baseline"><span className="text-3xl font-bold">{monitoringData.temperature}</span><span className="text-gray-500 ml-1">°C</span></div><div className="text-right text-sm"><div className="h-2 w-16 rounded-full" style={{ backgroundColor: getStatusColor(monitoringData.temperature, 20, 30) }}></div><span>Normal</span></div></div></div>
          <div className="bg-white p-4 rounded-lg shadow-md"><div className="flex items-center mb-2"><span className="text-2xl mr-3">💧</span><h3 className="font-semibold text-gray-700">Kelembaban</h3></div><div className="flex justify-between items-end"><div className="flex items-baseline"><span className="text-3xl font-bold">{monitoringData.humidity}</span><span className="text-gray-500 ml-1">%</span></div><div className="text-right text-sm"><div className="h-2 w-16 rounded-full" style={{ backgroundColor: getStatusColor(monitoringData.humidity, 60, 80) }}></div><span>Optimal</span></div></div></div>
          <div className="bg-white p-4 rounded-lg shadow-md"><div className="flex items-center mb-2"><span className="text-2xl mr-3">☀️</span><h3 className="font-semibold text-gray-700">Intensitas Cahaya</h3></div><div className="flex justify-between items-end"><div className="flex items-baseline"><span className="text-3xl font-bold">{monitoringData.lightIntensity}</span><span className="text-gray-500 ml-1">lux</span></div><div className="text-right text-sm"><div className="h-2 w-16 rounded-full" style={{ backgroundColor: getStatusColor(monitoringData.lightIntensity, 300, 600) }}></div><span>Baik</span></div></div></div>
          <div className="bg-white p-4 rounded-lg shadow-md"><div className="flex items-center mb-2"><span className="text-2xl mr-3">🌱</span><h3 className="font-semibold text-gray-700">Kelembaban Media</h3></div><div className="flex justify-between items-end"><div className="flex items-baseline"><span className="text-3xl font-bold">{monitoringData.soilMoisture}</span><span className="text-gray-500 ml-1">%</span></div><div className="text-right text-sm"><div className="h-2 w-16 rounded-full" style={{ backgroundColor: getStatusColor(monitoringData.soilMoisture, 40, 70) }}></div><span>Normal</span></div></div></div>
          <div className="bg-white p-4 rounded-lg shadow-md"><div className="flex items-center mb-2"><span className="text-2xl mr-3">⚗️</span><h3 className="font-semibold text-gray-700">pH Media</h3></div><div className="flex justify-between items-end"><div className="flex items-baseline"><span className="text-3xl font-bold">{monitoringData.ph}</span><span className="text-gray-500 ml-1">pH</span></div><div className="text-right text-sm"><div className="h-2 w-16 rounded-full" style={{ backgroundColor: getStatusColor(monitoringData.ph, 5.5, 6.5) }}></div><span>Optimal</span></div></div></div>
          <div className="bg-white p-4 rounded-lg shadow-md"><div className="flex items-center mb-2"><span className="text-2xl mr-3">🔋</span><h3 className="font-semibold text-gray-700">Baterai Sensor</h3></div><div className="flex justify-between items-end"><div className="flex items-baseline"><span className="text-3xl font-bold">{monitoringData.batteryLevel}</span><span className="text-gray-500 ml-1">%</span></div><div className="w-20"><div className="h-4 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${monitoringData.batteryLevel}%`, backgroundColor: monitoringData.batteryLevel > 20 ? '#22c55e' : '#ef4444' }}></div></div></div></div></div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">📊 Visualisasi Data Historis</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" onClick={() => setShowCharts(!showCharts)}>{showCharts ? 'Sembunyikan' : 'Tampilkan'} Grafik</button>
            </div>
            {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="border p-4 rounded-lg"><h3 className="font-semibold text-center mb-2">Grafik Suhu (24 Jam Terakhir)</h3><div className="h-64"><Line data={temperatureChartData} options={chartOptions} /></div></div>
                <div className="border p-4 rounded-lg"><h3 className="font-semibold text-center mb-2">Kelembaban Udara vs Media</h3><div className="h-64"><Line data={environmentChartData} options={chartOptions} /></div></div>
                <div className="border p-4 rounded-lg"><h3 className="font-semibold text-center mb-2">Intensitas Cahaya (12 Jam Terakhir)</h3><div className="h-64"><Bar data={lightChartData} options={chartOptions} /></div></div>
                <div className="border p-4 rounded-lg"><h3 className="font-semibold text-center mb-2">Status Kesehatan Keseluruhan</h3><div className="h-64 flex justify-center items-center"><div className="w-48 h-48"><Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} /></div></div></div>
            </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Notifikasi & Alert</h2>
            <div className="space-y-3">
            {alerts.map(alert => (
                <div key={alert.id} className={`flex justify-between items-center p-3 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                <div className="flex items-center">
                    <span className="text-xl mr-3">{alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <div><p className="font-semibold">{alert.message}</p><small>{alert.time}</small></div>
                </div>
                <button className="bg-transparent border-none text-2xl cursor-pointer font-bold opacity-50 hover:opacity-100" onClick={() => dismissAlert(alert.id)}>×</button>
                </div>
            ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
            <div className="flex flex-wrap gap-4">
                <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">💧 Siram Manual</button>
                <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">⚙️ Pengaturan</button>
                <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">📱 Kirim Laporan</button>
            </div>
        </div>
      </main>
    </div>
  );
};

