import { Page } from "@playwright/test";
import { TodoListData } from "../data/todolist.data";

/**
 * Extrait la liste de tâches depuis la page web
 * en lisant le JSON affiché dans l'Étape 1
 */
export async function extractTdlFromPage(page: Page): Promise<TodoListData> {
  // Récupérer le texte du bloc JSON (Étape 1)
  const jsonElement = page.locator('pre, code, textarea, .json, #json').first();
  
  // Si pas trouvé, chercher tout texte contenant une accolade
  let jsonText = '';
  if (await jsonElement.count() > 0) {
    jsonText = await jsonElement.innerText();
  } else {
    // Fallback : chercher dans tout le contenu de la page
    const pageContent = await page.content();
    const match = pageContent.match(/\{[\s\S]*"items"[\s\S]*\}/);
    jsonText = match ? match[0] : '{"items":[]}';
  }

  // Parser le JSON
  try {
    const parsed = JSON.parse(jsonText);
    const items = parsed.items || [];
    
    // Transformer en TodoListData (format simplifié)
    return items.map((item: any) => ({
      label: item.label || '',
      completed: item.done || false
    }));
  } catch (e) {
    console.error('Erreur parsing JSON:', e);
    return [];
  }
}