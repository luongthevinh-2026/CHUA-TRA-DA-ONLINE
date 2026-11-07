import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activeTouchId = useRef<number | null>(null);

  const radius = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsActive(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        activeTouchId.current = null;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= radius) {
      setKnobPos({ x: dx, y: dy });
      onMove({ x: dx / radius, y: -dy / radius });
    } else {
      const angle = Math.atan2(dy, dx);
      const clampedX = Math.cos(angle) * radius;
      const clampedY = Math.sin(angle) * radius;
      setKnobPos({ x: clampedX, y: clampedY });
      onMove({ x: clampedX / radius, y: -clampedY / radius });
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-32 h-32 rounded-full bg-stone-900/40 border-2 border-amber-400/40 backdrop-blur-sm flex items-center justify-center select-none touch-none shadow-lg"
    >
      {/* Outer directional indicators */}
      <div className="absolute inset-2 rounded-full border border-stone-500/20" />
      <span className="absolute top-1 text-[10px] text-amber-200/70 font-semibold">W</span>
      <span className="absolute bottom-1 text-[10px] text-amber-200/70 font-semibold">S</span>
      <span className="absolute left-1 text-[10px] text-amber-200/70 font-semibold">A</span>
      <span className="absolute right-1 text-[10px] text-amber-200/70 font-semibold">D</span>

      {/* Center stick */}
      <div
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md border-2 border-amber-200 transition-transform ${
          isActive ? 'scale-105' : 'scale-100'
        }`}
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      />
    </div>
  );
};
