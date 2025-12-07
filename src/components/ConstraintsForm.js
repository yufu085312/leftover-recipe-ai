import { storage } from '../utils/storage.js';

class ConstraintsForm {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.constraints = storage.getConstraints();
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="constraints-grid">
        <div class="form-group">
          <label for="cookingTimeSelect">⏱️ 調理時間</label>
          <select id="cookingTimeSelect" class="select">
            <option value="any">指定なし</option>
            <option value="10">10分以内</option>
            <option value="20">20分以内</option>
            <option value="30">30分以内</option>
          </select>
        </div>

        <div class="form-group">
          <label for="difficultySelect">📊 難易度</label>
          <select id="difficultySelect" class="select">
            <option value="any">指定なし</option>
            <option value="easy">簡単</option>
            <option value="medium">普通</option>
            <option value="hard">上級</option>
          </select>
        </div>

        <div class="form-group">
          <label for="mealTypeSelect">🍽️ 食事タイプ</label>
          <select id="mealTypeSelect" class="select">
            <option value="any">指定なし</option>
            <option value="breakfast">朝食</option>
            <option value="lunch">昼食</option>
            <option value="dinner">夕食</option>
            <option value="snack">おやつ</option>
          </select>
        </div>

        <div class="form-group">
          <label for="spicinessSelect">🌶️ 辛さ</label>
          <select id="spicinessSelect" class="select">
            <option value="mild">辛くない</option>
            <option value="medium">普通</option>
            <option value="spicy">辛い</option>
            <option value="very-spicy">とても辛い</option>
          </select>
        </div>
      </div>
    `;
    
    this.setFormValues();
  }

  setFormValues() {
    document.getElementById('cookingTimeSelect').value = this.constraints.cookingTime;
    document.getElementById('difficultySelect').value = this.constraints.difficulty;
    document.getElementById('mealTypeSelect').value = this.constraints.mealType;
    document.getElementById('spicinessSelect').value = this.constraints.spiciness;
  }

  attachEventListeners() {
    const selects = this.container.querySelectorAll('select');
    
    selects.forEach(select => {
      select.addEventListener('change', () => {
        this.updateConstraints();
      });
    });
  }

  updateConstraints() {
    this.constraints = {
      cookingTime: document.getElementById('cookingTimeSelect').value,
      difficulty: document.getElementById('difficultySelect').value,
      mealType: document.getElementById('mealTypeSelect').value,
      spiciness: document.getElementById('spicinessSelect').value
    };
    
    storage.saveConstraints(this.constraints);
    this.dispatchChangeEvent();
  }

  dispatchChangeEvent() {
    const event = new CustomEvent('constraintsChanged', { 
      detail: { constraints: this.constraints }
    });
    window.dispatchEvent(event);
  }

  getConstraints() {
    return this.constraints;
  }
}

export { ConstraintsForm };
