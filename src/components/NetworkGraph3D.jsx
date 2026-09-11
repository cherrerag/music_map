import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import SpriteText from 'three-spritetext';
import { RefreshCw, Box, Compass } from 'lucide-react';

export default function NetworkGraph3D({
  graphData,
  onSelectNode,
  selectedNode,
  similarityThreshold,
  onlyLocal,
  userCountry = "Chile",
  onToggleViewMode,
  is3DMode = true,
  pathHistory = []
}) {
  const containerRef = useRef(null);
  const graphInstanceRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.nodes) return;

    // Filter nodes based on user scene controls
    const filteredNodes = graphData.nodes.filter(n => {
      if (n.isSeed) return true;
      if (onlyLocal && n.country !== userCountry) return false;
      return true;
    });

    const activeNodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter links based on threshold
    const filteredLinks = (graphData.links || []).filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return (
        activeNodeIds.has(sourceId) &&
        activeNodeIds.has(targetId) &&
        (l.weight || 0.8) >= similarityThreshold
      );
    });

    const data3D = {
      nodes: filteredNodes.map(n => ({ ...n })),
      links: filteredLinks.map(l => ({
        ...l,
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target
      }))
    };

    // Clean up previous 3D instance if exists
    if (graphInstanceRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Helper to check if a link is part of the active path history trail
    const isTrailLink = (link) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
      return pathHistory.some((id, i) => {
        if (i === 0) return false;
        const prevId = pathHistory[i - 1];
        return (srcId === prevId && tgtId === id) || (srcId === id && tgtId === prevId);
      });
    };

    // Initialize 3D Force Graph WebGL Engine
    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(data3D)
      .backgroundColor('#090d16')
      .nodeRelSize(0) // Hide 3D sphere meshes so they don't obscure text!
      .nodeVal(0)
      .nodeThreeObjectExtend(false) // Pure 3D Billboard Text Pill Nodes
      .nodeThreeObject(node => {
        const isSelected = node.id === selectedNode?.id;
        const tIdx = pathHistory.indexOf(node.id);

        let prefix = '';
        let bgColor = 'rgba(15, 20, 32, 0.88)';
        let borderColor = 'rgba(255, 255, 255, 0.18)';
        let textColor = '#cbd5e1';

        // Color coding the active path history trail & origin steps
        if (isSelected) {
          bgColor = 'rgba(245, 158, 11, 0.95)'; // Golden Amber active focus
          borderColor = '#fbbf24';
          textColor = '#ffffff';
          prefix = '★ ';
        } else if (tIdx === 0) {
          bgColor = 'rgba(139, 92, 246, 0.95)'; // Neon Violet (Origen / Semilla Inicial)
          borderColor = '#c4b5fd';
          textColor = '#ffffff';
          prefix = '🌱 ';
        } else if (tIdx === 1) {
          bgColor = 'rgba(0, 210, 255, 0.90)'; // Neon Cyan (Primer paso de expansión)
          borderColor = '#7dd3fc';
          textColor = '#ffffff';
          prefix = '① ';
        } else if (tIdx === 2) {
          bgColor = 'rgba(236, 72, 153, 0.90)'; // Hot Pink (Segundo paso de expansión)
          borderColor = '#f472b6';
          textColor = '#ffffff';
          prefix = '② ';
        } else if (node.country === userCountry) {
          borderColor = '#34d399';
          bgColor = 'rgba(16, 185, 129, 0.25)';
          textColor = '#e2e8f0';
        }

        const sprite = new SpriteText(`${prefix}${node.flag || '🎵'} ${node.name}`);
        sprite.color = textColor;
        sprite.textHeight = isSelected ? 6.5 : (tIdx >= 0 ? 5.8 : 4.6);
        sprite.backgroundColor = bgColor;
        sprite.borderColor = borderColor;
        sprite.borderWidth = (isSelected || tIdx >= 0) ? 1.8 : 1.0;
        sprite.borderRadius = 6;
        sprite.padding = [4, 8];
        sprite.fontFace = 'Outfit, sans-serif';
        return sprite;
      })

      // Multidimensional & Trail Link Styling
      .linkColor(link => {
        if (isTrailLink(link)) return '#f59e0b'; // Gold laser for active path history!
        const source = link.source;
        const target = link.target;
        const isLocalLink = (source.country === userCountry || target.country === userCountry);
        if (isLocalLink) return 'rgba(16, 185, 129, 0.6)';
        if ((link.weight || 0.8) >= 0.85) return 'rgba(139, 92, 246, 0.6)';
        return 'rgba(0, 210, 255, 0.35)';
      })
      .linkWidth(link => isTrailLink(link) ? 3.5 : (link.weight || 0.8) * 1.6)
      .linkOpacity(0.6)

      // Glowing Directional Cosmic Particles along Links
      .linkDirectionalParticles(link => isTrailLink(link) ? 5 : 2)
      .linkDirectionalParticleWidth(link => isTrailLink(link) ? 4.0 : 2.2)
      .linkDirectionalParticleSpeed(link => isTrailLink(link) ? 0.012 : (link.weight || 0.8) * 0.005)
      .linkDirectionalParticleColor(link => isTrailLink(link) ? '#fbbf24' : '#7dd3fc')

      .onNodeClick(node => {
        onSelectNode(node);
        // Smoothly animate 3D camera to target node
        const distance = 140;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1200
        );
      });

    // Configure 3D Force physics parameters for wide 3D dispersion
    Graph.d3Force('charge').strength(-380);
    Graph.d3Force('link').distance(l => (l.weight >= 0.85 ? 130 : 190));

    // Enable OrbitControls auto-rotate if active
    const controls = Graph.controls();
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.2;
    }

    graphInstanceRef.current = Graph;

    // Handle container resize
    const handleResize = () => {
      if (containerRef.current && Graph) {
        Graph.width(containerRef.current.clientWidth);
        Graph.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [graphData, similarityThreshold, onlyLocal, userCountry, selectedNode, pathHistory]);

  // Toggle auto-rotation in 3D
  const toggleAutoRotate = () => {
    const nextState = !autoRotate;
    setAutoRotate(nextState);
    if (graphInstanceRef.current) {
      const controls = graphInstanceRef.current.controls();
      if (controls) {
        controls.autoRotate = nextState;
        controls.autoRotateSpeed = 1.2;
      }
    }
  };

  // Reset 3D camera view
  const handleResetCamera = () => {
    if (graphInstanceRef.current) {
      graphInstanceRef.current.cameraPosition({ x: 0, y: 0, z: 320 }, { x: 0, y: 0, z: 0 }, 1000);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#090d16' }}>
      
      {/* WebGL 3D Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Floating 3D Controls Bar */}
      <div className="glass-panel mobile-graph-controls" style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        zIndex: 10
      }}>
        {/* Toggle 2D / 3D Mode */}
        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              fontWeight: 700
            }}
            title="Conmutar entre Vista 3D y 2D"
          >
            <Box size={16} /> Mode {is3DMode ? '3D Cosmic' : '2D Canvas'}
          </button>
        )}

        {/* Auto Rotate Toggle */}
        <button
          className="btn-secondary"
          onClick={toggleAutoRotate}
          style={{
            color: autoRotate ? '#34d399' : '#c4b5fd',
            borderColor: autoRotate ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)',
            padding: '6px 12px',
            fontSize: '0.8rem'
          }}
          title="Modo Autorrotación Cósmica 3D"
        >
          <Compass size={16} className={autoRotate ? "spin-animation" : ""} /> {autoRotate ? 'Orbitando' : 'Orbita 3D'}
        </button>

        {/* Reset Camera */}
        <button
          className="btn-secondary"
          onClick={handleResetCamera}
          style={{ padding: '6px', cursor: 'pointer' }}
          title="Recentrar Cámara 3D"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* 3D Path Trail Legend Overlay */}
      <div className="glass-panel mobile-graph-legend" style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '0.78rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block', boxShadow: '0 0 8px #8b5cf6' }}></span>
          <span>🌱 Origen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00d2ff', display: 'inline-block', boxShadow: '0 0 8px #00d2ff' }}></span>
          <span>① Paso 1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', display: 'inline-block', boxShadow: '0 0 8px #ec4899' }}></span>
          <span>② Paso 2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', boxShadow: '0 0 8px #f59e0b' }}></span>
          <span>★ Activo</span>
        </div>
      </div>

    </div>
  );
}
