import { test, expect } from '@playwright/test';
import { TodoListPage } from './pages/todolist.page';
import { verifierLeNombreDeTaches, verifierQueLaTodoListContient } from './verifs/todolist.verif';

test.describe('TodoList - Tests simples pour commencer', () => {
  let todoPage: TodoListPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoListPage(page);
    await todoPage.naviguer();
  });

  // ===== SCÉNARIO 1: Ajouter une tâche simple =====
  // test('devrait ajouter une tâche avec un texte simple', async () => {
  //   // Arrange: définir le texte de la tâche
  //   const texte = 'Acheter du lait';

  //   // Act: ajouter la tâche
  //   await todoPage.ajouterTache(texte);

  //   // Assert: vérifier qu'il y a exactement 1 tâche
  //   const nb = await todoPage.obtenirNombreTaches();
  //   expect(nb).toBe(1);

  //   // Vérifier le texte de la première tâche
  //   const texteTache = await todoPage.obtenirTexteTache(0);
  //   expect(texteTache).toContain(texte);

  //   // Vérifier que la tâche n'est PAS cochée initialement
  //   const estCochee = await todoPage.tacheEstCochee(0);
  //   expect(estCochee).toBeFalsy();

  //   // Vérifier la synchronisation avec le JSON via les helpers du Page Object
  //   const existeDansJSON = await todoPage.tacheExisteDansJSON(texte);
  //   expect(existeDansJSON).toBeTruthy();

  //   const etatDansJSON = await todoPage.obtenirEtatDansJSON(texte);
  //   expect(etatDansJSON).toBeFalsy();

  //   const uidDansJSON = await todoPage.obtenirUidDansJSON(texte);
  //   expect(uidDansJSON).not.toBeNull();
  //   // uid doit être un nombre ou convertible en nombre
  //   expect(!Number.isNaN(Number(uidDansJSON))).toBeTruthy();

  //   // Vérifier le compteur affiché (1 restante)
  //   const compteurTexte = await todoPage.obtenirTexteCompteur();
  //   expect(compteurTexte).toMatch(/\b1\b\s*(restant|restante|restants|remaining|reste)/i);
  // });






    test('devrait ajouter une tâche avec un texte simple', async ({ page }) => {
    // Arrange
    const texte = 'Acheter du lait';
    
    // Act
    await todoPage.ajouterTache(texte);
    
    // Assert - VERSION LISIBLE ET DÉCLARATIVE
    await verifierLeNombreDeTaches(page, 1);
    
    await verifierQueLaTodoListContient(page, [
      { label: 'Acheter du lait', completed: false }
    ]);
    
    // Vérification optionnelle du compteur (si tu veux la garder)
    const compteurTexte = await todoPage.obtenirTexteCompteur();
    expect(compteurTexte).toMatch(/\b1\b/);
  });


  // ===== SCÉNARIO 2: Cocher une tâche =====
  test('devrait cocher une tâche et changer son état', async () => {
    // Arrange: ajouter une tâche
    
    // Act: cocher la tâche
    
    // Assert: vérifier que la tâche est cochée
    // TODO: Implémenter les assertions
  });

  // ===== SCÉNARIO 3: Synchronisation - Ajout de tâche =====
  test('devrait synchroniser l\'ajout d\'une tâche dans le JSON', async () => {
    // Arrange: définir le texte de la tâche
    
    // Act: ajouter la tâche
    
    // Assert: vérifier que la tâche apparaît dans le JSON avec done: false
    // TODO: Implémenter les assertions
  });

  // ===== SCÉNARIO 4: Synchronisation - Changement d'état =====
  test('devrait synchroniser le changement d\'état dans le JSON quand on coche une tâche', async () => {
    // Arrange: ajouter une tâche
    
    // Act: cocher la tâche
    
    // Assert: vérifier que dans le JSON done: true
    // TODO: Implémenter les assertions
  });

  // ===== SCÉNARIO 5: Filtre "Actifs" =====
  test('devrait afficher seulement les tâches actives avec le filtre', async () => {
    // Arrange: ajouter 2 tâches, en cocher 1
    
    // Act: cliquer sur le filtre "Actifs"
    
    // Assert: vérifier qu'il n'y a plus qu'1 tâche visible
    // TODO: Implémenter les assertions
  });

  // ===== SCÉNARIO 6: Annuler l'ajout d'une tâche =====
  test('devrait annuler l\'ajout d\'une tâche', async () => {
    // Arrange: ajouter une tâche
    
    // Act: cliquer sur "Annuler"
    
    // Assert: vérifier qu'il n'y a plus de tâche
    // TODO: Implémenter les assertions
  });
});






