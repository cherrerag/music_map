import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ExternalLink, Network, Sparkles, MapPin, Music, Heart, Disc, Volume2, VolumeX } from 'lucide-react';
import { getArtistDetails } from '../data/musicData';

export default function ArtistSidebar({ selectedNode, onClose, onExpandNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

  // Get rich metadata for the selected node
  const artist = selectedNode ? getArtistDetails(selectedNode) : null;

  const [dynamicTracks, setDynamicTracks] = useState(null);

  // Clean artist name (strip out any procedural/synthetic suffix)
  const cleanArtistName = (artist?.name || '')
    .replace(/ (Session|Constelación Local|Onda Sintética|Colectivo Fusión|expanded-\d+|Fans|sim-\d+)/gi, '')
    .trim();

  // Active track list (prioritizing dynamic iTunes 3-track real search)
  const activeTracks = (dynamicTracks && dynamicTracks.length > 0) 
    ? dynamicTracks 
    : (artist?.topTracks && artist.topTracks[0]?.previewUrl ? artist.topTracks : null);

  const currentTrack = activeTracks?.[currentTrackIndex] || {
    title: `${cleanArtistName || 'Canción Principal'}`,
    album: "Hit Single",
    duration: "0:30",
    previewUrl: ""
  };

  // Fetch Top 3 real tracks from iTunes API for the artist
  useEffect(() => {
    let isCancelled = false;
    if (!cleanArtistName) return;

    // Fetch top 3 tracks with real song titles and audio previews
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanArtistName)}&entity=song&limit=3`)
      .then(res => res.json())
      .then(data => {
        if (!isCancelled && data.results && data.results.length > 0) {
          const tracks = data.results.map(item => ({
            title: item.trackName || cleanArtistName,
            album: item.collectionName || "Single",
            duration: "0:30",
            previewUrl: item.previewUrl
          }));
          setDynamicTracks(tracks);
        }
      })
      .catch(err => console.error("iTunes dynamic 3-track fetch error:", err));

    return () => {
      isCancelled = true;
    };
  }, [artist?.id, cleanArtistName]);

  // Reset audio & state on artist node change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    setIsSaved(false);
    setAudioProgress(0);
    setDynamicTracks(null);
  }, [selectedNode?.id]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio instance when track changes or user toggles play/mute
  const togglePlay = (indexToPlay = currentTrackIndex) => {
    const targetTrack = activeTracks?.[indexToPlay] || currentTrack;
    const audioUrl = targetTrack?.previewUrl;
    if (!audioUrl) return;

    if (indexToPlay !== currentTrackIndex) {
      setCurrentTrackIndex(indexToPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    if (!audioRef.current || audioRef.current.src !== audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(audioUrl);
      newAudio.muted = isMuted;

      newAudio.ontimeupdate = () => {
        if (newAudio.duration) {
          setAudioProgress((newAudio.currentTime / newAudio.duration) * 100);
        }
      };

      newAudio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };

      newAudio.onerror = (e) => {
        console.error("Audio error:", e);
        setIsPlaying(false);
      };

      audioRef.current = newAudio;
    }

    if (isPlaying && indexToPlay === currentTrackIndex) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Failed to play audio:", err);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    onClose();
  };

  if (!artist) return null;

  return (
    <aside className="glass-panel" style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      bottom: '16px',
      width: '380px',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header Image Cover */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={artist.image} 
          alt={artist.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }} 
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 20, 32, 1) 0%, transparent 80%)'
        }} />

        {/* Close button */}
        <button 
          onClick={handleClose} 
          className="btn-secondary"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Artist Title Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>{artist.flag}</span>
            <span style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <MapPin size={12} /> {artist.city ? `${artist.city}, ` : ''}{artist.country}
            </span>
          </div>
          <h2 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.6rem', 
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1 
          }}>
            {artist.name}
          </h2>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Actions Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-primary" 
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onExpandNode(artist)}
          >
            <Network size={16} /> Expandir Red
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setIsSaved(!isSaved)}
            style={{ color: isSaved ? '#ec4899' : 'inherit' }}
            title="Guardar en favoritos"
          >
            <Heart size={16} fill={isSaved ? '#ec4899' : 'none'} />
          </button>
        </div>

        {/* Multidimensional Affinity Breakdown Card */}
        <div className="glass-card" style={{ padding: '12px', border: '1px solid rgba(139, 92, 246, 0.35)', background: 'rgba(139, 92, 246, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Radar de Afinidad Multidimensional</span>
            <Sparkles size={14} color="#34d399" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#c4b5fd' }}>🟣 Afinidad Sonora & Estilo</span>
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>88%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: '#8b5cf6' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#7dd3fc' }}>🔵 Coincidencia de Audiencia</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>84%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '84%', height: '100%', background: '#00d2ff' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ color: '#6ee7b7' }}>🟢 Conexión Geocultural</span>
              <span style={{ fontWeight: 700, color: '#34d399' }}>
                {artist.flag} {artist.country}
              </span>
            </div>
          </div>
        </div>

        {/* Popularity & Genres */}
        <div className="glass-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Popularidad global</span>
            <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{artist.popularity}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${artist.popularity}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}></div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {artist.genres?.map((genre, idx) => (
              <span key={idx} style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#c4b5fd',
                fontWeight: 500
              }}>
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Preview Player Box */}
        <div className="glass-card" style={{ padding: '14px', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Disc size={18} className={isPlaying ? "spin-animation" : ""} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Preview de Audio (30s)</span>
            </div>
            <button 
              onClick={toggleMute} 
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={isMuted ? "Dessilenciar" : "Silenciar"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <button 
              onClick={() => togglePlay(currentTrackIndex)}
              className="btn-primary"
              style={{ padding: '10px', borderRadius: '50%', width: '42px', height: '42px', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentTrack.title}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {currentTrack.album}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${audioProgress}%`, height: '100%', background: '#8b5cf6', transition: 'width 0.1s linear' }} />
          </div>

          {/* Equalizer animation simulation when playing */}
          {isPlaying && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '16px', marginBottom: '12px', justifyContent: 'center' }}>
              {[0.4, 0.8, 0.3, 0.9, 0.5, 0.7, 0.4, 0.9, 0.6].map((h, i) => (
                <div 
                  key={i} 
                  style={{ 
                    width: '3px', 
                    height: `${h * 100}%`, 
                    background: '#8b5cf6', 
                    borderRadius: '2px',
                    animation: `pulse-glow 0.8s infinite alternate ${i * 0.1}s` 
                  }} 
                />
              ))}
            </div>
          )}

          {/* Top Tracks List */}
          {activeTracks && activeTracks.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Top Canciones
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeTracks.map((track, idx) => {
                  const isSelected = idx === currentTrackIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => togglePlay(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        border: 'none',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                        {isSelected && isPlaying ? (
                          <Pause size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                        ) : (
                          <Play size={14} style={{ opacity: isSelected ? 1 : 0.6, flexShrink: 0 }} />
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isSelected ? 600 : 400 }}>
                          {track.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px', flexShrink: 0 }}>
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Artist Bio */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Acerca del Artista
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {artist.bio}
          </p>
        </div>

        {/* External Links */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a 
            href={artist.tidal_url || `https://listen.tidal.com/search?q=${encodeURIComponent(artist.name)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)', borderColor: '#00d2ff', color: '#fff', fontWeight: 700 }}
          >
            Escuchar en TIDAL 🌊 <ExternalLink size={14} />
          </a>
          <a 
            href={`https://open.spotify.com/search/${encodeURIComponent(artist.name)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(30, 215, 96, 0.08)', borderColor: 'rgba(30, 215, 96, 0.25)', color: '#1ed760', fontSize: '0.8rem' }}
          >
            Abrir en Spotify <ExternalLink size={14} />
          </a>
        </div>

      </div>
    </aside>
  );
}

