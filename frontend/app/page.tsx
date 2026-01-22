'use client'

import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function HomePage() {
  const features = [
    {
      icon: '⚡',
      title: 'Add & Manage Tasks Easily',
      description: 'Simple interface to create and organize your tasks in seconds.'
    },
    {
      icon: '✅',
      title: 'Pending & Completed Tracking',
      description: 'Keep track of what needs to be done and what you\'ve finished.'
    },
    {
      icon: '📊',
      title: 'Visual Dashboard Overview',
      description: 'Get insights into your productivity and task completion rates.'
    },
    {
      icon: '🚀',
      title: 'Clean & Fast Workflow',
      description: 'Designed for speed and simplicity to maximize your focus.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 antigravity-gradient-bg py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--foreground))] mb-4">
                Plan smarter. Finish faster. Stay in control.
              </h1>

              <p className="text-lg text-[rgb(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                A simple, powerful task manager that helps you focus on what matters most.
                Get more done with less stress.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <Button asChild variant="primary">
                  <a href="/signup">Get Started</a>
                </Button>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-12 text-center">
              Powerful Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.2 }}
                  className="antigravity-card p-6 rounded-lg"
                >
                  <div className="flex items-start">
                    <span className="text-3xl mr-4">{feature.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[rgb(var(--muted-foreground))]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

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