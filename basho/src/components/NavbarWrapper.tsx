"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar on auth routes
  if (pathname.startsWith("/auth")) {
    return null;
  }
  if (pathname.startsWith("/wishlist")) {
    return null;
  }

  return <Navbar />;
}
