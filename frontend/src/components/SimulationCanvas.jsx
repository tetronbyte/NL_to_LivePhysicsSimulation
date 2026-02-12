// frontend/src/components/SimulationCanvas.jsx (UPDATE with theme support)
import React, { useRef, useEffect, useState } from 'react';

const SimulationCanvas = ({ worldState, showGrid = true, showVectors = true }) => {
  const canvasRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!worldState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#1a1f2e' : '#f8f9fa';
    const groundColor = isDark ? '#16a085' : '#27ae60';
    const gridColor = isDark ? '#374151' : '#dee2e6';
    const textColor = isDark ? '#e8e9eb' : '#2c3e50';
    const labelColor = isDark ? '#a8adb5' : '#7f8c8d';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Scale factor (canvas pixels per meter)
    const scaleX = canvas.width / worldState.width;
    const scaleY = canvas.height / worldState.height;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width / zoomLevel, canvas.height / zoomLevel);

    // Draw ground
    const groundY = canvas.height - (worldState.ground_level * scaleY);
    ctx.fillStyle = groundColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(0, groundY / zoomLevel, canvas.width / zoomLevel, (canvas.height - groundY) / zoomLevel);
    ctx.globalAlpha = 1.0;

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let i = 0; i <= worldState.width; i += 5) {
        const x = i * scaleX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height / zoomLevel);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i <= worldState.height; i += 5) {
        const y = canvas.height / zoomLevel - (i * scaleY);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width / zoomLevel, y);
        ctx.stroke();
      }

      // Draw axis labels
      ctx.fillStyle = labelColor;
      ctx.font = '10px sans-serif';
      ctx.fillText('0', 5, canvas.height / zoomLevel - 5);
      ctx.fillText(`${worldState.width}m`, canvas.width / zoomLevel - 30, canvas.height / zoomLevel - 5);
      ctx.fillText(`${worldState.height}m`, 5, 15);
    }

    // Draw trajectories first (behind objects)
    worldState.objects.forEach((obj) => {
      if (obj.show_trajectory && obj.trajectory && obj.trajectory.length > 1) {
        ctx.strokeStyle = obj.color + '60'; // Semi-transparent
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const firstPoint = obj.trajectory[0];
        ctx.moveTo(firstPoint.x * scaleX, canvas.height / zoomLevel - firstPoint.y * scaleY);
        
        for (let i = 1; i < obj.trajectory.length; i++) {
          const point = obj.trajectory[i];
          ctx.lineTo(point.x * scaleX, canvas.height / zoomLevel - point.y * scaleY);
        }
        ctx.stroke();
      }
    });

    // Draw initial position markers
    worldState.objects.forEach((obj) => {
      if (obj.is_static) return;
      
      const ix = obj.initial_position.x * scaleX;
      const iy = canvas.height / zoomLevel - (obj.initial_position.y * scaleY);
      
      // Draw dotted circle at initial position
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(ix, iy, obj.radius * Math.min(scaleX, scaleY), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw displacement vectors
    worldState.objects.forEach((obj) => {
      if (obj.is_static) return;
      
      if (obj.displacement_magnitude > 0.1) {
        const ix = obj.initial_position.x * scaleX;
        const iy = canvas.height / zoomLevel - (obj.initial_position.y * scaleY);
        const fx = obj.position.x * scaleX;
        const fy = canvas.height / zoomLevel - (obj.position.y * scaleY);
        
        // Draw displacement arrow
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Arrow head
        const angle = Math.atan2(fy - iy, fx - ix);
        const arrowLength = 8;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(
          fx - arrowLength * Math.cos(angle - Math.PI / 6),
          fy - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(fx, fy);
        ctx.lineTo(
          fx - arrowLength * Math.cos(angle + Math.PI / 6),
          fy - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    // Draw objects
    worldState.objects.forEach((obj) => {
      const x = obj.position.x * scaleX;
      const y = canvas.height / zoomLevel - (obj.position.y * scaleY);
      const radius = obj.radius * Math.min(scaleX, scaleY);

      // Draw based on shape
      ctx.fillStyle = obj.color;
      
      if (obj.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.shape === 'square') {
        const size = radius * 2;
        ctx.fillRect(x - size/2, y - size/2, size, size);
      } else if (obj.shape === 'rectangle') {
        const width = obj.width * scaleX;
        const height = obj.height * scaleY;
        ctx.fillRect(x - width/2, y - height/2, width, height);
      }

      // Draw border
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 2;
      if (obj.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (obj.shape === 'square') {
        const size = radius * 2;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
      } else if (obj.shape === 'rectangle') {
        const width = obj.width * scaleX;
        const height = obj.height * scaleY;
        ctx.strokeRect(x - width/2, y - height/2, width, height);
      }

      // Draw label
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.label, x, y - radius - 15);

      // Draw velocity vector
      if (showVectors && obj.show_velocity_vector && 
          (obj.velocity.x !== 0 || obj.velocity.y !== 0)) {
        const velScale = 4;
        const vx = obj.velocity.x * velScale;
        const vy = -obj.velocity.y * velScale;

        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx, y + vy);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(vy, vx);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(
          x + vx - arrowLength * Math.cos(angle - Math.PI / 6),
          y + vy - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(
          x + vx - arrowLength * Math.cos(angle + Math.PI / 6),
          y + vy - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();

        // Velocity label
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 10px sans-serif';
        const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
        ctx.fillText(`v=${speed.toFixed(1)} m/s`, x + vx + 10, y + vy - 5);
      }

      // Draw circular motion path
      if (obj.circular_motion && obj.circular_motion.enabled) {
        const cm = obj.circular_motion;
        const cx = cm.center.x * scaleX;
        const cy = canvas.height / zoomLevel - (cm.center.y * scaleY);
        const r = cm.radius * Math.min(scaleX, scaleY);

        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw radius line
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Draw centripetal force arrow (toward center)
        const dx = cx - x;
        const dy = cy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const fcScale = 20;
          const fcx = (dx / dist) * fcScale;
          const fcy = (dy / dist) * fcScale;

          ctx.strokeStyle = '#9b59b6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + fcx, y + fcy);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(fcy, fcx);
          const arrowLength = 8;
          ctx.beginPath();
          ctx.moveTo(x + fcx, y + fcy);
          ctx.lineTo(
            x + fcx - arrowLength * Math.cos(angle - Math.PI / 6),
            y + fcy - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(x + fcx, y + fcy);
          ctx.lineTo(
            x + fcx - arrowLength * Math.cos(angle + Math.PI / 6),
            y + fcy - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();

          // Label
          ctx.fillStyle = '#9b59b6';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('Fc', x + fcx + 10, y + fcy);
        }
      }
    });

    // Draw time and system info
    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${worldState.time.toFixed(2)} s`, 10, 20);
    
    ctx.font = '12px sans-serif';
    ctx.fillText(`KE: ${worldState.total_kinetic_energy.toFixed(2)} J`, 10, 40);
    ctx.fillText(`PE: ${worldState.total_potential_energy.toFixed(2)} J`, 10, 55);
    ctx.fillText(`Total: ${worldState.total_mechanical_energy.toFixed(2)} J`, 10, 70);
    ctx.fillText(`Momentum: ${worldState.total_momentum_magnitude.toFixed(2)} kg⋅m/s`, 10, 85);

    ctx.restore();
  }, [worldState, zoomLevel, panOffset, showGrid, showVectors]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onWheel={handleWheel}
        style={{ 
          border: '2px solid var(--border-color)', 
          borderRadius: '8px',
          cursor: 'crosshair',
          background: 'var(--card-bg)'
        }}
      />
      
      <div className="canvas-controls">
        <button onClick={() => setZoomLevel(1.0)}>Reset Zoom</button>
        <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
      </div>

      <style jsx>{`
        .canvas-container {
          background: var(--card-bg);
          padding: 16px;
          border-radius: 8px;
          box-shadow: var(--shadow-md);
        }

        canvas {
          display: block;
        }

        .canvas-controls {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .canvas-controls button {
          padding: 6px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .canvas-controls button:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .canvas-controls span {
          font-size: 12px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default SimulationCanvas;
