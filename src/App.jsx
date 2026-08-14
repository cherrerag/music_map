import React, { useState, useEffect } from 'react';
import HeaderControl from './components/HeaderControl';
import NetworkGraph from './components/NetworkGraph';
import ArtistSidebar from './components/ArtistSidebar';
import { SEED_ARTISTS, getArtistDetails } from './data/musicData';
import { Sparkles, Info, Check } from 'lucide-react';

export default function App() {
  const [currentSeed, setCurrentSeed] = useState(SEED_ARTISTS[0]); // Soda Stereo as initial seed
  const [userCountry, setUserCountry] = useState("Chile");
  const [similarityThreshold, setSimilarityThreshold] = useState(0.70);
  const [onlyLocal, setOnlyLocal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Graph state (nodes and links)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Generate initial graph from seed artist (with FastAPI backend fetch + local fallback)
  useEffect(() => {
    if (!currentSeed) return;

    const seedName = typeof currentSeed === 'string' ? currentSeed : currentSeed.name;
    const API_BASE = import.meta.env.VITE_API_URL !== undefined 
      ? import.meta.env.VITE_API_URL 
      : (import.meta.env.DEV ? 'http://localhost:8000' : '');

    async function loadNetwork() {
      try {
        const response = await fetch(`${API_BASE}/api/network?artist=${encodeURIComponent(seedName)}&user_country=${encodeURIComponent(userCountry)}`);
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

      const similarNodes = (seedObj.similar || []).map(sim => ({
        id: sim.id,
        name: sim.name,
        country: sim.country,
        flag: sim.flag,
        isSeed: false,
        genres: sim.genres
      }));

      const links = (seedObj.similar || []).map(sim => ({
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
  }, [currentSeed, userCountry]);

  // Handler for expanding network from any node dynamically
  const handleExpandNode = async (nodeToExpand) => {
    showToast(`Expandiendo red para ${nodeToExpand.name}...`);
    const cleanName = nodeToExpand.name.replace(/ (Session|Constelación Local|Onda Sintética|Colectivo Fusión|expanded-\d+|Fans|sim-\d+)/gi, '').trim();

    const API_BASE = import.meta.env.VITE_API_URL !== undefined 
      ? import.meta.env.VITE_API_URL 
      : (import.meta.env.DEV ? 'http://localhost:8000' : '');

    // 1. Try backend serverless API
    try {
      const res = await fetch(`${API_BASE}/api/network?artist=${encodeURIComponent(cleanName)}&user_country=${encodeURIComponent(userCountry)}`);
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
      const lastfmRes = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(cleanName)}&api_key=b25b959554ed76058ac220b7b2e0a026&format=json&limit=6`);
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
              weight: 0.85 - i * 0.05
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
        />
      )}

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
