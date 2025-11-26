// verifs/todolist.verif.ts

import { expect, Page } from "@playwright/test";
import { TodoListData, areTdlSimilar } from "../data/todolist.data";
import { extractTdlFromPage } from "./extractTdlFromPage";

/**
 * Vérifie que la TodoList affichée correspond exactement
 * à la TodoList attendue
 */
export async function verifierQueLaTodoListContient(
  page: Page,
  todoListAttendue: TodoListData
): Promise<void> {
  // Extraire la TodoList depuis la page
  const todoListActuelle = await extractTdlFromPage(page);
  
  // Comparer avec la fonction areTdlSimilar de ton prof
  const sontIdentiques = areTdlSimilar(todoListActuelle, todoListAttendue);
  
  // Message d'erreur détaillé si ça échoue
  if (!sontIdentiques) {
    console.log('📋 TodoList attendue:', JSON.stringify(todoListAttendue, null, 2));
    console.log('📋 TodoList actuelle:', JSON.stringify(todoListActuelle, null, 2));
  }
  
  expect(sontIdentiques).toBeTruthy();
}

/**
 * Vérifie que la TodoList contient exactement N tâches
 */
export async function verifierLeNombreDeTaches(
  page: Page,
  nombreAttendu: number
): Promise<void> {
  const todoList = await extractTdlFromPage(page);
  expect(todoList.length).toBe(nombreAttendu);
}