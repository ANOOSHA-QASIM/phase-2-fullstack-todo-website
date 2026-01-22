'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
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

        setTodos(tasks);
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
    const response = await apiClient.updateTask(editingTask.id, {
      title: editTitle,
      description: editDescription,
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
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center md:ml-64">
          <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-6 md:ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">All Tasks</h1>
            <Button onClick={handleLogout}>Logout</Button>
          </div>

          <Button asChild className="mb-6">
            <a href="/tasks/add">Add New Task</a>
          </Button>

          <Card>
            {todos.length === 0 ? (
              <p className="text-center text-muted">No tasks found</p>
            ) : (
              <div className="space-y-3">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex justify-between items-center p-3 bg-muted rounded"
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTask(todo.id)}
                      />
                      <span
                        className={`ml-3 ${
                          todo.completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {todo.title}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(todo)}>✏️</button>
                      <button onClick={() => handleDeleteTask(todo.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-6 rounded w-full max-w-md">
            <h3 className="font-bold mb-4">Edit Task</h3>

            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <Input
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />

            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={editCompleted}
                onChange={e => setEditCompleted(e.target.checked)}
              />
              Completed
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
