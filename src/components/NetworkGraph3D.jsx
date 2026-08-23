import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RefreshCw, Eye, Sparkles, Box, Compass } from 'lucide-react';

export default function NetworkGraph3D({
  graphData,
  onSelectNode,
  selectedNode,
  similarityThreshold,
  onlyLocal,
  userCountry = "Chile",
  onToggleViewMode,
  is3DMode = true
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
      links: filteredLinks.map(l => ({ ...l }))
    };

    // Clean up previous 3D instance if exists
    if (graphInstanceRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Initialize 3D Force Graph WebGL Engine
    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(data3D)
      .backgroundColor('#090d16')
      .nodeRelSize(7)
      .nodeVal(d => d.isSeed ? 14 : 8)
      .nodeColor(d => {
        if (d.id === selectedNode?.id) return '#ec4899'; // Hot pink active
        if (d.isSeed) return '#8b5cf6'; // Neon Violet seed
        if (d.country === userCountry) return '#10b981'; // Emerald local
        return '#00d2ff'; // Cyan global
      })
      // 3D Billboard Sprite Text for nodes (Zero-clutter 3D text in space)
      .nodeThreeObject(node => {
        const sprite = new SpriteText(`${node.flag || '🎵'} ${node.name}`);
        const isSelected = node.id === selectedNode?.id;
        const isSeed = node.isSeed;
        const isLocal = node.country === userCountry;

        sprite.color = isSelected ? '#ffffff' : (isSeed ? '#f8fafc' : '#cbd5e1');
        sprite.textHeight = isSeed ? 6.5 : (isSelected ? 6 : 4.8);
        sprite.backgroundColor = isSelected ? 'rgba(139, 92, 246, 0.9)' : (isLocal ? 'rgba(16, 185, 129, 0.3)' : 'rgba(15, 20, 32, 0.85)');
        sprite.borderColor = isSelected ? '#a78bfa' : (isLocal ? '#34d399' : 'rgba(255, 255, 255, 0.2)');
        sprite.borderWidth = 1.2;
        sprite.borderRadius = 5;
        sprite.padding = [3, 6];
        sprite.fontFace = 'Outfit, sans-serif';
        return sprite;
      })
      .nodeThreeObjectExtend(true)
      // Multidimensional Link Styling
      .linkColor(link => {
        const source = link.source;
        const target = link.target;
        const isLocalLink = (source.country === userCountry || target.country === userCountry);
        if (isLocalLink) return 'rgba(16, 185, 129, 0.7)';
        if ((link.weight || 0.8) >= 0.85) return 'rgba(139, 92, 246, 0.7)';
        return 'rgba(0, 210, 255, 0.5)';
      })
      .linkWidth(link => (link.weight || 0.8) * 1.8)
      .linkOpacity(0.55)
      // Glowing Directional Cosmic Particles along Links
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(2.5)
      .linkDirectionalParticleSpeed(d => (d.weight || 0.8) * 0.005)
      .linkDirectionalParticleColor(l => l.weight >= 0.85 ? '#c4b5fd' : '#7dd3fc')
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
    Graph.d3Force('charge').strength(-350);
    Graph.d3Force('link').distance(l => (l.weight >= 0.85 ? 120 : 180));

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
  }, [graphData, similarityThreshold, onlyLocal, userCountry, selectedNode]);

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

      {/* 3D Multidimensional Legend Overlay */}
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
          <span>Esfera Semilla</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
          <span>Escena Local ({userCountry})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00d2ff', display: 'inline-block', boxShadow: '0 0 8px #00d2ff' }}></span>
          <span>Escena Global</span>
        </div>
      </div>

    </div>
  );
}
