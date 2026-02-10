/**
 * NodeConfigModal - Modal for Node Configuration
 * Features:
 * - Opens as a centered modal overlay
 * - Dynamic form based on node type
 * - N8N-STYLE dynamic variables from selected input node's output structure
 * - DRAG AND DROP data sources into input fields
 * - Clean, focused UI
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Settings, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Braces, GripVertical, ChevronDownSquare, FolderOpen, FileText } from 'lucide-react';
import type { Edge } from '@xyflow/react';
import type { CustomNode, BaseNodeConfig } from '../../types/node';
import { NODE_TYPES_METADATA } from '../../types/node';
import { suggestVariables } from '../../lib/variableParser';
import {
  Webhook, Globe, Variable, GitBranch, Edit, Code, Filter, Hash, Grid, Clock,
  AlertCircle, PlaySquare, Activity, FileInput, Rss, Upload, Terminal, Database,
  Mail, MessageSquare, MessageCircle, Send, Table, HardDrive, Table2, Book, Trello,
  Bot, Mic, Archive, Lock, ArrowUpDown, File, GitMerge, Cpu,
  UserCheck, Sparkles, Shield, Search, Bug, Eye, Zap, Ghost,
  Smartphone, Laptop, PenTool, Monitor, Radio, Server, MousePointerClick, RefreshCw,
  Kanban, GitFork,
} from 'lucide-react';

// Sample output data for each node type (simulating actual execution results)
const NODE_OUTPUT_SAMPLES: Partial<Record<string, any>> = {
  webhook: {
    body: { username: 'john_doe', email: 'john@example.com' },
    headers: { 'content-type': 'application/json' },
    query: { source: 'web' },
    method: 'POST',
    path: '/webhook',
  },
  httpRequest: {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    data: {
      id: 123,
      name: 'Example Response',
      items: [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
      ],
    },
    duration: 245,
  },
  setVariable: {
    key: 'output.value',
    value: 'Hello World',
    previousValue: null,
  },
  condition: {
    condition: 'user.age > 18',
    result: true,
    matchedPath: 'true',
  },
  code: {
    result: 'Execution successful',
    output: { processed: true, count: 42 },
    logs: ['Line 1', 'Line 2'],
    executionTime: 150,
  },
  filter: {
    items: [{ id: 1, name: 'Filtered Item' }],
    filteredCount: 1,
    originalCount: 5,
  },
  mySQL: {
    rows: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
    rowCount: 2,
    fields: ['id', 'name', 'email'],
  },
  mongoDB: {
    documents: [
      { _id: '507f1f77bcf86cd799439011', name: 'Document 1', value: 100 },
      { _id: '507f191e810c19729de860ea', name: 'Document 2', value: 200 },
    ],
    count: 2,
  },
  redis: {
    key: 'mykey',
    value: 'myvalue',
    ttl: 3600,
  },
  openAI: {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: 1677652288,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'Hello! How can I help you today?',
      },
      finishReason: 'stop',
    }],
    usage: {
      promptTokens: 10,
      completionTokens: 9,
      totalTokens: 19,
    },
  },
  email: {
    accepted: ['recipient@example.com'],
    rejected: [],
    messageId: '<12345@example.com>',
    response: '250 OK',
  },
  googleSheets: {
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjGMUUqptbfs',
    range: 'Sheet1!A1:E5',
    values: [
      ['Name', 'Email', 'Phone'],
      ['John Doe', 'john@example.com', '555-1234'],
      ['Jane Smith', 'jane@example.com', '555-5678'],
    ],
    rowCount: 3,
    columnCount: 3,
  },
  stripe: {
    id: 'pi_3MtweB2eZvKYlo2C1234abcd',
    object: 'payment_intent',
    amount: 2000,
    currency: 'usd',
    status: 'succeeded',
    description: 'Payment for order #1234',
  },
  slack: {
    ok: true,
    channel: 'C0123456789',
    timestamp: '1234567890.123456',
    message: { text: 'Message sent successfully', botId: 'B12345678' },
  },
  discord: {
    id: '123456789012345678',
    type: 0,
    content: 'Message sent to Discord',
    author: {
      id: '987654321098765432',
      username: 'Bot',
      discriminator: '1234',
      bot: true,
    },
    channel_id: '111222333444555666',
  },
  telegram: {
    ok: true,
    result: {
      message_id: 12345,
      from: { id: 987654321, is_bot: false, first_name: 'John' },
      chat: { id: 987654321, first_name: 'John', type: 'private' },
      date: 1234567890,
      text: 'Message sent via Telegram',
    },
  },
  whatsapp: {
    messaging_product: 'whatsapp',
    contacts: [{ input: '1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.1234567890' }],
  },
  notion: {
    object: 'list',
    results: [
      {
        id: 'page-123',
        archived: false,
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        properties: {
          title: { title: [{ text: { content: 'Example Page' } }] },
        },
      },
    ],
    has_more: false,
  },
  trello: {
    id: 'board123',
    name: 'Project Board',
    url: 'https://trello.com/b/board123',
    lists: [
      {
        id: 'list123',
        name: 'To Do',
        cards: [{ id: 'card123', name: 'Task 1', labels: ['urgent'] }],
      },
    ],
  },
  airtable: {
    records: [
      {
        id: 'rec123',
        createdTime: '2024-01-01T00:00:00.000Z',
        fields: {
          Name: 'John Doe',
          Email: 'john@example.com',
          Status: 'Active',
        },
      },
    ],
  },
  github: {
    id: 12345678,
    name: 'example-repo',
    full_name: 'user/example-repo',
    private: false,
    owner: { login: 'user', id: 987654321 },
    html_url: 'https://github.com/user/example-repo',
    description: 'Example repository',
  },
  figma: {
    name: 'Example File',
    key: 'ABC123',
    document: {
      id: 'doc123',
      children: [
        {
          type: 'CANVAS',
          name: 'Page 1',
          children: [{ type: 'FRAME', name: 'Frame 1' }],
        },
      ],
    },
  },
};

interface NodeConfigModalProps {
  selectedNode: CustomNode | null;
  onNodeUpdate: (nodeId: string, config: BaseNodeConfig) => void;
  onClose: () => void;
  isOpen: boolean;
  nodes: CustomNode[];
  edges: Edge[];
}

// Draggable Variable Item Component
interface DraggableVariableProps {
  variable: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconClassName?: string;
  onDragStart: (variable: string) => void;
  onDragEnd: () => void;
}

function DraggableVariable({ variable, label, description, icon, iconClassName, onDragStart, onDragEnd }: DraggableVariableProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.setData('application/x-variable', variable);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(variable);
  };

  // Render icon - if it's a component, create element with className; if it's already a node, render as-is
  const renderIcon = () => {
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return React.createElement(IconComponent, { className: iconClassName || 'w-4 h-4' });
    }
    // If icon is already a React element, render it
    if (React.isValidElement(icon)) {
      return icon;
    }
    // Fallback for non-renderable icons
    return null;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-grab active:cursor-grabbing transition-all group border border-transparent hover:border-gray-600 select-none"
    >
      <div className="pointer-events-none cursor-grab text-gray-500 group-hover:text-gray-400">
        {React.createElement(GripVertical, { className: 'w-4 h-4' })}
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <code className="text-xs text-brand-blue font-mono block truncate">
          {variable}
        </code>
        <p className="text-[10px] text-gray-500 truncate">{label}</p>
      </div>
      <div className="text-gray-400 pointer-events-none">
        {renderIcon()}
      </div>
    </div>
  );
}

// JSON Explorer Component for dynamic variables
interface JsonExplorerProps {
  data: any;
  path?: string;
  onDragStart: (variable: string) => void;
  onDragEnd: () => void;
  level?: number;
}

function JsonExplorer({ data, path = '$json', onDragStart, onDragEnd, level = 0 }: JsonExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderValue = (key: string | null, value: any, currentPath: string) => {
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const variable = `{{ ${currentPath} }}`;
    const displayKey = key || '';

    if (isObject) {
      const isExpanded = expanded.has(currentPath);
      const itemCount = Object.keys(value).length;

      return (
        <div key={currentPath} className={level > 0 ? 'ml-4' : ''}>
          <div
            className="flex items-center gap-1 py-1 px-2 hover:bg-gray-800/50 rounded cursor-pointer transition-colors group"
            onClick={() => toggleExpand(currentPath)}
          >
            {isExpanded ? (
              <ChevronDownSquare className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            )}
            {isArray ? (
              <FolderOpen className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            ) : (
              <Braces className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-300 font-mono flex-1">{displayKey}</span>
            <span className="text-[10px] text-gray-600">{itemCount} items</span>
          </div>
          {isExpanded && (
            <div className="ml-2 border-l border-gray-700 pl-2">
              {Object.entries(value).map(([k, v]) => renderValue(k, v, `${currentPath}.${k}`))}
            </div>
          )}
        </div>
      );
    }

    return (
      <DraggableVariable
        key={currentPath}
        variable={variable}
        label={displayKey}
        description={String(value)}
        icon={
          <div className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded">
            {typeof value === 'string' ? (
              <FileText className="w-3 h-3 text-green-400" />
            ) : typeof value === 'number' ? (
              <Hash className="w-3 h-3 text-blue-400" />
            ) : typeof value === 'boolean' ? (
              <Activity className="w-3 h-3 text-orange-400" />
            ) : (
              <Variable className="w-3 h-3 text-gray-400" />
            )}
          </div>
        }
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    );
  };

  return (
    <div>
      {data !== null && typeof data === 'object' ? (
        <div className="space-y-0.5">
          {Object.entries(data).map(([key, value]) => renderValue(key, value, `${path}.${key}`))}
        </div>
      ) : (
        <DraggableVariable
          variable={`{{ ${path} }}`}
          label="Value"
          description={String(data)}
          icon={<Variable className="w-4 h-4 text-gray-400" />}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      )}
    </div>
  );
}

// Drop Zone Input Component
interface DropZoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  onVariableDrop?: (variable: string) => void;
  isDraggingOver?: boolean;
}

function DropZoneInput({ value, onChange, placeholder, type = 'text', rows = 4, onVariableDrop, isDraggingOver }: DropZoneInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData('application/x-variable');
    if (variable && onVariableDrop) {
      onVariableDrop(variable);
      // Focus the input after drop
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const inputClassName = `
    w-full px-3 py-2 bg-bg-card border rounded-lg text-white text-sm
        focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent
        font-mono transition-all duration-200
        ${isDraggingOver ? 'border-brand-blue ring-2 ring-brand-blue/30 bg-brand-blue/5' : 'border-gray-700 hover:border-gray-600'}
        ${type === 'textarea' ? 'resize-none' : ''}
  `;

  return (
    <div className="relative">
      {type === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={inputClassName}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={inputClassName}
        />
      )}
      {isDraggingOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-brand-blue/20 text-brand-blue text-xs px-2 py-1 rounded border border-brand-blue">
            Relâchez pour insérer la variable
          </div>
        </div>
      )}
    </div>
  );
}

export default function NodeConfigModal({
  selectedNode,
  onNodeUpdate,
  onClose,
  isOpen,
  nodes,
  edges,
}: NodeConfigModalProps) {
  const [config, setConfig] = useState<BaseNodeConfig>({});
  const [selectedInputNode, setSelectedInputNode] = useState<string | null>(null);
  const [selectedOutputNode, setSelectedOutputNode] = useState<string | null>(null);
  const [draggedVariable, setDraggedVariable] = useState<string | null>(null);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Update config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
      setSelectedInputNode(null);
      setSelectedOutputNode(null);
    }
  }, [selectedNode]);

  // Find connected nodes (input - nodes that connect to this node)
  const inputNodes = useMemo(() => {
    if (!selectedNode) return [];
    return nodes.filter(node =>
      edges.some(edge => edge.source === node.id && edge.target === selectedNode.id)
    );
  }, [selectedNode, edges, nodes]);

  // Find connected nodes (output - nodes that this node connects to)
  const outputNodes = useMemo(() => {
    if (!selectedNode) return [];
    return nodes.filter(node =>
      edges.some(edge => edge.source === selectedNode.id && edge.target === node.id)
    );
  }, [selectedNode, edges, nodes]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, newConfig);
    }
  };

  // Handle variable drop into field
  const handleVariableDrop = (fieldKey: string, variable: string) => {
    // Get current input element to find cursor position
    const input = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
      const currentValue = config[fieldKey] || '';
      const cursorPosition = input.selectionStart || currentValue.length;

      // Insert variable at cursor position
      const newValue =
        currentValue.slice(0, cursorPosition) +
        variable +
        currentValue.slice(input.selectionEnd || cursorPosition);

      handleConfigChange(fieldKey, newValue);

      // Move cursor after inserted variable
      setTimeout(() => {
        const newPosition = cursorPosition + variable.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const nodeTypeMetadata = selectedNode
    ? NODE_TYPES_METADATA[selectedNode.data.type]
    : null;

  // Get selected input node data
  const selectedInputNodeData = useMemo(() => {
    if (!selectedInputNode) return null;
    return nodes.find(n => n.id === selectedInputNode);
  }, [selectedInputNode, nodes]);

  // Get output data for selected input node (sample or actual)
  const selectedInputNodeOutput = useMemo(() => {
    if (!selectedInputNodeData) return null;
    // Use sample data based on node type
    return NODE_OUTPUT_SAMPLES[selectedInputNodeData.data.type] || {
      sample: 'Sample output data',
      data: { value: 'example' },
    };
  }, [selectedInputNodeData]);

  // Workflow and node variables (always available)
  const workflowVariables = useMemo(() => [
    {
      variable: '{{ $workflow.id }}',
      label: 'Workflow ID',
      description: 'ID du workflow actuel',
      icon: Settings,
      iconClassName: 'w-4 h-4 text-purple-400',
    },
    {
      variable: '{{ $workflow.name }}',
      label: 'Workflow Name',
      description: 'Nom du workflow',
      icon: Settings,
      iconClassName: 'w-4 h-4 text-purple-400',
    },
    {
      variable: '{{ $node.id }}',
      label: 'Node ID',
      description: 'ID du nœud actuel',
      icon: GitBranch,
      iconClassName: 'w-4 h-4 text-orange-400',
    },
    {
      variable: '{{ $node.name }}',
      label: 'Node Name',
      description: 'Nom du nœud',
      icon: GitBranch,
      iconClassName: 'w-4 h-4 text-orange-400',
    },
  ], []);

  const handleDragStart = (variable: string) => {
    setDraggedVariable(variable);
  };

  const handleDragEnd = () => {
    setDraggedVariable(null);
  };

  if (!isOpen || !selectedNode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - 3 Column Layout */}
      <div className="relative w-full max-w-7xl mx-4 rounded-2xl shadow-2xl border max-h-[90vh] overflow-hidden flex flex-col bg-bg-modal border-gray-700 animate-scaleIn"
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {getNodeIcon(selectedNode.data.type)}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {selectedNode.data.label}
              </h2>
              <p className="text-sm text-gray-400 capitalize">
                {selectedNode.data.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content - 3 Column Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Input Nodes & Variables */}
          <div className="w-80 border-r border-gray-700 overflow-y-auto p-4 space-y-4">
            {/* Input Nodes Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArrowLeft className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Entrées (Input)
                </h3>
              </div>

              {inputNodes.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowLeft className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucun nœud connecté</p>
                </div>
              ) : (
                inputNodes.map(node => (
                  <div
                    key={node.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedInputNode === node.id
                        ? 'bg-green-900/30 border-green-500/50'
                        : 'bg-bg-card border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedInputNode(node.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getNodeIcon(node.data.type)}
                      <span className="text-sm font-medium text-white truncate">
                        {node.data.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {node.data.type}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Variables Section - Draggable & Dynamic */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Braces className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Variables (Drag & Drop)
                </h3>
              </div>

              {!selectedInputNode ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-3">
                    Sélectionnez un nœud d'entrée ci-dessus pour explorer ses données 👆
                  </p>
                  <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 text-center mb-3">Variables globales</p>
                    {workflowVariables.map((item) => (
                      <DraggableVariable
                        key={item.variable}
                        variable={item.variable}
                        label={item.label}
                        description={item.description}
                        icon={item.icon}
                        iconClassName={item.iconClassName}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Selected Node Info */}
                  <div className="p-2 bg-green-900/20 rounded border border-green-500/20">
                    <p className="text-xs text-green-400 font-medium mb-1">
                      Nœud sélectionné
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedInputNodeData?.data.label} ({selectedInputNodeData?.data.type})
                    </p>
                  </div>

                  {/* JSON Explorer - Dynamic Variables */}
                  <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <p className="text-xs text-brand-blue font-medium mb-2 flex items-center gap-1">
                      <Braces className="w-3 h-3" />
                      Structure de sortie
                    </p>
                    <p className="text-[10px] text-gray-500 mb-3">
                      Cliquez pour développer, glissez pour insérer
                    </p>
                    <JsonExplorer
                      data={selectedInputNodeOutput}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  </div>

                  {/* Workflow Variables (always available at bottom) */}
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-2 text-center">Variables globales</p>
                    <div className="grid grid-cols-2 gap-1">
                      {workflowVariables.map((item) => (
                        <div
                          key={item.variable}
                          draggable
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.setData('application/x-variable', item.variable);
                            e.dataTransfer.effectAllowed = 'copy';
                            handleDragStart(item.variable);
                          }}
                          onDragEnd={handleDragEnd}
                          className="flex items-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-gray-600"
                        >
                          <div className="shrink-0 text-gray-500 text-[10px]">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          <code className="text-[10px] text-brand-blue font-mono truncate">
                            {item.variable.replace('{{ ', '').replace(' }}', '')}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Panel - Configuration */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Description */}
            {nodeTypeMetadata?.description && (
              <div className="p-3 bg-bg-card rounded-lg">
                <p className="text-sm text-gray-400">
                  {nodeTypeMetadata.description}
                </p>
              </div>
            )}

            {/* Drag Indicator */}
            {draggedVariable && (
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-brand-blue" />
                <div className="flex-1">
                  <p className="text-xs text-brand-blue font-medium">
                    Glissez la variable dans un champ ci-dessous
                  </p>
                  <code className="text-[10px] text-brand-blue/70">
                    {draggedVariable}
                  </code>
                </div>
              </div>
            )}

            {/* Configuration Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Configuration
              </h3>

              {nodeTypeMetadata &&
                Object.entries(nodeTypeMetadata.config).map(([key, fieldConfig]) => {
                  const fieldMeta = fieldConfig as {
                    type: 'text' | 'textarea' | 'select' | 'number' | 'boolean';
                    label: string;
                    placeholder?: string;
                    options?: { label: string; value: string }[];
                    defaultValue?: any;
                  };

                  const isTextField = fieldMeta.type === 'text' || fieldMeta.type === 'textarea';
                  const isActiveField = activeFieldKey === key;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border transition-all ${
                        isActiveField ? 'bg-brand-blue/5 border-brand-blue/30' : 'bg-bg-card border-gray-700'
                      }`}
                      onMouseEnter={() => isTextField && setActiveFieldKey(key)}
                      onMouseLeave={() => setActiveFieldKey(null)}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {fieldMeta.label}
                      </label>
                      {fieldMeta.type === 'select' ? (
                        <select
                          value={config[key] || fieldMeta.defaultValue || ''}
                          onChange={(e) =>
                            handleConfigChange(key, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 hover:border-gray-600 cursor-pointer"
                        >
                          {fieldMeta.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : fieldMeta.type === 'boolean' ? (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config[key] || false}
                            onChange={(e) =>
                              handleConfigChange(key, e.target.checked)
                            }
                            className="w-5 h-5 rounded border-gray-600 text-brand-blue focus:ring-brand-blue focus:ring-offset-0 transition-all duration-200"
                          />
                          <span className="text-sm text-gray-300">
                            {config[key] ? 'Activé' : 'Désactivé'}
                          </span>
                        </label>
                      ) : isTextField ? (
                        <DropZoneInput
                          value={config[key] || ''}
                          onChange={(value) => handleConfigChange(key, value)}
                          placeholder={fieldMeta.placeholder}
                          type={fieldMeta.type === 'textarea' ? 'textarea' : 'text'}
                          rows={4}
                          onVariableDrop={(variable) => handleVariableDrop(key, variable)}
                          isDraggingOver={isActiveField && isDraggingOver}
                        />
                      ) : (
                        <input
                          type="number"
                          value={config[key] || ''}
                          onChange={(e) =>
                            handleConfigChange(key, parseFloat(e.target.value) || 0)
                          }
                          placeholder={fieldMeta.placeholder}
                          className="w-full px-3 py-2 bg-bg-card border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 hover:border-gray-600"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Panel - Output Nodes */}
          <div className="w-80 border-l border-gray-700 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                Sorties (Output)
              </h3>
            </div>

            {outputNodes.length === 0 ? (
              <div className="text-center py-8">
                <ArrowRight className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun nœud connecté</p>
              </div>
            ) : (
              outputNodes.map(node => (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedOutputNode === node.id
                      ? 'bg-blue-900/30 border-blue-500/50'
                      : 'bg-bg-card border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedOutputNode(node.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getNodeIcon(node.data.type)}
                    <span className="text-sm font-medium text-white truncate">
                      {node.data.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">
                    {node.data.type}
                  </p>
                  {selectedOutputNode === node.id && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-2">
                        Ce nœud recevra les données du nœud actuel
                      </p>
                      <div className="space-y-1.5">
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.setData('application/x-variable', '{{ $json }}');
                            e.dataTransfer.effectAllowed = 'copy';
                            handleDragStart('{{ $json }}');
                          }}
                          onDragEnd={handleDragEnd}
                          className="flex items-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-gray-600 group"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <code className="text-xs text-brand-blue font-mono flex-1">
                            {'{{ $json }}'}
                          </code>
                          <Braces className="w-3.5 h-3.5 text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.setData('application/x-variable', '{{ $workflow.id }}');
                            e.dataTransfer.effectAllowed = 'copy';
                            handleDragStart('{{ $workflow.id }}');
                          }}
                          onDragEnd={handleDragEnd}
                          className="flex items-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-gray-600 group"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <code className="text-xs text-purple-400 font-mono flex-1">
                            {'{{ $workflow.id }}'}
                          </code>
                          <Settings className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 bg-bg-modal">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-brand-blue hover:bg-brand-hover text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-bg-modal"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function getNodeIcon(type: string) {
  const iconMap: Partial<Record<string, { component: any; className: string }>> = {
    // CORE NODES
    webhook: { component: Webhook, className: 'w-6 h-6 text-purple-400' },
    httpRequest: { component: Globe, className: 'w-6 h-6 text-blue-400' },
    setVariable: { component: Variable, className: 'w-6 h-6 text-green-400' },
    condition: { component: GitBranch, className: 'w-6 h-6 text-orange-400' },
    editFields: { component: Edit, className: 'w-6 h-6 text-indigo-400' },
    code: { component: Code, className: 'w-6 h-6 text-violet-400' },
    filter: { component: Filter, className: 'w-6 h-6 text-cyan-400' },
    switch: { component: GitBranch, className: 'w-6 h-6 text-orange-400' },
    merge: { component: GitMerge, className: 'w-6 h-6 text-pink-400' },
    splitInBatches: { component: Grid, className: 'w-6 h-6 text-teal-400' },
    wait: { component: Clock, className: 'w-6 h-6 text-gray-400' },
    errorTrigger: { component: AlertCircle, className: 'w-6 h-6 text-red-400' },
    executeWorkflow: { component: PlaySquare, className: 'w-6 h-6 text-emerald-400' },
    limit: { component: Hash, className: 'w-6 h-6 text-lime-400' },
    sort: { component: ArrowUpDown, className: 'w-6 h-6 text-sky-400' },

    // TRIGGER NODES
    schedule: { component: Clock, className: 'w-6 h-6 text-amber-500' },
    onSuccessFailure: { component: Activity, className: 'w-6 h-6 text-rose-500' },
    formTrigger: { component: FileInput, className: 'w-6 h-6 text-blue-400' },
    chatTrigger: { component: MessageCircle, className: 'w-6 h-6 text-indigo-500' },
    clickTrigger: { component: MousePointerClick, className: 'w-6 h-6 text-pink-500' },
    emailTrigger: { component: Mail, className: 'w-6 h-6 text-gray-500' },
    httpPollTrigger: { component: RefreshCw, className: 'w-6 h-6 text-teal-500' },
    cronTrigger: { component: Clock, className: 'w-6 h-6 text-yellow-500' },

    // HTTP & DATA
    htmlExtract: { component: Globe, className: 'w-6 h-6 text-green-400' },
    rssRead: { component: Rss, className: 'w-6 h-6 text-orange-400' },
    ftp: { component: Upload, className: 'w-6 h-6 text-purple-400' },
    ssh: { component: Terminal, className: 'w-6 h-6 text-gray-500' },

    // DATABASE
    mySQL: { component: Database, className: 'w-6 h-6 text-blue-600' },
    mongoDB: { component: Database, className: 'w-6 h-6 text-green-600' },
    redis: { component: Database, className: 'w-6 h-6 text-red-600' },
    supabase: { component: Database, className: 'w-6 h-6 text-emerald-500' },

    // COMMUNICATION
    email: { component: Mail, className: 'w-6 h-6 text-gray-500' },
    slack: { component: MessageSquare, className: 'w-6 h-6 text-purple-600' },
    discord: { component: MessageCircle, className: 'w-6 h-6 text-indigo-500' },
    telegram: { component: Send, className: 'w-6 h-6 text-cyan-500' },
    whatsApp: { component: MessageSquare, className: 'w-6 h-6 text-green-500' },

    // CLOUD PRODUCTIVITY
    googleSheets: { component: Table, className: 'w-6 h-6 text-green-600' },
    googleDrive: { component: HardDrive, className: 'w-6 h-6 text-yellow-500' },
    airtable: { component: Table2, className: 'w-6 h-6 text-blue-500' },
    notion: { component: Book, className: 'w-6 h-6 text-gray-400' },
    trello: { component: Kanban, className: 'w-6 h-6 text-orange-500' },

    // AI/LLM
    openAI: { component: Bot, className: 'w-6 h-6 text-emerald-400' },
    aiAgent: { component: Mic, className: 'w-6 h-6 text-violet-400' },
    vectorStore: { component: Database, className: 'w-6 h-6 text-pink-400' },
    embeddings: { component: Cpu, className: 'w-6 h-6 text-cyan-400' },

    // BINARY
    readWriteBinaryFile: { component: File, className: 'w-6 h-6 text-gray-400' },
    compression: { component: Archive, className: 'w-6 h-6 text-orange-400' },
    crypto: { component: Lock, className: 'w-6 h-6 text-red-400' },

    // EXCLUSIVE CUSTOM NODES
    humanInTheLoop: { component: UserCheck, className: 'w-6 h-6 text-pink-500' },
    smartDataCleaner: { component: Sparkles, className: 'w-6 h-6 text-yellow-500' },
    aiCostGuardian: { component: Shield, className: 'w-6 h-6 text-cyan-500' },
    noCodeBrowserAutomator: { component: Globe, className: 'w-6 h-6 text-indigo-500' },
    aggregatorMultiSearch: { component: Search, className: 'w-6 h-6 text-teal-500' },
    liveCanvasDebugger: { component: Bug, className: 'w-6 h-6 text-lime-500' },
    socialMockupPreview: { component: Eye, className: 'w-6 h-6 text-violet-500' },
    rateLimiterBypass: { component: Zap, className: 'w-6 h-6 text-amber-500' },
    ghost: { component: Ghost, className: 'w-6 h-6 text-gray-400' },

    // ADVANCED INTEGRATION NODES
    appleEcosystem: { component: Laptop, className: 'w-6 h-6 text-gray-300' },
    androidEcosystem: { component: Smartphone, className: 'w-6 h-6 text-green-400' },
    gitHub: { component: GitFork, className: 'w-6 h-6 text-gray-300' },
    figma: { component: PenTool, className: 'w-6 h-6 text-pink-400' },
    windowsControl: { component: Monitor, className: 'w-6 h-6 text-blue-400' },
    streaming: { component: Radio, className: 'w-6 h-6 text-purple-400' },
    infrastructure: { component: Server, className: 'w-6 h-6 text-orange-400' },
  };

  const iconData = iconMap[type];
  if (!iconData) {
    return React.createElement(Variable, { className: 'w-6 h-6 text-gray-400' });
  }
  return React.createElement(iconData.component, { className: iconData.className });
}
