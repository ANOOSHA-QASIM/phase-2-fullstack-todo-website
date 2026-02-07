'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Call the backend login endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      // Store the JWT token in localStorage
      if (data.data?.access_token) {
        localStorage.setItem('access_token', data.data.access_token);
        // Initialize the API client with the token
        const { apiClient } = await import('@/lib/api');
        apiClient.setToken(data.data.access_token);
        // Redirect to dashboard or home
        router.push('/dashboard');
      } else {
        throw new Error('No token received from server');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center antigravity-gradient-bg py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-md w-full"
        >
          <Card animated={true} title="Sign in to TalkTodo">
            {error && (
              <div className="mb-4 p-3 bg-[rgb(var(--destructive)/0.1)] text-[rgb(var(--destructive))] rounded-md border border-[rgb(var(--destructive)/0.2)] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                fullWidth
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                fullWidth
                required
              />

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-[rgb(var(--muted-foreground))]">
              <p>
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary)/0.8)]">
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>

    
    </div>
  );
}