import React, { useState, useEffect } from 'react';
import { Lock, Check, AlertCircle, ShieldCheck, LogOut, Disc, Sparkles } from 'lucide-react';

export const ALLOWED_EMAILS = [
  "cherrera000@gmail.com",
  "bherrera.bhr@gmail.com",
  "alonsoherrera82@gmail.com",
  "prozas@gmail.com",
  "000cherrera@gmail.com"
];

export default function AuthGatekeeperModal({ onAuthenticate }) {
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleValidateEmail = (emailToTest) => {
    const clean = (emailToTest || '').trim().toLowerCase();
    
    if (!clean) {
      setErrorMsg('Por favor ingresa tu correo Gmail');
      return;
    }

    if (!clean.endsWith('@gmail.com')) {
      setErrorMsg('Debes ingresar una cuenta válida de @gmail.com');
      return;
    }

    if (ALLOWED_EMAILS.includes(clean)) {
      setErrorMsg('');
      localStorage.setItem('musicmap_user_email', clean);
      onAuthenticate(clean);
    } else {
      setErrorMsg(`El correo "${clean}" no está en la lista de acceso familiar autorizado.`);
    }
  };

  const handleSimulatedGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setErrorMsg('');

    // Try Google Identity GIS if script loaded, otherwise prompt or auto-fill primary
    setTimeout(() => {
      setIsGoogleLoading(false);
      // Auto-validate current input or primary admin email if match
      const target = emailInput.trim().toLowerCase();
      if (target && ALLOWED_EMAILS.includes(target)) {
        handleValidateEmail(target);
      } else {
        setErrorMsg('Ingresa tu correo autorizado de la familia arriba para acceder');
      }
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 8, 16, 0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '32px 28px',
        borderRadius: '20px',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
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
          <Disc size={36} color="#fff" className="spin-animation" />
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
            Acceso Privado Familiar
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Accede a <b>MusicMap 🌊</b> con tu cuenta autorizada de Gmail
          </p>
        </div>

        {/* Form Container */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Email input field */}
          <div style={{ textAlignment: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600, marginBottom: '6px', textAlign: 'left' }}>
              Tu correo de Gmail:
            </label>
            <input
              type="email"
              placeholder="ejemplo@gmail.com"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setErrorMsg('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleValidateEmail(emailInput);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid ' + (errorMsg ? '#ef4444' : 'rgba(255, 255, 255, 0.15)'),
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={() => handleValidateEmail(emailInput)}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
            }}
          >
            <ShieldCheck size={18} /> Validar e Ingresar
          </button>

          {/* Google Sign-in Styled Button */}
          <button
            onClick={handleSimulatedGoogleSignIn}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px',
              fontSize: '0.85rem',
              background: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontWeight: 600
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', width: '100%' }}>
          🔒 Acceso restringido a miembros autorizados de la familia.
        </div>
      </div>
    </div>
  );
}
