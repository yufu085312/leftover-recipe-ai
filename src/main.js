import { IngredientForm } from './components/IngredientForm.js';
import { ConstraintsForm } from './components/ConstraintsForm.js';
import { RecipeDisplay } from './components/RecipeDisplay.js';
import { geminiService } from './services/geminiService.js';
import { storage } from './utils/storage.js';

class App {
  constructor() {
    this.ingredientForm = null;
    this.constraintsForm = null;
    this.recipeDisplay = null;
    this.init();
  }

  init() {
    // Initialize components
    this.ingredientForm = new IngredientForm('ingredientForm');
    this.constraintsForm = new ConstraintsForm('constraintsForm');
    this.recipeDisplay = new RecipeDisplay('recipeDisplay');

    // Setup event listeners
    this.setupEventListeners();
    
    // Check for stored API key
    this.checkApiKey();
    
    // Update generate button state
    this.updateGenerateButtonState();
  }

  setupEventListeners() {
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', () => this.generateRecipes());

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn.addEventListener('click', () => this.openSettings());

    // Close modal button
    const closeModalBtn = document.getElementById('closeModalBtn');
    closeModalBtn.addEventListener('click', () => this.closeSettings());

    // Save API key button
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());

    // Close modal on backdrop click
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        this.closeSettings();
      }
    });

    // Listen for ingredient changes
    window.addEventListener('ingredientsChanged', () => {
      this.updateGenerateButtonState();
    });

    // Listen for constraint changes
    window.addEventListener('constraintsChanged', () => {
      // Could add logic here if needed
    });
  }

  checkApiKey() {
    const apiKey = storage.getApiKey();
    if (!apiKey) {
      // Show settings modal if no API key
      setTimeout(() => {
        this.openSettings();
        this.showToast('⚙️ Gemini APIキーを設定してください', 'info');
      }, 1000);
    }
  }

  updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    const ingredients = this.ingredientForm.getIngredients();
    const hasApiKey = geminiService.isReady() || storage.getApiKey();
    
    if (ingredients.length > 0 && hasApiKey) {
      generateBtn.disabled = false;
    } else {
      generateBtn.disabled = true;
    }
  }

  async generateRecipes() {
    const ingredients = this.ingredientForm.getIngredients();
    const constraints = this.constraintsForm.getConstraints();

    if (ingredients.length === 0) {
      alert('食材を1つ以上追加してください');
      return;
    }

    if (!geminiService.isReady()) {
      alert('Gemini APIキーが設定されていません。設定から入力してください。');
      this.openSettings();
      return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    const recipesSection = document.getElementById('recipesSection');

    try {
      loadingOverlay.classList.remove('hidden');
      loadingOverlay.classList.add('active');

      const recipes = await geminiService.generateRecipes(ingredients, constraints);
      
      this.recipeDisplay.displayRecipes(recipes);
      recipesSection.classList.remove('hidden');
      
      // Scroll to recipes
      recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      this.showToast('✅ レシピを生成しました！');
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert('レシピの生成に失敗しました: ' + error.message);
    } finally {
      loadingOverlay.classList.remove('active');
      loadingOverlay.classList.add('hidden');
    }
  }

  openSettings() {
    const modal = document.getElementById('settingsModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    // Load current API key
    const currentKey = storage.getApiKey();
    if (currentKey) {
      apiKeyInput.value = currentKey;
    }
    
    modal.classList.add('active');
  }

  closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
  }

  saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      alert('APIキーを入力してください');
      return;
    }

    // Save to storage
    storage.saveApiKey(apiKey);
    
    // Initialize Gemini service
    const success = geminiService.initialize(apiKey);
    
    if (success) {
      this.showToast('✅ APIキーを保存しました');
      this.closeSettings();
      this.updateGenerateButtonState();
    } else {
      alert('APIキーの初期化に失敗しました');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    const bgGradient = type === 'success' 
      ? 'var(--gradient-primary)' 
      : 'linear-gradient(135deg, hsl(200, 85%, 60%) 0%, hsl(160, 75%, 55%) 100%)';
    
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${bgGradient};
      color: white;
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideIn var(--transition-normal);
      font-family: var(--font-secondary);
      font-weight: 600;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity var(--transition-normal)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
