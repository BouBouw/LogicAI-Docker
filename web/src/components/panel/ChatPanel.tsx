/**
 * ChatPanel - Interactive chat panel for testing workflows
 * Features:
 * - Real-time chat interface for workflow testing
 * - Message history with user/assistant messages
 * - Send messages to trigger workflow execution
 * - Display workflow responses
 * - Clean chat UI with dark mode
 */

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Trash2, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  nodeId?: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<string>;
  workflowId?: string;
  messages?: ChatMessage[];
}

export default function ChatPanel({
  isOpen,
  onClose,
  onSendMessage,
  workflowId,
  messages: initialMessages = [],
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && isExpanded) {
      inputRef.current?.focus();
    }
  }, [isOpen, isExpanded]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to workflow and get response
      const response = await onSendMessage(trimmedInput);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: `Erreur: ${error.message || 'Une erreur est survenue'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`bg-bg-card border-t border-white/10 transition-all duration-300 h-80 flex flex-col`}
      style={{
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Chat Workflow</h3>
            <p className="text-xs text-gray-500">
              {workflowId ? workflowId.slice(0, 8) : 'Test'} {messages.length > 0 && `• ${messages.length} messages`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Effacer l'historique"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {isExpanded && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="w-8 h-8 text-brand-blue" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Commencez la conversation</h4>
                <p className="text-xs text-gray-500 max-w-[200px]">
                  Envoyez un message pour tester votre workflow
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-brand-blue text-white'
                        : message.role === 'assistant'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : message.role === 'assistant' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[75%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-brand-blue text-white rounded-br-sm'
                          : message.role === 'assistant'
                          ? 'bg-gray-700 text-gray-100 rounded-bl-sm'
                          : 'bg-red-600/20 border border-red-600/50 text-red-400'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded-lg rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                rows={1}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 max-h-24"
                style={{
                  minHeight: '40px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-brand-blue hover:bg-brand-hover text-white rounded-lg disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                title="Envoyer (Entrée)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
            </p>
          </div>
        </>
      )}
    </div>
  );
}
