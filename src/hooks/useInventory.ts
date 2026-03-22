import { useState, useEffect, useCallback } from 'react';

export interface Artwork {
  id: number;
  title: string;
  category: 'sculpture' | 'painting' | 'mixed-media' | 'functional-art' | 'installation' | 'jewelry' | 'heirloom';
  location: string;
  price: number;
  materials: string;
  dimensions: string;
  status: 'available' | 'sold';
  dateAdded: string;
}

export interface InventoryStats {
  totalPieces: number;
  available: number;
  sold: number;
  totalValue: number;
  avgPrice: number;
  conversionRate: number;
}

export interface InventoryCategoryBreakdown {
  [key: string]: number;
}

export interface InventoryLocationBreakdown {
  [key: string]: number;
}

const STORAGE_KEY = 'twisted-artwork';

export function useInventory() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setArtworks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist to localStorage whenever artworks change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
    }
  }, [artworks, loading]);

  const addArtwork = useCallback((artwork: Omit<Artwork, 'id' | 'dateAdded'>) => {
    const newArtwork: Artwork = {
      ...artwork,
      id: Date.now(),
      dateAdded: new Date().toLocaleDateString(),
    };
    setArtworks((prev) => [...prev, newArtwork]);
    return newArtwork;
  }, []);

  const updateArtwork = useCallback((id: number, updates: Partial<Artwork>) => {
    setArtworks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteArtwork = useCallback((id: number) => {
    setArtworks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateStatus = useCallback(
    (id: number, status: 'available' | 'sold') => {
      updateArtwork(id, { status });
    },
    [updateArtwork]
  );

  const getStats = useCallback((): InventoryStats => {
    const total = artworks.length;
    const availableCount = artworks.filter((a) => a.status === 'available').length;
    const soldCount = artworks.filter((a) => a.status === 'sold').length;
    const totalValue = artworks.reduce((sum, a) => sum + a.price, 0);
    const avgPrice = total > 0 ? totalValue / total : 0;
    const conversionRate = total > 0 ? Math.round((soldCount / total) * 100) : 0;

    return {
      totalPieces: total,
      available: availableCount,
      sold: soldCount,
      totalValue,
      avgPrice,
      conversionRate,
    };
  }, [artworks]);

  const getCategoryBreakdown = useCallback((): InventoryCategoryBreakdown => {
    return artworks.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as InventoryCategoryBreakdown);
  }, [artworks]);

  const getLocationBreakdown = useCallback((): InventoryLocationBreakdown => {
    return artworks.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as InventoryLocationBreakdown);
  }, [artworks]);

  const getAvailableArtworks = useCallback(() => {
    return artworks.filter((a) => a.status === 'available');
  }, [artworks]);

  const searchArtworks = useCallback(
    (query: string, category?: string) => {
      let filtered = artworks;

      if (query) {
        const lowercaseQuery = query.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(lowercaseQuery) ||
            a.materials?.toLowerCase().includes(lowercaseQuery)
        );
      }

      if (category && category !== 'all') {
        filtered = filtered.filter((a) => a.category === category);
      }

      return filtered;
    },
    [artworks]
  );

  return {
    artworks,
    loading,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    updateStatus,
    getStats,
    getCategoryBreakdown,
    getLocationBreakdown,
    getAvailableArtworks,
    searchArtworks,
  };
}
