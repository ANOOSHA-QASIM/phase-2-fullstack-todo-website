'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';


import type { Todo } from '@/types/todo';
type TasksApiResponse =
  | Todo[]
  | {
      tasks: Todo[];
    };


export default function CompletedTasksPage() {
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

  // Load token and fetch tasks on mount
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);

        // Get token from localStorage
        const token = localStorage.getItem('access_token');

        if (!token) {
          // No token, redirect to login
          router.push('/login');
          return;
        }

        // Initialize API client with token
        apiClient.setToken(token);

        // Fetch tasks
        await fetchTasks();
      } catch (err: any) {
        console.error('Page initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks();

      if (response.success && response.data) {
        // TypeScript ke liye type assertion
        const data = response.data as Todo[] | { tasks: Todo[] };

        const tasks: Todo[] = Array.isArray(data) ? data : data.tasks || [];

        const completedTasks = tasks.filter(task => task.completed);
        setTodos(completedTasks);
      }
    } catch (err: any) {
      console.error(err);
    }
  };


  const handleToggleTask = async (id: string) => {
    try {
      const response = await apiClient.toggleTask(String(id));

      if (response.success) {
        setTodos(todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await apiClient.deleteTask(String(id));

      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const openEditModal = (task: Todo) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
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
      const response = await apiClient.updateTask(String(editingTask.id), {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        due_date: editDueDate || null,
        completed: editCompleted
      });

      if (response.success && response.data) {
        setTodos(todos.map(todo =>
          todo.id === editingTask.id ? { ...todo, ...response.data! } : todo
        ));
        closeEditModal();
      } else {
        console.error('Failed to edit task:', response.error);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    apiClient.setToken(null);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
    
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--muted-foreground))]">Loading completed tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]"
            >
              Completed Tasks
            </motion.h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button asChild variant="outline" className="rounded-r-none border-r-0">
                <a href="/tasks">All Tasks</a>
              </Button>
              <Button asChild variant="outline" className="rounded-none border-r-0">
                <a href="/tasks/pending">Pending</a>
              </Button>
              <Button asChild variant="secondary" className="rounded-l-none">
                <a href="/tasks/completed">Completed</a>
              </Button>
            </div>
          </div>

          {todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-medium text-[rgb(var(--foreground))] mb-2">
                  No completed tasks
                </h3>
                <p className="text-[rgb(var(--muted-foreground))]">
                  Complete some tasks to see them here!
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card animated={true} title={`Completed Tasks (${todos.length})`}>
                <div className="space-y-4">
                  {todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
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
                            <p
                              className={`font-medium line-through text-[rgb(var(--muted-foreground))] opacity-70`}
                            >
                              {todo.title}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                              todo.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : 'Medium'}
                            </span>
                          </div>
                          {todo.description && (
                            <p className={`text-sm mt-2 line-through text-[rgb(var(--muted-foreground))] opacity-50`}>
                              {todo.description}
                            </p>
                          )}
                          {todo.dueDate && (
                            <p className={`text-xs mt-2 line-through text-[rgb(var(--muted-foreground))] opacity-50`}>
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-3 ml-4 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(todo)}
                          className="p-2 text-[rgb(var(--primary))] bg-transparent hover:bg-[rgb(var(--secondary)/0.5)] rounded-full transition-colors"
                        >
                          <span className="text-lg">✏️</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(todo.id)}
                          className="p-2 text-[rgb(var(--destructive))] bg-transparent hover:bg-[rgb(var(--secondary)/0.5)] rounded-full transition-colors"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[rgb(var(--card))] rounded-lg shadow-lg w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-[rgb(var(--foreground))] mb-4">Edit Task</h3>

                <Input
                  label="Title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  fullWidth
                  required
                />

                <Input
                  label="Description"
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  fullWidth
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
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

                  <Input
                    label="Due Date"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    fullWidth
                  />
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editCompleted}
                      onChange={(e) => setEditCompleted(e.target.checked)}
                      className="rounded border-[rgb(var(--border))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
                    />
                    <span className="ml-2 text-[rgb(var(--foreground))]">Completed</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="secondary" onClick={closeEditModal}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleEditTask}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}