"use client";
import React, { useState, useEffect } from 'react';


// ===== API SERVICE (Embedded) =====
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // ✅ INJECT TOKEN JWT KE HEADER
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseURL}/${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.status === 'success') {
        return { success: true, data: data.data || data };
      } else if (data.status === 'error') {
        return { success: false, error: data.message || 'Request failed' };
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Request timeout - Server tidak merespons' };
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { success: false, error: 'Tidak dapat terhubung ke server' };
      }
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ✅ ORCHID METHODS
  async getAllOrchids() {
    return this.request<any[]>('orchid');
  }

  async createOrchid(orchidData: {
    orchid_name: string;
    orchid_type: string;
    device_id: string;
  }) {
    return this.request<any>('orchid', {
      method: 'POST',
      body: JSON.stringify(orchidData),
    });
  }

  async deleteOrchid(orchidId: number) {
    return this.request<any>(`orchid?orchid_id=${orchidId}`, {
      method: 'DELETE',
    });
  }
}

const apiService = new ApiService(API_BASE_URL);

// ===== TYPES =====
interface Orchid {
  orchid_id: number;
  user_id: number;
  orchid_name: string;
  orchid_type: string;
  min_moisture?: string;
  max_moisture?: string;
  last_update?: string;
  status?: 'healthy' | 'warning' | 'critical';
  temperature?: number;
  humidity?: number;
  water_level?: number;
  device_id?: string;
}

const orchidTypes = [
  { id: 'Calanthe', name: 'Calanthe', description: 'Anggrek epifit yang tahan cuaca dengan bunga beragam warna.', tags: ['Tahan panas', 'Berbunga lebat'], icon: '/calanthe.png', tempRange: '20-30°C', humidityRange: '60-80%' },
  { id: 'Phaius', name: 'Phaius', description: 'Anggrek kupu-kupu dengan bunga elegan dan tahan lama.', tags: ['Indoor', 'Elegan'], icon: '/phaius.png', tempRange: '18-28°C', humidityRange: '65-85%' },
  { id: 'Spathoglottis', name: 'Spathoglottis', description: 'Dikenal sebagai "Ratu Anggrek" karena bunganya yang besar dan wangi.', tags: ['Wangi', 'Bunga besar'], icon: '/spathoglotis.png', tempRange: '22-32°C', humidityRange: '70-90%' }
];

const pageStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .mainContainer {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 2rem;
  }
  
  .header {
    max-width: 1200px;
    margin: 0 auto 3rem;
    text-align: center;
  }
  
  .title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
    color: #6b7280;
  }
  
  .contentWrapper {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .sectionTitle {
    font-size: 1.8rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .addButton {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  .addButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
  
  .myPlantsSection {
    margin-bottom: 3rem;
  }
  
  .plantsGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .plantCard {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .plantCard:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
  
  .plantCardHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .plantInfo h3 {
    font-size: 1.4rem;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .plantType {
    font-size: 0.9rem;
    color: #6b7280;
    font-style: italic;
  }
  
  .statusBadge {
    padding: 0.4rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .status-healthy {
    background: #d1fae5;
    color: #065f46;
  }
  
  .status-warning {
    background: #fef3c7;
    color: #92400e;
  }
  
  .status-critical {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .plantStats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin: 1rem 0;
  }
  
  .statItem {
    text-align: center;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 10px;
  }
  
  .statLabel {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
  
  .statValue {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
  }
  
  .plantActions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .actionBtn {
    flex: 1;
    padding: 0.6rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }
  
  .monitorBtn {
    background: #3b82f6;
    color: white;
  }
  
  .monitorBtn:hover {
    background: #2563eb;
  }
  
  .deleteBtn {
    background: #ef4444;
    color: white;
    flex: 0.3;
  }
  
  .deleteBtn:hover {
    background: #dc2626;
  }
  
  .emptyState {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 20px;
    border: 2px dashed #d1d5db;
  }
  
  .emptyState h3 {
    font-size: 1.5rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .emptyState p {
    color: #9ca3af;
  }
  
  .orchidTypesSection {
    margin-top: 3rem;
  }
  
  .typeCardsContainer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
  
  .typeCard {
    background: white;
    border-radius: 25px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .typeCard:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }
  
  .typeCardImage {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #f3f4f6;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .typeCard h3 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .typeDescription {
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  
  .typeTags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .tag {
    background: #e5e7eb;
    color: #374151;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .modalContent {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modalHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .modalHeader h2 {
    font-size: 1.8rem;
    color: #1f2937;
  }
  
  .closeBtn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
  }
  
  .formGroup {
    margin-bottom: 1.5rem;
  }
  
  .formGroup label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
  }
  
  .formGroup input,
  .formGroup select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .formGroup input:focus,
  .formGroup select:focus {
    outline: none;
    border-color: #667eea;
  }
  
  .submitBtn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .submitBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  .submitBtn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
  
  .loadingOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .spinner {
    border: 4px solid #f3f4f6;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .errorMessage {
    background: #fee2e2;
    color: #991b1b;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  
  .successMessage {
    background: #d1fae5;
    color: #065f46;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
`;

export default function OrchidSelectionPage() {
  const [plants, setPlants] = useState<Orchid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    orchid_name: '',
    orchid_type: '',
    device_id: ''
  });

  // ✅ Fetch Data dengan apiService (otomatis kirim token)
  const fetchPlants = async () => {
  try {
    setIsLoading(true);
    setError('');

    // ambil user_id
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await apiService.getAllOrchids();

    if (response.success && Array.isArray(response.data)) {
      setPlants(response.data);
    } else {
      setError(response.error || 'Gagal mengambil data anggrek');
    }
  } catch (err) {
    console.error(err);
    setError('Tidak dapat terhubung ke server.');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/selection';
      return;
    }
    
    fetchPlants();
  }, []);

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await apiService.createOrchid(formData);

      if (response.success) {
        setSuccess('Anggrek berhasil ditambahkan!');
        setShowAddModal(false);
        setFormData({ orchid_name: '', orchid_type: '', device_id: '' });
        fetchPlants();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Gagal menambahkan anggrek');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim data ke server.');
    }
  };

  const handleDeletePlant = async (orchidId: number) => {
    if (!confirm('Yakin ingin menghapus anggrek ini?')) return;
    
    try {
      const response = await apiService.deleteOrchid(orchidId);

      if (response.success) {
        setSuccess('Anggrek berhasil dihapus');
        fetchPlants();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Gagal menghapus anggrek');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghapus data.');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'status-healthy';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-healthy';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'healthy': return '✓ Sehat';
      case 'warning': return '⚠ Perhatian';
      case 'critical': return '✗ Kritis';
      default: return '— Status';
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="mainContainer">
        {isLoading && (
          <div className="loadingOverlay">
            <div className="spinner"></div>
          </div>
        )}

        <header className="header">
          <h1 className="title">🌸 Orchid Smart Monitoring</h1>
          <p className="subtitle">Kelola dan pantau semua anggrek Anda dalam satu tempat</p>
        </header>

        <div className="contentWrapper">
          {error && <div className="errorMessage">{error}</div>}
          {success && <div className="successMessage">{success}</div>}

          <section className="myPlantsSection">
            <div className="sectionTitle">
              <span>🪴 Anggrek Saya ({plants.length})</span>
              <button className="addButton" onClick={() => setShowAddModal(true)}>
                <span style={{ fontSize: '1.2rem' }}>+</span>
                Tambah Anggrek
              </button>
            </div>

            {plants.length === 0 ? (
              <div className="emptyState">
                <h3>Belum ada anggrek</h3>
                <p>Klik tombol "Tambah Anggrek" untuk memulai monitoring</p>
              </div>
            ) : (
              <div className="plantsGrid">
                {plants.map((orchid) => (
                  <div key={orchid.orchid_id} className="plantCard">
                    <div className="plantCardHeader">
                      <div className="plantInfo">
                        <h3>{orchid.orchid_name}</h3>
                        <p className="plantType">{orchid.orchid_type}</p>
                      </div>
                      <span className={`statusBadge ${getStatusColor(orchid.status)}`}>
                        {getStatusText(orchid.status)}
                      </span>
                    </div>

                    <div className="plantStats">
                      <div className="statItem">
                        <div className="statLabel">Suhu</div>
                        <div className="statValue">{orchid.temperature || '--'}°C</div>
                      </div>
                      <div className="statItem">
                        <div className="statLabel">Kelembaban</div>
                        <div className="statValue">{orchid.humidity || '--'}%</div>
                      </div>
                      <div className="statItem">
                        <div className="statLabel">Air</div>
                        <div className="statValue">{orchid.water_level || '--'}%</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                      Device ID: {orchid.device_id}
                    </div>

                    <div className="plantActions">
                      <button
                        className="actionBtn monitorBtn"
                        onClick={() =>
                          (window.location.href = `/monitoring?orchid_id=${orchid.orchid_id}&name=${orchid.orchid_name}`)
                        }
                      >
                        📊 Monitor
                      </button>
                      <button
                        className="actionBtn deleteBtn"
                        onClick={() => handleDeletePlant(orchid.orchid_id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="orchidTypesSection">
            <div className="sectionTitle">
              <span>📚 Referensi Jenis Anggrek</span>
            </div>
            <div className="typeCardsContainer">
              {orchidTypes.map((type) => (
                <div key={type.id} className="typeCard">
                  <img
                    src={type.icon}
                    alt={type.name}
                    className="typeCardImage"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23ddd" width="120" height="120"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E🌸%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <h3>{type.name}</h3>
                  <p className="typeDescription">{type.description}</p>
                  <div className="typeTags">
                    {type.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    <div>🌡️ {type.tempRange}</div>
                    <div>💧 {type.humidityRange}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {showAddModal && (
          <div className="modal" onClick={() => setShowAddModal(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <div className="modalHeader">
                <h2>➕ Tambah Anggrek Baru</h2>
                <button className="closeBtn" onClick={() => setShowAddModal(false)}>×</button>
              </div>

              <div>
                <div className="formGroup">
                  <label>Nama Anggrek *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Anggrek Pot Depan"
                    value={formData.orchid_name}
                    onChange={(e) => setFormData({ ...formData, orchid_name: e.target.value })}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Jenis Anggrek *</label>
                  <select
                    value={formData.orchid_type}
                    onChange={(e) => setFormData({ ...formData, orchid_type: e.target.value })}
                    required
                  >
                    <option value="">Pilih jenis...</option>
                    {orchidTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="formGroup">
                  <label>Device ID *</label>
                  <input
                    type="text"
                    placeholder="Contoh: ESP32-001"
                    value={formData.device_id}
                    onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                    required
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    ID unik perangkat IoT yang terpasang pada pot
                  </small>
                </div>

                <button 
                  onClick={handleAddPlant} 
                  className="submitBtn"
                  disabled={!formData.orchid_name || !formData.orchid_type || !formData.device_id}
                >
                  Tambahkan Anggrek
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}