"use client";

import "./workshop.css";
import Link from "next/link";
import Image from "next/image";
import React from "react";

type Props = {
  workshop: {
    title: string;
    slug: string;
    image: string;
    date?: string;
    price?: number;
  };
};

export default function WorkshopCard({ workshop }: Props) {
  return (
    <Link href={`/workshop/${workshop.slug}`} className="workshop-card">
      <div className="card-image">
        <Image
          src={workshop.image || "/images/img12.png"}
          alt={workshop.title}
          width={520}
          height={320}
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="card-body">
        <h3>{workshop.title}</h3>
        {workshop.date && <p className="muted">{new Date(workshop.date).toDateString()}</p>}
        {typeof workshop.price === "number" && (
          <p className="muted">Price: ₹{workshop.price}</p>
        )}
      </div>
    </Link>
  );
}
