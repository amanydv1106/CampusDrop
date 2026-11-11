"use client";

import { useEffect, useRef } from "react";

interface RadarCanvasProps {
  theme: "auto" | "light" | "dark";
  isDiscovering?: boolean;
}

export function RadarCanvas({ theme, isDiscovering = true }: RadarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let ripples: Array<{ radius: number; maxRadius: number; opacity: number; speed: number }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initial ripple circles
    const initRipples = () => {
      const maxDim = Math.max(canvas.width, canvas.height);
      ripples = [
        { radius: 60, maxRadius: maxDim * 0.7, opacity: 0.25, speed: 0.6 },
        { radius: 180, maxRadius: maxDim * 0.7, opacity: 0.2, speed: 0.6 },
        { radius: 300, maxRadius: maxDim * 0.7, opacity: 0.15, speed: 0.6 },
        { radius: 420, maxRadius: maxDim * 0.7, opacity: 0.1, speed: 0.6 }
      ];
    };
    initRipples();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isDiscovering) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const centerX = canvas.width / 2;
      // Position center slightly below middle (around center stage)
      const centerY = canvas.height / 2;

      // Color based on primary color
      const isDark =
        theme === "dark" ||
        (theme === "auto" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

      const strokeColor = isDark ? "66, 133, 244" : "66, 133, 244";

      for (let i = 0; i < ripples.length; i++) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;

        // Fade out as it expands
        const currentOpacity = (1 - ripple.radius / ripple.maxRadius) * ripple.opacity;

        if (ripple.radius >= ripple.maxRadius) {
          ripple.radius = 40;
        }

        if (currentOpacity > 0.005) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${strokeColor}, ${currentOpacity.toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isDiscovering]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
