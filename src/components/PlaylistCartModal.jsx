import React, { useState, useRef } from 'react';
import { X, Play, Pause, Trash2, Download, ExternalLink, MoveUp, MoveDown, Disc, ListMusic, Check, Copy, Sparkles } from 'lucide-react';

export default function PlaylistCartModal({ 
  isOpen, 
  onClose, 
  playlistCart, 
  onRemoveTrack, 
  onClearPlaylist,
  onReorderTracks
}) {
  const [playlistTitle, setPlaylistTitle] = useState("Mi Cosecha MusicMap 🌊");
  const [playingIndex, setPlayingIndex] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const audioRef = useRef(null);

  if (!isOpen) return null;

  const togglePlayTrack = (idx, track) => {
    if (!track.previewUrl) return;

    if (playingIndex === idx) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingIndex(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.previewUrl);
      audio.onended = () => setPlayingIndex(null);
      audio.onerror = () => setPlayingIndex(null);
      audio.play().catch(e => console.error("Playback error:", e));
      audioRef.current = audio;
      setPlayingIndex(idx);
    }
  };

  const handleMove = (index, direction) => {
    const newCart = [...playlistCart];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newCart.length) return;

    const temp = newCart[index];
    newCart[index] = newCart[targetIndex];
    newCart[targetIndex] = temp;
    onReorderTracks(newCart);
  };

  const handleExportM3U = () => {
    let content = "#EXTM3U\n";
    content += `#PLAYLIST:${playlistTitle}\n\n`;

    playlistCart.forEach(t => {
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

  const handleExportCSV = () => {
    let content = "Track Name,Artist Name,Album Name\n";
    playlistCart.forEach(t => {
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
    if (playlistCart.length === 0) return;

    // 1. Copy list formatted for TIDAL bulk search
    const text = playlistCart.map(t => `${t.artistName} - ${t.title}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);

    // 2. Open Soundiiz TIDAL importer / TIDAL search directly
    const firstTrack = playlistCart[0];
    const tidalSearchUrl = `https://listen.tidal.com/search/tracks?q=${encodeURIComponent(firstTrack.artistName + ' ' + firstTrack.title)}`;
    window.open(tidalSearchUrl, '_blank');

    // 3. Optionally open Soundiiz direct TIDAL webkit in background
    setTimeout(() => {
      window.open('https://soundiiz.com/webkit/tidal', '_blank');
    }, 400);
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
                <span>🛒 {playlistCart.length} Canciones guardadas</span>
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

        {/* Track List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {playlistCart.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Disc size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tu carrito de playlist está vacío</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Navega en el mapa y presiona <b>"+"</b> en tus canciones favoritas para armar tu lista.</p>
            </div>
          ) : (
            playlistCart.map((track, idx) => {
              const isPlaying = playingIndex === idx;
              return (
                <div 
                  key={`${track.id}-${idx}`} 
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
                        {track.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {track.artistName} {track.album ? `• ${track.album}` : ''}
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
                      disabled={idx === playlistCart.length - 1}
                      className="btn-secondary"
                      style={{ padding: '6px', opacity: idx === playlistCart.length - 1 ? 0.3 : 1, cursor: idx === playlistCart.length - 1 ? 'default' : 'pointer' }}
                      title="Mover abajo"
                    >
                      <MoveDown size={14} />
                    </button>

                    <button 
                      onClick={() => onRemoveTrack(idx)} 
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
          {playlistCart.length > 0 && (
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
              disabled={playlistCart.length === 0}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', gap: '6px', opacity: playlistCart.length === 0 ? 0.5 : 1, borderColor: '#00d2ff', color: '#7dd3fc' }}
              title="Descargar archivo CSV formateado para importar en TIDAL / Soundiiz"
            >
              <Download size={14} /> Descargar CSV (TIDAL)
            </button>

            <button 
              onClick={handleExportM3U}
              disabled={playlistCart.length === 0}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', gap: '6px', opacity: playlistCart.length === 0 ? 0.5 : 1 }}
            >
              <Download size={14} /> Descargar M3U
            </button>

            <button 
              onClick={handleOpenInTidal}
              disabled={playlistCart.length === 0}
              className="btn-primary"
              style={{ 
                background: 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)', 
                borderColor: '#00d2ff', 
                color: '#fff', 
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 16px',
                opacity: playlistCart.length === 0 ? 0.5 : 1
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
