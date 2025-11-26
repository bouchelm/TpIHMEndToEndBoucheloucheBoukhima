export type TodoListData = readonly TodoItem[];

interface TodoItem {
  readonly label: string;
  readonly completed: boolean;
}

export function areTdlSimilar(
  tdl1: TodoListData,
  tdl2: TodoListData
): boolean {
  if (tdl1.length !== tdl2.length) {
    return false;
  }

  for (let i = 0; i < tdl1.length; i++) {
    if (
      tdl1[i].label !== tdl2[i].label ||
      tdl1[i].completed !== tdl2[i].completed
    ) {
      return false;
    }
  }
  
  return true;
}
