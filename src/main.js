import { IngredientForm } from './components/IngredientForm.js';
import { ConstraintsForm } from './components/ConstraintsForm.js';
import { RecipeDisplay } from './components/RecipeDisplay.js';
import { geminiService } from './services/geminiService.js';
import { unsplashService } from './services/unsplashService.js';
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

    // Delete API key button
    const deleteApiKeyBtn = document.getElementById('deleteApiKeyBtn');
    deleteApiKeyBtn.addEventListener('click', () => this.deleteApiKey());

    // Save Unsplash API key button
    const saveUnsplashKeyBtn = document.getElementById('saveUnsplashKeyBtn');
    saveUnsplashKeyBtn.addEventListener('click', () => this.saveUnsplashKey());

    // Delete Unsplash API key button
    const deleteUnsplashKeyBtn = document.getElementById('deleteUnsplashKeyBtn');
    deleteUnsplashKeyBtn.addEventListener('click', () => this.deleteUnsplashKey());

    // Gemini model selection change
    const geminiModelSelect = document.getElementById('geminiModelSelect');
    geminiModelSelect.addEventListener('change', () => {
      const selectedModel = geminiModelSelect.value;
      storage.saveGeminiModel(selectedModel);
      this.showToast(`✅ モデルを ${selectedModel} に変更しました`);
    });

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

    // Setup instruction toggles
    this.setupInstructionToggles();
  }

  setupInstructionToggles() {
    const toggleButtons = document.querySelectorAll('.instruction-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const content = document.getElementById(targetId);

        // Toggle active class
        button.classList.toggle('active');

        // Toggle content display
        if (content.style.display === 'none') {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      });
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
    const statusText = document.getElementById('generateBtnStatus');
    const ingredients = this.ingredientForm.getIngredients();
    const hasApiKey = geminiService.isReady() || storage.getApiKey();
    const hasUnsplashKey = storage.getUnsplashKey();
    
    // Reset
    generateBtn.disabled = true;
    statusText.innerHTML = '';

    // Check conditions
    if (!hasApiKey) {
      statusText.innerHTML = '⚙️ <strong>Gemini APIキーを設定してください</strong> → 右上の設定ボタンから';
      statusText.style.color = 'var(--color-secondary)';
      return;
    }

    if (ingredients.length === 0) {
      statusText.innerHTML = '� <strong>食材を追加してください</strong>';
      statusText.style.color = 'var(--color-text-muted)';
      return;
    }

    // All conditions met - enable button
    generateBtn.disabled = false;
    statusText.innerHTML = '✅ <strong>準備完了！</strong> ボタンをクリックしてレシピを生成';
    statusText.style.color = 'var(--color-primary)';

    // Show Unsplash info if not configured (but don't block)
    if (!hasUnsplashKey) {
      statusText.innerHTML += '<br><br>🖼️ <strong>Unsplash APIキーを設定すると、レシピカードに料理画像を表示できます</strong> → 右上の設定ボタンから';
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
      
      await this.recipeDisplay.displayRecipes(recipes);
      recipesSection.classList.remove('hidden');
      
      // Scroll to recipes
      recipesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      this.showToast('✅ レシピを生成しました！');
    } catch (error) {
      console.error('Error generating recipes:', error);

      // Parse error type and show appropriate message
      const errorMessage = error.message || '';

      if (errorMessage.startsWith('RATE_LIMIT:')) {
        const message = errorMessage.replace('RATE_LIMIT: ', '');
        this.showErrorNotification('⏱️ レート制限エラー', message);
      } else if (errorMessage.startsWith('QUOTA_EXCEEDED:')) {
        const message = errorMessage.replace('QUOTA_EXCEEDED: ', '');
        this.showErrorNotification('📊 利用枠超過エラー', message);
      } else if (errorMessage.startsWith('INVALID_KEY:')) {
        const message = errorMessage.replace('INVALID_KEY: ', '');
        this.showErrorNotification('🔑 APIキーエラー', message);
      } else {
        this.showErrorNotification('❌ エラー', errorMessage);
      }
    } finally {
      loadingOverlay.classList.remove('active');
      loadingOverlay.classList.add('hidden');
    }
  }

  openSettings() {
    const modal = document.getElementById('settingsModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const unsplashKeyInput = document.getElementById('unsplashKeyInput');
    const geminiModelSelect = document.getElementById('geminiModelSelect');
    
    // Load current Gemini API key
    const currentKey = storage.getApiKey();
    if (currentKey) {
      apiKeyInput.value = currentKey;
    }
    
    // Load current Gemini model
    const currentModel = storage.getGeminiModel();
    geminiModelSelect.value = currentModel;

    // Load current Unsplash API key
    const currentUnsplashKey = storage.getUnsplashKey();
    if (currentUnsplashKey) {
      unsplashKeyInput.value = currentUnsplashKey;
    } else {
      unsplashKeyInput.placeholder = 'デモキー使用中（独自キーで制限を拡大可能）';
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

  deleteApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');

    // Confirm deletion
    if (!confirm('APIキーを削除してもよろしいですか？\n\n削除後は再度設定する必要があります。')) {
      return;
    }

    // Remove from storage
    storage.remove(storage.KEYS.API_KEY);

    // Clear input field
    apiKeyInput.value = '';

    // Reset Gemini service
    geminiService.client = null;

    // Update UI
    this.showToast('🗑️ APIキーを削除しました', 'info');
    this.updateGenerateButtonState();
  }

  saveUnsplashKey() {
    const unsplashKeyInput = document.getElementById('unsplashKeyInput');
    const apiKey = unsplashKeyInput.value.trim();

    if (!apiKey) {
      alert('Unsplash APIキーを入力してください');
      return;
    }

    // Save to storage and update service
    unsplashService.setAccessKey(apiKey);

    this.showToast('✅ Unsplash APIキーを保存しました');
  }

  deleteUnsplashKey() {
    const unsplashKeyInput = document.getElementById('unsplashKeyInput');

    if (!confirm('Unsplash APIキーを削除してデモキーに戻しますか？')) {
      return;
    }

    // Remove from storage
    storage.remove(storage.KEYS.UNSPLASH_KEY);

    // Clear input field
    unsplashKeyInput.value = '';

    // Reset to demo key
    unsplashService.loadAccessKey();

    this.showToast('🗑️ Unsplash APIキーを削除しました（デモキーを使用）', 'info');
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

  showErrorNotification(title, message) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="font-weight: 700; font-size: var(--font-size-lg); margin-bottom: var(--space-xs);">${title}</div>
      <div style="font-size: var(--font-size-sm); line-height: 1.5;">${message}</div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, hsl(10, 85%, 60%) 0%, hsl(0, 75%, 55%) 100%);
      color: white;
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn var(--transition-normal);
      font-family: var(--font-secondary);
      border: 2px solid rgba(255, 255, 255, 0.3);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity var(--transition-normal)';
      setTimeout(() => notification.remove(), 300);
    }, 6000); // Show error longer (6 seconds)
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
