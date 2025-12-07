// Unsplash API Service for fetching food images
import { storage } from '../utils/storage.js';

class UnsplashService {
  constructor() {
    this.apiUrl = 'https://api.unsplash.com';
    
    // Load access key from storage
    this.loadAccessKey();
  }

  // Load access key from storage
  loadAccessKey() {
    this.accessKey = storage.getUnsplashKey();
  }

  // Set custom access key
  setAccessKey(apiKey) {
    this.accessKey = apiKey;
    storage.saveUnsplashKey(apiKey);
  }

  // Check if access key is available
  get hasAccessKey() {
    return !!this.accessKey;
  }

  // Search for food images based on recipe title
  async searchRecipeImage(recipeTitle) {
    if (!this.hasAccessKey) {
      return null;
    }

    try {
      // Clean recipe title for better search results
      const searchQuery = this.cleanRecipeTitle(recipeTitle);
      
      // Build URL with search params
      const params = new URLSearchParams({
        query: searchQuery,
        per_page: '1',
        orientation: 'landscape',
        content_filter: 'high',
        client_id: this.accessKey
      });
      
      const response = await fetch(
        `${this.apiUrl}/search/photos?${params.toString()}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return {
          smallUrl: photo.urls.small,
          regularUrl: photo.urls.regular,
          alt: photo.alt_description || recipeTitle,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          downloadUrl: photo.links.download_location
        };
      }
      
      // Return null if no results
      return null;
    } catch (error) {
      console.error('Error fetching Unsplash image:', error);
      return null;
    }
  }

  // Clean recipe title for better search results
  cleanRecipeTitle(title) {
    // Remove common cooking terms and focus on main ingredients
    const cleanedTitle = title
      .replace(/の?レシピ/g, '')
      .replace(/簡単な?/g, '')
      .replace(/美味しい/g, '')
      .replace(/作り方/g, '')
      .trim();
    
    // Add "food" or "dish" to improve results
    return `${cleanedTitle} food dish`;
  }

  // Get fallback image when search fails
  getFallbackImage(recipeTitle) {
    return {
      smallUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      regularUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      alt: recipeTitle,
      photographer: 'Alyson McPhee',
      photographerUrl: 'https://unsplash.com/@alyson_jane',
      downloadUrl: null
    };
  }

  // Track photo download (required by Unsplash API guidelines)
  async trackDownload(downloadUrl) {
    if (!downloadUrl) return;
    
    try {
      await fetch(downloadUrl, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`
        }
      });
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  }
}

export const unsplashService = new UnsplashService();
