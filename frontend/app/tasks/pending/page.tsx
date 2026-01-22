'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
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


export default function PendingTasksPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
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
        const data = response.data as TasksApiResponse;

        const tasks: Todo[] = Array.isArray(data)
          ? data
          : data.tasks;

        const pendingTasks = tasks.filter(task => !task.completed);
        setTodos(pendingTasks);
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
        completed: editCompleted
      });

      if (response.success && response.data) {
        setTodos(todos.map(todo =>
          todo.id === editingTask.id ? { ...todo, title: response.data!.title, description: response.data!.description, completed: response.data!.completed } : todo
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
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center md:ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--muted-foreground))]">Loading pending tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]"
            >
              Pending Tasks
            </motion.h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-[rgb(var(--primary)/0.1)] rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <h3 className="text-lg font-medium text-[rgb(var(--foreground))] mb-2">
                  No pending tasks
                </h3>
                <p className="text-[rgb(var(--muted-foreground))]">
                  All caught up! Add a new task or check completed ones.
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card title={`Pending Tasks (${todos.length})`}>
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-4 bg-[rgb(var(--muted))] rounded-md hover:bg-[rgb(var(--muted)/0.8)] transition-colors group"
                    >
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTask(todo.id)}
                          className="w-4 h-4 text-[rgb(var(--primary))] rounded cursor-pointer border-[rgb(var(--border))] bg-white focus:ring-[rgb(var(--primary))] focus:ring-offset-2"
                        />
                        <div className="ml-4 flex-1 min-w-0">
                          <p
                            className={`font-medium text-[rgb(var(--foreground))]`}
                          >
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className={`text-sm mt-1 text-[rgb(var(--muted-foreground))]`}>
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => openEditModal(todo)}
                          className="p-2 text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.1)] rounded-full transition-colors"
                        >
                          <span className="text-lg">✏️</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(todo.id)}
                          className="p-2 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive)/0.1)] rounded-full transition-colors"
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

          {/* Chatbot */}
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-[rgb(var(--primary))] text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-[rgb(var(--primary)/0.9)] transition-colors">
              <span className="text-xl">💬</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}