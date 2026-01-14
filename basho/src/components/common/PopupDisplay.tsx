"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type PopupItem = {
  _id: string;
  name: string;
  isActive: boolean;
  pages: string[];
  targetSlug?: string;
  image?: string;
  images?: string[];
  title?: string;
  subtitle?: string;
  tags?: string[];
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  triggerType?: 'page_load' | 'delay' | 'scroll';
  triggerDelayMs?: number;
  frequency?: 'once_per_session' | 'once_per_day' | 'always';
  startAt?: string;
  endAt?: string;
};

export default function PopupDisplay({ currentPage }: { currentPage: string }) {
  const [popup, setPopup] = useState<PopupItem | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const pathname = usePathname();
  const slugMatch = pathname.match(/^\/workshop\/([^/?#]+)/);
  const currentSlug = slugMatch?.[1] || null;
  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => {
    setImgIndex(0);
  }, [popup, showPopup]);

  const shouldShowByFrequency = (p: PopupItem) => {
    const idKey = `popup_${p._id}_seen`;
    if (p.frequency === 'always') return true;
    if (p.frequency === 'once_per_session') {
      const seen = sessionStorage.getItem(idKey);
      return !seen;
    }
    if (p.frequency === 'once_per_day') {
      const last = localStorage.getItem(idKey);
      if (!last) return true;
      const oneDay = 24 * 60 * 60 * 1000;
      return Date.now() - Number(last) > oneDay;
    }
    return true;
  };

  const markSeen = (p: PopupItem) => {
    const idKey = `popup_${p._id}_seen`;
    if (p.frequency === 'once_per_session') {
      sessionStorage.setItem(idKey, '1');
    } else if (p.frequency === 'once_per_day') {
      localStorage.setItem(idKey, String(Date.now()));
    } else {
      localStorage.setItem(idKey, String(Date.now()));
    }
  };

  const withinSchedule = (p: PopupItem) => {
    const now = new Date();
    const startOk = p.startAt ? now >= new Date(p.startAt) : true;
    const endOk = p.endAt ? now <= new Date(p.endAt) : true;
    return startOk && endOk;
  };

  const evaluatePopups = (list: PopupItem[]) => {
    const candidates = list.filter((p) => {
      if (!p.isActive) return false;
      if (!withinSchedule(p)) return false;
      const includesPage = (p.pages || []).includes(currentPage);
      if (!includesPage) return false;
      if (currentPage === 'workshops' && currentSlug) {
        return p.targetSlug ? p.targetSlug === currentSlug : true;
      }
      return !p.targetSlug;
    });
    const showable = candidates.find((p) => shouldShowByFrequency(p)) || null;
    if (!showable) return;
    setPopup(showable);
    const showNow = showable.triggerType === 'page_load';
    if (showNow) setShowPopup(true);
    if (showable.triggerType === 'delay') {
      const ms = showable.triggerDelayMs || 0;
      setTimeout(() => setShowPopup(true), ms);
    }
    if (showable.triggerType === 'scroll') {
      const onScroll = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= 40) {
          setShowPopup(true);
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll);
    }
  };

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch('/api/popups');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) evaluatePopups(data);
        }
      } catch (error) {
        console.error('Error fetching popups:', error);
      }
    };
    fetchPopups();
  }, [currentPage]);

  useEffect(() => {
    const imgs = [
      ...(popup?.image ? [popup.image] : []),
      ...((popup?.images && popup.images.length > 0) ? popup.images : [])
    ];
    const unique = Array.from(new Set(imgs));
    if (!showPopup || unique.length <= 1) return;
  }, [showPopup, popup]);

  useEffect(() => {
    const imgs = [
      ...(popup?.image ? [popup.image] : []),
      ...((popup?.images && popup.images.length > 0) ? popup.images : [])
    ];
    const unique = Array.from(new Set(imgs));
    if (!showPopup || unique.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setImgIndex((idx) => (idx - 1 + unique.length) % unique.length);
      } else if (e.key === 'ArrowRight') {
        setImgIndex((idx) => (idx + 1) % unique.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPopup, popup]);

  if (!popup || !showPopup) return null;

  const resolveSrc = (src: string | undefined | null) => {
    if (!src) return '';
    const s = String(src);
    if (s.startsWith('http') || s.startsWith('data:') || s.startsWith('/')) return s;
    return `/images/${s}`;
  };
  const combined = [
    ...(popup.image ? [popup.image] : []),
    ...((popup.images && popup.images.length > 0) ? popup.images : [])
  ];
  const images = Array.from(new Set(combined));
  const currentImg = images[imgIndex] ? resolveSrc(images[imgIndex]) : null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 animate-[overlayfade_.35s_ease]">
      <div className="relative rounded-[22px] bg-white w-[62vw] max-w-3xl overflow-hidden" style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.25), 0 40px 100px rgba(0,0,0,0.35)', animation: 'popup .35s ease' }}>
        <button
          onClick={() => {
            setShowPopup(false);
            markSeen(popup);
          }}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-lg ring-2 ring-[#E2C48D] flex items-center justify-center text-[#6A2424] transition hover:scale-105 z-20"
          aria-label="Close"
        >
          <span className="text-2xl leading-none transition-transform hover:rotate-90">×</span>
        </button>
        {currentImg ? (
          <div className="group relative w-full h-[46vh] md:h-[58vh] px-6 pt-6">
            <div className="relative w-full h-full rounded-xl overflow-hidden ring-1 ring-[#E2C48D]/50 shadow-md bg-white/5">
              <img src={currentImg} alt="" className="w-full h-full object-cover transition-transform duration-400 ease-out hover:scale-[1.04] animate-[imgfade_.4s_ease]" />
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 60%)' }} />
            </div>
            <div className="absolute bottom-4 right-8 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur-sm">
              {imgIndex + 1} / {images.length}
            </div>
            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                <button
                  onClick={() => setImgIndex((idx) => (idx - 1 + images.length) % images.length)}
                  className="pointer-events-auto w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-lg ring-2 ring-[#E2C48D] text-[#6A2424] flex items-center justify-center transition hover:scale-105 hover:bg-white"
                  aria-label="Previous image"
                >
                  <span className="text-2xl leading-none">‹</span>
                </button>
                <button
                  onClick={() => setImgIndex((idx) => (idx + 1) % images.length)}
                  className="pointer-events-auto w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-lg ring-2 ring-[#E2C48D] text-[#6A2424] flex items-center justify-center transition hover:scale-105 hover:bg-white"
                  aria-label="Next image"
                >
                  <span className="text-2xl leading-none">›</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
        <div className="px-6 pb-6 pt-4 border-t border-slate-200/60 bg-white/95">
          {popup.title ? <div className="text-lg font-semibold text-slate-900 break-words">{popup.title}</div> : null}
          {popup.description ? <p className="mt-2 text-sm text-slate-700 break-words whitespace-pre-wrap">{popup.description}</p> : null}
          <div className="mt-4 flex items-center gap-3">
            {popup.ctaText && popup.ctaLink ? (
              <a href={popup.ctaLink} className="px-4 py-2 rounded-full bg-[#E76F51] text-white shadow-md hover:bg-[#D35400] transition-transform hover:scale-[1.03]">
                {popup.ctaText}
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes popup {
          from { transform: scale(.95) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes overlayfade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes imgfade {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
