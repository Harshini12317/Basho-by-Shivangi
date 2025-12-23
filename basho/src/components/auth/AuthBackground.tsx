"use client";

import Particles from "@tsparticles/react";

export default function AuthBackground() {
  return (
    <Particles
      className="auth-bg"
      options={{
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          number: {
            value: 18,
          },
          color: {
            value: ["#d6c8b8", "#c2a67e"],
          },
          opacity: {
            value: 0.25,
          },
          size: {
            value: { min: 80, max: 160 },
          },
          move: {
            enable: true,
            speed: 1.2,              // 👈 noticeable movement
            direction: "top-right",  // 👈 drifting motion
            outModes: {
              default: "out",
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
