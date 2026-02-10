/**
 * ExecutionLogsPanel - Panel for displaying node execution logs
 * Features:
 * - Shows execution logs for all nodes
 * - Displays errors, success, and running status
 * - Collapsible panel
 * - Auto-scroll to latest logs
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, X, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'running' | 'success' | 'error';
  message: string;
  timestamp: Date;
  duration?: number;
  details?: any;
}

interface ExecutionLogsPanelProps {
  logs: ExecutionLog[];
  onClear: () => void;
  onClose: () => void;
}

export default function ExecutionLogsPanel({ logs, onClear, onClose }: ExecutionLogsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  return (
    <div
      className={`bg-bg-card border-t border-white/10 transition-all duration-300 ${
        isExpanded ? 'h-80' : 'h-12'
      }`}
      style={{
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Logs d'exécution</h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300">
            {logs.length}
          </span>
          {logs.some((log) => log.status === 'running') && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
              En cours
            </span>
          )}
          {logs.some((log) => log.status === 'error') && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-300">
              Erreurs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 hover:bg-white/10 rounded transition-colors ${
              autoScroll ? 'text-orange-500' : 'text-gray-400'
            }`}
            title={autoScroll ? 'Auto-scroll activé' : 'Auto-scroll désactivé'}
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            Effacer
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Logs Content */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="overflow-y-auto p-4 space-y-2"
          style={{ maxHeight: 'calc(20rem - 3.5rem)' }}
        >
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Aucun log d'exécution</p>
              <p className="text-xs mt-1">Exécutez le workflow pour voir les logs</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${getStatusColor(log.status)} transition-all duration-200`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {log.nodeName}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {log.nodeType}
                      </span>
                      {log.duration && (
                        <span className="text-xs text-gray-400">
                          {log.duration}ms
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        log.status === 'error'
                          ? 'text-red-400'
                          : log.status === 'success'
                          ? 'text-green-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {log.message}
                    </p>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
                          Détails
                        </summary>
                        <pre className="mt-2 p-2 bg-black/30 rounded text-xs text-gray-400 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {log.timestamp.toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
