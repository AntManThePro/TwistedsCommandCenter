import React, { useState, useRef, useEffect } from ‘react’;
import { useInventory, type Artwork } from ‘../hooks/useInventory’;

type TabType = ‘gallery’ | ‘add’ | ‘analytics’;

export function CommandCenter() {
const [activeTab, setActiveTab] = useState<TabType>(‘gallery’);
const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
const [filterStatus, setFilterStatus] = useState<‘all’ | ‘available’ | ‘sold’>(‘all’);
const canvasRef = useRef<HTMLCanvasElement>(null);

const {
artworks,
loading,
addArtwork,
updateStatus,
deleteArtwork,
getStats,
getCategoryBreakdown,
} = useInventory();

const stats = getStats();
const categories = getCategoryBreakdown();

const [formData, setFormData] = useState({
title: ‘’,
category: ‘sculpture’ as const,
location: ‘Storage A’,
price: ‘’,
status: ‘available’ as const,
materials: ‘’,
dimensions: ‘’,
});

// Canvas animation for analytics
useEffect(() => {
if (activeTab !== ‘analytics’ || !canvasRef.current) return;

```
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');
if (!ctx) return;

let animationId: number;
let time = 0;

const animate = () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Background
  ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw particles for each artwork
  artworks.forEach((item, index) => {
    const x =
      (Math.sin(time * 0.001 + index) + 1) * (canvas.width * 0.25) +
      canvas.width * 0.125;
    const y =
      (Math.cos(time * 0.0008 + index * 0.5) + 1) * (canvas.height * 0.25) +
      canvas.height * 0.125;

    // Glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    gradient.addColorStop(
      0,
      item.status === 'sold'
        ? 'rgba(255, 0, 128, 0.4)'
        : 'rgba(0, 255, 135, 0.4)'
    );
    gradient.addColorStop(1, 'rgba(96, 239, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 40, y - 40, 80, 80);

    // Node
    ctx.fillStyle = item.status === 'sold' ? '#ff0080' : '#00ff87';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Pulse
    const pulse = Math.sin(time * 0.005 + index) * 3 + 3;
    ctx.strokeStyle =
      item.status === 'sold'
        ? 'rgba(255, 0, 128, 0.6)'
        : 'rgba(0, 255, 135, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, pulse + 8, 0, Math.PI * 2);
    ctx.stroke();
  });

  time += 1;
  animationId = requestAnimationFrame(animate);
};

animate();
return () => cancelAnimationFrame(animationId);
```

}, [activeTab, artworks]);

const handleAddArtwork = (e: React.FormEvent) => {
e.preventDefault();
if (!formData.title) {
alert(‘Title is required’);
return;
}

```
addArtwork({
  title: formData.title,
  category: formData.category,
  location: formData.location,
  price: parseFloat(formData.price) || 0,
  status: formData.status,
  materials: formData.materials,
  dimensions: formData.dimensions,
});

setFormData({
  title: '',
  category: 'sculpture',
  location: 'Storage A',
  price: '',
  status: 'available',
  materials: '',
  dimensions: '',
});

setActiveTab('gallery');
```

};

const filteredArtwork =
filterStatus === ‘all’
? artworks
: artworks.filter((item) => item.status === filterStatus);

if (loading) {
return (
<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a0f3a] flex items-center justify-center">
<div className="text-[#60efff] text-xl">Loading inventory…</div>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a0f3a] text-[#00ff87]">
{/* Header */}
<div className="border-b-2 border-[#00ff87] bg-gradient-to-r from-[#0a0e27] to-[#1a1a3a] p-6 shadow-lg shadow-[rgba(0,255,135,0.3)]">
<h1 className="text-4xl font-bold text-[#00ff87] text-shadow mb-2">
◈ TWISTED GENIUS COMMAND CENTER ◈
</h1>
<div className="flex gap-8 flex-wrap text-[#60efff] text-sm">
<span>📦 Total: {stats.totalPieces}</span>
<span>✓ Available: {stats.available}</span>
<span>✔ Sold: {stats.sold}</span>
<span>💰 Value: ${stats.totalValue.toFixed(2)}</span>
</div>
</div>

```
  <div className="flex flex-1">
    {/* Sidebar */}
    <aside className="w-64 bg-[#0f1629] border-r-2 border-[#ff0080] p-6 overflow-y-auto">
      <h2 className="text-[#ff0080] font-bold mb-4 pb-2 border-b border-[#ff0080]">
        NAVIGATION
      </h2>
      <div className="space-y-2">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`w-full p-3 rounded border transition-all ${
            activeTab === 'gallery'
              ? 'bg-[#00ff87] text-[#0a0e27] border-[#00ff87]'
              : 'bg-transparent border-[#60efff] text-[#60efff] hover:bg-[rgba(96,239,255,0.2)]'
          }`}
        >
          📸 Gallery
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`w-full p-3 rounded border transition-all ${
            activeTab === 'add'
              ? 'bg-[#00ff87] text-[#0a0e27] border-[#00ff87]'
              : 'bg-transparent border-[#60efff] text-[#60efff] hover:bg-[rgba(96,239,255,0.2)]'
          }`}
        >
          ➕ Add Artwork
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full p-3 rounded border transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#00ff87] text-[#0a0e27] border-[#00ff87]'
              : 'bg-transparent border-[#60efff] text-[#60efff] hover:bg-[rgba(96,239,255,0.2)]'
          }`}
        >
          📊 Analytics
        </button>
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-y-auto p-8">
      {/* GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div>
          <h2 className="text-3xl font-bold text-[#ffcc00] mb-6">
            ◈ YOUR COLLECTION
          </h2>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full border-2 transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#ffcc00] text-[#0a0e27] border-[#ffcc00]'
                  : 'border-[#ffcc00] text-[#ffcc00] hover:bg-[rgba(255,204,0,0.1)]'
              }`}
            >
              All ({artworks.length})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-4 py-2 rounded-full border-2 transition-all ${
                filterStatus === 'available'
                  ? 'bg-[#ffcc00] text-[#0a0e27] border-[#ffcc00]'
                  : 'border-[#ffcc00] text-[#ffcc00] hover:bg-[rgba(255,204,0,0.1)]'
              }`}
            >
              Available ({stats.available})
            </button>
            <button
              onClick={() => setFilterStatus('sold')}
              className={`px-4 py-2 rounded-full border-2 transition-all ${
                filterStatus === 'sold'
                  ? 'bg-[#ffcc00] text-[#0a0e27] border-[#ffcc00]'
                  : 'border-[#ffcc00] text-[#ffcc00] hover:bg-[rgba(255,204,0,0.1)]'
              }`}
            >
              Sold ({stats.sold})
            </button>
          </div>

          {filteredArtwork.length === 0 ? (
            <div className="text-center py-12 text-[#60efff]">
              No pieces match your filter
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtwork.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-[rgba(255,204,0,0.1)] border-2 border-[#ffcc00] rounded-lg p-4 cursor-pointer hover:shadow-lg hover:shadow-[rgba(255,204,0,0.5)] transition-all"
                >
                  <h4 className="text-[#ffcc00] font-bold mb-2">
                    {item.title}
                  </h4>
                  <p className="text-[#60efff] text-sm">{item.category}</p>
                  <p className="text-[#60efff] text-sm">{item.location}</p>
                  {item.price > 0 && (
                    <p className="text-[#ffcc00] font-bold mt-2">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                  <span className="inline-block mt-2 px-2 py-1 bg-[#ff0080] text-white text-xs rounded">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedItem && (
            <div className="mt-8 bg-[rgba(255,204,0,0.1)] border-2 border-[#ffcc00] rounded-lg p-6">
              <h3 className="text-2xl font-bold text-[#ffcc00] mb-4">
                {selectedItem.title}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[#60efff]">Category:</span>{' '}
                  {selectedItem.category}
                </div>
                <div>
                  <span className="text-[#60efff]">Status:</span>{' '}
                  {selectedItem.status}
                </div>
                <div>
                  <span className="text-[#60efff]">Location:</span>{' '}
                  {selectedItem.location}
                </div>
                <div>
                  <span className="text-[#60efff]">Price:</span> $
                  {selectedItem.price.toFixed(2)}
                </div>
                <div>
                  <span className="text-[#60efff]">Materials:</span>{' '}
                  {selectedItem.materials}
                </div>
                <div>
                  <span className="text-[#60efff]">Dimensions:</span>{' '}
                  {selectedItem.dimensions}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateStatus(
                      selectedItem.id,
                      selectedItem.status === 'available' ? 'sold' : 'available'
                    );
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-[#00ff87] text-[#0a0e27] rounded font-bold hover:shadow-lg hover:shadow-[rgba(0,255,135,0.5)]"
                >
                  Mark as {selectedItem.status === 'available' ? 'SOLD' : 'AVAILABLE'}
                </button>
                <button
                  onClick={() => {
                    deleteArtwork(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-[#ff0080] text-white rounded font-bold hover:shadow-lg hover:shadow-[rgba(255,0,128,0.5)]"
                >
                  DELETE
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-[#ff0080] text-white rounded font-bold hover:shadow-lg hover:shadow-[rgba(255,0,128,0.5)]"
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD TAB */}
      {activeTab === 'add' && (
        <div>
          <h2 className="text-3xl font-bold text-[#ffcc00] mb-6">
            ➕ ADD ARTWORK
          </h2>
          <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#ffcc00] rounded-lg p-8 max-w-2xl">
            <form onSubmit={handleAddArtwork} className="space-y-6">
              <div>
                <label className="block text-[#00ff87] font-bold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Abstract Golden Mirror"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#00ff87] font-bold mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                  >
                    <option>sculpture</option>
                    <option>painting</option>
                    <option>mixed-media</option>
                    <option>functional-art</option>
                    <option>installation</option>
                    <option>jewelry</option>
                    <option>heirloom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#00ff87] font-bold mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-2">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Storage A - Shelf 3"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                />
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-2">
                  Materials
                </label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) =>
                    setFormData({ ...formData, materials: e.target.value })
                  }
                  placeholder="Bronze, Resin, Hand-painted"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                />
              </div>

              <div>
                <label className="block text-[#00ff87] font-bold mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensions: e.target.value,
                    })
                  }
                  placeholder="24 x 18 x 8 inches"
                  className="w-full px-4 py-2 bg-[#1a1a3a] border border-[#00ff87] text-[#00ff87] rounded focus:outline-none focus:shadow-lg focus:shadow-[rgba(0,255,135,0.5)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00ff87] text-[#0a0e27] font-bold rounded hover:shadow-lg hover:shadow-[rgba(0,255,135,0.5)] transition-all"
              >
                ADD TO INVENTORY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          <h2 className="text-3xl font-bold text-[#ffcc00] mb-6">
            📊 ANALYTICS
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] rounded-lg p-6 text-center">
              <div className="text-[#ffcc00] text-sm font-bold">Total</div>
              <div className="text-[#00ff87] text-4xl font-bold">
                {stats.totalPieces}
              </div>
            </div>
            <div className="bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] rounded-lg p-6 text-center">
              <div className="text-[#ffcc00] text-sm font-bold">Available</div>
              <div className="text-[#00ff87] text-4xl font-bold">
                {stats.available}
              </div>
            </div>
            <div className="bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] rounded-lg p-6 text-center">
              <div className="text-[#ffcc00] text-sm font-bold">Sold</div>
              <div className="text-[#ff0080] text-4xl font-bold">
                {stats.sold}
              </div>
            </div>
            <div className="bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] rounded-lg p-6 text-center">
              <div className="text-[#ffcc00] text-sm font-bold">Total Value</div>
              <div className="text-[#ffcc00] text-4xl font-bold">
                ${stats.totalValue.toFixed(0)}
              </div>
            </div>
          </div>

          <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-6 mb-8">
            <h3 className="text-[#ffcc00] font-bold text-xl mb-4">
              Live Visualization
            </h3>
            <canvas
              ref={canvasRef}
              className="w-full h-64 bg-[rgba(0,255,135,0.05)] rounded"
            />
          </div>

          {Object.keys(categories).length > 0 && (
            <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-6">
              <h3 className="text-[#ffcc00] font-bold text-xl mb-4">
                Category Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categories).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="bg-[rgba(96,239,255,0.1)] border-l-4 border-[#00ff87] p-4"
                  >
                    <div className="text-[#00ff87] font-bold capitalize mb-2">
                      {cat}
                    </div>
                    <div className="text-[#ffcc00] text-2xl font-bold">
                      {count}
                    </div>
                    <div className="text-[#60efff] text-sm">
                      {Math.round((count / stats.totalPieces) * 100)}% of
                      collection
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  </div>
</div>
```

);
}