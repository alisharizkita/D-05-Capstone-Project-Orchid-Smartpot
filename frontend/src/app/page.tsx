'use client';

import React from 'react';

// Data untuk kartu-kartu anggrek
const orchidData = [
  { id: 'Calanthe', name: 'calanthe', description: 'Anggrek epifit yang tahan cuaca dengan bunga beragam warna.', tags: ['Tahan panas', 'Berbunga lebat'], icon: '🌸' },
  { id: 'Phaius', name: 'phaius', description: 'Anggrek kupu-kupu dengan bunga elegan dan tahan lama.', tags: ['Indoor', 'Elegan'], icon: '🦋' },
  { id: 'Spathoglottis', name: 'spathoglottis', description: 'Dikenal sebagai "Ratu Anggrek" karena bunganya yang besar dan wangi.', tags: ['Wangi', 'Bunga besar'], icon: '👑' }
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
    background: #FFFFF6;
    font-family: 'Poppins';
  }
  .title {
    font-size: 4rem;
    font-weight: bold;
    color: black;
    margin-bottom: 1rem;
    font-family:'Montserrat';
    text-align: center;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
  }
  .subtitle {
    font-size: 1.2rem;
    color: #6b7280;
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
    background: rgba(255, 255, 255, 1);
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 55px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  .card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .card h2 {
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
    font-family: 'Poppins';
    font-weight: bold;
    color: black;
  }
  .cardDescription {
    color: #4b5563;
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
    color: black;
    border:1px solid #e5e7eb;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
  }
  .selectButton {
    background: #D9D9D9;
    color: #1a2c3a;
    border: none;
    padding: 8px 18px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  .selectButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px #acacacff;
  }
  .footer {
    width: 100%;
    padding-top: 3rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    margin-top: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(255,255,255,0);
  }
`;

export default function OrchidSelectionPage() {
  return (
    <>
      <style>{pageStyles}</style>
      <main className="mainContainer">
        
        <h1 className="title">Choose Your Orchid Type</h1>
        <p className="subtitle">Your choice determines the algorithm used</p>

        <div className="cardsContainer">
          {orchidData.map((orchid) => (
            <a 
              key={orchid.id} 
              href={`/monitoring?type=${orchid.id}&name=${orchid.name}`} 
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

