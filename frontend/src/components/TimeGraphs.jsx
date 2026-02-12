// frontend/src/components/TimeGraphs.jsx (NEW)
import React, { useRef, useEffect } from 'react';

const TimeGraphs = ({ worldState }) => {
  const positionCanvasRef = useRef(null);
  const velocityCanvasRef = useRef(null);
  const accelerationCanvasRef = useRef(null);

  const drawGraph = (canvas, data, label, color, unit) => {
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, width / 2, 15);

    // Find data range
    const maxTime = Math.max(...data.map(d => d.time));
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 0.1);
    const minValue = Math.min(...values, -0.1);

    // Draw axes
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis labels
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#7f8c8d';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${label} (${unit})`, 0, 0);
    ctx.restore();

    // Grid
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * i / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y labels
      const value = maxValue - (maxValue - minValue) * i / 5;
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding - 5, y + 3);
    }

    // Scale functions
    const scaleX = (time) => padding + (time / maxTime) * (width - 2 * padding);
    const scaleY = (value) => {
      const range = maxValue - minValue;
      if (range === 0) return height / 2;
      return height - padding - ((value - minValue) / range) * (height - 2 * padding);
    };

    // Draw data line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, i) => {
      const x = scaleX(point.time);
      const y = scaleY(point.value);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Current value marker
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const x = scaleX(lastPoint.time);
      const y = scaleY(lastPoint.value);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Value label
      ctx.fillStyle = color;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${lastPoint.value.toFixed(2)} ${unit}`, width - padding + 5, y + 3);
    }
  };

  useEffect(() => {
    if (!worldState || worldState.objects.length === 0) return;

    const obj = worldState.objects.find(o => !o.is_static);
    if (!obj || !obj.trajectory) return;

    // Prepare position data (magnitude)
    const positionData = obj.trajectory.map((point, i) => ({
      time: i * 0.016,
      value: Math.sqrt(point.x ** 2 + point.y ** 2)
    }));

    // Prepare velocity data (from current state, we'll approximate)
    const velocityData = [];
    for (let i = 0; i < obj.trajectory.length; i++) {
      const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
      velocityData.push({
        time: i * 0.016,
        value: i === obj.trajectory.length - 1 ? speed : speed * (1 - i * 0.001) // Approximation
      });
    }

    // Prepare acceleration data
    const accelMag = Math.sqrt(obj.acceleration.x ** 2 + obj.acceleration.y ** 2);
    const accelerationData = obj.trajectory.map((point, i) => ({
      time: i * 0.016,
      value: accelMag
    }));

    drawGraph(positionCanvasRef.current, positionData, 'Position', '#3498db', 'm');
    drawGraph(velocityCanvasRef.current, velocityData, 'Velocity', '#e74c3c', 'm/s');
    drawGraph(accelerationCanvasRef.current, accelerationData, 'Acceleration', '#f39c12', 'm/s²');

  }, [worldState]);

  if (!worldState || worldState.objects.length === 0) {
    return (
      <div className="time-graphs">
        <div className="no-data">
          <p>Start simulation to see graphs</p>
        </div>

        <style jsx>{`
          .time-graphs {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    <div className="time-graphs">
      <h3>📈 Motion Graphs</h3>
      
      <div className="graphs-container">
        <canvas ref={positionCanvasRef} width={350} height={180} />
        <canvas ref={velocityCanvasRef} width={350} height={180} />
        <canvas ref={accelerationCanvasRef} width={350} height={180} />
      </div>

      <style jsx>{`
        .time-graphs {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 18px;
        }

        .graphs-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        canvas {
          display: block;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default TimeGraphs;
