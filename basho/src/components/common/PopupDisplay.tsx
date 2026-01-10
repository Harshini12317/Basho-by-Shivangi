"use client";
import React, { useState, useEffect } from 'react';

type PopupItem = {
  _id: string;
  name: string;
  isActive: boolean;
  pages: string[];
  targetSlug?: string;
  image?: string;
  title?: string;
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

  const shouldShowByFrequency = (p: PopupItem) => {
    const key = `popup_${p.name}_seen`;
    if (p.frequency === 'always') return true;
    const last = localStorage.getItem(key);
    if (!last) return true;
    const lastTime = Number(last);
    if (p.frequency === 'once_per_session') return false;
    if (p.frequency === 'once_per_day') {
      const oneDay = 24 * 60 * 60 * 1000;
      return Date.now() - lastTime > oneDay;
    }
    return true;
  };

  const markSeen = (p: PopupItem) => {
    const key = `popup_${p._id}_seen`;
    localStorage.setItem(key, String(Date.now()));
  };

  const withinSchedule = (p: PopupItem) => {
    const now = new Date();
    const startOk = p.startAt ? now >= new Date(p.startAt) : true;
    const endOk = p.endAt ? now <= new Date(p.endAt) : true;
    return startOk && endOk;
  };

  const evaluatePopups = (list: PopupItem[]) => {
    const candidates = list.filter(
      (p) =>
        p.isActive &&
        (p.pages || []).includes(currentPage) &&
        !p.targetSlug &&
        withinSchedule(p)
    );
    const first = candidates[0] || null;
    if (!first) return;
    if (!shouldShowByFrequency(first)) return;
    setPopup(first);
    const showNow = first.triggerType === 'page_load';
    if (showNow) setShowPopup(true);
    if (first.triggerType === 'delay') {
      const ms = first.triggerDelayMs || 0;
      setTimeout(() => setShowPopup(true), ms);
    }
    if (first.triggerType === 'scroll') {
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

  if (!popup || !showPopup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="rounded-3xl bg-white shadow-2xl w-[92%] max-w-md overflow-hidden">
        {popup.image ? <img src={popup.image} alt="" className="w-full h-40 object-cover" /> : null}
        <div className="p-5">
          {popup.title ? <div className="text-lg font-semibold text-slate-900 break-words">{popup.title}</div> : null}
          {popup.description ? <p className="mt-2 text-sm text-slate-700 break-words whitespace-pre-wrap">{popup.description}</p> : null}
          <div className="mt-4 flex items-center gap-3">
            {popup.ctaText && popup.ctaLink ? (
              <a href={popup.ctaLink} className="px-4 py-2 rounded-full bg-[#E76F51] text-white shadow-md hover:bg-[#D35400]">
                {popup.ctaText}
              </a>
            ) : null}
            <button
              onClick={() => {
                setShowPopup(false);
                markSeen(popup);
              }}
              className="px-4 py-2 rounded-full bg-white ring-1 ring-[#E2C48D] text-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
