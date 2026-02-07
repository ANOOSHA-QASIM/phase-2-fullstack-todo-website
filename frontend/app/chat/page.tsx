'use client'


import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';

import Card from '@/components/ui/Card'; 
export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      

      <main className="flex-1 antigravity-gradient-bg py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <section className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--foreground))] mb-4">
                Chat with TalkTodo
              </h1>

              <p className="text-lg text-[rgb(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                Get help managing your tasks with our intelligent assistant. Ask questions, get suggestions, and streamline your workflow.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/dashboard">
                  <Button variant="outline">
                    Back to Tasks
                  </Button>
                </Link>

                <Link href="/chat">
                  <Button variant="secondary">
                    Start Chatting
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </section>

          <div className="flex justify-center">
            <Card animated={true} className="w-full max-w-2xl">
              <div className="flex justify-center space-x-4 mb-6 pt-6 px-6">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="transition-all duration-200"
                  >
                    Task Mode
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button
                    variant="secondary"
                    className="transition-all duration-200"
                  >
                    Chat Mode
                  </Button>
                </Link>
              </div>

              <div className="bg-[rgb(var(--muted))] rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
                    Chat Interface Coming Soon
                  </h3>
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Our intelligent assistant is ready to help you manage your tasks efficiently.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}