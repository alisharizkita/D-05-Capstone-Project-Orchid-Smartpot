'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

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
        width: 100%; padding: 1.2rem; border: 2px solid #e1e8ed;
        border-radius: 12px; font-size: 1rem; transition: all 0.3s ease; background: white; color: #2c3e50;
    }
    .form-input:focus {
        outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        transform: translateY(-2px);
    }
    .form-input::placeholder {
        color: #bdc3c7;
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
    .login-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
    .register-link {
        text-align: center; color: #7f8c8d; font-size: 0.95rem;
    }
    .register-link a {
        color: #667eea; font-weight: 600; text-decoration: none; cursor: pointer;
    }
    .register-link a:hover {
        color: #764ba2; text-decoration: underline;
    }
    .alert {
        padding: 1.2rem; border-radius: 12px; margin-bottom: 1.5rem;
        animation: slideDown 0.3s ease-out; font-weight: 500;
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
    .alert.hidden {
        display: none;
    }
    
    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .modal-content {
        background: white;
        border-radius: 20px;
        padding: 2.5rem;
        width: 90%;
        max-width: 450px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        color: #7f8c8d;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
    }
    .modal-close:hover {
        background: #f0f0f0;
        color: #2c3e50;
    }
    .modal-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    .modal-title {
        font-size: 2rem;
        color: #2c3e50;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .modal-subtitle {
        color: #7f8c8d;
        font-size: 1rem;
    }
    
    .footer {
        position: absolute; bottom: 2rem; right: 4rem; color: #7f8c8d;
        font-size: 0.85rem; text-align: right;
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
        .footer { position: relative; bottom: auto; right: auto; text-align: center; margin-top: 2rem; }
        .modal-content { padding: 2rem; }
    }
`;

export default function LoginPage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertMessage('');

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const response = await apiService.login(username, password);
      
      if (response.success) {
        setAlertType('success');
        setAlertMessage('✅ Login berhasil! Mengalihkan ke dashboard...');
        
        setTimeout(() => {
          window.location.href = '/selection';
        }, 1500);
      } else {
        setAlertType('error');
        setAlertMessage('❌ ' + (response.error || 'Username atau password salah!'));
      }
    } catch (error) {
      setAlertType('error');
      setAlertMessage('❌ Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlertMessage('');

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('reg_username') as HTMLInputElement).value;
    const email = (form.elements.namedItem('reg_email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('reg_phone') as HTMLInputElement).value;
    const password = (form.elements.namedItem('reg_password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('reg_confirm_password') as HTMLInputElement).value;

    // Validation
    if (password !== confirmPassword) {
      setAlertType('error');
      setAlertMessage('❌ Password dan konfirmasi password tidak cocok!');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setAlertType('error');
      setAlertMessage('❌ Password minimal 6 karakter!');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.register(username, email, password, phone);
      
      if (response.success) {
        setAlertType('success');
        setAlertMessage('✅ Registrasi berhasil! Silakan login.');
        
        setTimeout(() => {
          setShowRegisterModal(false);
          setAlertMessage('');
        }, 2000);
      } else {
        setAlertType('error');
        setAlertMessage('❌ ' + (response.error || 'Registrasi gagal!'));
      }
    } catch (error) {
      setAlertType('error');
      setAlertMessage('❌ Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

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
              
              {alertMessage && (
                <div className={`alert ${alertType}`}>
                  {alertMessage}
                </div>
              )}
              
              <form className="login-form" onSubmit={handleLogin}>
                  <div className="form-group">
                      <label className="form-label" htmlFor="username">Username atau Email</label>
                      <input 
                        type="text" 
                        id="username" 
                        name="username"
                        className="form-input" 
                        placeholder="Masukkan username atau email" 
                        required 
                        disabled={isLoading}
                      />
                  </div>
                  
                  <div className="form-group">
                      <label className="form-label" htmlFor="password">Password</label>
                      <input 
                        type={showPassword ? "text" : "password"}
                        id="password" 
                        name="password"
                        className="form-input" 
                        placeholder="Masukkan password" 
                        required 
                        disabled={isLoading}
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                  </div>
                  
                  <div className="form-options">
                      <label className="remember-me">
                          <input type="checkbox" id="remember" />
                          <span>Ingat saya</span>
                      </label>
                      <a href="#" className="forgot-password">Lupa password?</a>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`login-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                      {isLoading ? '' : 'Masuk ke Dashboard'}
                  </button>
              </form>
              
              <div className="divider">
                  <span>atau</span>
              </div>
              
              <div className="register-link">
                  Belum punya akun? <a onClick={() => setShowRegisterModal(true)}>Daftar sekarang</a>
              </div>
          </div>
          
          <div className="footer">
              © 2025 Orchid Monitoring System<br />
              Capstone D-05
          </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowRegisterModal(false)}
            >
              ×
            </button>
            
            <div className="modal-header">
              <h2 className="modal-title">Buat Akun Baru</h2>
              <p className="modal-subtitle">Daftar untuk mulai monitoring anggrek Anda</p>
            </div>
            
            {alertMessage && (
              <div className={`alert ${alertType}`}>
                {alertMessage}
              </div>
            )}
            
            <form className="login-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg_username">Username</label>
                <input 
                  type="text" 
                  id="reg_username" 
                  name="reg_username"
                  className="form-input" 
                  placeholder="Pilih username" 
                  required 
                  minLength={3}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="reg_email">Email</label>
                <input 
                  type="email" 
                  id="reg_email" 
                  name="reg_email"
                  className="form-input" 
                  placeholder="email@example.com" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="reg_phone">Nomor Telepon</label>
                <input 
                  type="text" 
                  id="reg_phone" 
                  name="reg_phone"
                  className="form-input" 
                  placeholder="08xxxxxxxxxx (Opsional)" 
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="reg_password">Password</label>
                <input 
                  type={showRegPassword ? "text" : "password"}
                  id="reg_password" 
                  name="reg_password"
                  className="form-input" 
                  placeholder="Minimal 6 karakter" 
                  required 
                  minLength={6}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="reg_confirm_password">Konfirmasi Password</label>
                <input 
                  type={showRegPassword ? "text" : "password"}
                  id="reg_confirm_password" 
                  name="reg_confirm_password"
                  className="form-input" 
                  placeholder="Ketik ulang password" 
                  required 
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              
              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? '' : 'Daftar Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}