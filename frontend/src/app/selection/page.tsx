'use client';

import React, { useState, useEffect } from 'react';

interface Plant {
  id: number;
  plant_name: string;
  plant_type: string;
  device_id: string;
  created_at: string;
  last_update?: string;
  status?: 'healthy' | 'warning' | 'critical';
  temperature?: number;
  humidity?: number;
  water_level?: number;
}

const orchidTypes = [
  { 
    id: 'Calanthe', 
    name: 'Calanthe', 
    description: 'Anggrek epifit yang tahan cuaca dengan bunga beragam warna.', 
    tags: ['Tahan panas', 'Berbunga lebat'], 
    icon: '/calanthe.png',
    tempRange: '20-30°C',
    humidityRange: '60-80%'
  },
  { 
    id: 'Phaius', 
    name: 'Phaius', 
    description: 'Anggrek kupu-kupu dengan bunga elegan dan tahan lama.', 
    tags: ['Indoor', 'Elegan'], 
    icon: '/phaius.png',
    tempRange: '18-28°C',
    humidityRange: '65-85%'
  },
  { 
    id: 'Spathoglottis', 
    name: 'Spathoglottis', 
    description: 'Dikenal sebagai "Ratu Anggrek" karena bunganya yang besar dan wangi.', 
    tags: ['Wangi', 'Bunga besar'], 
    icon: '/spathoglotis.png',
    tempRange: '22-32°C',
    humidityRange: '70-90%'
  }
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
    cursor: pointer;
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
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    plant_name: '',
    plant_type: '',
    device_id: ''
  });

  // Fetch plants from API
  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      // Ganti dengan user_id yang sebenarnya dari session/auth
      const userId = 1; // TODO: Get from auth context
      
      const response = await fetch(`${apiUrl}/plants.php?user_id=${userId}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setPlants(result.data || []);
      } else {
        setError(result.message || 'Gagal mengambil data tanaman');
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const userId = 1; // TODO: Get from auth context
      
      const response = await fetch(`${apiUrl}/plants.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...formData
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setSuccess('Tanaman berhasil ditambahkan!');
        setShowAddModal(false);
        setFormData({ plant_name: '', plant_type: '', device_id: '' });
        fetchPlants();
      } else {
        setError(result.message || 'Gagal menambahkan tanaman');
      }
    } catch (err) {
      console.error('Error adding plant:', err);
      setError('Gagal terhubung ke server');
    }
  };

  const handleDeletePlant = async (plantId: number) => {
    if (!confirm('Yakin ingin menghapus tanaman ini?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const response = await fetch(`${apiUrl}/plants.php?id=${plantId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setSuccess('Tanaman berhasil dihapus');
        fetchPlants();
      } else {
        setError(result.message || 'Gagal menghapus tanaman');
      }
    } catch (err) {
      console.error('Error deleting plant:', err);
      setError('Gagal terhubung ke server');
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
          
          {/* My Plants Section */}
          <section className="myPlantsSection">
            <div className="sectionTitle">
              <span>🪴 Tanaman Saya ({plants.length})</span>
              <button className="addButton" onClick={() => setShowAddModal(true)}>
                <span style={{fontSize: '1.2rem'}}>+</span>
                Tambah Tanaman
              </button>
            </div>
            
            {plants.length === 0 ? (
              <div className="emptyState">
                <h3>Belum ada tanaman</h3>
                <p>Klik tombol "Tambah Tanaman" untuk memulai monitoring</p>
              </div>
            ) : (
              <div className="plantsGrid">
                {plants.map((plant) => (
                  <div key={plant.id} className="plantCard">
                    <div className="plantCardHeader">
                      <div className="plantInfo">
                        <h3>{plant.plant_name}</h3>
                        <p className="plantType">{plant.plant_type}</p>
                      </div>
                      <span className={`statusBadge ${getStatusColor(plant.status)}`}>
                        {getStatusText(plant.status)}
                      </span>
                    </div>
                    
                    <div className="plantStats">
                      <div className="statItem">
                        <div className="statLabel">Suhu</div>
                        <div className="statValue">{plant.temperature || '--'}°C</div>
                      </div>
                      <div className="statItem">
                        <div className="statLabel">Kelembaban</div>
                        <div className="statValue">{plant.humidity || '--'}%</div>
                      </div>
                      <div className="statItem">
                        <div className="statLabel">Air</div>
                        <div className="statValue">{plant.water_level || '--'}%</div>
                      </div>
                    </div>
                    
                    <div style={{fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem'}}>
                      Device ID: {plant.device_id}
                    </div>
                    
                    <div className="plantActions">
                      <button 
                        className="actionBtn monitorBtn"
                        onClick={() => window.location.href = `/monitoring?plant_id=${plant.id}&name=${plant.plant_name}`}
                      >
                        📊 Monitor
                      </button>
                      <button 
                        className="actionBtn deleteBtn"
                        onClick={() => handleDeletePlant(plant.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Orchid Types Reference */}
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
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%23ddd" width="120" height="120"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E🌸%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <h3>{type.name}</h3>
                  <p className="typeDescription">{type.description}</p>
                  <div className="typeTags">
                    {type.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem'}}>
                    <div>🌡️ {type.tempRange}</div>
                    <div>💧 {type.humidityRange}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Add Plant Modal */}
        {showAddModal && (
          <div className="modal" onClick={() => setShowAddModal(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <div className="modalHeader">
                <h2>➕ Tambah Tanaman Baru</h2>
                <button className="closeBtn" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleAddPlant}>
                <div className="formGroup">
                  <label>Nama Tanaman *</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Anggrek Rumah Depan"
                    value={formData.plant_name}
                    onChange={(e) => setFormData({...formData, plant_name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="formGroup">
                  <label>Jenis Anggrek *</label>
                  <select 
                    value={formData.plant_type}
                    onChange={(e) => setFormData({...formData, plant_type: e.target.value})}
                    required
                  >
                    <option value="">Pilih jenis...</option>
                    {orchidTypes.map(type => (
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
                    onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                    required
                  />
                  <small style={{color: '#6b7280', fontSize: '0.85rem'}}>
                    ID unik perangkat IoT yang terpasang pada pot
                  </small>
                </div>
                
                <button type="submit" className="submitBtn">
                  Tambahkan Tanaman
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}