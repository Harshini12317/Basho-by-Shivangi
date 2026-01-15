'use client';

import { useEffect, useState } from 'react';

interface StaticData {
  _id: string;
  studioLocation: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    googleMapsLink?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    socialMedia: {
      instagram: string;
      facebook: string;
      twitter: string;
    };
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  hsnCode: string;
}

export default function StaticDataPage() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Separate editing states for each section
  const [editingStudio, setEditingStudio] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editingFAQs, setEditingFAQs] = useState(false);
  const [editingHSN, setEditingHSN] = useState(false);

  // Form data for each section
  const [studioForm, setStudioForm] = useState<StaticData['studioLocation']>({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    googleMapsLink: '',
  });
  const [contactForm, setContactForm] = useState<StaticData['contactInfo']>({
    phone: '',
    email: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
  });
  const [faqsForm, setFaqsForm] = useState<StaticData['faqs']>([]);
  const [hsnForm, setHsnForm] = useState<string>('');

  useEffect(() => {
    fetchStaticData();
  }, []);

  const fetchStaticData = async () => {
    try {
      const response = await fetch('/api/admin/static-data');
      if (response.ok) {
        const data = await response.json();
        setStaticData(data);
        // Initialize form data
        setStudioForm(data.studioLocation);
        setContactForm(data.contactInfo);
        setFaqsForm(data.faqs);
        setHsnForm(data.hsnCode || '');
      }
    } catch (error) {
      console.error('Failed to fetch static data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section: 'studioLocation' | 'contactInfo' | 'faqs' | 'hsnCode') => {
    if (!staticData) return;

    setSaving(true);
    try {
      const updateData: Partial<StaticData> = {};


      if (section === 'studioLocation') {
        updateData.studioLocation = studioForm;
      } else if (section === 'contactInfo') {
        updateData.contactInfo = contactForm;
      } else if (section === 'faqs') {
        updateData.faqs = faqsForm;
      } else if (section === 'hsnCode') {
        updateData.hsnCode = hsnForm;
      }

      const response = await fetch('/api/admin/static-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setStaticData(updatedData);
        // Update form data with saved data
        if (section === 'studioLocation') setStudioForm(updatedData.studioLocation);
        if (section === 'contactInfo') setContactForm(updatedData.contactInfo);
        if (section === 'faqs') setFaqsForm(updatedData.faqs);
        if (section === 'hsnCode') setHsnForm(updatedData.hsnCode || '');

        // Exit edit mode
        if (section === 'studioLocation') setEditingStudio(false);
        if (section === 'contactInfo') setEditingContact(false);
        if (section === 'faqs') setEditingFAQs(false);
        if (section === 'hsnCode') setEditingHSN(false);
      }
    } catch (error) {
      console.error('Failed to update static data:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (section: 'studio' | 'contact' | 'faqs' | 'hsn') => {
    if (section === 'studio') setEditingStudio(true);
    if (section === 'contact') setEditingContact(true);
    if (section === 'faqs') setEditingFAQs(true);
    if (section === 'hsn') setEditingHSN(true);
  };

  const cancelEditing = (section: 'studio' | 'contact' | 'faqs' | 'hsn') => {
    if (!staticData) return;

    // Reset form data to current static data
    if (section === 'studio') {
      setStudioForm(staticData.studioLocation);
      setEditingStudio(false);
    }
    if (section === 'contact') {
      setContactForm(staticData.contactInfo);
      setEditingContact(false);
    }
    if (section === 'faqs') {
      setFaqsForm(staticData.faqs);
      setEditingFAQs(false);
    }
    if (section === 'hsn') {
      setHsnForm(staticData.hsnCode || '');
      setEditingHSN(false);
    }
  };

  const addFAQ = () => {
    setFaqsForm(prev => [...prev, { question: '', answer: '' }]);
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqsForm(prev => prev.map((faq, i) =>
      i === index ? { ...faq, [field]: value } : faq
    ));
  };

  const removeFAQ = (index: number) => {
    setFaqsForm(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Static Data Management</h1>
          <p className="mt-2 text-slate-600">Manage studio location, contact information, and FAQs</p>
        </div>
        <a href="/admin" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 whitespace-nowrap">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      <div className="space-y-6">
        {/* Studio Location Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Studio Location</h2>
            {!editingStudio ? (
              <button
                onClick={() => startEditing('studio')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => updateSection('studioLocation')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => cancelEditing('studio')}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!editingStudio ? (
            <div className="space-y-2">
              <p><strong>Address:</strong> {staticData?.studioLocation.address || 'Not set'}</p>
              <p><strong>City:</strong> {staticData?.studioLocation.city || 'Not set'}</p>
              <p><strong>State:</strong> {staticData?.studioLocation.state || 'Not set'}</p>
              <p><strong>ZIP:</strong> {staticData?.studioLocation.zip || 'Not set'}</p>
              <p><strong>Country:</strong> {staticData?.studioLocation.country || 'Not set'}</p>
              <p><strong>Google Maps Link:</strong> {staticData?.studioLocation.googleMapsLink ? (
                <a href={staticData.studioLocation.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  View on Google Maps
                </a>
              ) : 'Not set'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={studioForm.address}
                  onChange={(e) => setStudioForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={studioForm.city}
                    onChange={(e) => setStudioForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={studioForm.state}
                    onChange={(e) => setStudioForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={studioForm.zip}
                    onChange={(e) => setStudioForm(prev => ({ ...prev, zip: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={studioForm.country}
                    onChange={(e) => setStudioForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Link</label>
                <input
                  type="url"
                  value={studioForm.googleMapsLink || ''}
                  onChange={(e) => setStudioForm(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Contact Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Contact Information</h2>
            {!editingContact ? (
              <button
                onClick={() => startEditing('contact')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => updateSection('contactInfo')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => cancelEditing('contact')}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!editingContact ? (
            <div className="space-y-2">
              <p><strong>Phone:</strong> {staticData?.contactInfo.phone || 'Not set'}</p>
              <p><strong>Email:</strong> {staticData?.contactInfo.email || 'Not set'}</p>
              <p><strong>Instagram:</strong> {staticData?.contactInfo.socialMedia?.instagram || 'Not set'}</p>
              <p><strong>Facebook:</strong> {staticData?.contactInfo.socialMedia?.facebook || 'Not set'}</p>
              <p><strong>Twitter:</strong> {staticData?.contactInfo.socialMedia?.twitter || 'Not set'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Social Media</label>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={contactForm.socialMedia.instagram}
                    onChange={(e) => setContactForm(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Facebook</label>
                  <input
                    type="text"
                    value={contactForm.socialMedia.facebook}
                    onChange={(e) => setContactForm(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Twitter</label>
                  <input
                    type="text"
                    value={contactForm.socialMedia.twitter}
                    onChange={(e) => setContactForm(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQs Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
            {!editingFAQs ? (
              <button
                onClick={() => startEditing('faqs')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => updateSection('faqs')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => cancelEditing('faqs')}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!editingFAQs ? (
            <div className="space-y-4">
              {staticData?.faqs && staticData.faqs.length > 0 ? (
                staticData.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0">
                    <h3 className="font-medium text-slate-900">{faq.question}</h3>
                    <p className="text-slate-600 mt-1">{faq.answer}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No FAQs set yet.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {faqsForm.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-slate-700">FAQ {index + 1}</span>
                    <button
                      onClick={() => removeFAQ(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter answer"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addFAQ}
                className="w-full py-2 px-4 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
              >
                + Add FAQ
              </button>
            </div>
          )}
        </div>

        {/* HSN Code Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">HSN Code</h2>
            {!editingHSN ? (
              <button
                onClick={() => startEditing('hsn')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => updateSection('hsnCode')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => cancelEditing('hsn')}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!editingHSN ? (
            <div className="space-y-2">
              <p><strong>HSN Code:</strong> {staticData?.hsnCode || 'Not set'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={hsnForm}
                  onChange={(e) => setHsnForm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter HSN code (e.g., 69010010)"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}