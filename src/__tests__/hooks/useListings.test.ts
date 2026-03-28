import { renderHook, act } from '@testing-library/react';
import { useListings } from '../../hooks/useListings';

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useListings', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('initializes with empty listings', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});
    expect(result.current.listings).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('creates a listing with generated description', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    let listing: ReturnType<typeof result.current.createListing>;
    act(() => {
      listing = result.current.createListing({
        title: 'Crystal Vase',
        price: 450,
        category: 'sculpture',
        description: 'A beautiful handcrafted vase.',
        materials: 'Crystal',
        dimensions: '12x8 inches',
        tone: 'elegant',
      });
    });

    expect(result.current.listings).toHaveLength(1);
    expect(listing!.title).toBe('Crystal Vase');
    expect(listing!.price).toBe(450);
    expect(listing!.tone).toBe('elegant');
    expect(listing!.generatedDescription).toContain('masterpiece of refined craftsmanship');
    expect(listing!.generatedDescription).toContain('A beautiful handcrafted vase.');
    expect(listing!.generatedDescription).toContain('Crystal');
    expect(listing!.generatedDescription).toContain('12x8 inches');
  });

  it('creates listings with different tones', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    const tones = ['elegant', 'energetic', 'mystical', 'professional'] as const;

    for (const tone of tones) {
      act(() => {
        result.current.createListing({
          title: `${tone} piece`,
          price: 100,
          category: 'painting',
          description: 'Test piece',
          tone,
        });
      });
    }

    expect(result.current.listings).toHaveLength(4);
  });

  it('deletes a listing', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    let listingId: number;
    act(() => {
      const l = result.current.createListing({
        title: 'To Delete',
        price: 100,
        category: 'painting',
        description: '',
        tone: 'professional',
      });
      listingId = l.id;
    });

    expect(result.current.listings).toHaveLength(1);

    act(() => {
      result.current.deleteListing(listingId);
    });

    expect(result.current.listings).toHaveLength(0);
  });

  it('generateSquarespaceHTML escapes XSS content', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    let listing: ReturnType<typeof result.current.createListing>;
    act(() => {
      listing = result.current.createListing({
        title: '<script>alert("xss")</script>',
        price: 100,
        category: 'painting',
        description: '<img src=x onerror=alert(1)>',
        tone: 'elegant',
      });
    });

    const html = result.current.generateSquarespaceHTML(listing!);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('$100.00');
  });

  it('getTotalListedValue sums all listing prices', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    act(() => {
      result.current.createListing({
        title: 'A',
        price: 100,
        category: 'sculpture',
        description: '',
        tone: 'elegant',
      });
      result.current.createListing({
        title: 'B',
        price: 250,
        category: 'painting',
        description: '',
        tone: 'energetic',
      });
    });

    expect(result.current.getTotalListedValue()).toBe(350);
  });

  it('getListingCoverage returns correct percentage', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    act(() => {
      result.current.createListing({
        title: 'One',
        price: 100,
        category: 'sculpture',
        description: '',
        tone: 'elegant',
      });
    });

    expect(result.current.getListingCoverage(4)).toBe(25);
    expect(result.current.getListingCoverage(0)).toBe(0);
  });

  it('persists listings to localStorage', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    act(() => {
      result.current.createListing({
        title: 'Persist',
        price: 500,
        category: 'jewelry',
        description: 'Test',
        tone: 'mystical',
      });
    });

    const stored = JSON.parse(localStorageMock.getItem('twisted-listings') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Persist');
  });

  it('generateDescription uses fallback when no user description provided', async () => {
    const { result } = renderHook(() => useListings());
    await act(async () => {});

    const desc = result.current.generateDescription('Title', '', '', '', 'professional');
    expect(desc).toContain('Handcrafted with meticulous attention to detail');
    expect(desc).toContain('Premium materials');
    expect(desc).toContain('Custom dimensions');
  });
});
