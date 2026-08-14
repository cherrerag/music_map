import React, { useState, useEffect } from 'react';
import HeaderControl from './components/HeaderControl';
import NetworkGraph from './components/NetworkGraph';
import ArtistSidebar from './components/ArtistSidebar';
import PlaylistCartModal from './components/PlaylistCartModal';
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

  const [currentSeed, setCurrentSeed] = useState(SEED_ARTISTS[0]); // Soda Stereo as initial seed
  const [userCountry, setUserCountry] = useState(detectUserCountry);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.70);
  const [onlyLocal, setOnlyLocal] = useState(false);
  const [nodesLimit, setNodesLimit] = useState(10); // Default to 10 similar artists for richer discovery
  const [selectedNode, setSelectedNode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Playlist Cart State & Modal toggle
  const [playlistCart, setPlaylistCart] = useState([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // Graph state (nodes and links)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

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
        if (response.ok) {
          const data = await response.json();
          if (data && data.nodes && data.nodes.length > 0) {
            setGraphData(data);
            setSelectedNode(data.nodes[0]);
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

      const similarNodes = (seedObj.similar || []).slice(0, nodesLimit).map(sim => ({
        id: sim.id,
        name: sim.name,
        country: sim.country,
        flag: sim.flag,
        isSeed: false,
        genres: sim.genres
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
    }

    loadNetwork();
  }, [currentSeed, userCountry, nodesLimit]);

  // Handler for expanding network from any node dynamically
  const handleExpandNode = async (nodeToExpand) => {
    showToast(`Expandiendo red para ${nodeToExpand.name}...`);
    const cleanName = nodeToExpand.name.replace(/ (Session|Constelación Local|Onda Sintética|Colectivo Fusión|expanded-\d+|Fans|sim-\d+)/gi, '').trim();

    const API_BASE = import.meta.env.VITE_API_URL !== undefined 
      ? import.meta.env.VITE_API_URL 
      : (import.meta.env.DEV ? 'http://localhost:8000' : '');

    // 1. Try backend serverless API
    try {
      const res = await fetch(`${API_BASE}/api/network?artist=${encodeURIComponent(cleanName)}&user_country=${encodeURIComponent(userCountry)}&limit=${nodesLimit}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.nodes && data.nodes.length > 0) {
          setGraphData(prev => {
            const existingNodeIds = new Set(prev.nodes.map(n => n.id));
            const addedNodes = data.nodes.filter(n => !existingNodeIds.has(n.id) && n.name.toLowerCase() !== cleanName.toLowerCase());
            const addedLinks = data.links || [];
            return {
              nodes: [...prev.nodes, ...addedNodes],
              links: [...prev.links, ...addedLinks]
            };
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API offline during expand, attempting direct Last.fm client fetch:", err);
    }

    // 2. Direct browser fetch from Last.fm API as client-side fallback
    try {
      const lastfmRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(cleanName)}&api_key=b25b959554ed76058ac220b7b2e0a026&format=json&limit=${nodesLimit}`);
      if (lastfmRes.ok) {
        const data = await lastfmRes.json();
        const similar = data?.similarartists?.artist;
        if (similar && similar.length > 0) {
          const newNodes = similar.map((item) => ({
            id: item.name.toLowerCase().replace(/\s+/g, '-'),
            name: item.name,
            country: "Escena Global",
            flag: "🎵",
            isSeed: false,
            genres: nodeToExpand.genres || ["Rock"]
          }));

          setGraphData(prev => {
            const existingNodeIds = new Set(prev.nodes.map(n => n.id));
            const addedNodes = newNodes.filter(n => !existingNodeIds.has(n.id) && n.name.toLowerCase() !== cleanName.toLowerCase());
            const addedLinks = addedNodes.map((n, i) => ({
              source: nodeToExpand.id,
              target: n.id,
              weight: 0.85 - i * 0.04
            }));

            return {
              nodes: [...prev.nodes, ...addedNodes],
              links: [...prev.links, ...addedLinks]
            };
          });
          return;
        }
      }
    } catch (err) {
      console.error("Last.fm client expansion error:", err);
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
      />

      {/* Main Canvas Force Graph */}
      <main style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <NetworkGraph
          graphData={graphData}
          onSelectNode={setSelectedNode}
          selectedNode={selectedNode}
          similarityThreshold={similarityThreshold}
          onlyLocal={onlyLocal}
          userCountry={userCountry}
        />
      </main>

      {/* Artist Sidebar */}
      {selectedNode && (
        <ArtistSidebar
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onExpandNode={handleExpandNode}
          onAddToPlaylist={handleAddToPlaylist}
          playlistCart={playlistCart}
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
