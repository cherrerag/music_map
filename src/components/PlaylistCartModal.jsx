import React, { useState, useRef } from 'react';
import { X, Play, Pause, Trash2, Download, ExternalLink, MoveUp, MoveDown, Disc, ListMusic, Check, Copy, Sparkles } from 'lucide-react';

export default function PlaylistCartModal({ 
  isOpen, 
  onClose, 
  playlistCart = [], 
  onRemoveTrack, 
  onClearPlaylist,
  onReorderTracks
}) {
  const [playlistTitle, setPlaylistTitle] = useState("Mi Cosecha MusicMap 🌊");
  const [playingIndex, setPlayingIndex] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showTidalGuide, setShowTidalGuide] = useState(false);
  const audioRef = useRef(null);

  if (!isOpen) return null;

  const safeCart = Array.isArray(playlistCart) ? playlistCart : [];

  const handleExportM3U = () => {
    let content = "#EXTM3U\n";
    content += `#PLAYLIST:${playlistTitle}\n\n`;

    safeCart.forEach(t => {
      content += `#EXTINF:-1,${t.artistName} - ${t.title}\n`;
      content += `${t.previewUrl || t.tidalUrl || ''}\n\n`;
    });

    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlistTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'playlist'}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const text = safeCart.map((t, i) => `${i + 1}. ${t.artistName} - ${t.title}`).join('\n');
    navigator.clipboard.writeText(`Playlist: ${playlistTitle}\n\n${text}`);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleExportCSV = () => {
    let content = "Track Name,Artist Name,Album Name\n";
    safeCart.forEach(t => {
      const cleanTrack = (t.title || '').replace(/"/g, '""');
      const cleanArtist = (t.artistName || '').replace(/"/g, '""');
      const cleanAlbum = (t.album || '').replace(/"/g, '""');
      content += `"${cleanTrack}","${cleanArtist}","${cleanAlbum}"\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlistTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'playlist'}_tidal.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInTidal = () => {
    if (safeCart.length === 0) return;

    // 1. Download CSV automatically for TIDAL
    handleExportCSV();

    // 2. Copy formatted text to clipboard
    const text = safeCart.map(t => `${t.artistName} - ${t.title}`).join('\n');
    navigator.clipboard.writeText(text);

    // 3. Display interactive guide card inside modal
    setShowTidalGuide(true);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(5, 8, 16, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(0, 210, 255, 0.1) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 210, 255, 0.5)'
            }}>
              <ListMusic size={22} color="#fff" />
            </div>
            <div>
              <input
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px dashed rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  outline: 'none',
                  fontFamily: 'var(--font-heading)',
                  width: '320px'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span>🛒 {safeCart.length} Canciones guardadas</span>
                <span>•</span>
                <span style={{ color: '#00d2ff', fontWeight: 600 }}>Lista para TIDAL 🌊</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Guided Export Banner to TIDAL */}
        {showTidalGuide && (
          <div style={{
            margin: '16px 24px 0 24px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.15) 0%, rgba(0, 114, 255, 0.2) 100%)',
            border: '1px solid rgba(0, 210, 255, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#00d2ff" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                  ¡Archivo CSV descargado y lista copiada! 🌊
                </span>
              </div>
              <button 
                onClick={() => setShowTidalGuide(false)}
                style={{ background: 'none', border: 'none', color: '#7dd3fc', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cerrar ✕
              </button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#e0f2fe', lineHeight: 1.4, margin: 0 }}>
              Para transferir estas canciones a tu cuenta de <b>TIDAL</b> en 1 clic (como tus otras playlists), abre el importador gratuito de <b>TuneMyMusic</b> o <b>Soundiiz</b> y sube el archivo CSV descargado:
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <a
                href="https://www.tunemymusic.com/es/transfer"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  fontSize: '0.8rem',
                  padding: '7px 12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderColor: '#10b981',
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                1. Importar a TIDAL vía TuneMyMusic 🚀 <ExternalLink size={14} />
              </a>

              <a
                href="https://soundiiz.com/webapp"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  padding: '7px 12px',
                  borderColor: '#00d2ff',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                2. Importar en Soundiiz 🌊 <ExternalLink size={14} />
              </a>

              <a
                href="https://listen.tidal.com/"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  padding: '7px 12px',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                3. Abrir Reproductor TIDAL Web 🎧 <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Track List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {safeCart.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Disc size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tu carrito de playlist está vacío</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Navega en el mapa y presiona <b>"+"</b> en tus canciones favoritas para armar tu lista.</p>
            </div>
          ) : (
            safeCart.map((track, idx) => {
              const isPlaying = playingIndex === idx;
              return (
                <div 
                  key={`${track.id || 'track'}-${idx}`} 
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isPlaying ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid ' + (isPlaying ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'),
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: '24px' }}>
                      #{idx + 1}
                    </span>

                    <button
                      onClick={() => togglePlayTrack(idx, track)}
                      className="btn-primary"
                      style={{ padding: '8px', borderRadius: '50%', width: '34px', height: '34px', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                    </button>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.title || "Canción sin título"}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.artistName || "Artista desconocido"} {track.album ? `• ${track.album}` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                    <button 
                      onClick={() => handleMove(idx, -1)} 
                      disabled={idx === 0}
                      className="btn-secondary"
                      style={{ padding: '6px', opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? 'default' : 'pointer' }}
                      title="Mover arriba"
                    >
                      <MoveUp size={14} />
                    </button>

                    <button 
                      onClick={() => handleMove(idx, 1)} 
                      disabled={idx === safeCart.length - 1}
                      className="btn-secondary"
                      style={{ padding: '6px', opacity: idx === safeCart.length - 1 ? 0.3 : 1, cursor: idx === safeCart.length - 1 ? 'default' : 'pointer' }}
                      title="Mover abajo"
                    >
                      <MoveDown size={14} />
                    </button>

                    <button 
                      onClick={() => onRemoveTrack && onRemoveTrack(idx)} 
                      className="btn-secondary"
                      style={{ padding: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
                      title="Eliminar de la lista"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'rgba(10, 15, 26, 0.95)'
        }}>
          {safeCart.length > 0 && (
            <button 
              onClick={onClearPlaylist}
              className="btn-secondary"
              style={{ color: '#ef4444', fontSize: '0.8rem' }}
            >
              Vaciar Lista
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button 
              onClick={handleCopyText}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', gap: '6px' }}
            >
              {copiedToast ? <Check size={14} color="#10b981" /> : <Copy size={14} />} 
              {copiedToast ? '¡Copiado!' : 'Copiar Texto'}
            </button>

            <button 
              onClick={handleExportCSV}
              disabled={safeCart.length === 0}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', gap: '6px', opacity: safeCart.length === 0 ? 0.5 : 1, borderColor: '#00d2ff', color: '#7dd3fc' }}
              title="Descargar archivo CSV formateado para importar en TIDAL / Soundiiz"
            >
              <Download size={14} /> Descargar CSV (TIDAL)
            </button>

            <button 
              onClick={handleExportM3U}
              disabled={safeCart.length === 0}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', gap: '6px', opacity: safeCart.length === 0 ? 0.5 : 1 }}
            >
              <Download size={14} /> Descargar M3U
            </button>

            <button 
              onClick={handleOpenInTidal}
              disabled={safeCart.length === 0}
              className="btn-primary"
              style={{ 
                background: 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)', 
                borderColor: '#00d2ff', 
                color: '#fff', 
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 16px',
                opacity: safeCart.length === 0 ? 0.5 : 1
              }}
            >
              Abrir e Importar en TIDAL 🌊 <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
