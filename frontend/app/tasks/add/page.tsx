'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';



export default function AddTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      setIsLoading(false);
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        // No token, redirect to login
        router.push('/login');
        return;
      }

      // Initialize API client with token
      apiClient.setToken(token);

      const response = await apiClient.createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.dueDate || null,
        completed: false
      });

      if (response.success && response.data) {
        // Redirect to tasks page after successful creation
        router.push('/dashboard');
      } else {
        setError('Failed to create task');
      }
    } catch (err: any) {
      setError('Error creating task');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    apiClient.setToken(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
    
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl md:text-3xl font-bold text-[rgb(var(--foreground))]"
            >
              Add New Task
            </motion.h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button asChild variant="outline" className="rounded-r-none border-r-0">
                <a href="/dashboard">All Tasks</a>
              </Button>
              <Button asChild variant="outline" className="rounded-none border-r-0">
                <a href="/tasks/pending">Pending</a>
              </Button>
              <Button asChild variant="outline" className="rounded-l-none">
                <a href="/tasks/completed">Completed</a>
              </Button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 text-[rgb(var(--destructive))] rounded-md border border-red-200"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card title="Create Task">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Task Title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  fullWidth
                  required
                />

                <Input
                  label="Description (optional)"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  fullWidth
                />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PRIORITY */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Priority
                    </label>

                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as 'low' | 'medium' | 'high',
                        })
                      }
                      className="w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border border-[rgb(var(--border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* DUE DATE */}
                  <Input
                    label="Due Date (optional)"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dueDate: e.target.value,
                      })
                    }
                    fullWidth
                  />
                </div>


                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Task'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}