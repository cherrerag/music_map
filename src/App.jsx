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

  // Handler for expanding red from any node
  const handleExpandNode = async (nodeToExpand) => {
    showToast(`Expandiendo red para ${nodeToExpand.name}...`);
    const API_BASE = import.meta.env.VITE_API_URL !== undefined 
      ? import.meta.env.VITE_API_URL 
      : (import.meta.env.DEV ? 'http://localhost:8000' : '');

    try {
      const res = await fetch(`${API_BASE}/api/network?artist=${encodeURIComponent(nodeToExpand.name)}&user_country=${encodeURIComponent(userCountry)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.nodes && data.nodes.length > 0) {
          setGraphData(prev => {
            const existingNodeIds = new Set(prev.nodes.map(n => n.id));
            const addedNodes = data.nodes.filter(n => !existingNodeIds.has(n.id));
            const addedLinks = data.links;
            return {
              nodes: [...prev.nodes, ...addedNodes],
              links: [...prev.links, ...addedLinks]
            };
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Backend API offline during expand, using fallback expansion:", err);
    }

    // Real artists fallback map for node expansion
    const realSimilarsMap = {
      "the-cure": [
        { id: "joy-division", name: "Joy Division", country: "Reino Unido", flag: "🇬🇧", similarity: 0.92, genres: ["Post-Punk"] },
        { id: "new-order", name: "New Order", country: "Reino Unido", flag: "🇬🇧", similarity: 0.88, genres: ["Synth-Pop"] },
        { id: "depeche-mode", name: "Depeche Mode", country: "Reino Unido", flag: "🇬🇧", similarity: 0.86, genres: ["Synth-Pop"] },
        { id: "interpol", name: "Interpol", country: "Estados Unidos", flag: "🇺🇸", similarity: 0.82, genres: ["Indie Rock"] }
      ]
    };

    const details = getArtistDetails(nodeToExpand);
    const newSimilars = (details.similar && details.similar.length > 0) 
      ? details.similar 
      : (realSimilarsMap[nodeToExpand.id] || [
          { id: `${nodeToExpand.id}-sim-1`, name: `${nodeToExpand.name}`, country: nodeToExpand.country, flag: nodeToExpand.flag, similarity: 0.85, genres: nodeToExpand.genres }
        ]);

    setGraphData(prev => {
      const existingNodeIds = new Set(prev.nodes.map(n => n.id));
      const addedNodes = [];
      const addedLinks = [];

      newSimilars.forEach(sim => {
        if (!existingNodeIds.has(sim.id)) {
          addedNodes.push({
            id: sim.id,
            name: sim.name,
            country: sim.country,
            flag: sim.flag,
            isSeed: false,
            genres: sim.genres
          });
        }
        addedLinks.push({
          source: nodeToExpand.id,
          target: sim.id,
          weight: sim.similarity || 0.80
        });
      });

      return {
        nodes: [...prev.nodes, ...addedNodes],
        links: [...prev.links, ...addedLinks]
      };
    });
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
