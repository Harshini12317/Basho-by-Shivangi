"use client";

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
    <Link
      href={`/workshop/${workshop.slug}`}
      className="block bg-white rounded-2xl p-3 border border-[#EDD8B4] shadow-sm hover:shadow-md transition-all"
    >
      <div className="overflow-hidden rounded-xl">
        <Image
          src={workshop.image || "/images/img12.png"}
          alt={workshop.title}
          width={520}
          height={320}
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="px-2 pt-3">
        <h3 className="text-slate-900 font-semibold">{workshop.title}</h3>
        {workshop.date && (
          <p className="text-slate-500 text-sm">{new Date(workshop.date).toDateString()}</p>
        )}
        {typeof workshop.price === "number" && (
          <p className="text-slate-600 text-sm">Price: ₹{workshop.price}</p>
        )}
      </div>
    </Link>
  );
}
