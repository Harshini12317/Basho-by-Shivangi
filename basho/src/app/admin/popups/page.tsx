'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

type Popup = {
  _id?: string;
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
  triggerType: 'page_load' | 'delay' | 'scroll';
  triggerDelayMs?: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  startAt?: string;
  endAt?: string;
};

const pageOptions = ['homepage', 'workshops'];

export default function AdminPopupsPage() {
  const [items, setItems] = useState<Popup[]>([]);
  const [form, setForm] = useState<Popup>({
    name: '',
    isActive: true,
    pages: [],
    targetSlug: '',
    image: '',
    images: [],
    title: '',
    subtitle: '',
    tags: [],
    description: '',
    ctaText: '',
    ctaLink: '',
    triggerType: 'page_load',
    triggerDelayMs: 0,
    frequency: 'once_per_session',
    startAt: '',
    endAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMore, setUploadingMore] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  useEffect(() => {
    setPreviewIdx(0);
  }, [form.image, form.images]);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const res = await fetch('/api/admin/popups');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching popups:', error);
    }
  };

  const togglePage = (p: string) => {
    setForm((f) => {
      const has = f.pages.includes(p);
      return { ...f, pages: has ? f.pages.filter((x) => x !== p) : [...f.pages, p] };
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.url) setForm((f) => ({ ...f, image: data.url }));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAdditional = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploadingMore(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok && data?.url) {
          urls.push(data.url);
        }
      }
      if (urls.length) {
        setForm((f) => ({ ...f, images: [...(f.images || []), ...urls] }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingMore(false);
    }
  };

  const removeAdditionalImage = (idx: number) => {
    setForm((f) => {
      const arr = [...(f.images || [])];
      arr.splice(idx, 1);
      return { ...f, images: arr };
    });
  };
  const useAdditionalAsMain = (idx: number) => {
    setForm((f) => {
      const arr = [...(f.images || [])];
      const chosen = arr[idx];
      arr.splice(idx, 1);
      return { ...f, image: chosen, images: arr };
    });
  };

  const savePopup = async () => {
    if (!form.name || form.pages.length === 0) return;
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        startAt: form.startAt || undefined,
        endAt: form.endAt || undefined,
      };

      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchPopups();
        setForm({
          name: '',
          isActive: true,
          pages: [],
          targetSlug: '',
          image: '',
          images: [],
          title: '',
          subtitle: '',
          tags: [],
          description: '',
          ctaText: '',
          ctaLink: '',
          triggerType: 'page_load',
          triggerDelayMs: 0,
          frequency: 'once_per_session',
          startAt: '',
          endAt: '',
        });
      }
    } catch (error) {
      console.error('Error saving popup:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateActive = async (id: string, val: boolean) => {
    try {
      const res = await fetch(`/api/admin/popups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: val }),
      });
      if (res.ok) {
        await fetchPopups();
      }
    } catch (error) {
      console.error('Error updating popup:', error);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;
    try {
      const res = await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPopups();
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
    }
  };
  const resetSeen = (p: Popup) => {
    try {
      const keyById = p._id ? `popup_${p._id}_seen` : null;
      const keyByName = p.name ? `popup_${p.name}_seen` : null;
      if (keyById) {
        sessionStorage.removeItem(keyById);
        localStorage.removeItem(keyById);
      }
      if (keyByName) {
        sessionStorage.removeItem(keyByName);
        localStorage.removeItem(keyByName);
      }
      alert('Popup view history reset. Reload the site page to see it again.');
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Popup Management</h1>
          <p className="text-slate-600">Create and manage popups for your site</p>
        </div>
        <a href="/admin/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Form (70%) */}
        <div className="xl:col-span-2 space-y-10">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              Basic Info
              <span className="text-xs text-gray-400 font-normal">Popup identity</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Name *</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  value={form.isActive ? 'active' : 'draft'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Target Slug</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                  value={form.targetSlug || ''}
                  onChange={(e) => setForm({ ...form, targetSlug: e.target.value })}
                  placeholder="optional"
                />
              </div>
            </div>
          </div>

          {/* Popup Content Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              Popup Content
              <span className="text-xs text-gray-400 font-normal">What visitors see</span>
            </h3>
            
            {/* Image Upload Builder Card */}
            <div className="border rounded-2xl p-4 space-y-4 bg-gradient-to-br from-gray-50 to-white">
              {(() => {
                const imgs = Array.from(new Set([
                  ...(form.image ? [form.image] : []),
                  ...((form.images && form.images.length > 0) ? form.images : [])
                ]));
                return imgs.length ? (
                  <div className="relative">
                    <div className="aspect-video rounded-xl bg-white overflow-hidden border shadow-sm flex items-center justify-center">
                      <img
                        src={imgs[previewIdx]}
                        alt="preview"
                        className="max-h-full max-w-full object-contain"
                        onClick={() => { setZoomSrc(imgs[previewIdx]); setZoomOpen(true); }}
                        style={{ cursor: 'zoom-in' }}
                      />
                    </div>
                    {imgs.length > 1 && (
                      <>
                        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                          <button
                            type="button"
                            onClick={() => setPreviewIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                            className="pointer-events-auto w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition"
                            aria-label="Prev"
                          >
                            <span className="text-lg leading-none">‹</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewIdx((i) => (i + 1) % imgs.length)}
                            className="pointer-events-auto w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition"
                            aria-label="Next"
                          >
                            <span className="text-lg leading-none">›</span>
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-1">
                          {imgs.map((_, i) => (
                            <button
                              key={`dot-${i}`}
                              type="button"
                              onClick={() => setPreviewIdx(i)}
                              className={`w-2 h-2 rounded-full ${i === previewIdx ? 'bg-orange-500' : 'bg-gray-300'}`}
                              aria-label={`Go to image ${i + 1}`}
                            />
                          ))}
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Additional images</div>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {imgs.map((src, i) => (
                            <button
                              type="button"
                              key={`${src}-${i}`}
                              onClick={() => setPreviewIdx(i)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border ${i === previewIdx ? 'ring-2 ring-orange-400' : 'border-gray-200'}`}
                              aria-label="Preview thumbnail"
                            >
                              <img src={src} alt="thumb" className="w-full h-full object-cover rounded-md shadow-sm" />
                            </button>
                          ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center border">
                    <div className="text-gray-400 text-sm">Image preview</div>
                  </div>
                );
              })()}
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                  value={form.image || ''}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Paste image URL..."
                />
                <label className="px-4 py-2 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-50 transition text-sm font-medium cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                  />
                  {uploading ? 'Uploading...' : 'Upload'}
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Additional images (Cloudinary or URLs)</label>
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-50 transition text-sm font-medium cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleUploadAdditional(e.target.files)}
                    />
                    {uploadingMore ? 'Uploading...' : 'Upload more'}
                  </label>
                  <span className="text-xs text-gray-400">You can also paste URLs below</span>
                </div>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none min-h-[100px] resize-y"
                  placeholder="https://.../img1.jpg\nhttps://.../img2.jpg"
                  value={(form.images || []).join('\n')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      images: e.target.value
                        .split(/(?:\r?\n|\\n|,)+/g)
                        .map(s => s.trim())
                        .filter(Boolean)
                    })
                  }
                />
                {(form.images || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {form.images!.slice(0,3).map((src, i) => (
                      <img key={i} src={src} alt="preview" className="w-full h-20 object-cover rounded-lg border shadow-sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Title</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Subtitle</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                  value={form.subtitle || ''}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Short subtitle or category"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">CTA Text</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                  value={form.ctaText || ''}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none min-h-[120px] resize-none"
                rows={3}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Tags</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                value={(form.tags || []).join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean)
                  })
                }
                placeholder="Art, Workshop, Handmade"
              />
              {(form.tags || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.tags!.map((t, i) => (
                    <span key={`${t}-${i}`} className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs border border-orange-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">CTA Link</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-gray-400 outline-none"
                value={form.ctaLink || ''}
                onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
              />
            </div>
          </div>

          {/* Pages Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              Pages
              <span className="text-xs text-gray-400 font-normal">Where popup appears</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {pageOptions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePage(p)}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition ${
                    form.pages.includes(p) 
                      ? 'bg-orange-500/10 text-orange-600 border border-orange-300' 
                      : 'border border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'
                  }`}
                >
                  {form.pages.includes(p) && '✓ '}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Behavior & Schedule Card */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              Behavior & Schedule
              <span className="text-xs text-gray-400 font-normal">When popup shows</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border rounded-2xl p-5">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Trigger</label>
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  value={form.triggerType}
                  onChange={(e) => setForm({ ...form, triggerType: e.target.value as Popup['triggerType'] })}
                >
                  <option value="page_load">Page Load</option>
                  <option value="delay">Delay</option>
                  <option value="scroll">Scroll</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">When popup appears</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Delay (ms)</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  value={form.triggerDelayMs || 0}
                  onChange={(e) => setForm({ ...form, triggerDelayMs: Number(e.target.value || 0) })}
                />
                <p className="text-xs text-gray-400 mt-1">Milliseconds to wait</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Frequency</label>
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as Popup['frequency'] })}
                >
                  <option value="once_per_session">Once Per Session</option>
                  <option value="once_per_day">Once Per Day</option>
                  <option value="always">Always</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">How often to show</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Start At</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  value={form.startAt || ''}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-500">End At</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition outline-none"
                  value={form.endAt || ''}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview (30%) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Live Preview Card */}
          <div className="bg-white border rounded-2xl shadow-sm p-4 sticky top-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Live Preview</p>
            <div className="rounded-xl border bg-gray-50 p-4">
              {/* Mock Popup Preview */}
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
                {/* Header */}
                <div className="mb-3">
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">{form.title || 'Your Popup Title'}</h4>
                  {form.subtitle && <p className="text-sm text-gray-600">{form.subtitle}</p>}
                  {(form.tags || []).length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      {(form.tags || []).join(' • ')}
                    </div>
                  )}
                </div>
                {(() => {
                  const imgs = Array.from(new Set([
                    ...(form.image ? [form.image] : []),
                    ...((form.images && form.images.length > 0) ? form.images : [])
                  ]));
                return imgs.length ? (
                  <div className="relative w-full h-32 mb-4 overflow-hidden rounded-lg border shadow-sm bg-white flex items-center justify-center">
                    <img
                      src={imgs[previewIdx]}
                      alt="preview"
                      className="max-h-full max-w-full object-contain"
                      onClick={() => { setZoomSrc(imgs[previewIdx]); setZoomOpen(true); }}
                      style={{ cursor: 'zoom-in' }}
                    />
                    {imgs.length > 1 && (
                      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                        <button
                          type="button"
                          onClick={() => setPreviewIdx((i) => (i - 1 + imgs.length) % imgs.length)}
                          className="pointer-events-auto w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition"
                          aria-label="Prev"
                        >
                          <span className="text-lg leading-none">‹</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewIdx((i) => (i + 1) % imgs.length)}
                          className="pointer-events-auto w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition"
                          aria-label="Next"
                        >
                          <span className="text-lg leading-none">›</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : null;
                })()}
                {(() => {
                  const imgs = Array.from(new Set([
                    ...(form.image ? [form.image] : []),
                    ...((form.images && form.images.length > 0) ? form.images : [])
                  ]));
                  return imgs.length > 1 ? (
                    <>
                      <div className="mb-2 flex items-center justify-center gap-1">
                        {imgs.map((_, i) => (
                          <button
                            key={`live-dot-${i}`}
                            type="button"
                            onClick={() => setPreviewIdx(i)}
                            className={`w-2 h-2 rounded-full ${i === previewIdx ? 'bg-orange-500' : 'bg-gray-300'}`}
                            aria-label={`Go to image ${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
                        {imgs.map((src, i) => (
                          <button
                            type="button"
                            key={`live-thumb-${src}-${i}`}
                            onClick={() => setPreviewIdx(i)}
                            className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border ${i === previewIdx ? 'ring-2 ring-orange-400' : 'border-gray-200'}`}
                            aria-label="Preview thumbnail"
                          >
                            <img src={src} alt="thumb" className="w-full h-full object-cover rounded-md shadow-sm" />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null;
                })()}
                <h4 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                  {form.title || 'Your Popup Title'}
                </h4>
                <p className="text-gray-600 text-sm mb-4 break-words whitespace-pre-wrap">
                  {form.description || 'Your popup description will appear here...'}
                </p>
                {form.ctaText && (
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                    {form.ctaText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end mt-8">
        <button
          type="button"
          onClick={savePopup}
          disabled={isSaving}
          className="px-7 py-3 rounded-xl bg-orange-500 text-white font-semibold shadow-lg hover:bg-orange-600 hover:shadow-xl active:scale-[0.97] transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : '➕ Create Popup'}
        </button>
      </div>

      {/* Existing Popups Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Existing Popups</h2>
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Pages</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((x) => (
                <tr key={x._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{x.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(x.pages || []).map((page) => (
                        <span key={page} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          {page}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      x.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {x.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => x._id && updateActive(x._id, !x.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          x.isActive 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        {x.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => resetSeen(x)}
                        className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium transition"
                      >
                        Reset Seen
                      </button>
                      <button
                        onClick={() => x._id && remove(x._id)}
                        className="px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Zoom Overlay */}
      {zoomOpen && zoomSrc && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setZoomOpen(false)}>
          <div className="max-w-5xl max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={zoomSrc} alt="Zoomed" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
