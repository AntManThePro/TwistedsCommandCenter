import React, { useState, useEffect, useMemo } from ‘react’;
import { useInventory } from ‘../hooks/useInventory’;

export function Gallery() {
const { artworks } = useInventory();
const [searchTerm, setSearchTerm] = useState(’’);
const [selectedCategory, setSelectedCategory] = useState(‘all’);
const [selectedItem, setSelectedItem] = useState<any>(null);

const availableArtworks = useMemo(
() => artworks.filter((a) => a.status === ‘available’),
[artworks]
);

const categories = useMemo(
() => [‘all’, …new Set(availableArtworks.map((a) => a.category))],
[availableArtworks]
);

const filteredArtwork = useMemo(() => {
let filtered = availableArtworks;

```
if (searchTerm) {
  const lowercaseQuery = searchTerm.toLowerCase();
  filtered = filtered.filter(
    (a) =>
      a.title.toLowerCase().includes(lowercaseQuery) ||
      a.materials?.toLowerCase().includes(lowercaseQuery)
  );
}

if (selectedCategory !== 'all') {
  filtered = filtered.filter((a) => a.category === selectedCategory);
}

return filtered;
```

}, [availableArtworks, searchTerm, selectedCategory]);

const stats = useMemo(() => {
const total = availableArtworks.length;
const value = availableArtworks.reduce((sum, a) => sum + a.price, 0);
return { total, value };
}, [availableArtworks]);

return (
<div className="w-full h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a0f3a] text-[#00ff87] overflow-hidden flex flex-col">
{/* Header */}
<div className="bg-gradient-to-r from-[#0a0e27] to-[#1a1a3a] via-[#2a0a2a] border-b-2 border-[#ff0080] p-8 flex-shrink-0 shadow-lg shadow-[rgba(255,0,128,0.3)]">
<div className="max-w-7xl mx-auto">
<div className="flex justify-between items-start mb-6">
<div>
<h1 className="text-5xl font-bold text-[#ff0080] text-shadow mb-2">
TWISTED GENIUS
</h1>
<p className="text-[#60efff] text-lg tracking-widest">
Elevated Functional Art Collection
</p>
</div>
<div className="flex gap-8 text-[#60efff] text-right">
<div>
<div className="text-3xl font-bold text-[#00ff87]">
{stats.total}
</div>
<div className="text-sm">Pieces</div>
</div>
<div>
<div className="text-3xl font-bold text-[#ffcc00]">
${stats.value.toFixed(0)}
</div>
<div className="text-sm">Total Value</div>
</div>
</div>
</div>

```
      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="🔍 Search by title, materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-6 py-3 bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] text-[#60efff] rounded-full placeholder-[rgba(96,239,255,0.5)] focus:outline-none focus:shadow-lg focus:shadow-[rgba(96,239,255,0.5)]"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full border-2 font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ffcc00] text-[#0a0e27] border-[#ffcc00] shadow-lg shadow-[rgba(255,204,0,0.5)]'
                  : 'bg-[rgba(255,204,0,0.1)] border-[#ffcc00] text-[#ffcc00] hover:bg-[rgba(255,204,0,0.2)]'
              }`}
            >
              {cat === 'all' ? '◆ All' : cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex flex-1 overflow-hidden">
    {/* Gallery Grid */}
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {filteredArtwork.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-[#60efff] text-xl text-center">
            No pieces match your search. Try different filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtwork.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-[rgba(10,14,39,0.8)] border-2 border-[#00ff87] rounded-lg overflow-hidden cursor-pointer hover:border-[#ff0080] hover:shadow-lg hover:shadow-[rgba(255,0,128,0.5)] hover:-translate-y-2 transition-all group"
              >
                <div className="w-full h-48 bg-gradient-to-br from-[rgba(0,255,135,0.1)] to-[rgba(96,239,255,0.1)] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  ◈
                </div>
                <div className="p-4">
                  <h3 className="text-[#ffcc00] font-bold mb-2 group-hover:text-shadow">
                    {item.title}
                  </h3>
                  <p className="text-[#60efff] text-sm capitalize mb-3">
                    {item.category.replace('-', ' ')}
                  </p>
                  {item.price > 0 && (
                    <p className="text-[#00ff87] text-lg font-bold text-shadow">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Detail Panel */}
    {selectedItem && (
      <div className="w-96 bg-[rgba(10,14,39,0.95)] border-l-2 border-[#00ff87] p-8 overflow-y-auto flex-shrink-0 shadow-lg shadow-[rgba(0,255,135,0.1)]">
        <button
          onClick={() => setSelectedItem(null)}
          className="absolute top-4 right-4 text-[#ff0080] hover:text-[#ffcc00] text-2xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[#ffcc00] mb-6">
          {selectedItem.title}
        </h2>

        {selectedItem.price > 0 && (
          <div className="mb-6 pb-6 border-b border-[rgba(0,255,135,0.2)]">
            <div className="text-[#00ff87] text-sm uppercase font-bold mb-2">
              Price
            </div>
            <div className="text-4xl font-bold text-[#00ff87] text-shadow">
              ${selectedItem.price.toFixed(2)}
            </div>
          </div>
        )}

        <div className="mb-6 pb-6 border-b border-[rgba(0,255,135,0.2)]">
          <div className="text-[#00ff87] text-sm uppercase font-bold mb-2">
            Category
          </div>
          <div className="text-[#60efff] capitalize">
            {selectedItem.category.replace('-', ' ')}
          </div>
        </div>

        {selectedItem.materials && (
          <div className="mb-6 pb-6 border-b border-[rgba(0,255,135,0.2)]">
            <div className="text-[#00ff87] text-sm uppercase font-bold mb-2">
              Materials
            </div>
            <div className="text-[#60efff]">{selectedItem.materials}</div>
          </div>
        )}

        {selectedItem.dimensions && (
          <div className="mb-6 pb-6 border-b border-[rgba(0,255,135,0.2)]">
            <div className="text-[#00ff87] text-sm uppercase font-bold mb-2">
              Dimensions
            </div>
            <div className="text-[#60efff]">{selectedItem.dimensions}</div>
          </div>
        )}

        <div className="mb-8">
          <div className="text-[#00ff87] text-sm uppercase font-bold mb-2">
            Availability
          </div>
          <span className="inline-block px-3 py-1 bg-[#00ff87] text-[#0a0e27] rounded text-sm font-bold">
            ✓ Available
          </span>
        </div>

        <button className="w-full py-3 bg-[#ff0080] text-white font-bold rounded mb-4 hover:shadow-lg hover:shadow-[rgba(255,0,128,0.5)] transition-all">
          📧 INQUIRE ABOUT THIS PIECE
        </button>

        <div className="bg-[rgba(96,239,255,0.1)] border-l-4 border-[#60efff] p-4 rounded text-sm text-[#60efff] leading-relaxed">
          Each piece from Twisted Genius is handcrafted with meticulous
          attention to detail. Inquire for shipping, custom orders, or to
          arrange a private viewing.
        </div>
      </div>
    )}
  </div>
</div>
```

);
}