// frontend/src/components/EnergyChart.jsx (NEW)
import React, { useRef, useEffect } from 'react';

const EnergyChart = ({ energyHistory }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!energyHistory || !energyHistory.history || energyHistory.history.length === 0) return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#1a1f2e' : '#ffffff';
    const gridColor = isDark ? '#374151' : '#ecf0f1';
    const textColor = isDark ? '#e8e9eb' : '#2c3e50';
    const axisColor = isDark ? '#e8e9eb' : '#2c3e50';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const history = energyHistory.history;
    const maxTime = history[history.length - 1]?.time || 1;
    const maxEnergy = Math.max(
      ...history.map(h => Math.max(h.kinetic, h.potential, h.mechanical))
    );

    // Draw axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energy (J)', 0, 0);
    ctx.restore();

    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * i / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      const energyValue = maxEnergy * (1 - i / 5);
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.font = '9px sans-serif';
      ctx.fillText(energyValue.toFixed(1), padding - 5, y + 4);
    }

    // Scale functions
    const scaleX = (time) => padding + (time / maxTime) * (width - 2 * padding);
    const scaleY = (energy) => height - padding - (energy / maxEnergy) * (height - 2 * padding);

    // Draw kinetic energy
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = scaleX(point.time);
      const y = scaleY(point.kinetic);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw potential energy
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = scaleX(point.time);
      const y = scaleY(point.potential);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw mechanical energy
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = scaleX(point.time);
      const y = scaleY(point.mechanical);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw legend
    const legendX = width - padding - 120;
    const legendY = padding + 20;

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(legendX, legendY, 15, 3);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';
    ctx.fillText('Kinetic', legendX + 20, legendY + 3);

    ctx.fillStyle = '#3498db';
    ctx.fillRect(legendX, legendY + 20, 15, 3);
    ctx.fillStyle = textColor;
    ctx.fillText('Potential', legendX + 20, legendY + 23);

    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(legendX, legendY + 40, 15, 3);
    ctx.fillStyle = textColor;
    ctx.fillText('Total', legendX + 20, legendY + 43);

  }, [energyHistory]);


  if (!energyHistory || !energyHistory.history || energyHistory.history.length === 0) {
    return (
      <div className="energy-chart">
        <h3>Energy Over Time</h3>
        <div className="no-data">
          <p>Start the simulation to see energy changes</p>
        </div>

        <style jsx>{`
          .energy-chart {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .energy-chart h3 {
            margin: 0 0 16px 0;
            color: #2c3e50;
          }

          .no-data {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 4px;
          }

          .no-data p {
            color: #7f8c8d;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="energy-chart">
      <h3>⚡ Energy Conservation</h3>
      
      <canvas ref={canvasRef} width={600} height={250} />

      <div className="energy-info">
        <div className="energy-stat">
          <span className="label">Initial Energy:</span>
          <span className="value">{energyHistory.initial_energy?.toFixed(2) || 0} J</span>
        </div>
        <div className="energy-stat">
          <span className="label">Energy Loss:</span>
          <span className="value loss">{energyHistory.energy_loss?.toFixed(2) || 0} J</span>
        </div>
        <div className="energy-stat">
          <span className="label">Conservation:</span>
          <span className="value">
            {energyHistory.initial_energy > 0 
              ? ((1 - energyHistory.energy_loss / energyHistory.initial_energy) * 100).toFixed(1) 
              : 100}%
          </span>
        </div>
      </div>

      <style jsx>{`
        .energy-chart {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .energy-chart h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 18px;
        }

        canvas {
          display: block;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
        }

        .energy-info {
          display: flex;
          justify-content: space-around;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #ecf0f1;
        }

        .energy-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .energy-stat .label {
          font-size: 12px;
          color: #7f8c8d;
          margin-bottom: 4px;
        }

        .energy-stat .value {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
        }

        .energy-stat .value.loss {
          color: #e74c3c;
        }
      `}</style>
    </div>
  );
};

export default EnergyChart;
