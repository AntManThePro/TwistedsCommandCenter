import { renderHook, act } from '@testing-library/react';
import { useInventory } from '../../hooks/useInventory';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Ensure unique Date.now() values per call to avoid ID collisions
let counter = 1000000;
const originalDateNow = Date.now;
beforeAll(() => {
  Date.now = () => ++counter;
});
afterAll(() => {
  Date.now = originalDateNow;
});

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useInventory', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('initializes with empty artworks array', async () => {
    const { result } = renderHook(() => useInventory());
    // Wait for loading to complete
    await act(async () => {});
    expect(result.current.artworks).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('adds an artwork', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    act(() => {
      result.current.addArtwork({
        title: 'Test Sculpture',
        category: 'sculpture',
        location: 'Storage A',
        price: 500,
        status: 'available',
        materials: 'Bronze',
        dimensions: '12x8x6 inches',
      });
    });

    expect(result.current.artworks).toHaveLength(1);
    expect(result.current.artworks[0].title).toBe('Test Sculpture');
    expect(result.current.artworks[0].category).toBe('sculpture');
    expect(result.current.artworks[0].price).toBe(500);
    expect(result.current.artworks[0].status).toBe('available');
    expect(result.current.artworks[0].id).toBeDefined();
    expect(result.current.artworks[0].dateAdded).toBeDefined();
  });

  it('deletes an artwork', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    let addedId: number;
    act(() => {
      const artwork = result.current.addArtwork({
        title: 'To Delete',
        category: 'painting',
        location: 'Storage B',
        price: 200,
        status: 'available',
        materials: 'Oil',
        dimensions: '24x18',
      });
      addedId = artwork.id;
    });

    expect(result.current.artworks).toHaveLength(1);

    act(() => {
      result.current.deleteArtwork(addedId);
    });

    expect(result.current.artworks).toHaveLength(0);
  });

  it('updates artwork status', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    let artworkId: number;
    act(() => {
      const artwork = result.current.addArtwork({
        title: 'Status Test',
        category: 'sculpture',
        location: 'Storage A',
        price: 300,
        status: 'available',
        materials: 'Resin',
        dimensions: '10x10',
      });
      artworkId = artwork.id;
    });

    act(() => {
      result.current.updateStatus(artworkId, 'sold');
    });

    expect(result.current.artworks[0].status).toBe('sold');
  });

  it('getStats returns correct statistics', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    let firstId: number;
    // Add artworks and capture IDs to handle potential Date.now() collision
    act(() => {
      const a = result.current.addArtwork({
        title: 'Piece 1',
        category: 'sculpture',
        location: 'Storage A',
        price: 100,
        status: 'available',
        materials: '',
        dimensions: '',
      });
      firstId = a.id;
    });
    act(() => {
      result.current.addArtwork({
        title: 'Piece 2',
        category: 'painting',
        location: 'Storage B',
        price: 200,
        status: 'available',
        materials: '',
        dimensions: '',
      });
    });

    expect(result.current.artworks).toHaveLength(2);

    // Mark first artwork as sold using saved ID
    act(() => {
      result.current.updateStatus(firstId, 'sold');
    });

    const stats = result.current.getStats();
    expect(stats.totalPieces).toBe(2);
    expect(stats.sold).toBe(1);
    expect(stats.available).toBe(1);
    expect(stats.totalValue).toBe(300);
    expect(stats.avgPrice).toBe(150);
    expect(stats.conversionRate).toBe(50);
  });

  it('getCategoryBreakdown returns correct counts', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    act(() => {
      result.current.addArtwork({
        title: 'S1',
        category: 'sculpture',
        location: 'A',
        price: 0,
        status: 'available',
        materials: '',
        dimensions: '',
      });
    });
    act(() => {
      result.current.addArtwork({
        title: 'S2',
        category: 'sculpture',
        location: 'A',
        price: 0,
        status: 'available',
        materials: '',
        dimensions: '',
      });
    });
    act(() => {
      result.current.addArtwork({
        title: 'P1',
        category: 'painting',
        location: 'A',
        price: 0,
        status: 'available',
        materials: '',
        dimensions: '',
      });
    });

    const breakdown = result.current.getCategoryBreakdown();
    expect(breakdown.sculpture).toBe(2);
    expect(breakdown.painting).toBe(1);
  });

  it('persists artworks to localStorage', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    act(() => {
      result.current.addArtwork({
        title: 'Persist Test',
        category: 'jewelry',
        location: 'Vault',
        price: 1000,
        status: 'available',
        materials: 'Gold',
        dimensions: '5x5',
      });
    });

    const stored = JSON.parse(localStorageMock.getItem('twisted-artwork') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Persist Test');
  });

  it('searchArtworks filters by query and category', async () => {
    const { result } = renderHook(() => useInventory());
    await act(async () => {});

    act(() => {
      result.current.addArtwork({
        title: 'Golden Mirror',
        category: 'sculpture',
        location: 'A',
        price: 500,
        status: 'available',
        materials: 'Gold leaf',
        dimensions: '',
      });
    });
    act(() => {
      result.current.addArtwork({
        title: 'Blue Wave',
        category: 'painting',
        location: 'B',
        price: 300,
        status: 'available',
        materials: 'Oil',
        dimensions: '',
      });
    });

    const goldResults = result.current.searchArtworks('gold');
    expect(goldResults).toHaveLength(1);
    expect(goldResults[0].title).toBe('Golden Mirror');

    const sculptureResults = result.current.searchArtworks('', 'sculpture');
    expect(sculptureResults).toHaveLength(1);
    expect(sculptureResults[0].category).toBe('sculpture');
  });
});
