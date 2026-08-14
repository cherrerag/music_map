import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, MapPin, Share2, Globe, Disc, LogOut, User } from 'lucide-react';
import { SEED_ARTISTS } from '../data/musicData';

export default function HeaderControl({
  onSelectSeed,
  userCountry,
  onChangeCountry,
  similarityThreshold,
  setSimilarityThreshold,
  onlyLocal,
  setOnlyLocal,
  onShareMap,
  playlistCartCount = 0,
  onOpenCart,
  nodesLimit = 10,
  setNodesLimit,
  authenticatedUser,
  onLogout
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveResults, setLiveResults] = useState([]);

  // Fetch live artist search suggestions from iTunes API when typing
  React.useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setLiveResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm.trim())}&entity=musicArtist&limit=5`)
        .then(res => res.json())
        .then(data => {
          if (data.results) {
            const results = data.results.map(item => ({
              id: item.artistName.toLowerCase().replace(/\s+/g, '-'),
              name: item.artistName,
              genre: item.primaryGenreName || "Music",
              flag: "🎵"
            }));
            setLiveResults(results);
          }
        })
        .catch(err => console.error("Search error:", err));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredSeeds = SEED_ARTISTS.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (artist) => {
    onSelectSeed(artist);
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleSelect({ name: searchTerm.trim() });
    }
  };

  return (
    <header className="glass-panel" style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      height: '64px',
      zIndex: 30,
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(139, 92, 246, 0.5)'
        }}>
          <Disc size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #fff 0%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1
          }}>
            MusicMap
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Constelación de Descubrimiento
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          gap: '8px',
          borderRadius: '10px'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar artista semilla (ej: Depeche Mode)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsSearchOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              width: '100%',
              fontFamily: 'var(--font-body)'
            }}
          />
        </div>

        {/* Dropdown Auto-complete */}
        {isSearchOpen && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            padding: '8px',
            maxHeight: '320px',
            overflowY: 'auto',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
          }}>
            {searchTerm.trim().length > 0 && (
              <div
                onClick={() => handleSelect({ name: searchTerm.trim() })}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  background: 'rgba(139, 92, 246, 0.25)',
                  border: '1px solid rgba(139, 92, 246, 0.4)'
                }}
              >
                <Search size={16} color="#c4b5fd" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Buscar "{searchTerm}"</div>
                  <div style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>Generar grafo completo en tiempo real</div>
                </div>
              </div>
            )}

            {/* Live Search API Results */}
            {liveResults.length > 0 && (
              <div>
                <p style={{ fontSize: '0.7rem', color: '#c4b5fd', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Sugerencias en Vivo
                </p>
                {liveResults.map(artist => (
                  <div
                    key={artist.id}
                    onClick={() => handleSelect(artist)}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      marginBottom: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      🎵
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{artist.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{artist.genre}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase', marginTop: '6px' }}>
              Artistas Semilla Destacados
            </p>
            {filteredSeeds.map(artist => (
              <div
                key={artist.id}
                onClick={() => handleSelect(artist)}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  marginBottom: '4px',
                  cursor: 'pointer'
                }}
              >
                <img src={artist.image} alt={artist.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{artist.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{artist.flag} {artist.country}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls & Location Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Country Context Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <MapPin size={15} style={{ color: '#10b981' }} />
          <span>Mi Ubicación:</span>
          <select
            value={userCountry}
            onChange={(e) => onChangeCountry(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              border: '1px solid var(--border-glass)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Chile">Chile 🇨🇱</option>
            <option value="Argentina">Argentina 🇦🇷</option>
            <option value="México">México 🇲🇽</option>
            <option value="España">España 🇪🇸</option>
            <option value="Estados Unidos">EE.UU. 🇺🇸</option>
          </select>
        </div>

        {/* Local Filter Toggle */}
        <button
          className="btn-secondary"
          onClick={() => setOnlyLocal(!onlyLocal)}
          style={{
            background: onlyLocal ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            borderColor: onlyLocal ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-glass)',
            color: onlyLocal ? '#34d399' : 'var(--text-primary)'
          }}
        >
          <Globe size={15} /> {onlyLocal ? 'Solo Escena Local' : 'Escena Global'}
        </button>

        {/* Network Density (Nodes Limit) Selector */}
        {setNodesLimit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={15} style={{ color: '#8b5cf6' }} />
            <span>Afines:</span>
            <select
              value={nodesLimit}
              onChange={(e) => setNodesLimit(parseInt(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <option value="6">6 Afines (Enfoque)</option>
              <option value="10">10 Afines (Estándar)</option>
              <option value="15">15 Afines (Galaxia)</option>
            </select>
          </div>
        )}

        {/* Similarity Threshold Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
          <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Min Similitud:</span>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            style={{ width: '80px', accentColor: '#8b5cf6', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600 }}>
            {Math.round(similarityThreshold * 100)}%
          </span>
        </div>

        {/* Playlist Cart Button */}
        <button
          onClick={onOpenCart}
          className="btn-primary"
          style={{
            padding: '8px 14px',
            background: playlistCartCount > 0 ? 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)' : 'rgba(255, 255, 255, 0.08)',
            borderColor: playlistCartCount > 0 ? '#00d2ff' : 'var(--border-glass)',
            color: '#fff',
            fontWeight: 700,
            boxShadow: playlistCartCount > 0 ? '0 0 16px rgba(0, 210, 255, 0.4)' : 'none',
            position: 'relative'
          }}
        >
          🛒 Playlist ({playlistCartCount})
        </button>

        {/* User Account Badge & Logout */}
        {authenticatedUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.06)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <User size={14} color="#00d2ff" />
            <span style={{ fontSize: '0.78rem', color: '#e0f2fe', fontWeight: 600 }}>
              {authenticatedUser.split('@')[0]}
            </span>
            <button
              onClick={onLogout}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Share Button */}
        <button className="btn-primary" onClick={onShareMap} style={{ padding: '8px 14px' }}>
          <Share2 size={15} /> Compartir
        </button>

      </div>
    </header>
  );
}
