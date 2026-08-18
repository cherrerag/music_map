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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="glass-panel header-container" style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      minHeight: '64px',
      zIndex: 30,
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
            <span className="brand-title-sub" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Constelación de Descubrimiento
            </span>
          </div>
        </div>

        {/* Mobile Header Actions (Cart + Settings Toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenCart}
            className="btn-primary mobile-toggle-btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              background: playlistCartCount > 0 ? 'linear-gradient(135deg, #00d2ff 0%, #0072ff 100%)' : 'rgba(255, 255, 255, 0.08)'
            }}
          >
            🛒 ({playlistCartCount})
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn-secondary mobile-toggle-btn"
            style={{ padding: '8px', cursor: 'pointer' }}
            title="Filtros y Ajustes"
          >
            <SlidersHorizontal size={18} color="#c4b5fd" />
          </button>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="header-search-container" style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
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

      {/* Controls & Unified Location/Scene Filter */}
      <div className="header-controls-desktop" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Unified Scene & Country Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <MapPin size={15} style={{ color: onlyLocal ? '#10b981' : '#38bdf8' }} />
          <select
            value={onlyLocal ? userCountry : "GLOBAL"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "GLOBAL") {
                setOnlyLocal(false);
              } else {
                setOnlyLocal(true);
                onChangeCountry(val);
              }
            }}
            style={{
              background: onlyLocal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              border: '1px solid ' + (onlyLocal ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)'),
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <option value="GLOBAL">🌐 Escena Global</option>
            <option value="Chile">🇨🇱 Solo Chile</option>
            <option value="Argentina">🇦🇷 Solo Argentina</option>
            <option value="México">🇲🇽 Solo México</option>
            <option value="España">🇪🇸 Solo España</option>
            <option value="Estados Unidos">🇺🇸 Solo EE.UU.</option>
          </select>
        </div>

        {/* Network Density (Nodes Limit) Selector */}
        {setNodesLimit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={15} style={{ color: '#8b5cf6' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Similitud:</span>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            style={{ width: '70px', accentColor: '#8b5cf6', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600 }}>
            {Math.round(similarityThreshold * 100)}%
          </span>
        </div>

        {/* User Logout Button */}
        {authenticatedUser && (
          <button
            onClick={onLogout}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Cerrar Sesión"
          >
            🚪 Cerrar Sesión
          </button>
        )}

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
            boxShadow: playlistCartCount > 0 ? '0 0 16px rgba(0, 210, 255, 0.4)' : 'none'
          }}
        >
          🛒 Playlist ({playlistCartCount})
        </button>

      </div>

      {/* Mobile Expandable Controls Panel */}
      {isMobileMenuOpen && (
        <div className="mobile-controls-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c4b5fd' }}>⚙️ Ajustes del Mapa</span>
            {authenticatedUser && (
              <button
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '4px 8px', color: '#ef4444', fontSize: '0.75rem' }}
              >
                Cerrar Sesión
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Escena:</span>
              <select
                value={onlyLocal ? userCountry : "GLOBAL"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "GLOBAL") {
                    setOnlyLocal(false);
                  } else {
                    setOnlyLocal(true);
                    onChangeCountry(val);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid var(--border-glass)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="GLOBAL">🌐 Escena Global</option>
                <option value="Chile">🇨🇱 Solo Chile</option>
                <option value="Argentina">🇦🇷 Solo Argentina</option>
                <option value="México">🇲🇽 Solo México</option>
                <option value="España">🇪🇸 Solo España</option>
                <option value="Estados Unidos">🇺🇸 Solo EE.UU.</option>
              </select>
            </div>

            {setNodesLimit && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nodos por expansión:</span>
                <select
                  value={nodesLimit}
                  onChange={(e) => setNodesLimit(parseInt(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid var(--border-glass)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="6">6 Afines (Enfoque)</option>
                  <option value="10">10 Afines (Estándar)</option>
                  <option value="15">15 Afines (Galaxia)</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mín. Similitud ({Math.round(similarityThreshold * 100)}%):</span>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                style={{ width: '110px', accentColor: '#8b5cf6' }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
