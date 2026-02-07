'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

import type { Todo } from '@/types/todo';

export default function DashboardPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
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
    const initializeDashboard = async () => {
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
        console.error('Dashboard initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks();

      if (response.success && response.data) {
        // Handle the response structure from backend
        // The API client automatically transforms snake_case to camelCase
        let tasks: Todo[] = [];

        if (Array.isArray(response.data)) {
          // Direct array of tasks
          tasks = response.data as Todo[];
        } else if ((response.data as any).tasks) {
          // Tasks wrapped in a data object
          tasks = (response.data as any).tasks as Todo[];
        }

        setTodos(tasks);

        // Calculate stats
        const total = tasks.length;
        const pending = tasks.filter(task => !task.completed).length;
        const completed = tasks.filter(task => task.completed).length;

        setStats({
          total,
          pending,
          completed
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const response = await apiClient.toggleTask(String(id));

      if (response.success && response.data) {
        setTodos(todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));

        // Recalculate stats
        const updatedTodos = todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );

        const total = updatedTodos.length;
        const pending = updatedTodos.filter(task => !task.completed).length;
        const completed = updatedTodos.filter(task => task.completed).length;

        setStats({
          total,
          pending,
          completed
        });
      } else {
        console.error('Failed to toggle task:', response.error);
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
        // Update the todo list with the response data (already transformed to camelCase)
        setTodos(todos.map(todo =>
          todo.id === editingTask.id ? { ...todo, ...response.data! } : todo
        ));

        // Recalculate stats
        const updatedTodos = todos.map(todo =>
          todo.id === editingTask.id ? { ...todo, ...response.data! } : todo
        );

        const total = updatedTodos.length;
        const pending = updatedTodos.filter(task => !task.completed).length;
        const completed = updatedTodos.filter(task => task.completed).length;

        setStats({
          total,
          pending,
          completed
        });

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
            <p className="text-[rgb(var(--muted-foreground))]">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
  

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]"
            >
              Dashboard
            </motion.h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              <Card animated={true} className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 dark:from-teal-900/30 dark:to-teal-900/10 dark:border-teal-700">
                <div className="flex items-center">
                  <div className="bg-teal-500 text-white p-3 rounded-lg mr-4 dark:bg-teal-400 dark:text-gray-900">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <p className="text-sm text-teal-600 font-medium dark:text-teal-300">Total Tasks</p>
                    <p className="text-3xl font-bold text-[rgb(var(--foreground))] dark:text-white">{stats.total}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Pending Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <Card animated={true} className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/30 dark:to-yellow-900/10 dark:border-yellow-700">
                <div className="flex items-center">
                  <div className="bg-yellow-500 text-white p-3 rounded-lg mr-4 dark:bg-yellow-400 dark:text-gray-900">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium dark:text-yellow-300">Pending</p>
                    <p className="text-3xl font-bold text-[rgb(var(--foreground))] dark:text-white">{stats.pending}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Completed Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              <Card animated={true} className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/30 dark:to-green-900/10 dark:border-green-700">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white p-3 rounded-lg mr-4 dark:bg-green-400 dark:text-gray-900">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium dark:text-green-300">Completed</p>
                    <p className="text-3xl font-bold text-[rgb(var(--foreground))] dark:text-white">{stats.completed}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Tabs for navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button asChild variant="outline" className="rounded-r-none border-r-0">
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

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.2 }}
            className="mb-8"
          >
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild variant="primary">
                  <a href="/tasks/add">Add New Task</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="/chat">Chat with Assistant</a>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.2 }}
          >
            <Card title="Recent Tasks">
              {todos.slice(0, 5).map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.2 }}
                  className="flex items-start justify-between p-4 border-b border-[rgb(var(--border))] last:border-0 antigravity-card-no-border"
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTask(todo.id)}
                      className="w-5 h-5 text-[rgb(var(--primary))] rounded cursor-pointer border-[rgb(var(--border))] bg-white focus:ring-[rgb(var(--primary))] focus:ring-offset-2 mt-0.5 mr-3 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))]': 'text-[rgb(var(--foreground))]'}`}>
                          {todo.title}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          todo.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : 'Medium'}
                        </span>
                      </div>
                      {todo.description && (
                        <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))] opacity-70' : 'text-[rgb(var(--muted-foreground))]'} dark:text-[rgb(var(--muted-foreground))]`}>
                          {todo.description}
                        </p>
                      )}
                      {todo.dueDate && (
                        <p className={`text-xs mt-1 ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))] opacity-70' : 'text-[rgb(var(--muted-foreground))]'} dark:text-[rgb(var(--muted-foreground))]`}>
                          Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => openEditModal(todo)}
                      className="text-[rgb(var(--primary))] hover:opacity-80 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <span className={`text-sm ${todo.completed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {todo.completed ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {todos.length === 0 && (
                <p className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                  No tasks yet. Add your first task!
                </p>
              )}
            </Card>
          </motion.div>

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