import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Disc } from 'lucide-react';

export const ALLOWED_EMAILS = [
  "cherrera000@gmail.com",
  "bherrera.bhr@gmail.com",
  "alonsoherrera82@gmail.com",
  "prozas@gmail.com",
  "000cherrera@gmail.com",
  "friend",
  "friend@gmail.com"
];

// Helper to decode Google OAuth JWT Token
function parseJwt(token) {
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
    console.error("Error descodificando JWT:", e);
    return null;
  }
}

export default function AuthGatekeeperModal({ onAuthenticate }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const googleBtnRef = useRef(null);

  // Client ID configurable via VITE_GOOGLE_CLIENT_ID or fallback default
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1089278370954-gsi.apps.googleusercontent.com";

  const handleCredentialResponse = (response) => {
    setErrorMsg('');
    if (!response || !response.credential) {
      setErrorMsg('No se recibió la credencial de autenticación de Google.');
      return;
    }

    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) {
      setErrorMsg('No se pudo verificar el correo electrónico en la respuesta de Google.');
      return;
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    if (ALLOWED_EMAILS.includes(cleanEmail)) {
      localStorage.setItem('musicmap_token', response.credential);
      localStorage.setItem('musicmap_user_email', cleanEmail);
      onAuthenticate(cleanEmail);
    } else {
      setErrorMsg(`Acceso denegado: La cuenta de Google "${cleanEmail}" no está autorizada para acceder.`);
    }
  };

  useEffect(() => {
    const initializeGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 320,
              locale: 'es'
            });
          }
          setIsGsiLoaded(true);
        } catch (err) {
          console.error("Error al inicializar GIS:", err);
        }
      }
    };

    initializeGsi();

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && !isGsiLoaded) {
        initializeGsi();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleFallbackClick = () => {
    setErrorMsg('');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("GIS prompt notification reason:", notification.getNotDisplayedReason());
        }
      });
    } else {
      setErrorMsg('Cargando Google Identity Services... Intenta nuevamente en un momento.');
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
            Inicia sesión con tu cuenta oficial de <b>Google</b> para acceder a <b>MusicMap 🌊</b>
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

        {/* Official Google Sign-In Button Container */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
          <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          {!isGsiLoaded && (
            <button
              onClick={handleFallbackClick}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                borderColor: '#dadce0',
                color: '#3c4043',
                fontWeight: 600,
                fontSize: '0.95rem',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.27v3.15C3.25 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.01-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              Continuar con Google
            </button>
          )}
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', width: '100%' }}>
          🔒 Autenticación oficial mediante Google OAuth 2.0.
        </div>
      </div>
    </div>
  );
}

