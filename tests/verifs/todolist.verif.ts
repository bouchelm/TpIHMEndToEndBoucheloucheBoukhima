import { expect, Page } from "@playwright/test";
import { TodoListData, areTdlSimilar } from "../data/todolist.data";
import { extractTdlFromPage } from "./extractTdlFromPage";

/**
 * Vérifie que la TodoList (JSON) correspond à la liste attendue
 */
export async function verifierQueLaTodoListContient(
  page: Page,
  todoListAttendue: TodoListData
): Promise<void> {
  const todoListActuelle = await extractTdlFromPage(page);
  const sontIdentiques = areTdlSimilar(todoListActuelle, todoListAttendue);
  
  if (!sontIdentiques) {
    console.log('📋 TodoList attendue:', JSON.stringify(todoListAttendue, null, 2));
    console.log('📋 TodoList actuelle:', JSON.stringify(todoListActuelle, null, 2));
  }
  
  expect(sontIdentiques).toBeTruthy();
}

/**
 * Vérifie le nombre de tâches dans le JSON
 */
export async function verifierLeNombreDeTaches(
  page: Page,
  nombreAttendu: number
): Promise<void> {
  const todoList = await extractTdlFromPage(page);
  expect(todoList.length).toBe(nombreAttendu);
}

/**
 * Vérifie le nombre de tâches VISIBLES dans l'interface
 */
/**
 * Vérifie le nombre de tâches RÉELLEMENT VISIBLES dans l'interface
 * (ignore les éléments cachés par CSS ou attributs)
 */
export async function verifierLeNombreDeTachesVisibles(
  page: Page,
  nombreAttendu: number
): Promise<void> {

  const items = page.locator('ul li');

  const count = await items.count();
  let visibles = 0;

  for (let i = 0; i < count; i++) {
    const label = items.nth(i).locator('label');

    if (await label.isVisible()) {
      visibles++;
    }
  }

  console.log("Nb tâches visibles :", visibles);
  expect(visibles).toBe(nombreAttendu);
}



/**
 * Vérifie que seules certaines tâches sont visibles
 */
export async function verifierLesTachesVisibles(
  page: Page,
  labelsAttendus: string[]
): Promise<void> {
  await page.waitForTimeout(300);
  
  // Récupérer seulement les tâches réellement visibles
  const tachesVisiblesTextes = await page.locator('ul li').filter({ 
    has: page.locator('input[type="checkbox"]')
  }).evaluateAll((elements) => {
    return elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetParent !== null;
      })
      .map(el => el.textContent?.trim() || '');
  });
  
  console.log(' Tâches visibles:', tachesVisiblesTextes);
  
  // Vérifier que chaque label attendu est présent
  for (const label of labelsAttendus) {
    const trouve = tachesVisiblesTextes.some(texte => texte.includes(label));
    if (!trouve) {
      console.log(` Label "${label}" non trouvé dans les tâches visibles`);
    }
    expect(trouve).toBeTruthy();
  }
  
  // Vérifier qu'on a le bon nombre de tâches
  expect(tachesVisiblesTextes.length).toBe(labelsAttendus.length);
}