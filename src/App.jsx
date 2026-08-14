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

  // Generate initial graph from seed artist
  useEffect(() => {
    if (!currentSeed) return;

    const seedNode = {
      id: currentSeed.id,
      name: currentSeed.name,
      country: currentSeed.country,
      flag: currentSeed.flag,
      isSeed: true,
      genres: currentSeed.genres
    };

    const similarNodes = currentSeed.similar.map(sim => ({
      id: sim.id,
      name: sim.name,
      country: sim.country,
      flag: sim.flag,
      isSeed: false,
      genres: sim.genres
    }));

    const links = currentSeed.similar.map(sim => ({
      source: currentSeed.id,
      target: sim.id,
      weight: sim.similarity
    }));

    setGraphData({
      nodes: [seedNode, ...similarNodes],
      links: links
    });

    setSelectedNode(seedNode);
  }, [currentSeed]);

  // Handler for expanding red from any node
  const handleExpandNode = (nodeToExpand) => {
    showToast(`Expandiendo red para ${nodeToExpand.name}...`);

    // Check if node already has pre-defined similar, or procedurally generate 4 new connected nodes
    const details = getArtistDetails(nodeToExpand);
    let newSimilars = details.similar;

    if (!newSimilars || newSimilars.length === 0) {
      // Procedural generation of new discovery nodes
      const proceduralNames = [
        { name: `${nodeToExpand.name} Session`, country: nodeToExpand.country, flag: nodeToExpand.flag },
        { name: "Constelación Local", country: userCountry, flag: "🇨🇱" },
        { name: "Onda Sintética", country: "Argentina", flag: "🇦🇷" },
        { name: "Colectivo Fusión", country: "México", flag: "🇲🇽" }
      ];

      newSimilars = proceduralNames.map((p, idx) => ({
        id: `${nodeToExpand.id}-expanded-${idx}`,
        name: p.name,
        country: p.country,
        flag: p.flag,
        similarity: 0.85 - idx * 0.05,
        genres: nodeToExpand.genres || ["Alternative"]
      }));
    }

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
