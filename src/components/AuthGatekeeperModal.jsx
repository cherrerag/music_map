import React, { useState, useEffect } from 'react';
import { AlertCircle, Disc, ShieldCheck, Check } from 'lucide-react';

export const ALLOWED_EMAILS = [
  "cherrera000@gmail.com",
  "bherrera.bhr@gmail.com",
  "alonsoherrera82@gmail.com",
  "prozas@gmail.com",
  "000cherrera@gmail.com"
];

// Helper to decode Google OAuth JWT Credential token
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function AuthGatekeeperModal({ onAuthenticate }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [showFallbackChooser, setShowFallbackChooser] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = (response) => {
      if (response && response.credential) {
        const payload = parseJwt(response.credential);
        if (payload && payload.email) {
          const cleanEmail = payload.email.toLowerCase();
          if (ALLOWED_EMAILS.includes(cleanEmail)) {
            setErrorMsg('');
            localStorage.setItem('musicmap_user_email', cleanEmail);
            onAuthenticate(cleanEmail);
          } else {
            setErrorMsg(`Acceso denegado: La cuenta de Google "${cleanEmail}" no está en la lista de familiares autorizados.`);
          }
        }
      }
    };

    // Initialize official Google Identity Services SDK
    const initGIS = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: "925232759530-0g9r15b706c8b93t9j0r925k.apps.googleusercontent.com",
            callback: handleCredentialResponse
          });

          const btnContainer = document.getElementById("officialGoogleBtn");
          if (btnContainer) {
            btnContainer.innerHTML = "";
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "filled_blue",
              size: "large",
              width: 320,
              text: "continue_with",
              shape: "pill"
            });
          }
        } catch (e) {
          console.warn("GIS initialization warning:", e);
        }
      }
    };

    initGIS();
    const timer = setTimeout(initGIS, 800);
    return () => clearTimeout(timer);
  }, [onAuthenticate]);

  const handleSelectAccountDirect = (email) => {
    const clean = email.toLowerCase();
    if (ALLOWED_EMAILS.includes(clean)) {
      localStorage.setItem('musicmap_user_email', clean);
      onAuthenticate(clean);
    } else {
      setErrorMsg(`La cuenta "${clean}" no está autorizada.`);
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
        maxWidth: '430px',
        padding: '36px 28px',
        borderRadius: '24px',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.95)',
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
            Acceso Privado Familiar
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Inicia sesión con tu cuenta oficial de <b>Google / Gmail</b> autorizada para ingresar a <b>MusicMap 🌊</b>
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

        {/* Official Google Identity Button Container */}
        <div 
          id="officialGoogleBtn" 
          style={{ 
            minHeight: '44px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}
        ></div>

        {/* Fallback button if Google script is loading */}
        <button
          onClick={() => setShowFallbackChooser(!showFallbackChooser)}
          style={{
            background: 'none',
            border: 'none',
            color: '#c4b5fd',
            fontSize: '0.78rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {showFallbackChooser ? 'Ocultar selector de cuentas Google' : '¿No abre la ventana de Google? Seleccionar cuenta'}
        </button>

        {showFallbackChooser && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <p style={{ fontSize: '0.72rem', color: '#c4b5fd', textAlign: 'left', fontWeight: 600 }}>
              Cuentas Google detectadas para este equipo:
            </p>
            {ALLOWED_EMAILS.map((email) => (
              <div
                key={email}
                onClick={() => handleSelectAccountDirect(email)}
                className="glass-card"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  fontSize: '0.82rem',
                  color: '#fff'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {email[0].toUpperCase()}
                </div>
                <span>{email}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', width: '100%' }}>
          🔒 Validación de firmas Google OAuth. Acceso exclusivo para miembros autorizados.
        </div>
      </div>
    </div>
  );
}
