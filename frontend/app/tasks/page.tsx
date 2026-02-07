'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

/* ================= TYPES ================= */

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  deleted?: boolean;

  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}


type TasksApiResponse = Todo[] | { tasks: Todo[] };

/* ================= PAGE ================= */

export default function AllTasksPage() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        apiClient.setToken(token);
        await fetchTasks();
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [router]);

  /* ================= FETCH ================= */

  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks();

      if (response?.success && response.data) {
        const data = response.data as TasksApiResponse;

        const tasks: Todo[] = Array.isArray(data)
          ? data
          : data.tasks ?? [];

        const mappedTasks = tasks.map(task => ({
  ...task,
  due_date: task.dueDate, // snake_case → camelCase
}));

setTodos(mappedTasks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ACTIONS ================= */

  const handleToggleTask = async (id: string) => {
    try {
      const response = await apiClient.toggleTask(id);

      if (response.success) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await apiClient.deleteTask(id);

      if (response.success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (task: Todo) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
    setEditCompleted(task.completed);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

const handleEditTask = async () => {
  if (!editingTask) return;

  try {
    const response = await apiClient.updateTask(editingTask.id,  {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      due_date: editDueDate || null,
      completed: editCompleted,
    });

    if (response.success && response.data) {
      const updatedTask = response.data;

      setTodos(prev =>
        prev.map(todo =>
          todo.id === editingTask.id ? updatedTask : todo
        )
      );

      closeEditModal();
    }
  } catch (err) {
    console.error(err);
  }
};


  const handleLogout = () => {
    localStorage.removeItem('access_token');
    apiClient.setToken(null);
    router.push('/login');
  };

  /* ================= UI ================= */

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
       
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-[rgb(var(--primary))] rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">All Tasks</h1>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button asChild variant="secondary" className="rounded-r-none border-r-0">
                <a href="/tasks">All Tasks</a>
              </Button>
              <Button asChild variant="outline" className="rounded-none border-r-0">
                <a href="/tasks/pending">Pending</a>
              </Button>
              <Button asChild variant="outline" className="rounded-l-none">
                <a href="/tasks/completed">Completed</a>
              </Button>
            </div>
          </div>

          <Button asChild className="mb-6">
            <a href="/tasks/add">Add New Task</a>
          </Button>

          <Card>
            {todos.length === 0 ? (
              <p className="text-center py-8 text-[rgb(var(--muted-foreground))]">No tasks found</p>
            ) : (
              <div className="space-y-4">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-start justify-between p-4 bg-[rgb(var(--muted))] rounded-lg hover:opacity-90 transition-colors group antigravity-card-no-border"
                  >
                    <div className="flex items-start flex-1">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTask(todo.id)}
                        className="w-5 h-5 text-[rgb(var(--primary))] rounded cursor-pointer border-[rgb(var(--border))] bg-white focus:ring-[rgb(var(--primary))] focus:ring-offset-2 mt-0.5 mr-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))]' : 'text-[rgb(var(--foreground))]'}`}>
                            {todo.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : 'Medium'}
                          </span>
                        </div>
                        {todo.description && (
                          <p className={`text-sm mt-2 ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))] opacity-70' : 'text-[rgb(var(--muted-foreground))]'}`}>
                            {todo.description}
                          </p>
                        )}
                        {todo.dueDate && (
                          <p className={`text-xs mt-2 ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))] opacity-70' : 'text-[rgb(var(--muted-foreground))]'} dark:text-[rgb(var(--muted-foreground))]`}>
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 ml-4 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(todo)}
                        className="text-[rgb(var(--primary))] hover:opacity-80 p-1 rounded-full hover:bg-[rgb(var(--secondary)/0.5)] transition-colors"
                      >
                        <span className="text-lg">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(todo.id)}
                        className="text-[rgb(var(--destructive))] hover:opacity-80 p-1 rounded-full hover:bg-[rgb(var(--secondary)/0.5)] transition-colors"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--card))] p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="font-bold mb-4 text-[rgb(var(--foreground))]">Edit Task</h3>

            <Input
              label="Title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              fullWidth
            />
            <Input
              label="Description"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={editCompleted}
                onChange={e => setEditCompleted(e.target.checked)}
                className="rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
              />
              <span className="text-[rgb(var(--foreground))]">Completed</span>
            </label>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleEditTask}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
