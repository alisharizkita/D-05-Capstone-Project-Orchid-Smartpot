'use client';

import React from 'react';

// Data untuk kartu-kartu anggrek
const orchidData = [
  { id: 'dendrobium', name: 'Dendrobium', description: 'Anggrek epifit yang tahan cuaca dengan bunga beragam warna.', tags: ['Tahan panas', 'Berbunga lebat'], icon: '🌸' },
  { id: 'phalaenopsis', name: 'Phalaenopsis', description: 'Anggrek kupu-kupu dengan bunga elegan dan tahan lama.', tags: ['Indoor', 'Elegan'], icon: '🦋' },
  { id: 'cattleya', name: 'Cattleya', description: 'Dikenal sebagai "Ratu Anggrek" karena bunganya yang besar dan wangi.', tags: ['Wangi', 'Bunga besar'], icon: '👑' }
];

// --- PERBAIKAN: CSS disematkan langsung untuk menghindari error import ---
const pageStyles = `
  /* Styling untuk halaman pemilihan anggrek */
  .mainContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    font-family: sans-serif;
  }
  .title {
    font-size: 3rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1rem;
    text-align: center;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
  }
  .subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 3rem;
    text-align: center;
  }
  .cardsContainer {
    display: flex;
    flex-wrap: wrap; /* Agar responsif di layar kecil */
    justify-content: center;
    gap: 2rem;
    width: 100%;
    max-width: 1000px; /* Batas lebar maksimum */
  }
  .card {
    min-height: 400px;
    width: 280px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    text-align: center;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    text-decoration: none; /* Menghilangkan garis bawah dari link */
  }
  .card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    background: rgba(255,255,255,0.15);
  }
  .card h2 {
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
    color: white;
  }
  .cardDescription {
    color: rgba(255,255,255,0.8);
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
  .imageContainer {
    margin-bottom: 1rem;
  }
  .placeholderImage {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }
  .characteristics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .tag {
    background: rgba(255,255,255,0.2);
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
  }
  .selectButton {
    background: linear-gradient(45deg, #00ff88, #00ccff);
    color: #1a2c3a;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  .selectButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,255,136,0.3);
  }
  .footer {
    width: 100%;
    padding-top: 3rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    margin-top: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0.6);
  }
`;

export default function OrchidSelectionPage() {
  return (
    <>
      {/* Menyisipkan CSS langsung ke dalam halaman */}
      <style>{pageStyles}</style>

      {/* Menggunakan nama kelas biasa, bukan objek 'styles' */}
      <main className="mainContainer">
        
        <h1 className="title">Sistem Monitoring Anggrek</h1>
        <p className="subtitle">Pilih jenis anggrek yang ingin Anda monitor</p>

        <div className="cardsContainer">
          {orchidData.map((orchid) => (
            // --- PERBAIKAN: Menggunakan tag <a> untuk navigasi ---
            <a 
              key={orchid.id} 
              href={`/monitoring.tsx?type=${orchid.id}&name=${orchid.name}`} 
              className="card"
            >
              <div>
                <div className="imageContainer">
                  <div className="placeholderImage">{orchid.icon}</div>
                </div>
                <h2>{orchid.name}</h2>
                <p className="cardDescription">{orchid.description}</p>
                <div className="characteristics">
                  {orchid.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              {/* Mengganti <button> dengan <div> agar valid di dalam <a> */}
              <div className="selectButton">
                Pilih
              </div>
            </a>
          ))}
        </div>
        
        <footer className="footer">
          <p>Orchid Smartpot © 2025</p>
        </footer>
      </main>
    </>
  );
}

