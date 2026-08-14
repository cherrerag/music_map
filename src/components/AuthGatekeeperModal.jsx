import React, { useState } from 'react';
import { Lock, Check, AlertCircle, ShieldCheck, Disc, UserCheck } from 'lucide-react';

export const ALLOWED_EMAILS = [
  "cherrera000@gmail.com",
  "bherrera.bhr@gmail.com",
  "alonsoherrera82@gmail.com",
  "prozas@gmail.com",
  "000cherrera@gmail.com"
];

export default function AuthGatekeeperModal({ onAuthenticate }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSelect = (email) => {
    setIsAuthenticating(true);
    setErrorMsg('');
    setSelectedAccount(email);

    setTimeout(() => {
      setIsAuthenticating(false);
      if (ALLOWED_EMAILS.includes(email.toLowerCase())) {
        localStorage.setItem('musicmap_user_email', email.toLowerCase());
        onAuthenticate(email.toLowerCase());
      } else {
        setErrorMsg(`La cuenta Google "${email}" no tiene permiso de acceso.`);
      }
    }, 400);
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
        maxWidth: '440px',
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Selecciona tu cuenta de <b>Google / Gmail</b> autorizada para ingresar a <b>MusicMap 🌊</b>
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{
            width: '100%',
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

        {/* Google Account Selector List */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.72rem', color: '#c4b5fd', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'left', marginBottom: '4px' }}>
            Selecciona tu cuenta Google:
          </p>

          {ALLOWED_EMAILS.map((email) => {
            const isSelected = selectedAccount === email;
            return (
              <button
                key={email}
                onClick={() => handleGoogleSelect(email)}
                disabled={isAuthenticating}
                className="glass-card"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid ' + (isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)'),
                  cursor: isAuthenticating ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {email[0].toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0, truncate: true }}>
                    {email.split('@')[0]}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {email}
                  </p>
                </div>

                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={14} color="#34d399" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', width: '100%' }}>
          🔒 Validación estricta Google OAuth. Acceso exclusivo para miembros autorizados de la familia.
        </div>
      </div>
    </div>
  );
}
