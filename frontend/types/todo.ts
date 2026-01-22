export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TodoCreateInput {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface TodoUpdateInput {
  title?: string;
  description?: string;
  completed?: boolean;
}