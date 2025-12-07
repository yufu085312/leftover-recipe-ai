import { storage } from '../utils/storage.js';

class IngredientForm {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.ingredients = storage.getIngredients();
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="ingredient-input-wrapper">
        <input 
          type="text" 
          id="ingredientInput" 
          class="input" 
          placeholder="食材を入力（例: 豚肉、玉ねぎ）"
          autocomplete="off"
        >
        <button id="addIngredientBtn" class="btn btn-secondary">
          追加
        </button>
      </div>
      <div id="ingredientTags" class="ingredient-tags"></div>
    `;
    
    this.renderIngredients();
  }

  renderIngredients() {
    const tagsContainer = document.getElementById('ingredientTags');
    
    if (this.ingredients.length === 0) {
      tagsContainer.innerHTML = '<p class="help-text">食材を追加してください</p>';
      return;
    }
    
    tagsContainer.innerHTML = this.ingredients.map(ingredient => `
      <div class="ingredient-tag">
        <span>${ingredient}</span>
        <button data-ingredient="${ingredient}" class="remove-ingredient-btn">×</button>
      </div>
    `).join('');
    
    // Attach remove button listeners
    tagsContainer.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeIngredient(btn.dataset.ingredient);
      });
    });
  }

  attachEventListeners() {
    const input = document.getElementById('ingredientInput');
    const addBtn = document.getElementById('addIngredientBtn');
    
    addBtn.addEventListener('click', () => this.addIngredient());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addIngredient();
      }
    });
  }

  addIngredient() {
    const input = document.getElementById('ingredientInput');
    const ingredient = input.value.trim();
    
    if (!ingredient) return;
    
    if (this.ingredients.includes(ingredient)) {
      alert('この食材は既に追加されています');
      return;
    }
    
    this.ingredients.push(ingredient);
    storage.saveIngredients(this.ingredients);
    input.value = '';
    this.renderIngredients();
    
    // Dispatch event for other components
    this.dispatchChangeEvent();
  }

  removeIngredient(ingredient) {
    this.ingredients = this.ingredients.filter(i => i !== ingredient);
    storage.saveIngredients(this.ingredients);
    this.renderIngredients();
    this.dispatchChangeEvent();
  }

  dispatchChangeEvent() {
    const event = new CustomEvent('ingredientsChanged', { 
      detail: { ingredients: this.ingredients }
    });
    window.dispatchEvent(event);
  }

  getIngredients() {
    return this.ingredients;
  }
}

export { IngredientForm };
