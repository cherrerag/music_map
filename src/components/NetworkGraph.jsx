import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-force';
import { ZoomIn, ZoomOut, RefreshCw, Maximize2, Sparkles, MapPin } from 'lucide-react';

export default function NetworkGraph({ 
  graphData, 
  onSelectNode, 
  selectedNode, 
  similarityThreshold,
  onlyLocal,
  userCountry = "Chile"
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Transformation & interaction states
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef(null);
  const hoveredNodeRef = useRef(null);
  const simulationRef = useRef(null);
  
  const nodesRef = useRef([]);
  const linksRef = useRef([]);

  // Initialize & update physics simulation
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    // Filter nodes and links based on user controls
    const filteredNodes = graphData.nodes.filter(n => {
      if (n.isSeed) return true;
      if (onlyLocal && n.country !== userCountry) return false;
      return true;
    });

    const activeNodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = graphData.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return (
        activeNodeIds.has(sourceId) && 
        activeNodeIds.has(targetId) && 
        l.weight >= similarityThreshold
      );
    });

    // Copy data for d3 physics
    const nodes = filteredNodes.map(n => ({ ...n }));
    const links = filteredLinks.map(l => ({ ...l }));

    nodesRef.current = nodes;
    linksRef.current = links;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // Create D3 Force Simulation with Orbital Radial Distances
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        const isLocalConnection = d.target.country === userCountry || d.source.country === userCountry;
        // Inner orbit (~110px) for local scene, outer orbit (~190px) for global
        return isLocalConnection ? 110 : (190 * (1.2 - d.weight * 0.4));
      }))
      .force('charge', d3.forceManyBody().strength(d => d.isSeed ? -750 : -320))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => d.isSeed ? 48 : 32));

    simulationRef.current = sim;

    sim.on('tick', () => {
      renderCanvas();
    });

    return () => sim.stop();
  }, [graphData, similarityThreshold, onlyLocal, userCountry]);

  // Canvas render loop
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply zoom & pan transformation
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const hoveredNode = hoveredNodeRef.current;
    const selectedId = selectedNode?.id;

    // Find seed node coordinates for Concentric Orbits
    const seedNode = nodesRef.current.find(n => n.isSeed);
    if (seedNode && seedNode.x) {
      // Inner Local Orbit Ring (Green glow)
      ctx.beginPath();
      ctx.arc(seedNode.x, seedNode.y, 110, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      // Outer Global Orbit Ring (Purple glow)
      ctx.beginPath();
      ctx.arc(seedNode.x, seedNode.y, 190, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash
    }

    // Draw Multidimensional Links
    linksRef.current.forEach(link => {
      const source = link.source;
      const target = link.target;
      if (!source.x || !target.x) return;

      const isConnected = 
        (hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id)) ||
        (selectedId && (source.id === selectedId || target.id === selectedId));

      const isLocalLink = (source.country === userCountry || target.country === userCountry);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      // Multidimensional Link Color System
      let linkColor = 'rgba(0, 210, 255, 0.4)'; // Cyan (Global Audience)
      if (isLocalLink) {
        linkColor = '#10b981'; // Emerald Green (Local Scene Connection)
      } else if (link.weight >= 0.85) {
        linkColor = '#8b5cf6'; // Neon Violet (High Sonic/Style Affinity)
      }

      if (isConnected) {
        ctx.strokeStyle = linkColor;
        ctx.lineWidth = 3.5 * link.weight;
        ctx.globalAlpha = 0.95;
      } else {
        ctx.strokeStyle = linkColor;
        ctx.lineWidth = 1.2 * link.weight;
        ctx.globalAlpha = 0.35;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw Nodes
    nodesRef.current.forEach(node => {
      if (!node.x) return;

      const isSeed = node.isSeed;
      const isSelected = selectedId === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isLocal = node.country === userCountry;

      const radius = isSeed ? 28 : (isHovered || isSelected ? 23 : 18);

      // Node Halo Glow
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
      let glowColor = 'rgba(0, 210, 255, 0.2)';
      if (isSeed) glowColor = 'rgba(139, 92, 246, 0.45)';
      else if (isLocal) glowColor = 'rgba(16, 185, 129, 0.35)';

      if (isSelected || isHovered) glowColor = 'rgba(139, 92, 246, 0.7)';
      
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Node Body Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      
      // Node Border Color
      let borderColor = '#00d2ff'; // Cyan global
      if (isSeed) borderColor = '#8b5cf6'; // Violet seed
      else if (isLocal) borderColor = '#10b981'; // Emerald local

      ctx.fillStyle = '#121824';
      ctx.fill();
      ctx.lineWidth = isSelected || isHovered ? 3.5 : 2;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Node Icon / Indicator inside
      ctx.fillStyle = '#ffffff';
      ctx.font = `${isSeed ? '15px' : '12px'} Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.flag || '🎵', node.x, node.y - (isSeed ? 2 : 0));

      // Node Name Label
      const labelText = node.name;
      ctx.font = `${isSeed ? 'bold 13px' : '11px'} Outfit, sans-serif`;
      const textWidth = ctx.measureText(labelText).width;

      // Label background pill
      const pillW = textWidth + 14;
      const pillH = 20;
      const pillX = node.x - pillW / 2;
      const pillY = node.y + radius + 6;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
      ctx.fillStyle = isSelected ? '#8b5cf6' : (isLocal ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 20, 32, 0.85)');
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#a78bfa' : (isLocal ? '#34d399' : 'rgba(255, 255, 255, 0.12)');
      ctx.stroke();

      // Label Text
      ctx.fillStyle = isSelected ? '#ffffff' : (isHovered ? '#f8fafc' : '#cbd5e1');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, node.x, pillY + pillH / 2);
    });

    ctx.restore();
  };

  // Resize canvas dynamically
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      const ctx = canvasRef.current.getContext('2d');
      ctx.scale(dpr, dpr);
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [transform]);

  // Pointer & mouse event handlers (Drag, Hover, Click, Zoom)
  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = (clientX - rect.left - transform.x) / transform.k;
    const y = (clientY - rect.top - transform.y) / transform.k;
    return { x, y };
  };

  const findNodeAtCoords = (x, y) => {
    return nodesRef.current.find(node => {
      if (!node.x) return false;
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= (node.isSeed ? 30 : 24);
    });
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoords(e);
    const node = findNodeAtCoords(x, y);

    if (node) {
      draggedNodeRef.current = node;
      node.fx = node.x;
      node.fy = node.y;
      simulationRef.current?.alphaTarget(0.3).restart();
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoords(e);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = x;
      draggedNodeRef.current.fy = y;
      renderCanvas();
      return;
    }

    if (isDraggingRef.current) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      }));
      return;
    }

    // Hover state check
    const hovered = findNodeAtCoords(x, y);
    if (hoveredNodeRef.current !== hovered) {
      hoveredNodeRef.current = hovered;
      canvasRef.current.style.cursor = hovered ? 'pointer' : 'grab';
      renderCanvas();
    }
  };

  const handleMouseUp = (e) => {
    if (draggedNodeRef.current) {
      const { x, y } = getCanvasCoords(e);
      const node = findNodeAtCoords(x, y);
      if (node && node.id === draggedNodeRef.current.id) {
        onSelectNode(node);
      }
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      simulationRef.current?.alphaTarget(0);
    }
    isDraggingRef.current = false;
    canvasRef.current.style.cursor = 'grab';
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform(prev => {
      const newK = Math.max(0.4, Math.min(3, prev.k * zoomFactor));
      return { ...prev, k: newK };
    });
  };

  const handleResetZoom = () => {
    setTransform({ x: 0, y: 0, k: 1 });
    simulationRef.current?.alpha(0.8).restart();
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: 'grab', display: 'block', width: '100%', height: '100%' }}
      />

      {/* Floating Canvas Controls */}
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        gap: '6px',
        padding: '6px',
        zIndex: 10
      }}>
        <button 
          className="btn-secondary" 
          onClick={() => setTransform(p => ({ ...p, k: Math.min(3, p.k * 1.2) }))}
          title="Acercar (Zoom In)"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => setTransform(p => ({ ...p, k: Math.max(0.4, p.k * 0.8) }))}
          title="Alejar (Zoom Out)"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          className="btn-secondary" 
          onClick={handleResetZoom}
          title="Reorganizar Grafo"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Multidimensional Legend overlay */}
      <div className="glass-panel" style={{
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
          <span>Afinidad Sonora (Estilo)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
          <span>Escena Local ({userCountry})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00d2ff', display: 'inline-block', boxShadow: '0 0 8px #00d2ff' }}></span>
          <span>Conexión Global</span>
        </div>
      </div>
    </div>
  );
}
