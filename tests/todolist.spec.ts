import { test, expect } from '@playwright/test';
import { TodoListPage } from './pages/todolist.page';
import { verifierLeNombreDeTaches, verifierLeNombreDeTachesVisibles, verifierLesTachesVisibles, verifierQueLaTodoListContient } from './verifs/todolist.verif';

test.describe('TodoList - Tests simples pour commencer', () => {
  let todoPage: TodoListPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoListPage(page);
    await todoPage.naviguer();
  });

 
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

   
  
 // ===== SCÉNARIO 2: Filtre "Actifs" =====
test('devrait afficher seulement les tâches actives avec le filtre', async ({ page }) => {
  // Arrange
  await todoPage.ajouterTache('Tâche 1');
  await todoPage.ajouterTache('Tâche 2');
  await todoPage.cocherTache(0);
  
  // Act
  await todoPage.cliquerFiltreActifs();
  await page.waitForTimeout(500);
  
  // Assert: Vérifier les données dans le JSON
  await verifierQueLaTodoListContient(page, [
    { label: 'Tâche 1', completed: true },
    { label: 'Tâche 2', completed: false }
  ]);
  
  // Assert: Le compteur affiche "1 restante" (preuve que le filtre marche)
  const compteurTexte = await todoPage.obtenirTexteCompteur();
  expect(compteurTexte).toMatch(/\b1\b/);
});

test('devrait supprimer une tâche', async ({ page }) => {
  // Arrange
  await todoPage.ajouterTache('Tâche à supprimer');
  await verifierLeNombreDeTaches(page, 1);
  
  // Act
  await todoPage.supprimerTache(0);
  
  // Assert
  await verifierLeNombreDeTaches(page, 0);
});


test('devrait cocher une tâche et mettre à jour le JSON', async ({ page }) => {
  // Arrange
  await todoPage.ajouterTache('Faire les courses');
  
  // Act
  await todoPage.cocherTache(0);
  
  // Assert
  await verifierQueLaTodoListContient(page, [
    { label: 'Faire les courses', completed: true }
  ]);
  
  const compteurTexte = await todoPage.obtenirTexteCompteur();
  expect(compteurTexte).toMatch(/\b0\b/); // 0 tâches restantes
});

// ===== SCÉNARIO 5: Filtre "Complétés" =====
test('devrait afficher seulement les tâches complétées', async ({ page }) => {
  // Arrange
  await todoPage.ajouterTache('Tâche 1');
  await todoPage.ajouterTache('Tâche 2');
  await todoPage.ajouterTache('Tâche 3');
  await todoPage.cocherTache(0);
  await todoPage.cocherTache(2);
  
  // Act
  await todoPage.cliquerFiltreCompletees();
  await page.waitForTimeout(500);
  
  // Assert: JSON contient toujours 3 tâches
  await verifierQueLaTodoListContient(page, [
    { label: 'Tâche 1', completed: true },
    { label: 'Tâche 2', completed: false },
    { label: 'Tâche 3', completed: true }
  ]);
  
  // Assert: Seulement 2 tâches sont VISIBLES (les complétées)
  await verifierLeNombreDeTachesVisibles(page, 2);
});

// ===== SCÉNARIO 6: Filtre "Tous" =====
test('devrait afficher toutes les tâches avec le filtre Tous', async ({ page }) => {
  // Arrange
  await todoPage.ajouterTache('Tâche 1');
  await todoPage.ajouterTache('Tâche 2');
  await todoPage.cocherTache(0);
  await todoPage.cliquerFiltreActifs(); // On active le filtre "Actifs"
  await page.waitForTimeout(500);
  
  // Act : Revenir au filtre "Tous"
  await todoPage.cliquerFiltreTous();
  await page.waitForTimeout(500);
  
  // Assert: Toutes les tâches sont visibles
  await verifierLeNombreDeTachesVisibles(page, 2);
});


});






