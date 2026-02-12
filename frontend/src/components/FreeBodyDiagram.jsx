// frontend/src/components/FreeBodyDiagram.jsx (NEW)
import React, { useRef, useEffect } from 'react';

const FreeBodyDiagram = ({ worldState }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!worldState || !canvasRef.current || worldState.objects.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Free Body Diagram', width / 2, 20);

    // Get first non-static object
    const obj = worldState.objects.find(o => !o.is_static);
    if (!obj) return;

    // Center of object
    const centerX = width / 2;
    const centerY = height / 2;
    const objRadius = 30;

    // Draw object
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, objRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(obj.label, centerX, centerY + 5);

    const forceScale = 3; // Pixels per Newton

    // Draw forces
    const forces = [];

    // Gravity (downward)
    if (worldState.gravity_enabled) {
      const gravityForce = obj.mass * worldState.gravity_strength;
      forces.push({
        name: 'Gravity (Fg)',
        magnitude: gravityForce,
        angle: -Math.PI / 2, // Downward
        color: '#e74c3c'
      });
    }

    // Net force based on acceleration
    const netForceX = obj.acceleration.x * obj.mass;
    const netForceY = obj.acceleration.y * obj.mass;
    const netForceMag = Math.sqrt(netForceX * netForceX + netForceY * netForceY);

    if (netForceMag > 0.1) {
      const netForceAngle = Math.atan2(-netForceY, netForceX);
      forces.push({
        name: 'Net Force (ΣF)',
        magnitude: netForceMag,
        angle: netForceAngle,
        color: '#9b59b6'
      });
    }

    // Normal force (if on ground)
    if (obj.position.y <= worldState.ground_level + obj.radius + 0.5 && worldState.gravity_enabled) {
      const normalForce = obj.mass * worldState.gravity_strength;
      forces.push({
        name: 'Normal (N)',
        magnitude: normalForce,
        angle: Math.PI / 2, // Upward
        color: '#3498db'
      });
    }

    // Tension (for pendulum/spring)
    if (obj.velocity.magnitude > 0 && obj.position.y > worldState.ground_level + 5) {
      // Check if constrained motion (pendulum-like)
      const speed = Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2);
      if (speed > 0.5) {
        const tensionMag = obj.mass * (worldState.gravity_strength + speed * speed / 10);
        const toCenter = Math.atan2(50 - obj.position.y, 50 - obj.position.x);
        forces.push({
          name: 'Tension (T)',
          magnitude: tensionMag,
          angle: toCenter,
          color: '#f39c12'
        });
      }
    }

    // Applied force (velocity-based)
    if (Math.abs(obj.velocity.x) > 0.5 || Math.abs(obj.velocity.y) > 0.5) {
      const velAngle = Math.atan2(-obj.velocity.y, obj.velocity.x);
      const appliedForceMag = obj.mass * Math.sqrt(obj.velocity.x ** 2 + obj.velocity.y ** 2) * 0.5;
      
      if (appliedForceMag > 0.5) {
        forces.push({
          name: 'Applied (Fa)',
          magnitude: appliedForceMag,
          angle: velAngle,
          color: '#27ae60'
        });
      }
    }

    // Circular motion - centripetal force
    if (obj.circular_motion && obj.circular_motion.enabled) {
      const centripetalForce = obj.circular_motion.centripetal_acceleration * obj.mass;
      const angleToCenter = Math.atan2(
        obj.circular_motion.center.y - obj.position.y,
        obj.circular_motion.center.x - obj.position.x
      );
      forces.push({
        name: 'Centripetal (Fc)',
        magnitude: centripetalForce,
        angle: angleToCenter,
        color: '#9b59b6'
      });
    }

    // Draw force vectors
    forces.forEach((force, index) => {
      const length = Math.min(force.magnitude * forceScale, 80);
      const endX = centerX + length * Math.cos(force.angle);
      const endY = centerY - length * Math.sin(force.angle); // Negative because canvas Y is inverted

      // Draw arrow
      ctx.strokeStyle = force.color;
      ctx.fillStyle = force.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrow head
      const headLength = 12;
      const headAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(force.angle - headAngle),
        endY + headLength * Math.sin(force.angle - headAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(force.angle + headAngle),
        endY + headLength * Math.sin(force.angle + headAngle)
      );
      ctx.stroke();

      // Label
      const labelX = centerX + (length + 20) * Math.cos(force.angle);
      const labelY = centerY - (length + 20) * Math.sin(force.angle);
      
      ctx.fillStyle = force.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(force.name, labelX, labelY);
      ctx.font = '10px sans-serif';
      ctx.fillText(`${force.magnitude.toFixed(1)} N`, labelX, labelY + 12);
    });

    // Legend
    ctx.fillStyle = '#2c3e50';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Mass: ${obj.mass.toFixed(2)} kg`, 10, height - 30);
    ctx.fillText(`|a|: ${Math.sqrt(obj.acceleration.x**2 + obj.acceleration.y**2).toFixed(2)} m/s²`, 10, height - 15);

  }, [worldState]);

  if (!worldState || worldState.objects.length === 0) {
    return null;
  }

  return (
    <div className="fbd-container">
      <canvas ref={canvasRef} width={300} height={350} />
      
      <style jsx>{`
        .fbd-container {
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        canvas {
          display: block;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default FreeBodyDiagram;
