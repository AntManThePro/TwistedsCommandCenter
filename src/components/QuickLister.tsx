import React, { useState, memo } from 'react';
import { useListings } from '../hooks/useListings';
import type { ListingTone } from '../hooks/useListings';

const QuickLister = memo(function QuickLister() {
  const { createListing, listings, generateSquarespaceHTML } = useListings();
  const [selectedTone, setSelectedTone] = useState<ListingTone>('elegant');
  const [preview, setPreview] = useState<ReturnType<typeof createListing> | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'sculpture',
    description: '',
    materials: '',
    dimensions: '',
  });

  const handleGenerateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.price) {
      alert('Title and price are required');
      return;
    }

    const listing = createListing({
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description.trim(),
      materials: formData.materials.trim(),
      dimensions: formData.dimensions.trim(),
      tone: selectedTone,
    });

    setPreview(listing);

    setFormData({
      title: '',
      price: '',
      category: 'sculpture',
      description: '',
      materials: '',
      dimensions: '',
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a0f3a] text-[#00ff87] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#0a0e27] to-[#1a1a3a] border-2 border-[#ff0080] rounded-lg p-8 mb-8 shadow-lg shadow-[rgba(255,0,128,0.3)]">
          <h1 className="text-4xl font-bold text-[#ff0080] mb-2">⚡ QUICK SALE LISTER</h1>
          <p className="text-[#60efff]">
            Turn inventory into shop-ready listings instantly. Professional descriptions. Shareable
            formats.
          </p>
        </div>

        {copied && (
          <div className="fixed top-6 right-6 bg-[#00ff87] text-[#0a0e27] px-6 py-3 rounded font-bold animate-pulse z-50">
            ✓ Copied to clipboard!
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-8 shadow-lg shadow-[rgba(0,255,135,0.2)]">
            <h2 className="text-2xl font-bold text-[#ffcc00] mb-6 pb-4 border-b border-[#ffcc00]">
              📝 CREATE LISTING
            </h2>

            <form onSubmit={handleGenerateListing} className="space-y-6">
              <div>
                <label className="block text-[#00ff87] font-bold mb-2">Title *</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Crystalline Vessel"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00ff87] font-bold mb-2">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                  />
                </div>
                <div>
                  <label className="block text-[#00ff87] font-bold mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none"
                  >
                    <option value="sculpture">sculpture</option>
                    <option value="painting">painting</option>
                    <option value="mixed-media">mixed-media</option>
                    <option value="functional-art">functional-art</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  maxLength={500}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Your personal notes about this piece..."
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-2">Materials</label>
                <input
                  type="text"
                  maxLength={200}
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="Bronze, Hand-painted, Epoxy Resin"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-2">Dimensions</label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g., 18 x 24 x 8 inches"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-3">Listing Tone</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['elegant', 'energetic', 'mystical', 'professional'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setSelectedTone(tone)}
                      className={`py-2 rounded border-2 font-bold transition-all ${
                        selectedTone === tone
                          ? 'bg-[#60efff] text-[#0a0e27] border-[#60efff] shadow-lg shadow-[rgba(96,239,255,0.5)]'
                          : 'bg-transparent border-[#60efff] text-[#60efff] hover:bg-[rgba(96,239,255,0.1)]'
                      }`}
                    >
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00ff87] text-[#0a0e27] font-bold rounded hover:shadow-lg hover:shadow-[rgba(0,255,135,0.5)] transition-all"
              >
                GENERATE LISTING
              </button>
            </form>
          </div>

          <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-8 shadow-lg shadow-[rgba(0,255,135,0.2)]">
            <h2 className="text-2xl font-bold text-[#ffcc00] mb-6 pb-4 border-b border-[#ffcc00]">
              👁️ LIVE PREVIEW
            </h2>

            {preview ? (
              <div>
                <div className="bg-[rgba(255,204,0,0.05)] border-2 border-[#ffcc00] rounded-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold text-[#ffcc00] mb-2">{preview.title}</h3>
                  <p className="text-3xl font-bold text-[#00ff87] mb-4">
                    ${preview.price.toFixed(2)}
                  </p>
                  <p className="text-[#60efff] leading-relaxed mb-4 whitespace-pre-line">
                    {preview.generatedDescription}
                  </p>
                  <div className="text-sm text-[#60efff]">
                    <p>{preview.category}</p>
                    <p>{preview.tone} tone</p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(preview.generatedDescription)}
                  className="w-full py-2 mb-4 bg-[#60efff] text-[#0a0e27] font-bold rounded hover:shadow-lg hover:shadow-[rgba(96,239,255,0.5)]"
                >
                  📋 Copy Description
                </button>

                <h4 className="text-[#ffcc00] font-bold mb-3">HTML for Squarespace</h4>
                <div className="bg-[#0a0e27] border border-[#00ff87] p-4 rounded mb-4 overflow-x-auto text-xs">
                  <code className="text-[#60efff]">{generateSquarespaceHTML(preview)}</code>
                </div>

                <button
                  onClick={() => handleCopy(generateSquarespaceHTML(preview))}
                  className="w-full py-2 bg-[#60efff] text-[#0a0e27] font-bold rounded hover:shadow-lg hover:shadow-[rgba(96,239,255,0.5)]"
                >
                  📋 Copy HTML
                </button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#60efff] text-center">
                Create a listing to see the preview
              </div>
            )}
          </div>
        </div>

        {listings.length > 0 && (
          <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-8 shadow-lg shadow-[rgba(0,255,135,0.2)]">
            <h2 className="text-2xl font-bold text-[#ffcc00] mb-6 pb-4 border-b border-[#ffcc00]">
              📚 RECENT LISTINGS ({listings.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => setPreview(listing)}
                  className="bg-[rgba(255,204,0,0.05)] border border-[#ffcc00] rounded-lg p-4 cursor-pointer hover:shadow-lg hover:shadow-[rgba(255,204,0,0.3)] transition-all"
                >
                  <h4 className="text-[#ffcc00] font-bold mb-2">{listing.title}</h4>
                  <p className="text-[#00ff87] font-bold">${listing.price.toFixed(2)}</p>
                  <p className="text-[#60efff] text-sm">
                    {listing.category} • {listing.tone} tone
                  </p>
                  <p className="text-[#60efff] text-xs opacity-75">{listing.dateCreated}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default QuickLister;
