/**
 * Chat page for Phase 3 AI-powered Todo Chatbot
 * Constitutional Compliance: This page strictly follows the Phase 3 System Constitution.
 * Requires authentication - redirects to login if not authenticated
 */


'use client';

import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/lib/auth';

import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

import { useEffect, useRef, useState } from 'react';
import { redirect } from 'next/navigation';

export default function ChatPage() {
  // Get authenticated user from JWT token
  const { userId, isAuthenticated } = useAuth();

  // Phase 6: T080, T083 - Sidebar state management with localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      redirect('/login');
    }
  }, [mounted, isAuthenticated]);

  if (!mounted) return null;

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !userId) {
    return null;
  }

  // Phase 5: T070, T075 - Conversation list management (authenticated mode)
  const { conversations, loading: conversationsLoading, refreshConversations } = useConversations();

  // Phase 5: T073, T074, T075 - Conversation management in useChat (authenticated mode)
  const {
    messages,
    conversationId,
    loading,
    error,
    sendMessage,
    loadConversation,
    handleConfirm,
    handleCancel,
    startNewConversation
  } = useChat({
    onConversationCreated: refreshConversations // Phase 5: T075
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 

  // Phase 6: T080 - Toggle sidebar
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Phase 6: T084, T086 - Select conversation and close sidebar on mobile
  const handleSelectConversation = async (convId: string) => {
    await loadConversation(convId);

    // Phase 6: T086 - Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Phase 6: T071 - New chat handler
  const handleNewChat = () => {
    startNewConversation();

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Show loading state while checking authentication
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
  //         <p className="text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Don't render if not authenticated (will redirect)
  // if (!isAuthenticated || !userId) {
  //   return null;
  // }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Phase 6: T078, T081, T082 - ChatSidebar with responsive layout */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        loading={conversationsLoading}
      />

      {/* Main content area - ChatGPT-style layout */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-[280px]' : 'ml-0'
        }`}
      >
        {/* Chat Container - Full height */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-6">💬</div>
                  <h2 className="text-3xl font-semibold text-gray-800 mb-3">
                    Welcome to TalkTodo Chat
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Manage your tasks through natural conversation
                  </p>
                  <div className="grid grid-cols-1 gap-3 text-left">
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                      <p className="text-sm text-gray-700">💡 "Add a task to buy groceries tomorrow"</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                      <p className="text-sm text-gray-700">📋 "Show me all my pending tasks"</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                      <p className="text-sm text-gray-700">✅ "Mark task 5 as complete"</p>
                    </div>
                  </div>
                  <div className="mt-6 text-sm text-gray-500">
                    <p>✨ Supports English, Urdu, and Roman Urdu</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    message={message}
                    onConfirm={message.requiresConfirmation ? handleConfirm : undefined}
                    onCancel={message.requiresConfirmation ? handleCancel : undefined}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-200 bg-white">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
