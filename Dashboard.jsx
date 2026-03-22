import React, { useMemo } from ‘react’;
import { useInventory } from ‘../hooks/useInventory’;
import { useListings } from ‘../hooks/useListings’;

export function Dashboard() {
const { artworks, getStats, getCategoryBreakdown } = useInventory();
const { listings, getTotalListedValue, getListingCoverage } = useListings();

const stats = getStats();
const categories = getCategoryBreakdown();
const locations = useMemo(() => {
return artworks.reduce((acc, item) => {
acc[item.location] = (acc[item.location] || 0) + 1;
return acc;
}, {} as Record<string, number>);
}, [artworks]);

const listedValue = getTotalListedValue();
const listingCoverage = getListingCoverage(stats.totalPieces);

const recommendations = useMemo(() => {
const recs = [];

```
if (listingCoverage < 50) {
  recs.push(
    `⚠️ Increase Listing Coverage: You have ${
      stats.totalPieces - listings.length
    } unlisted pieces worth $${(stats.totalValue - listedValue).toFixed(0)}. Create listings to maximize visibility.`
  );
}

if (stats.sold > 5) {
  recs.push(
    `✨ Success Pattern Detected: Your ${stats.sold} sold pieces show strong market demand. Consider expanding these categories.`
  );
}

if (stats.conversionRate < 15) {
  recs.push(
    `📊 Pricing Review: Consider adjusting prices if inventory isn't moving fast enough.`
  );
}

recs.push(
  `📱 Mobile Showcase: Use the Gallery to share your collection via social media for maximum reach.`
);

return recs;
```

}, [stats, listings.length, listingCoverage, listedValue]);

const handleExportReport = () => {
const data = {
generated: new Date().toISOString(),
inventory: artworks,
listings: listings,
stats: stats,
categories: categories,
locations: locations,
};

```
const json = JSON.stringify(data, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `twisted-genius-report-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);
```

};

return (
<div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a0f3a] text-[#00ff87]">
{/* Navbar */}
<div className="bg-gradient-to-r from-[#0a0e27] to-[#1a1a3a] border-b-2 border-[#ff0080] p-6 shadow-lg shadow-[rgba(255,0,128,0.3)]">
<div className="max-w-7xl mx-auto flex justify-between items-center">
<h1 className="text-3xl font-bold text-[#ff0080] tracking-wider">
🎨 TWISTED GENIUS DASHBOARD
</h1>
<div className="text-[#60efff] flex items-center gap-2">
<span className="inline-block w-2 h-2 bg-[#00ff87] rounded-full animate-pulse"></span>
System Live • {new Date().toLocaleTimeString()}
</div>
</div>
</div>

```
  <div className="max-w-7xl mx-auto p-8">
    {/* Key Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <MetricCard
        label="Total Pieces"
        value={stats.totalPieces}
        change={`↑ ${stats.available} available`}
        colorClass="border-[#00ff87] text-[#00ff87]"
      />
      <MetricCard
        label="Sold"
        value={stats.sold}
        change={`${stats.conversionRate}% conversion rate`}
        colorClass={
          stats.conversionRate > 20
            ? 'border-[#00ff87] text-[#00ff87]'
            : 'border-[#ff0080] text-[#ff0080]'
        }
      />
      <MetricCard
        label="Total Value"
        value={`$${stats.totalValue.toFixed(0)}`}
        change={`Avg: $${stats.avgPrice.toFixed(0)}/piece`}
        colorClass="border-[#ffcc00] text-[#ffcc00]"
      />
      <MetricCard
        label="Active Listings"
        value={listings.length}
        change={`${listingCoverage}% coverage`}
        colorClass={
          listingCoverage >= 50
            ? 'border-[#00ff87] text-[#00ff87]'
            : 'border-[#ff0080] text-[#ff0080]'
        }
      />
      <MetricCard
        label="Listed Value"
        value={`$${listedValue.toFixed(0)}`}
        change="Ready to sell"
        colorClass="border-[#00ff87] text-[#00ff87]"
      />
      <MetricCard
        label="Storage Locations"
        value={Object.keys(locations).length}
        change="Organized inventory"
        colorClass="border-[#60efff] text-[#60efff]"
      />
    </div>

    {/* Inventory Distribution */}
    <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-8 mb-8 shadow-lg shadow-[rgba(0,255,135,0.2)]">
      <h3 className="text-2xl font-bold text-[#ffcc00] mb-6 pb-4 border-b-2 border-[#ffcc00]">
        📊 INVENTORY DISTRIBUTION
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categories).map(([cat, count]) => (
          <div
            key={cat}
            className="bg-[rgba(96,239,255,0.1)] border-l-4 border-[#00ff87] p-6 rounded"
          >
            <div className="text-[#00ff87] font-bold capitalize mb-3">
              {cat.replace('-', ' ')}
            </div>
            <div className="text-4xl font-bold text-[#ffcc00] mb-2">
              {count}
            </div>
            <div className="text-[#60efff] text-sm">
              {Math.round((count / stats.totalPieces) * 100)}% of collection
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recommendations */}
    <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-8 mb-8 shadow-lg shadow-[rgba(0,255,135,0.2)]">
      <h3 className="text-2xl font-bold text-[#ffcc00] mb-6 pb-4 border-b-2 border-[#ffcc00]">
        💡 RECOMMENDATIONS
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="bg-[rgba(96,239,255,0.05)] border-l-4 border-[#60efff] p-4 rounded text-[#60efff] leading-relaxed"
          >
            {rec}
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-[rgba(10,14,39,0.9)] border-2 border-[#00ff87] rounded-lg p-8 shadow-lg shadow-[rgba(0,255,135,0.2)]">
      <h3 className="text-2xl font-bold text-[#ffcc00] mb-6 pb-4 border-b-2 border-[#ffcc00]">
        🔗 QUICK ACTIONS
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton
          label="📦 Inventory"
          href="/inventory"
        />
        <QuickActionButton
          label="⚡ Create Listings"
          href="/listings"
        />
        <QuickActionButton
          label="🎨 Gallery"
          href="/gallery"
        />
        <button
          onClick={handleExportReport}
          className="px-6 py-4 bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] text-[#60efff] rounded hover:bg-[#60efff] hover:text-[#0a0e27] transition-all font-bold"
        >
          📊 Export Report
        </button>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="bg-[#0a0e27] border-t-2 border-[#ff0080] p-6 text-center text-[#60efff] mt-12">
    TWISTED GENIUS • Elevated Functional Art • Handcrafted Since Day One
  </div>
</div>
```

);
}

interface MetricCardProps {
label: string;
value: string | number;
change: string;
colorClass: string;
}

function MetricCard({ label, value, change, colorClass }: MetricCardProps) {
return (
<div
className={`bg-[rgba(10,14,39,0.9)] border-2 rounded-lg p-6 shadow-lg shadow-[rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 ${colorClass}`}
>
<div className="text-sm uppercase font-bold opacity-80 mb-3">
{label}
</div>
<div className="text-4xl font-bold mb-3">{value}</div>
<div className="text-sm opacity-75">{change}</div>
</div>
);
}

interface QuickActionButtonProps {
label: string;
href: string;
}

function QuickActionButton({ label, href }: QuickActionButtonProps) {
return (
<a
href={href}
className="px-6 py-4 bg-[rgba(96,239,255,0.1)] border-2 border-[#60efff] text-[#60efff] rounded hover:bg-[#60efff] hover:text-[#0a0e27] transition-all font-bold text-center"
>
{label}
</a>
);
}