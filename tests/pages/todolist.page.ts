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
  readonly blocJSON: Locator;
  
  // Sélecteurs - À compléter par Copilot
  // TODO: Définir les sélecteurs pour les éléments de l'interface
  
constructor(page: Page) {
  this.page = page;

  // 👉 Input réel de l’application
  this.input = page.getByRole("textbox", { name: /nouvelle tâche/i });

  // Items
  this.listeTaches = page.locator('.todo-item');

  // Filtres (ce sont des <a>)
  this.boutonTous = page.getByRole('link', { name: /tous/i });
  this.boutonActifs = page.getByRole('link', { name: /actifs/i });
  this.boutonCompletes = page.getByRole('link', { name: /(complétés|completed)/i });

  // Compteur
  this.compteur = page.locator('.todo-count');

  // JSON output
  this.blocJSON = page.locator('pre').first();
}


// Naviguer vers l'application
async naviguer() {
  console.log("🌐 Navigation vers l'application...");

  try {
    const response = await this.page.goto(
      'https://alexdmr.github.io/l3m-2023-2024-angular-todolist/',
      { waitUntil: 'domcontentloaded', timeout: 30000 }
    );

    if (!response || response.status() >= 400) {
      console.warn('⚠️ Status inattendu:', response?.status());
    }

    // 👉 Attendre l'input réel
    await this.input.waitFor({ state: "visible", timeout: 20000 });

    await this.page.waitForTimeout(200);

    console.log("✅ Input trouvé !");
  } catch (err) {
    console.error("❌ Erreur navigation:", err);
    throw err;
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
    const item = this.listeTaches.nth(index);
    // boutons communs : button.destroy, button:has-text("X"), .remove
    const deleteBtn = item.locator('button.destroy, button:has-text("X"), .remove, .delete').first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 2000 });
    await deleteBtn.click();
  }

  // Cliquer sur le filtre "Tous"
  async cliquerFiltreTous() {
    if (await this.boutonTous.count() > 0) {
      await this.boutonTous.click();
      return;
    }
    // fallback : lien texte
    await this.page.locator('text=/^(Tous|All)$/i').first().click();
  }

  // Cliquer sur le filtre "Actifs"
  async cliquerFiltreActifs() {
    if (await this.boutonActifs.count() > 0) {
      await this.boutonActifs.click();
      return;
    }
    await this.page.locator('text=/^(Actifs|Active)$/i').first().click();
  }

  // Cliquer sur le filtre "Complétés"
  async cliquerFiltreCompletes() {
    if (await this.boutonCompletes.count() > 0) {
      await this.boutonCompletes.click();
      return;
    }
    await this.page.locator('text=/^(Compl[eé]t[eé]s|Completed)$/i').first().click();
  }

 

 


  // Obtenir le texte du compteur (ex: "1 restante")
  async obtenirTexteCompteur(): Promise<string> {
    if (await this.compteur.count() > 0) return (await this.compteur.innerText()).trim();
    // fallback: chercher un élément qui ressemble à "X restante"
    const fallback = this.page.locator('text=/\\d+\\s+(restant|restants|remaining|reste)/i').first();
    if (await fallback.count() > 0) return (await fallback.innerText()).trim();
    return '';
  }

  // Obtenir le contenu JSON affiché dans la vue (pré, code, textarea ou similaire)
  async obtenirContenuJSON(): Promise<string> {
    if (await this.blocJSON.count() > 0) return (await this.blocJSON.innerText()).trim();
    // fallback: chercher un <pre> ou <code> contenant une accolade
    const possible = this.page.locator('pre:has-text("{") , code:has-text("{")').first();
    if (await possible.count() > 0) return (await possible.innerText()).trim();
    // dernier recours: retourner un extrait du HTML (pour que parseJSON puisse tenter d'extraire)
    return (await this.page.content()).slice(0, 2000);
  }

  // ----- JSON helpers (parsing centralisé + requêtes utiles) -----
  // Retourne true si une tâche avec le label donné existe dans le JSON affiché
  async tacheExisteDansJSON(label: string): Promise<boolean> {
    const parsed = await this.parseJSON();
    const items: any[] = parsed && Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    return items.some((t: any) => String(t.label || t.text || t.name || '').includes(label));
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