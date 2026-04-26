"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const CHARS = "01アイウエオカキクケコサシスセソ777RITUAL";
const SIZE = 220;
const FS = 13;
const COLS = Math.floor(SIZE / FS);

export default function MatrixLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    c.font = `${FS}px "SF Mono", monospace`;

    const drops: number[] = Array.from({ length: COLS }, () =>
      Math.floor(Math.random() * -20)
    );

    let tick = 0;
    let raf: number;

    function draw() {
      tick++;
      raf = requestAnimationFrame(draw);
      if (tick % 3 !== 0) return;

      c.fillStyle = "rgba(0,0,0,0.08)";
      c.fillRect(0, 0, SIZE, SIZE);

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * FS;
        if (y < 0) { drops[i]++; continue; }

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const ratio = Math.min(y / SIZE, 1);
        const alpha = ratio < 0.3 ? 0.85 : ratio < 0.65 ? 0.5 : 0.2;
        const r = Math.floor(29 + (82 - 29) * ratio);
        const g = Math.floor(96 + (184 - 96) * ratio);
        const b = Math.floor(48 + (112 - 48) * ratio);
        c.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        c.fillText(char, i * FS, y);

        if (y > SIZE + FS && Math.random() > 0.97) {
          drops[i] = Math.floor(Math.random() * -12);
        }
        drops[i]++;
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="matrixLogoWrap">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="matrixCanvas" />
      <div className="matrixLogoInner">
        <Image src="/logo.jpg" alt="Pledged 777" fill className="matrixLogoImg" priority />
      </div>
    </div>
  );
}
