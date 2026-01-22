'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

export default function AddTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        completed: false
      });

      if (response.success && response.data) {
        // Redirect to tasks page after successful creation
        router.push('/tasks');
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
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 md:ml-64">
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

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[rgb(var(--destructive)/0.1)] text-[rgb(var(--destructive))] rounded-md border border-[rgb(var(--destructive)/0.2)]"
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