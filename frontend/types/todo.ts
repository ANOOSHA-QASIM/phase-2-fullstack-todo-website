export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TodoCreateInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;  // snake_case for API
  completed?: boolean;
}

export interface TodoUpdateInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;  // snake_case for API
  completed?: boolean;
}
