"use client";
import { usePathname } from 'next/navigation';
import PopupDisplay from '@/components/common/PopupDisplay';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show popups on admin pages
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  let currentPage = 'homepage'; // Default
  if (pathname.startsWith('/workshop')) {
    currentPage = 'workshops';
  } else if (pathname.startsWith('/events')) {
    currentPage = 'events';
  }

  return (
    <>
      {children}
      <PopupDisplay currentPage={currentPage} />
    </>
  );
}
