// scenraio 


import { Page, Locator } from '@playwright/test';

export class TodoListPage {
  readonly page: Page;
  readonly input: Locator;
  readonly listeTaches: Locator;
  readonly compteur: Locator;
  readonly boutonTous: Locator;
  readonly boutonActifs: Locator;
  readonly boutonCompletes: Locator;
  readonly boutonAnnuler: Locator;
  readonly boutonRefaire: Locator;
  readonly blocJSON: Locator;
  
  // Sélecteurs - À compléter par Copilot
  // TODO: Définir les sélecteurs pour les éléments de l'interface
  
  constructor(page: Page) {
    this.page = page;
    // Sélecteurs robustes / tolérants : cherchent les éléments par rôle, texte ou structure commune
    // Champ d'ajout : prend le premier input text visible (le site a un seul champ d'ajout)
  this.input = page.locator('header input, .header input, input.new-todo, input[placeholder]').first();
    // Liste des tâches : prend tous les éléments <li> visibles (structure TODO list classique)
    this.listeTaches = page.locator('ul li').filter({ has: page.locator('input, label, button') });

    // Compteur : texte indiquant le nombre restant (ex: "1 restante" ou "1 restante(s)")
    this.compteur = page.locator('text=/\\d+\\s+(restant|restants|remaining|reste)/i').first();

    // Filtres : boutons ou liens possédant le texte (fr/en)
    this.boutonTous = page.getByRole('button', { name: /^(Tous|All)$/i }).first();
    this.boutonActifs = page.getByRole('button', { name: /^(Actifs|Active)$/i }).first();
    this.boutonCompletes = page.getByRole('button', { name: /^(Compl[eé]t[eé]s|Completed)$/i }).first();

    // Annuler / Refaire (Undo/Redo) : boutons probables
    this.boutonAnnuler = page.getByRole('button', { name: /^(Annuler|Undo)$/i }).first();
    this.boutonRefaire = page.getByRole('button', { name: /^(Refaire|Redo|Redo)$/i }).first();

    // Bloc JSON : essaye <pre>, <code> ou une zone contenant un objet JSON
    this.blocJSON = page.locator('pre, code, textarea, .json, #json').first();
  }

  // Naviguer vers l'application
async naviguer() {
  await this.page.goto('https://alexdmr.github.io/l3m-2023-2024-angular-todolist/');
  // Attendre que Angular soit chargé
  await this.page.waitForLoadState('domcontentloaded');
  // Attendre l'input avec un timeout plus long
  await this.input.waitFor({ state: 'visible', timeout: 10000 });

  // Nettoyer l'état persistant (localStorage) pour garantir un état propre par test
  try {
    await this.page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* ignore */ } });
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.input.waitFor({ state: 'visible', timeout: 10000 });
  } catch (e) {
    // si clear/reload échoue, continuer quand même
  }
}

  // Ajouter une tâche dans le champ "Liste Miage"
  async ajouterTache(texte: string) {
    await this.input.fill('');
    await this.input.type(texte);
    // Soumettre en appuyant sur Entrée (le comportement standard des todo apps)
    await this.input.press('Enter');
    // attendre que la nouvelle tâche apparaisse (au moins une li contenant le texte)
    await this.page.waitForSelector(`ul li:has-text("${textoEscape(texte)}")`, { timeout: 3000 }).catch(() => {});
  }

  // Cocher une tâche par son index (0 = première tâche)
  async cocherTache(index: number) {
    const item = this.listeTaches.nth(index);
    const checkbox = item.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: 2000 });
    if (!await checkbox.isChecked()) await checkbox.check();
  }

  // Décocher une tâche par son index
  async decocherTache(index: number) {
    const item = this.listeTaches.nth(index);
    const checkbox = item.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: 2000 });
    if (await checkbox.isChecked()) await checkbox.uncheck();
  }

  // Supprimer une tâche en cliquant sur le bouton X
async supprimerTache(index: number) {
  // 1. Récupérer l'élément de la tâche
  const item = this.listeTaches.nth(index);
  
  // 2. SURVOL de la tâche pour révéler le bouton X
  await item.hover();
  
  // 3. Attendre que le bouton devienne visible après le hover
  const deleteBtn = item.locator('button.destroy, button:has-text("X")').first();
  await deleteBtn.waitFor({ state: 'visible', timeout: 2000 });
  
  // 4. Cliquer sur le bouton
  await deleteBtn.click();
}


async cliquerFiltreActifs() {
  await this.page.locator('button, a').filter({ hasText: 'Actifs' }).first().click();
}

async cliquerFiltreCompletees() {
  // ⚠️ C'est "Complétés" et NON "Complétées" !
  await this.page.locator('button, a').filter({ hasText: 'Complétés' }).first().click();
}

