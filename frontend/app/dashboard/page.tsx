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
  
  type GetTasksResponse = Todo[] | { tasks: Todo[] };


  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks();

      if (response.success && response.data) {
        // Handle the response structure from backend
        const data = response.data as GetTasksResponse;

        const tasks: Todo[] = Array.isArray(data)
        ? data
        : data.tasks ?? [];


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

        // Recalculate stats
        const updatedTodos = todos.map(todo =>
          todo.id === editingTask.id ? { ...todo, title: response.data!.title, description: response.data!.description, completed: response.data!.completed } : todo
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
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center md:ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--primary))] mx-auto mb-4"></div>
            <p className="text-[rgb(var(--muted-foreground))]">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 md:ml-64">
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
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.total}</p>
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
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <div className="flex items-center">
                  <div className="bg-yellow-500 text-white p-3 rounded-lg mr-4">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.pending}</p>
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
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                    <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{stats.completed}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
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
                  <a href="/tasks/pending">View Pending</a>
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
                  className="flex items-center justify-between p-3 border-b border-[rgb(var(--border))] last:border-0"
                >
                  <div className="flex items-center">
                    <span className={`mr-3 ${todo.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                      {todo.completed ? '✅' : '⏳'}
                    </span>
                    <span className={`truncate ${todo.completed ? 'line-through text-[rgb(var(--muted-foreground))]': 'text-[rgb(var(--foreground))]'}`}>
                      {todo.title}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(todo)}
                      className="text-[rgb(var(--primary))] hover:opacity-80"
                    >
                      Edit
                    </button>
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      {todo.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {todos.length === 0 && (
                <p className="text-center py-4 text-[rgb(var(--muted-foreground))]">
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
            <div className="bg-[rgb(var(--primary))] text-white p-4 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-colors">
              <span className="text-xl">💬</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}