"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function HeroPot() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(y, { stiffness: 120, damping: 20 });
  const rotateY = useSpring(x, { stiffness: 120, damping: 20 });

 
  return (
    <motion.div
      drag
      dragElastic={0.12}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDrag={(e, info) => {
        x.set(info.offset.x);
        y.set(info.offset.y);
      }}
      style={{
       rotateX: rotateX,
        rotateY: rotateY,
        perspective: 1200,
      }}
      className="relative cursor-grab active:cursor-grabbing"
    >
      <Image
        src="/images/pottery-hero.png"
        alt="Basho pottery"
        width={520}
        height={520}
        priority
        className="select-none rounded-xl"
      />
    </motion.div>
  );
}
