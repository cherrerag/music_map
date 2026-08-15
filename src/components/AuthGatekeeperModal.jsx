import React, { useState } from 'react';
import { AlertCircle, Disc, KeyRound, ShieldCheck } from 'lucide-react';

export const ALLOWED_EMAILS = [
  "cherrera000@gmail.com",
  "bherrera.bhr@gmail.com",
  "alonsoherrera82@gmail.com",
  "prozas@gmail.com",
  "000cherrera@gmail.com",
  "friend",
  "friend@gmail.com"
];

export default function AuthGatekeeperModal({ onAuthenticate }) {
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    const clean = emailInput.trim().toLowerCase();
    if (ALLOWED_EMAILS.includes(clean)) {
      localStorage.setItem('musicmap_user_email', clean);
      onAuthenticate(clean);
    } else {
      setErrorMsg(`Acceso denegado: La cuenta "${clean}" no tiene autorización para acceder.`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 8, 16, 0.94)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '410px',
        padding: '40px 32px',
        borderRadius: '24px',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.95)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Brand Icon Header */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #00d2ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 32px rgba(139, 92, 246, 0.6)'
        }}>
          <Disc size={36} color="#fff" />
        </div>

        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.6rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #fff 0%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            Acceso Privado
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Ingresa tu correo autorizado para acceder a <b>MusicMap 🌊</b>
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Auth with Input */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass-card" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            gap: '10px',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <KeyRound size={18} style={{ color: '#c4b5fd' }} />
            <input
              type="text"
              placeholder="Tu correo electrónico..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                width: '100%',
                fontFamily: 'var(--font-body)'
              }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #00d2ff 100%)',
              borderColor: '#8b5cf6',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={18} style={{ marginRight: '8px' }} />
            Ingresar a MusicMap
          </button>
        </form>

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', width: '100%' }}>
          🔒 Validación estricta por lista de correos autorizados.
        </div>
      </div>
    </div>
  );
}


