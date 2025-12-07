import { geminiService } from '../services/geminiService.js';
import { unsplashService } from '../services/unsplashService.js';

class RecipeDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.recipes = [];
    this.recipeImages = new Map(); // Store loaded images
    this.expandedRecipe = null;
  }

  async displayRecipes(recipes) {
    this.recipes = recipes;
    this.render();

    // Load images asynchronously
    await this.loadRecipeImages();
  }

  async loadRecipeImages() {
    for (let i = 0; i < this.recipes.length; i++) {
      try {
        const image = await unsplashService.searchRecipeImage(this.recipes[i].title);
        this.recipeImages.set(i, image);

        // Track download (Unsplash API requirement)
        if (image.downloadUrl) {
          unsplashService.trackDownload(image.downloadUrl);
        }

        // Update the specific card with the image
        this.updateRecipeCardImage(i, image);
      } catch (error) {
        console.error(`Error loading image for recipe ${i}:`, error);
      }
    }
  }

  updateRecipeCardImage(index, image) {
    const card = this.container.querySelector(`.recipe-card[data-index="${index}"]`);
    if (!card) return;

    const imageContainer = card.querySelector('.recipe-card-image');
    if (imageContainer) {
      imageContainer.innerHTML = `
        <img src="${image.smallUrl}" alt="${image.alt}" loading="lazy" />
        <div class="image-credit">
          Photo by <a href="${image.photographerUrl}?utm_source=leftover-recipe-ai&utm_medium=referral" target="_blank" rel="noopener">${image.photographer}</a> on <a href="https://unsplash.com?utm_source=leftover-recipe-ai&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>
        </div>
      `;
    }
  }

  render() {
    if (this.recipes.length === 0) {
      this.container.innerHTML = '<p class="help-text">レシピがありません</p>';
      return;
    }

    this.container.innerHTML = `
      <div class="recipe-grid">
        ${this.recipes.map((recipe, index) => this.renderRecipeCard(recipe, index)).join('')}
      </div>
    `;

    this.attachEventListeners();
  }

  renderRecipeCard(recipe, index) {
    const isExpanded = this.expandedRecipe === index;
    const image = this.recipeImages.get(index);
    const hasUnsplashKey = unsplashService.hasAccessKey;
    
    return `
      <div class="recipe-card" data-index="${index}">
        ${hasUnsplashKey ? `
          <div class="recipe-card-image">
            ${image ? `
              <img src="${image.smallUrl}" alt="${image.alt}" loading="lazy" />
              <div class="image-credit">
                Photo by <a href="${image.photographerUrl}?utm_source=leftover-recipe-ai&utm_medium=referral" target="_blank" rel="noopener">${image.photographer}</a> on <a href="https://unsplash.com?utm_source=leftover-recipe-ai&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>
              </div>
            ` : `
              <div class="image-placeholder">
                <div class="loading-spinner-small"></div>
                <p>画像を読み込み中...</p>
              </div>
            `}
          </div>
        ` : ''}
        <div class="recipe-card-header">
          <h4 class="recipe-card-title">${recipe.title}</h4>
          <div class="recipe-card-meta">
            <span>⏱️ ${recipe.cookingTime}</span>
            <span>📊 ${recipe.difficulty}</span>
            <span>👥 ${recipe.servings}</span>
          </div>
        </div>
        <div class="recipe-card-content">
          <p>${recipe.description}</p>
        </div>
        <div class="recipe-card-footer">
          <button class="btn btn-secondary btn-small expand-btn" data-index="${index}">
            ${isExpanded ? '閉じる' : '詳細を見る'}
          </button>
        </div>
        
        ${isExpanded ? this.renderRecipeDetail(recipe, index) : ''}
      </div>
    `;
  }

  renderRecipeDetail(recipe, index) {
    return `
      <div class="recipe-detail">
        <div class="recipe-section">
          <h4>🧂 必要な調味料</h4>
          <ul class="recipe-ingredients-list">
            ${recipe.seasonings.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="recipe-section">
          <h4>🥬 材料</h4>
          <ul class="recipe-ingredients-list">
            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>

        <div class="recipe-section">
          <h4>👨‍🍳 作り方</h4>
          <ol class="recipe-steps-list">
            ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>

        ${recipe.nutrition ? `
          <div class="recipe-section">
            <h4>📊 栄養情報</h4>
            <ul class="recipe-ingredients-list">
              <li>カロリー: ${recipe.nutrition.calories}</li>
              <li>タンパク質: ${recipe.nutrition.protein}</li>
              ${recipe.nutrition.notes ? `<li>${recipe.nutrition.notes}</li>` : ''}
            </ul>
          </div>
        ` : ''}

        ${recipe.tips ? `
          <div class="recipe-section">
            <h4>💡 コツ・保存方法</h4>
            <p>${recipe.tips}</p>
          </div>
        ` : ''}

        <div class="refine-section">
          <h4>✨ レシピを修正</h4>
          <div class="refine-buttons">
            <button class="btn btn-small btn-secondary refine-preset-btn" data-index="${index}" data-instruction="もっとヘルシーに">
              🥗 ヘルシーに
            </button>
            <button class="btn btn-small btn-secondary refine-preset-btn" data-index="${index}" data-instruction="子供向けに甘く">
              🍭 子供向けに
            </button>
            <button class="btn btn-small btn-secondary refine-preset-btn" data-index="${index}" data-instruction="辛くする">
              🌶️ 辛くする
            </button>
            <button class="btn btn-small btn-secondary refine-preset-btn" data-index="${index}" data-instruction="時短にする">
              ⚡ 時短にする
            </button>
          </div>
          <div class="refine-custom">
            <input 
              type="text" 
              class="input refine-input" 
              data-index="${index}"
              placeholder="カスタム指示"
            >
            <button class="btn btn-secondary refine-custom-btn" data-index="${index}">
              修正
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Expand/collapse buttons
    this.container.querySelectorAll('.expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.toggleRecipe(index);
      });
    });

    // Preset refine buttons
    this.container.querySelectorAll('.refine-preset-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const index = parseInt(btn.dataset.index);
        const instruction = btn.dataset.instruction;
        await this.refineRecipe(index, instruction);
      });
    });

    // Custom refine buttons
    this.container.querySelectorAll('.refine-custom-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const index = parseInt(btn.dataset.index);
        const input = this.container.querySelector(`.refine-input[data-index="${index}"]`);
        const instruction = input.value.trim();
        
        if (!instruction) {
          alert('修正指示を入力してください');
          return;
        }
        
        await this.refineRecipe(index, instruction);
        input.value = '';
      });
    });

    // Enter key on custom refine input
    this.container.querySelectorAll('.refine-input').forEach(input => {
      input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const index = parseInt(input.dataset.index);
          const instruction = input.value.trim();
          
          if (!instruction) return;
          
          await this.refineRecipe(index, instruction);
          input.value = '';
        }
      });
    });
  }

  toggleRecipe(index) {
    if (this.expandedRecipe === index) {
      this.expandedRecipe = null;
    } else {
      this.expandedRecipe = index;
    }
    this.render();
  }

  async refineRecipe(index, instruction) {
    const recipe = this.recipes[index];
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
      loadingOverlay.classList.remove('hidden');
      loadingOverlay.classList.add('active');
      loadingOverlay.querySelector('#loadingMessage').textContent = `✨ 「${instruction}」でレシピを修正中...`;
      
      const refinedRecipe = await geminiService.refineRecipe(recipe, instruction);
      
      // Update the recipe
      this.recipes[index] = refinedRecipe;
      this.expandedRecipe = index; // Keep it expanded
      this.render();
      
      // Show success message
      this.showToast('✅ レシピを修正しました');
    } catch (error) {
      console.error('Error refining recipe:', error);
      alert('レシピの修正に失敗しました: ' + error.message);
    } finally {
      loadingOverlay.classList.remove('active');
      loadingOverlay.classList.add('hidden');
      loadingOverlay.querySelector('#loadingMessage').textContent = '✨ AIがレシピを考えています...';
    }
  }

  showToast(message) {
    // Simple toast notification (you can enhance this)
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--gradient-primary);
      color: white;
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      animation: slideIn var(--transition-normal);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity var(--transition-normal)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getRecipes() {
    return this.recipes;
  }
}

export { RecipeDisplay };
