import { GoogleGenAI } from '@google/genai';
import { storage } from '../utils/storage.js';

class GeminiService {
  constructor() {
    this.client = null;
    this.initializeWithStoredKey();
  }

  // Initialize with stored API key
  initializeWithStoredKey() {
    const apiKey = storage.getApiKey();
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  // Initialize the Gemini API
  initialize(apiKey) {
    try {
      this.client = new GoogleGenAI({ apiKey });
      return true;
    } catch (error) {
      console.error('Error initializing Gemini API:', error);
      return false;
    }
  }

  // Check if API is ready
  isReady() {
    return this.client !== null;
  }

  // Generate recipes based on ingredients and constraints
  async generateRecipes(ingredients, constraints) {
    if (!this.isReady()) {
      throw new Error('Gemini APIが初期化されていません。設定でAPIキーを入力してください。');
    }

    const prompt = this.buildRecipePrompt(ingredients, constraints);

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      return this.parseRecipesFromResponse(response.text);
    } catch (error) {
      console.error('Error generating recipes:', error);
      throw new Error('レシピの生成に失敗しました: ' + error.message);
    }
  }

  // Refine a recipe based on user instructions
  async refineRecipe(recipe, instruction) {
    if (!this.isReady()) {
      throw new Error('Gemini APIが初期化されていません。');
    }

    const prompt = this.buildRefinePrompt(recipe, instruction);

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      return this.parseRecipeFromResponse(response.text);
    } catch (error) {
      console.error('Error refining recipe:', error);
      throw new Error('レシピの修正に失敗しました: ' + error.message);
    }
  }

  // Build prompt for recipe generation
  buildRecipePrompt(ingredients, constraints) {
    let prompt = `あなたは経験豊富な料理人です。以下の食材と条件から、3〜5種類のユニークで美味しいレシピを提案してください。\n\n`;
    
    prompt += `### 利用可能な食材:\n`;
    ingredients.forEach(ingredient => {
      prompt += `- ${ingredient}\n`;
    });
    
    prompt += `\n### 条件:\n`;
    
    if (constraints.cookingTime !== 'any') {
      const timeMap = {
        '10': '10分以内',
        '20': '20分以内',
        '30': '30分以内'
      };
      prompt += `- 調理時間: ${timeMap[constraints.cookingTime]}\n`;
    }
    
    if (constraints.difficulty !== 'any') {
      const difficultyMap = {
        'easy': '簡単',
        'medium': '普通',
        'hard': '上級'
      };
      prompt += `- 難易度: ${difficultyMap[constraints.difficulty]}\n`;
    }
    
    if (constraints.mealType !== 'any') {
      const mealTypeMap = {
        'breakfast': '朝食',
        'lunch': '昼食',
        'dinner': '夕食',
        'snack': 'おやつ'
      };
      prompt += `- 食事タイプ: ${mealTypeMap[constraints.mealType]}\n`;
    }
    
    if (constraints.spiciness !== 'medium') {
      const spicinessMap = {
        'mild': '辛くない',
        'medium': '普通',
        'spicy': '辛い',
        'very-spicy': 'とても辛い'
      };
      prompt += `- 辛さ: ${spicinessMap[constraints.spiciness]}\n`;
    }
    
    prompt += `\n### 出力フォーマット:\n`;
    prompt += `各レシピについて、以下のJSON形式で出力してください（複数のレシピを配列として）:\n\n`;
    prompt += `\`\`\`json\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "title": "レシピのタイトル",\n`;
    prompt += `    "description": "レシピの簡単な説明（1-2文）",\n`;
    prompt += `    "cookingTime": "調理時間（例: 15分）",\n`;
    prompt += `    "difficulty": "難易度（簡単/普通/上級）",\n`;
    prompt += `    "servings": "人数（例: 2人分）",\n`;
    prompt += `    "seasonings": ["必要な調味料のリスト"],\n`;
    prompt += `    "ingredients": ["使用する食材のリスト（分量付き）"],\n`;
    prompt += `    "steps": ["詳細な手順のリスト"],\n`;
    prompt += `    "nutrition": {\n`;
    prompt += `      "calories": "カロリー（例: 約350kcal）",\n`;
    prompt += `      "protein": "タンパク質（例: 約20g）",\n`;
    prompt += `      "notes": "栄養に関する補足"\n`;
    prompt += `    },\n`;
    prompt += `    "tips": "調理のコツや保存方法などの補足情報"\n`;
    prompt += `  }\n`;
    prompt += `]\n`;
    prompt += `\`\`\`\n\n`;
    prompt += `JSONコードブロック以外の説明は不要です。JSON配列のみを返してください。`;
    
    return prompt;
  }

  // Build prompt for recipe refinement
  buildRefinePrompt(recipe, instruction) {
    let prompt = `以下のレシピを「${instruction}」という指示に従って修正してください。\n\n`;
    prompt += `### 元のレシピ:\n`;
    prompt += `**タイトル**: ${recipe.title}\n`;
    prompt += `**説明**: ${recipe.description}\n`;
    prompt += `**調理時間**: ${recipe.cookingTime}\n`;
    prompt += `**難易度**: ${recipe.difficulty}\n\n`;
    
    prompt += `**調味料**:\n`;
    recipe.seasonings.forEach(s => prompt += `- ${s}\n`);
    
    prompt += `\n**食材**:\n`;
    recipe.ingredients.forEach(i => prompt += `- ${i}\n`);
    
    prompt += `\n**手順**:\n`;
    recipe.steps.forEach((step, index) => prompt += `${index + 1}. ${step}\n`);
    
    prompt += `\n### 出力フォーマット:\n`;
    prompt += `修正後のレシピを以下のJSON形式で出力してください:\n\n`;
    prompt += `\`\`\`json\n`;
    prompt += `{\n`;
    prompt += `  "title": "レシピのタイトル",\n`;
    prompt += `  "description": "レシピの簡単な説明",\n`;
    prompt += `  "cookingTime": "調理時間",\n`;
    prompt += `  "difficulty": "難易度",\n`;
    prompt += `  "servings": "人数",\n`;
    prompt += `  "seasonings": ["必要な調味料のリスト"],\n`;
    prompt += `  "ingredients": ["使用する食材のリスト（分量付き）"],\n`;
    prompt += `  "steps": ["詳細な手順のリスト"],\n`;
    prompt += `  "nutrition": {\n`;
    prompt += `    "calories": "カロリー",\n`;
    prompt += `    "protein": "タンパク質",\n`;
    prompt += `    "notes": "栄養に関する補足"\n`;
    prompt += `  },\n`;
    prompt += `  "tips": "調理のコツや保存方法などの補足情報"\n`;
    prompt += `}\n`;
    prompt += `\`\`\`\n\n`;
    prompt += `JSONコードブロック以外の説明は不要です。JSONオブジェクトのみを返してください。`;
    
    return prompt;
  }

  // Parse recipes from API response
  parseRecipesFromResponse(text) {
    try {
      // Extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try parsing the entire response as JSON
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing recipes:', error);
      console.log('Raw response:', text);
      throw new Error('レシピの解析に失敗しました。もう一度お試しください。');
    }
  }

  // Parse single recipe from API response
  parseRecipeFromResponse(text) {
    try {
      // Extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try parsing the entire response as JSON
      return JSON.parse(text);
    } catch (error) {
      console.error('Error parsing recipe:', error);
      console.log('Raw response:', text);
      throw new Error('レシピの解析に失敗しました。もう一度お試しください。');
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