async cliquerFiltreTous() {
  await this.page.locator('button, a').filter({ hasText: 'Tous' }).first().click();
}




  



  // Cliquer sur le bouton "Annuler"
  async annuler() {
    if (await this.boutonAnnuler.count() > 0) {
      await this.boutonAnnuler.click();
      return;
    }
    await this.page.locator('text=/^(Annuler|Undo)$/i').first().click();
  }

  // Cliquer sur le bouton "Refaire"
  async refaire() {
    if (await this.boutonRefaire.count() > 0) {
      await this.boutonRefaire.click();
      return;
    }
    await this.page.locator('text=/^(Refaire|Redo)$/i').first().click();
  }

  // Obtenir le nombre de tâches affichées dans la liste
  async obtenirNombreTaches(): Promise<number> {
    return await this.listeTaches.count();
  }

  // Obtenir le texte d'une tâche par son index
  async obtenirTexteTache(index: number): Promise<string> {
    const item = this.listeTaches.nth(index);
    // Cherche une étiquette ou un span typique dans les todo list
    const label = item.locator('label, span, .view, .todo, .todo-text').first();
    if (await label.count() > 0) return (await label.innerText()).trim();
    return (await item.innerText()).trim();
  }

  // Obtenir le contenu JSON affiché dans la vue "Étape 1"
  async obtenirContenuJSON(): Promise<string> {
    if (await this.blocJSON.count() > 0) return (await this.blocJSON.innerText()).trim();
    // fallback: chercher le premier élément contenant une accolade '{'
    const possible = this.page.locator(':text-is("{")').first();
    if (await possible.count() > 0) return (await possible.innerText()).trim();
    // dernier recours : retourner le texte brut de la page
    return (await this.page.content()).slice(0, 2000);
  }

  // Vérifier si une tâche est cochée
  async tacheEstCochee(index: number): Promise<boolean> {
    const item = this.listeTaches.nth(index);
    const checkbox = item.locator('input[type="checkbox"]');
    await checkbox.waitFor({ state: 'attached', timeout: 2000 });
    return await checkbox.isChecked();
  }

  // Obtenir le texte du compteur (ex: "1 restante")
  async obtenirTexteCompteur(): Promise<string> {
    if (await this.compteur.count() > 0) return (await this.compteur.innerText()).trim();
    // fallback: chercher un élément qui ressemble à "X restante"
    const fallback = this.page.locator('text=/\\d+\\s+(restant|restants|remaining|reste)/i').first();
    if (await fallback.count() > 0) return (await fallback.innerText()).trim();
    return '';
  }

  // ----- JSON helpers (parsing centralisé + requêtes utiles) -----
  // Retourne true si une tâche avec le label donné existe dans le JSON affiché
  async tacheExisteDansJSON(label: string): Promise<boolean> {
    const parsed = await this.parseJSON();
    const items: any[] = parsed && Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    return items.some((t: any) => String(t.label || t.text || t.name || '').includes(label));
  }

  // Retourne l'état 'done' (boolean) pour la tâche identifiée par son label.
  // Si la tâche n'est pas trouvée, retourne false.
  async obtenirEtatDansJSON(label: string): Promise<boolean> {
    const parsed = await this.parseJSON();
    const items: any[] = parsed && Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    const found = items.find((t: any) => String(t.label || t.text || t.name || '').includes(label));
    if (!found) return false;
    // accepte boolean ou string 'false'/'true'
    if (typeof found.done === 'boolean') return found.done;
    if (typeof found.done === 'string') return found.done.toLowerCase() === 'true';
    return Boolean(found.done);
  }

  // Retourne l'uid numérique si présent, sinon null
  async obtenirUidDansJSON(label: string): Promise<number | null> {
    const parsed = await this.parseJSON();
    const items: any[] = parsed && Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    const found = items.find((t: any) => String(t.label || t.text || t.name || '').includes(label));
    if (!found) return null;
    const uid = found.uid ?? found.id ?? found.userId ?? null;
    const n = Number(uid);
    return Number.isNaN(n) ? null : n;
  }

  // Retourne le nombre d'items trouvés dans le JSON (0 si non trouvé)
  async obtenirNombreTachesDansJSON(): Promise<number> {
    const parsed = await this.parseJSON();
    const items: any[] = parsed && Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    return items.length;
  }

  // Méthode privée centralisant le parsing robuste du JSON affiché
  private async parseJSON(): Promise<any> {
    const text = await this.obtenirContenuJSON();
    let parsed: any = null;
    // Attempt 1: direct parse
    try {
      parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      // continue to heuristics
    }

    // Attempt 2: extract first array or object substring and parse
    const arrayMatch = text.match(/\[([\s\S]*?)\]/);
    const objMatch = text.match(/\{([\s\S]*?)\}/);
    try {
      if (arrayMatch) {
        parsed = JSON.parse(arrayMatch[0]);
        return parsed;
      }
      if (objMatch) {
        parsed = JSON.parse(objMatch[0]);
        return parsed;
      }
    } catch (e) {
      // fallthrough
    }

    // Attempt 3: try to find a property named items/tasks inside the text using a lightweight regexp
    // This will not be perfect but helps in many demo apps that embed JSON in HTML
    const itemsMatch = text.match(/"(items|tasks)"\s*:\s*(\[[\s\S]*\])/i);
    if (itemsMatch) {
      try {
        parsed = { items: JSON.parse(itemsMatch[2]) };
        return parsed;
      } catch (e) {
        // ignore
      }
    }

    // If nothing parsed, return an empty structure
    return { items: [] };
  }
}

// Helper: échappe les guillemets et backslashes pour usage dans selectors text
function textoEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}