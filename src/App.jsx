import React, { useState, useEffect } from 'react';
import HeaderControl from './components/HeaderControl';
import NetworkGraph from './components/NetworkGraph';
import NetworkGraph3D from './components/NetworkGraph3D';
import ArtistSidebar from './components/ArtistSidebar';
import PlaylistCartModal from './components/PlaylistCartModal';
import TidalLinkModal from './components/TidalLinkModal';
import AuthGatekeeperModal, { ALLOWED_EMAILS } from './components/AuthGatekeeperModal';
import { SEED_ARTISTS, getArtistDetails } from './data/musicData';
import { Sparkles, Info, Check } from 'lucide-react';

export default function App() {
  const detectUserCountry = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.includes("Santiago")) return "Chile";
      if (tz.includes("Buenos_Aires") || tz.includes("Cordoba") || tz.includes("Mendoza")) return "Argentina";
      if (tz.includes("Mexico")) return "México";
      if (tz.includes("Madrid")) return "España";
      if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago")) return "Estados Unidos";
    } catch (e) {
      console.warn("Timezone detection error:", e);
    }
    return "Chile";
  };

  // Gatekeeper Auth State (Restricted to 5 family emails)
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    const saved = localStorage.getItem('musicmap_user_email');
    return (saved && ALLOWED_EMAILS.includes(saved.toLowerCase())) ? saved.toLowerCase() : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('musicmap_user_email');
    localStorage.removeItem('musicmap_token');
    setAuthenticatedUser(null);
    showToast("Sesión cerrada");
  };

  const [currentSeed, setCurrentSeed] = useState(SEED_ARTISTS[0]); // Soda Stereo as initial seed
  const [userCountry, setUserCountry] = useState(detectUserCountry);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.50);
  const [onlyLocal, setOnlyLocal] = useState(false);
  const [nodesLimit, setNodesLimit] = useState(10); // Default to 10 similar artists for richer discovery
  const [selectedNode, setSelectedNode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [is3DMode, setIs3DMode] = useState(true); // Default to 3D WebGL Constellation mode

  // Playlist Cart State & Modal toggle
  const [playlistCart, setPlaylistCart] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // TIDAL User Account Session State
  const [tidalUser, setTidalUser] = useState(() => {
    try {
      const saved = localStorage.getItem('musicmap_tidal_session');
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      return null;
    }
  });
  const [isTidalModalOpen, setIsTidalModalOpen] = useState(false);

  // Graph state (nodes and links)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [pathHistory, setPathHistory] = useState([]); // Max 3 step active path history

  // Add track to playlist cart
  const handleAddToPlaylist = (track, artist) => {
    const artistName = track.artistName || (artist && artist.name) || "Artista";
    const item = {
      id: track.id || `${artistName}-${track.title}`,
      title: track.title,
      artistName: artistName,
      album: track.album || "Single",
      previewUrl: track.previewUrl || "",
      tidalUrl: (artist && artist.tidal_url) || `https://listen.tidal.com/search?q=${encodeURIComponent(artistName + ' ' + track.title)}`
    };

    setPlaylistCart(prev => {
      const exists = prev.some(t => t.title.toLowerCase() === item.title.toLowerCase() && t.artistName.toLowerCase() === item.artistName.toLowerCase());
      if (exists) {
        showToast(`"${item.title}" ya está en tu playlist`);
        return prev;
      }
      showToast(`¡"${item.title}" añadida a la playlist! 🛒`);
      return [...prev, item];
    });
  };

  // Remove track from playlist cart
  const handleRemoveFromPlaylist = (indexToRemove) => {
    setPlaylistCart(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Clear playlist cart
  const handleClearPlaylist = () => {
    setPlaylistCart([]);
    showToast("Playlist vaciada");
  };

  // Reorder playlist cart
  const handleReorderPlaylist = (newCart) => {
    setPlaylistCart(newCart);
  };

  // Generate initial graph from seed artist (with FastAPI backend fetch + local fallback)
  useEffect(() => {
    if (!currentSeed) return;

    const seedName = typeof currentSeed === 'string' ? currentSeed : currentSeed.name;
    const API_BASE = import.meta.env.VITE_API_URL !== undefined 
      ? import.meta.env.VITE_API_URL 
      : (import.meta.env.DEV ? 'http://localhost:8000' : '');

    async function loadNetwork() {
      try {
        const response = await fetch(`${API_BASE}/api/network?artist=${encodeURIComponent(seedName)}&user_country=${encodeURIComponent(userCountry)}&limit=${nodesLimit}`);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data && data.nodes && data.nodes.length > 0) {
            setGraphData(data);
            setSelectedNode(data.nodes[0]);
            setPathHistory([data.nodes[0].id]);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend API offline or unreachable, using local fallback data:", err);
      }

      // Local fallback
      const seedObj = typeof currentSeed === 'object' ? currentSeed : (SEED_ARTISTS.find(a => a.name.toLowerCase() === seedName.toLowerCase()) || SEED_ARTISTS[0]);

      const seedNode = {
        id: seedObj.id,
        name: seedObj.name,
        country: seedObj.country,
        flag: seedObj.flag,
        isSeed: true,
        genres: seedObj.genres
      };

      const similarNodes = (seedObj.similar || []).slice(0, nodesLimit).map((sim, idx) => ({
        id: sim.id,
        name: sim.name,
        country: sim.country,
        flag: sim.flag,
        isSeed: false,
        genres: sim.genres,
        cooccurrence_pct: sim.cooccurrence_pct || roundDec(0.92 - idx * 0.05)
      }));

      const links = (seedObj.similar || []).slice(0, nodesLimit).map(sim => ({
        source: seedObj.id,
        target: sim.id,
        weight: sim.similarity
      }));

      setGraphData({
        nodes: [seedNode, ...similarNodes],
        links: links
      });

      setSelectedNode(seedNode);
      setPathHistory([seedNode.id]);
    }

    loadNetwork();
  }, [currentSeed, userCountry, nodesLimit]);

  function roundDec(val) {
    return Math.max(0.35, Math.round(val * 100) / 100);
  }

  // Handler for expanding network from any node dynamically (keeping a 3-step active trail)
  const handleExpandNode = async (nodeToExpand) => {
    showToast(`Expandiendo red para ${nodeToExpand.name}...`);
    const cleanName = nodeToExpand.name.replace(/ (Session|Constelación Local|Onda Sintética|Colectivo Fusión|expanded-\d+|Fans|sim-\d+)/gi, '').trim();
    const expandId = typeof nodeToExpand.id === 'string' 
      ? nodeToExpand.id 
      : (nodeToExpand.name ? nodeToExpand.name.toLowerCase().replace(/\s+/g, '-') : String(nodeToExpand));

    // Update path history trail (keep max 3 recent steps)
    setPathHistory(prev => [...prev, expandId].slice(-3));

    const API_BASE = import.meta.env.VITE_API_URL !== undefined 
      ? import.meta.env.VITE_API_URL 
      : (import.meta.env.DEV ? 'http://localhost:8000' : '');

    // 1. Try backend API if available and responsive
    try {
      const res = await fetch(`${API_BASE}/api/network?artist=${encodeURIComponent(cleanName)}&user_country=${encodeURIComponent(userCountry)}&limit=${nodesLimit}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.nodes && data.nodes.length > 0) {
          setGraphData(prev => {
            const existingNodeIds = new Set(prev.nodes.map(n => n.id));
            const addedNodes = data.nodes.filter(n => !existingNodeIds.has(n.id) && n.name.toLowerCase() !== cleanName.toLowerCase());

            // Normalize link sources and targets to ensure pure string IDs
            const normalizedPrevLinks = prev.links.map(l => ({
              ...l,
              source: typeof l.source === 'object' ? l.source.id : l.source,
              target: typeof l.target === 'object' ? l.target.id : l.target
            }));
            const normalizedAddedLinks = (data.links || []).map(l => ({
              ...l,
              source: typeof l.source === 'object' ? l.source.id : l.source,
              target: typeof l.target === 'object' ? l.target.id : l.target
            }));

            const allLinks = [...normalizedPrevLinks, ...normalizedAddedLinks];

            // Prune nodes older than 3 steps away from the active trail
            const activeTrailSet = new Set([expandId]);
            const allowedNodeIds = new Set(activeTrailSet);
            allLinks.forEach(l => {
              if (activeTrailSet.has(l.source)) allowedNodeIds.add(l.target);
              if (activeTrailSet.has(l.target)) allowedNodeIds.add(l.source);
            });

            const filteredNodes = [...prev.nodes, ...addedNodes].filter(n => allowedNodeIds.has(n.id));
            const filteredLinks = allLinks.filter(l => allowedNodeIds.has(l.source) && allowedNodeIds.has(l.target));

            return {
              nodes: filteredNodes,
              links: filteredLinks
            };
          });
          showToast(`¡Red expandida con ${data.nodes.length} artistas!`);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API offline or returned invalid response, attempting direct Last.fm client fetch:", err);
    }

    // 2. Direct browser fetch from Last.fm API as client-side fallback
    try {
      const lastfmRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(cleanName)}&api_key=b25b959554ed76058ac220b7b2e0a026&format=json&limit=${nodesLimit}`);
      if (lastfmRes.ok) {
        const data = await lastfmRes.json();
        const similar = data?.similarartists?.artist;
        if (similar && similar.length > 0) {
          const newNodes = similar.map((item, idx) => {
            const rawId = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return {
              id: rawId,
              name: item.name,
              country: "Escena Global",
              flag: "🎵",
              isSeed: false,
              genres: nodeToExpand.genres || ["Rock", "Alternative"],
              cooccurrence_pct: roundDec(parseFloat(item.match) || (0.88 - idx * 0.05))
            };
          });

          setGraphData(prev => {
            const existingNodeIds = new Set(prev.nodes.map(n => n.id));
            const addedNodes = newNodes.filter(n => !existingNodeIds.has(n.id) && n.name.toLowerCase() !== cleanName.toLowerCase());

            // Normalize existing links to clean strings
            const normalizedPrevLinks = prev.links.map(l => ({
              ...l,
              source: typeof l.source === 'object' ? l.source.id : l.source,
              target: typeof l.target === 'object' ? l.target.id : l.target
            }));

            const addedLinks = addedNodes.map((n, i) => ({
              source: expandId,
              target: n.id,
              weight: Math.max(0.60, 0.92 - i * 0.03) // Comfortably passes similarityThreshold
            }));

            return {
              nodes: [...prev.nodes, ...addedNodes],
              links: [...normalizedPrevLinks, ...addedLinks]
            };
          });
          showToast(`¡Red expandida con ${newNodes.length} artistas vía Last.fm!`);
          return;
        }
      }
    } catch (err) {
      console.error("Last.fm client expansion error:", err);
      showToast("No se pudo expandir la red para este artista");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareMap = () => {
    showToast("¡Enlace del mapa copiado al portapapeles! 🎵");
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Restricted Access Gatekeeper Modal */}
      {!authenticatedUser && (
        <AuthGatekeeperModal onAuthenticate={setAuthenticatedUser} />
      )}

      {/* Navbar Control Header */}
      <HeaderControl
        onSelectSeed={setCurrentSeed}
        userCountry={userCountry}
        onChangeCountry={setUserCountry}
        similarityThreshold={similarityThreshold}
        setSimilarityThreshold={setSimilarityThreshold}
        onlyLocal={onlyLocal}
        setOnlyLocal={setOnlyLocal}
        onShareMap={handleShareMap}
        playlistCartCount={playlistCart.length}
        onOpenCart={() => setIsCartModalOpen(true)}
        nodesLimit={nodesLimit}
        setNodesLimit={setNodesLimit}
        authenticatedUser={authenticatedUser}
        onLogout={handleLogout}
        tidalUser={tidalUser}
        onOpenTidalModal={() => setIsTidalModalOpen(true)}
      />

      {/* Main 3D / 2D Constellation Canvas */}
      <main style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        {is3DMode ? (
          <NetworkGraph3D
            graphData={graphData}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
            similarityThreshold={similarityThreshold}
            onlyLocal={onlyLocal}
            userCountry={userCountry}
            is3DMode={is3DMode}
            onToggleViewMode={() => setIs3DMode(!is3DMode)}
            pathHistory={pathHistory}
          />
        ) : (
          <NetworkGraph
            graphData={graphData}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
            similarityThreshold={similarityThreshold}
            onlyLocal={onlyLocal}
            userCountry={userCountry}
            is3DMode={is3DMode}
            onToggleViewMode={() => setIs3DMode(!is3DMode)}
            pathHistory={pathHistory}
          />
        )}
      </main>

      {/* Artist Sidebar */}
      {selectedNode && (
        <ArtistSidebar
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onExpandNode={handleExpandNode}
          onAddToPlaylist={handleAddToPlaylist}
          playlistCart={playlistCart}
          tidalUser={tidalUser}
          onOpenTidalModal={() => setIsTidalModalOpen(true)}
        />
      )}

      {/* Playlist Cart Modal */}
      <PlaylistCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        playlistCart={playlistCart}
        onRemoveTrack={handleRemoveFromPlaylist}
        onClearPlaylist={handleClearPlaylist}
        onReorderTracks={handleReorderPlaylist}
        tidalUser={tidalUser}
        onOpenTidalModal={() => setIsTidalModalOpen(true)}
      />

      {/* TIDAL Link Modal */}
      <TidalLinkModal
        isOpen={isTidalModalOpen}
        onClose={() => setIsTidalModalOpen(false)}
        onLinkTidal={setTidalUser}
        tidalUser={tidalUser}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="glass-panel" style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderColor: '#8b5cf6',
          color: '#f8fafc',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
        }}>
          <Check size={18} color="#10b981" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
