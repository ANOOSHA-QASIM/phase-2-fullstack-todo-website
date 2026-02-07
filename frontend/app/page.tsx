'use client'


import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const features = [
    {
      icon: '📋',
      title: 'Task Management',
      description: 'Easily create, organize, and prioritize your daily tasks with our intuitive interface.'
    },
    {
      icon: '🤖',
      title: 'AI Chatbot Assistant',
      description: 'Get smart recommendations and assistance with our integrated AI chatbot.'
    },
    {
      icon: '⏰',
      title: 'Priority & Due Dates',
      description: 'Set priorities and deadlines to stay on top of your most important tasks.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
   

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
                Your Tasks, Smarter. Your Day, Easier.
              </h1>

              <p className="text-lg text-[rgb(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                A professional SaaS-grade task management platform designed to boost your productivity.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/signup">
                  <Button variant="primary">
                    Start for Free
                  </Button>
                </Link>

                <Link href="/login">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
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
                >
                  <Card animated={true} className="p-6">
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
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      
    </div>
  );
}