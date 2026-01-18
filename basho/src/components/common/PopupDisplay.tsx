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
    console.log('🎯 PopupDisplay mounted/updated with currentPage:', currentPage, 'currentSlug:', currentSlug);
  }, [currentPage, currentSlug]);

  const shouldShowByFrequency = (p: PopupItem) => {
    const idKey = `popup_${p._id}_seen`;
    if (p.frequency === 'always') {
      console.log(`"${p.name}" frequency check: always = TRUE`);
      return true;
    }
    if (p.frequency === 'once_per_session') {
      const seen = sessionStorage.getItem(idKey);
      const shouldShow = !seen;
      console.log(`"${p.name}" frequency check: once_per_session, sessionStorage has key: ${!!seen}, shouldShow: ${shouldShow}`);
      return shouldShow;
    }
    if (p.frequency === 'once_per_day') {
      const last = localStorage.getItem(idKey);
      if (!last) {
        console.log(`"${p.name}" frequency check: once_per_day, no localStorage entry = TRUE`);
        return true;
      }
      const oneDay = 24 * 60 * 60 * 1000;
      const shouldShow = Date.now() - Number(last) > oneDay;
      console.log(`"${p.name}" frequency check: once_per_day, last shown: ${new Date(Number(last)).toLocaleString()}, shouldShow: ${shouldShow}`);
      return shouldShow;
    }
    console.log(`"${p.name}" frequency check: unknown frequency = TRUE`);
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
    if (p.startAt || p.endAt) {
      console.log(`"${p.name}" schedule check:`, {
        now: now.toLocaleString(),
        startAt: p.startAt ? new Date(p.startAt).toLocaleString() : 'Not set',
        startOk,
        endAt: p.endAt ? new Date(p.endAt).toLocaleString() : 'Not set',
        endOk,
        withinSchedule: startOk && endOk
      });
    }
    return startOk && endOk;
  };

  useEffect(() => {
    // Reset image index when popup changes, but do it in a callback
    const timer = setTimeout(() => {
      setImgIndex(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [popup, showPopup]);

  const evaluatePopups = (list: PopupItem[]) => {
    console.log('🔍 Evaluating', list.length, 'popups for page:', currentPage);
    console.log('📋 Full popup list:', list.map(p => ({ name: p.name, pages: p.pages })));
    
    const candidates = list.filter((p) => {
      const isActive = p.isActive;
      const withinTime = withinSchedule(p);
      const includesPage = (p.pages || []).includes(currentPage);
      
      // Slug check: 
      // - If popup has no targetSlug, show on all pages
      // - If popup has targetSlug, only show on workshops page and only if it matches
      const passesSlugCheck = !p.targetSlug || (currentPage === 'workshops' && p.targetSlug === currentSlug);
      
      console.log(`Popup "${p.name}":`, { isActive, withinTime, includesPage, passesSlugCheck, pages: p.pages, currentPage, targetSlug: p.targetSlug, currentSlug });
      
      if (!isActive) {
        console.log(`  ❌ Not active`);
        return false;
      }
      if (!withinTime) {
        console.log(`  ❌ Outside schedule`);
        return false;
      }
      if (!includesPage) {
        console.log(`  ❌ Page not in popup.pages. Pages array: [${p.pages}], CurrentPage: ${currentPage}`);
        return false;
      }
      if (!passesSlugCheck) {
        console.log(`  ❌ Slug check failed`);
        return false;
      }
      console.log(`  ✅ All checks passed!`);
      return true;
    });
    
    console.log('✅ Candidate popups after filtering:', candidates.length);
    console.log('📝 Candidate popup names:', candidates.map(c => c.name));
    
    const showable = candidates.find((p) => {
      const shouldShow = shouldShowByFrequency(p);
      console.log(`Frequency check for "${p.name}":`, shouldShow, `(frequency: ${p.frequency})`);
      return shouldShow;
    }) || null;
    console.log('Showable popup:', showable?.name || 'None');
    
    if (!showable) return;
    setPopup(showable);
    const showNow = showable.triggerType === 'page_load';
    console.log(`Trigger type for "${showable.name}":`, showable.triggerType, 'Show immediately:', showNow);
    if (showNow) setShowPopup(true);
    if (showable.triggerType === 'delay') {
      const ms = showable.triggerDelayMs || 0;
      console.log(`Showing popup after delay: ${ms}ms`);
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
          console.log('Fetched popups:', data);
          console.log('Current page:', currentPage);
          if (Array.isArray(data)) {
            console.log('Evaluating popups for page:', currentPage);
            evaluatePopups(data);
          }
        } else {
          console.error('Failed to fetch popups:', res.status);
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
      <div className="relative rounded-[22px] bg-white w-[92vw] sm:w-[80vw] md:w-[62vw] max-w-3xl overflow-hidden" style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.25), 0 40px 100px rgba(0,0,0,0.35)', animation: 'popup .35s ease' }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPopup(false);
            setTimeout(() => {
              if (popup) markSeen(popup);
            }, 0);
          }}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-lg ring-2 ring-[#E2C48D] flex items-center justify-center text-[#6A2424] transition hover:scale-105 z-20"
          aria-label="Close"
        >
          <span className="text-2xl leading-none transition-transform hover:rotate-90">×</span>
        </button>
        {currentImg ? (
          <div className="group relative w-full h-[46vh] sm:h-[54vh] md:h-[60vh] px-4 sm:px-6 pt-6">
            <div className="relative w-full h-full rounded-xl overflow-hidden ring-1 ring-[#E2C48D]/50 shadow-md bg-white">
              <img src={currentImg} alt="" className="w-full h-full object-contain transition-transform duration-400 ease-out hover:scale-[1.02] animate-[imgfade_.4s_ease]" />
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 60%)' }} />
            </div>
            <div className="absolute bottom-4 right-8 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur-sm">
              {imgIndex + 1} / {images.length}
            </div>
            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 sm:px-3 md:px-4">
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
