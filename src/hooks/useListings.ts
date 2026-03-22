import { useState, useEffect, useCallback } from 'react';

export type ListingTone = 'elegant' | 'energetic' | 'mystical' | 'professional';

export interface Listing {
  id: number;
  title: string;
  price: number;
  category: string;
  generatedDescription: string;
  materials?: string;
  dimensions?: string;
  tone: ListingTone;
  dateCreated: string;
}

export interface ToneTemplate {
  intro: string;
  closer: string;
}

const STORAGE_KEY = 'twisted-listings';

/**
 * Escapes HTML special characters to prevent XSS in generated HTML output.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const TONE_TEMPLATES: Record<ListingTone, ToneTemplate> = {
  elegant: {
    intro: 'Behold a masterpiece of refined craftsmanship.',
    closer: 'This piece speaks to the discerning collector.',
  },
  energetic: {
    intro: 'Introducing a bold creation that commands attention.',
    closer: 'Own a piece that makes a statement.',
  },
  mystical: {
    intro: 'Unveil the magic within this extraordinary creation.',
    closer: 'For those drawn to the mystical and sublime.',
  },
  professional: {
    intro: 'An expertly crafted functional art piece.',
    closer: 'Investment-grade artistry and design.',
  },
};

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setListings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    }
  }, [listings, loading]);

  const generateDescription = useCallback(
    (
      title: string,
      userDescription: string,
      materials: string,
      dimensions: string,
      tone: ListingTone
    ): string => {
      const template = TONE_TEMPLATES[tone];
      return `${template.intro} ${
        userDescription || 'Handcrafted with meticulous attention to detail.'
      }

Materials: ${materials || 'Premium materials'}
Dimensions: ${dimensions || 'Custom dimensions'}

${template.closer}`;
    },
    []
  );

  const createListing = useCallback(
    (data: {
      title: string;
      price: number;
      category: string;
      description: string;
      materials?: string;
      dimensions?: string;
      tone: ListingTone;
    }): Listing => {
      const generatedDescription = generateDescription(
        data.title,
        data.description,
        data.materials || '',
        data.dimensions || '',
        data.tone
      );

      const newListing: Listing = {
        id: Date.now(),
        title: data.title,
        price: data.price,
        category: data.category,
        generatedDescription,
        materials: data.materials,
        dimensions: data.dimensions,
        tone: data.tone,
        dateCreated: new Date().toLocaleDateString(),
      };

      setListings((prev) => [newListing, ...prev]);
      return newListing;
    },
    [generateDescription]
  );

  const deleteListing = useCallback((id: number) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  /**
   * Generates Squarespace-compatible HTML with escaped user content to prevent XSS.
   */
  const generateSquarespaceHTML = useCallback((listing: Listing): string => {
    const safeTitle = escapeHtml(listing.title);
    const safeDesc = escapeHtml(listing.generatedDescription).replace(/\n/g, '<br/>');
    return `<div class="product-listing">
  <h2>${safeTitle}</h2>
  <p class="price"><strong>$${listing.price.toFixed(2)}</strong></p>
  <p>${safeDesc}</p>
</div>`;
  }, []);

  const getTotalListedValue = useCallback((): number => {
    return listings.reduce((sum, l) => sum + l.price, 0);
  }, [listings]);

  const getListingCoverage = useCallback(
    (totalArtworks: number): number => {
      if (totalArtworks === 0) return 0;
      return Math.round((listings.length / totalArtworks) * 100);
    },
    [listings.length]
  );

  return {
    listings,
    loading,
    createListing,
    deleteListing,
    generateDescription,
    generateSquarespaceHTML,
    getTotalListedValue,
    getListingCoverage,
    TONE_TEMPLATES,
  };
}
