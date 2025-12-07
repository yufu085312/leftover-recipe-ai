// Storage utility for managing localStorage
export const storage = {
  // Keys
  KEYS: {
    INGREDIENTS: 'leftover_ingredients',
    CONSTRAINTS: 'leftover_constraints',
    API_KEY: 'gemini_api_key',
    GEMINI_MODEL: 'gemini_model',
    UNSPLASH_KEY: 'unsplash_api_key',
    FAVORITES: 'favorite_recipes'
  },

  // Get item from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Set item in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Get ingredients
  getIngredients() {
    return this.get(this.KEYS.INGREDIENTS) || [];
  },

  // Save ingredients
  saveIngredients(ingredients) {
    return this.set(this.KEYS.INGREDIENTS, ingredients);
  },

  // Get constraints
  getConstraints() {
    return this.get(this.KEYS.CONSTRAINTS) || {
      cookingTime: 'any',
      difficulty: 'any',
      mealType: 'any',
      spiciness: 'medium'
    };
  },

  // Save constraints
  saveConstraints(constraints) {
    return this.set(this.KEYS.CONSTRAINTS, constraints);
  },

  // Get API key
  getApiKey() {
    return this.get(this.KEYS.API_KEY);
  },

  // Save API key
  saveApiKey(apiKey) {
    return this.set(this.KEYS.API_KEY, apiKey);
  },

  // Get Unsplash API key
  getUnsplashKey() {
    return this.get(this.KEYS.UNSPLASH_KEY);
  },

  // Save Unsplash API key
  saveUnsplashKey(apiKey) {
    return this.set(this.KEYS.UNSPLASH_KEY, apiKey);
  },

  // Get Gemini model
  getGeminiModel() {
    return this.get(this.KEYS.GEMINI_MODEL) || 'gemini-2.5-flash'; // Default to stable model
  },

  // Save Gemini model
  saveGeminiModel(model) {
    return this.set(this.KEYS.GEMINI_MODEL, model);
  },

  // Get favorites
  getFavorites() {
    return this.get(this.KEYS.FAVORITES) || [];
  },

  // Add to favorites
  addFavorite(recipe) {
    const favorites = this.getFavorites();
    favorites.push({ ...recipe, savedAt: new Date().toISOString() });
    return this.set(this.KEYS.FAVORITES, favorites);
  },

  // Remove from favorites
  removeFavorite(recipeTitle) {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(r => r.title !== recipeTitle);
    return this.set(this.KEYS.FAVORITES, filtered);
  }
};
