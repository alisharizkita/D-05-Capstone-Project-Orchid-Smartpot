'use client';

import React from 'react';

// PERBAIKAN 1: Mengubah 'icon' menjadi path ke gambar di folder public
const orchidData = [
  { id: 'Calanthe', name: 'Calanthe', description: 'Anggrek epifit yang tahan cuaca dengan bunga beragam warna.', tags: ['Tahan panas', 'Berbunga lebat'], icon: '/calanthe.png' },
  { id: 'Phaius', name: 'Phaius', description: 'Anggrek kupu-kupu dengan bunga elegan dan tahan lama.', tags: ['Indoor', 'Elegan'], icon: '/phaius.png' },
  { id: 'Spathoglottis', name: 'Spathoglottis', description: 'Dikenal sebagai "Ratu Anggrek" karena bunganya yang besar dan wangi.', tags: ['Wangi', 'Bunga besar'], icon: '/spathoglotis.png' }
];

// --- CSS disematkan langsung untuk menghindari error import ---
const pageStyles = `
  .mainContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background: #f9fafb;
    font-family: 'Poppins', sans-serif;
  }
  .title {
    font-size: 3rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 1rem;
    text-align: center;
  }
  .subtitle {
    font-size: 1.2rem;
    color: #6b7280;
    margin-bottom: 3rem;
    text-align: center;
  }
  .cardsContainer {
    display: flex;
    flex-wrap: wrap; 
    justify-content: center;
    gap: 2rem;
    width: 100%;
    max-width: 1000px;
  }
  .card {
    min-height: 400px;
    width: 280px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #ffffff;
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
    color: #111827;
  }
  .cardDescription {
    color: #4b5563;
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
  .imageContainer {
    margin-bottom: 1.5rem; /* Sedikit ruang tambahan */
  }

  /* PERBAIKAN 3: Menyesuaikan style untuk tag <img> */
  .placeholderImage {
    width: 120px;   /* Dibuat sedikit lebih besar */
    height: 120px;
    margin: 0 auto;
    border-radius: 50%; /* Membuat gambar menjadi lingkaran */
    object-fit: cover;  /* Memastikan gambar mengisi lingkaran tanpa distorsi */
    border: 4px solid white; /* Opsional: menambah border putih */
    box-shadow: 0 5px 15px rgba(0,0,0,0.1); /* Opsional: menambah bayangan */
  }
  .characteristics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .tag {
    background: #e5e7eb;
    color: #374151;
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
    border-top: 1px solid #e5e7eb;
    margin-top: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #9ca3af;
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
                  {/* PERBAIKAN 2: Mengganti <div> dengan <img> */}
                  <img 
                    src={orchid.icon} 
                    alt={`Gambar ${orchid.name}`} 
                    className="placeholderImage" 
                  />
                </div>
                <h2>{orchid.name}</h2>
                <p className="cardDescription">{orchid.description}</p>
                <div className="characteristics">
                  {orchid.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
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

