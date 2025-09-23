'use client';

import React, { useEffect } from 'react';

const pageStyles = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        position: relative;
        overflow: auto;
    }
    .bg-decoration {
        position: absolute;
        border-radius: 50%;
        opacity: 0.1;
        animation: float 8s ease-in-out infinite;
    }
    .bg-decoration:nth-child(1) {
        width: 120px; height: 120px; background: white; top: 15%; left: 8%; animation-delay: 0s;
    }
    .bg-decoration:nth-child(2) {
        width: 180px; height: 180px; background: white; top: 60%; right: 12%; animation-delay: 2s;
    }
    .bg-decoration:nth-child(3) {
        width: 90px; height: 90px; background: white; bottom: 25%; left: 15%; animation-delay: 4s;
    }
    .bg-decoration:nth-child(4) {
        width: 60px; height: 60px; background: white; top: 30%; right: 30%; animation-delay: 6s;
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-25px) rotate(15deg); }
    }
    .left-section {
        flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Montserrat';
        padding: 3rem; color: white; text-align: center; position: relative; z-index: 1;
        background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/anggrek (2).jpg');  
        background-size: cover; 
        background-position: center; 
        background-repeat: no-repeat;
    }
    .brand-logo {
        font-size: 8rem; margin-bottom: 2rem; animation: pulse 3s ease-in-out infinite;
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
    }
    .brand-title {
        font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem;
        text-shadow: 2px 4px 8px rgba(0,0,0,0.3); letter-spacing: -1px;
    }
    .brand-subtitle {
        font-size: 1.3rem; opacity: 0.9; margin-bottom: 0.5rem; font-weight: 300;
    }
    .brand-description {
        font-size: 1rem; opacity: 0.8; max-width: 400px; line-height: 1.6; margin-bottom: 3rem;
    }
    .feature-list {
        display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;
    }
    .feature-item {
        display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; opacity: 0.9;
    }
    .feature-icon {
        font-size: 1.5rem; width: 40px; text-align: center;
    }
    .right-section {
        flex: 0 0 550px; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px);
        display: flex; flex-direction: column; justify-content: center; padding: 4rem;
        position: relative; box-shadow: -10px 0 30px rgba(0,0,0,0.1);
    }
    .login-container {
        width: 100%; max-width: 400px; margin: 0 auto;
    }
    .login-header {
        text-align: center; margin-bottom: 3rem;
    }
    .login-title {
        font-size: 2.2rem; color: #2c3e50; margin-bottom: 0.5rem; font-weight: 700;
    }
    .login-subtitle {
        color: #7f8c8d; font-size: 1.1rem; font-weight: 400;
    }
    .login-form {
        display: flex; flex-direction: column; gap: 1.8rem;
    }
    .form-group {
        position: relative;
    }
    .form-label {
        display: block; color: #2c3e50; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.95rem;
    }
    .form-input {
        width: 100%; padding: 1.2rem 1.2rem 1.2rem 1.2rem; border: 2px solid #e1e8ed;
        border-radius: 12px; font-size: 1rem; transition: all 0.3s ease; background: white; color: #2c3e50;
    }
    .form-input:focus {
        outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
    }
    .form-input::placeholder {
        color: #bdc3c7;
    }
    .input-icon {
        position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%);
        font-size: 1.3rem; color: #7f8c8d; transition: color 0.3s ease;
    }
    .form-input:focus ~ .input-icon {
        color: #667eea;
    }
    .password-toggle {
        position: absolute; right: 1.2rem; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer; font-size: 1.3rem; color: #7f8c8d;
        transition: color 0.3s ease; padding: 0.5rem;
    }
    .password-toggle:hover {
        color: #667eea;
    }
    .form-options {
        display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem;
    }
    .remember-me {
        display: flex; align-items: center; gap: 0.7rem; color: #2c3e50;
    }
    .remember-me input[type="checkbox"] {
        width: 20px; height: 20px; accent-color: #667eea; cursor: pointer;
    }
    .forgot-password {
        color: #667eea; text-decoration: none; font-weight: 500; transition: color 0.3s ease;
    }
    .forgot-password:hover {
        color: #764ba2; text-decoration: underline;
    }
    .login-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;
        padding: 1.3rem 2rem; border-radius: 12px; font-size: 1.1rem; font-weight: 600;
        cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; margin-top: 1rem;
    }
    .login-button::before {
        content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    .login-button:hover::before {
        left: 100%;
    }
    .login-button:hover {
        transform: translateY(-3px); box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
    .login-button:active {
        transform: translateY(-1px);
    }
    .login-button.loading {
        pointer-events: none;
    }
    .login-button.loading::after {
        content: ''; position: absolute; top: 50%; left: 50%; width: 22px; height: 22px;
        margin: -11px 0 0 -11px; border: 2px solid transparent; border-top: 2px solid white;
        border-radius: 50%; animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .divider {
        position: relative; margin: 2.5rem 0 2rem; text-align: center;
        color: #7f8c8d; font-size: 0.9rem;
    }
    .divider::before {
        content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px;
        background: #e1e8ed;
    }
    .divider span {
        background: rgba(255, 255, 255, 0.98); padding: 0 1.5rem; position: relative;
    }

    .alert {
        padding: 1.2rem; border-radius: 12px; margin-bottom: 1.5rem;
        display: none; animation: slideDown 0.3s ease-out; font-weight: 500;
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-15px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .alert.error {
        background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3);
    }
    .alert.success {
        background: rgba(39, 174, 96, 0.1); color: #27ae60; border: 1px solid rgba(39, 174, 96, 0.3);
    }
    .footer {
        position: absolute; bottom: 2rem; right: 4rem; color: #7f8c8d;
        font-size: 0.85rem; text-align: right;
    }
    .particle {
        position: absolute; background: rgba(255, 255, 255, 0.1); border-radius: 50%;
        pointer-events: none; animation: floatUp 4s linear infinite;
    }
    @keyframes floatUp {
        0% { opacity: 1; transform: translateY(0) scale(0); }
        50% { opacity: 0.8; transform: translateY(-50vh) scale(1); }
        100% { opacity: 0; transform: translateY(-100vh) scale(0); }
    }
    @media (max-width: 1200px) {
        .right-section { flex: 0 0 480px; padding: 3rem; }
        .brand-title { font-size: 3rem; }
        .brand-logo { font-size: 6rem; }
    }
    @media (max-width: 768px) {
        body { flex-direction: column; }
        .left-section { flex: 0 0 auto; padding: 2rem; min-height: 40vh; }
        .right-section { flex: 1; padding: 2rem; }
        .brand-title { font-size: 2.5rem; }
        .brand-logo { font-size: 4rem; }
        .feature-list { display: none; }
        .footer { position: relative; bottom: auto; right: auto; text-align: center; margin-top: 2rem; }
    }
`;

// Komponen utama halaman login
export default function LoginPage() {

  // Semua logika JavaScript dari tag <script> dipindahkan ke sini
  useEffect(() => {
    // Password toggle functionality
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (togglePasswordBtn && passwordInput) {
        const handler = function(this: HTMLElement) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                this.textContent = '👁️';
            }
        };
        togglePasswordBtn.addEventListener('click', handler);
        return () => togglePasswordBtn.removeEventListener('click', handler);
    }
  }, []);

  useEffect(() => {
    // Form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const handler = function(e: SubmitEvent) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
            const alertEl = document.getElementById('alert') as HTMLDivElement;

            const username = usernameInput.value;
            const password = passwordInput.value;

            if (!loginBtn || !alertEl) return;

            loginBtn.classList.add('loading');
            loginBtn.textContent = '';
            
            setTimeout(() => {
                if ((username === 'admin' && password === 'admin123') || (username === 'user@orchid.com' && password === 'password')) {
                    alertEl.className = 'alert success';
                    alertEl.textContent = '✅ Login berhasil! Mengalihkan ke dashboard...';
                    alertEl.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = '/selection'; 
                    }, 1500);
                    
                } else {
                    alertEl.className = 'alert error';
                    alertEl.textContent = '❌ Username atau password salah!';
                    alertEl.style.display = 'block';
                    
                    loginBtn.classList.remove('loading');
                    loginBtn.textContent = 'Masuk ke Dashboard';
                }
            }, 2000);
        };
        loginForm.addEventListener('submit', handler);
        return () => loginForm.removeEventListener('submit', handler);
    }
  }, []);
  

  useEffect(() => {
    // --- Efek Tambahan ---
    let particleInterval: NodeJS.Timeout | null = null;
    if (typeof window !== 'undefined') {
      const createParticle = () => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 4000);
      }
      particleInterval = setInterval(createParticle, 500);
    }
    
    // Cleanup interval on component unmount
    return () => {
        if (particleInterval) clearInterval(particleInterval);
    };
  }, []);

  return (
    <>
      <style>{pageStyles}</style>
      
      {/* Background decorations */}
      <div className="bg-decoration"></div>
      <div className="bg-decoration"></div>
      <div className="bg-decoration"></div>
      <div className="bg-decoration"></div>

      {/* Left Section - Branding */}
      <div className="left-section">
          <div className="brand-logo">🌺</div>
          <h1 className="brand-title">Orchid Monitor</h1>
          <p className="brand-subtitle">Smart IoT Monitoring System</p>
          <p className="brand-description">
              Real-time irrigation insights for healthier orchids.
          </p>
      </div>

      {/* Right Section - Login Form */}
      <div className="right-section">
          <div className="login-container">
              <div className="login-header">
                  <h2 className="login-title">Selamat Datang Kembali</h2>
                  <p className="login-subtitle">Masuk ke dashboard monitoring Anda</p>
              </div>
              <div id="alert" className="alert"></div>
              <form className="login-form" id="loginForm">
                  {/* --- PERBAIKAN: Input fields ditambahkan kembali --- */}
                  <div className="form-group">
                      <label className="form-label" htmlFor="username">Username atau Email</label>
                      <input type="text" id="username" className="form-input" placeholder="Masukkan username atau email" required />
                  </div>
                  <div className="form-group">
                      <label className="form-label" htmlFor="password">Password</label>
                      <input type="password" id="password" className="form-input" placeholder="Masukkan password" required />
                      <button type="button" className="password-toggle" id="togglePassword"></button>
                  </div>
                  <div className="form-options">
                      <label className="remember-me">
                          <input type="checkbox" id="remember" />
                          <span>Ingat saya</span>
                      </label>
                      <a href="#" className="forgot-password">Lupa password?</a>
                  </div>
                  <button type="submit" className="login-button" id="loginBtn">
                      Masuk ke Dashboard
                  </button>
              </form>
          </div>
          <div className="footer">
              © 2025 Orchid Monitoring System<br />
              Capstone D-05
          </div>
      </div>
    </>
  );
}

