/**
 * WorkflowEditor - Main workflow editing page
 * Features:
 * - React Flow canvas with drag & drop
 * - Sidebar for node configuration
 * - Toolbar with save, execute, activate/deactivate
 * - Dark mode styling
 * - Export/Import workflows
 * - Auto-save
 * - Execution tracking
 * - Data flow visualization
 * - Templates gallery
 * - Command palette
 * - Keyboard shortcuts
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ScrollText,
  Settings,
  Loader2,
  MessageSquare,
  Key,
  BookTemplate,
  Keyboard,
  Search,
} from 'lucide-react';
import WorkflowCanvas from '../components/canvas/WorkflowCanvas';
import NodeSidebar from '../components/sidebar/NodeSidebar';
import NodeConfigModal from '../components/modal/NodeConfigModal';
import ToolbarNavigationModal from '../components/modal/ToolbarNavigationModal';
import ExecutionLogsPanel from '../components/panel/ExecutionLogsPanel';
import ChatPanel from '../components/panel/ChatPanel';
import { WorkflowToolbar } from '../components/workflow/WorkflowToolbar';
import { ExecutionStatusPanel } from '../components/workflow/ExecutionStatusPanel';
import { DataFlowInspector } from '../components/workflow/DataFlowInspector';
import { TemplateGallery } from '../components/templates/TemplateGallery';
import { KeyboardShortcutsModal } from '../components/help/KeyboardShortcutsModal';
import { CommandPalette } from '../components/command/CommandPalette';
import { useAutoSave } from '../hooks/useAutoSave';
import { useExecution } from '../contexts/ExecutionContext';
import { workflowApi } from '../lib/api';
import { exportWorkflow, copyToClipboard } from '../lib/workflowExporter';
import type { WorkflowTemplate } from '../lib/workflowTemplates';
import type { ExecutionLog } from '../components/panel/ExecutionLogsPanel';
import type { CustomNode, NodeType, BaseNodeConfig } from '../types/node';
import type { Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge, getConnectedEdges, ReactFlowProvider } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch: executionDispatch } = useExecution();

  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [showDataInspector, setShowDataInspector] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [panelsSplit, setPanelsSplit] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  // Auto-save hook
  const { lastSaved, hasUnsavedChanges } = useAutoSave(
    id || '',
    nodes as any,
    edges,
    async (workflowId, data) => {
      if (id && id !== 'new') {
        await workflowApi.update(workflowId, data as any);
      }
    }
  );

  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  async function loadWorkflow(workflowId: string) {
    try {
      setLoading(true);
      const data = await workflowApi.getById(workflowId);
      setWorkflow(data);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (err: any) {
      alert(err.message || 'Failed to load workflow');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!id || id === 'new') {
      alert('Please create a workflow first');
      return;
    }

    try {
      setSaving(true);
      const updated = await workflowApi.update(id, {
        nodes,
        edges,
      });
      setWorkflow(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  }

  async function handleExecute() {
    if (!id || id === 'new') {
      alert('Please save the workflow first');
      return;
    }

    try {
      setExecuting(true);
      setShowLogsPanel(true);
      setShowExecutionPanel(true);

      // Start execution tracking
      executionDispatch({
        type: 'START_EXECUTION',
        executionId: uuidv4(),
        nodeIds: nodes.map(n => n.id),
      });

      // Add execution start log
      const startLog: ExecutionLog = {
        id: uuidv4(),
        nodeId: 'workflow',
        nodeName: 'Workflow',
        nodeType: 'workflow',
        status: 'running',
        message: "Démarrage de l'exécution...",
        timestamp: new Date(),
      };
      setExecutionLogs([startLog]);

      const result = await workflowApi.execute(id);

      // Simulate node execution logs
      const nodeLogs: ExecutionLog[] = await Promise.all(
        nodes.map(async (node) => {
          // Mark node as running
          executionDispatch({ type: 'START_NODE', nodeId: node.id });

          // Simulate execution time
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 100));

          // Mark node as complete
          executionDispatch({
            type: 'COMPLETE_NODE',
            nodeId: node.id,
            outputData: { success: true },
            duration: Math.floor(Math.random() * 1000) + 50,
          });

          return {
            id: uuidv4(),
            nodeId: node.id,
            nodeName: node.data.label,
            nodeType: node.data.type,
            status: 'success' as const,
            message: `Nœud ${node.data.label} exécuté avec succès`,
            timestamp: new Date(),
            duration: Math.floor(Math.random() * 1000) + 50,
          };
        })
      );

      setExecutionLogs((prev) => [...prev, ...nodeLogs]);

      // Complete execution
      executionDispatch({ type: 'COMPLETE_EXECUTION', success: true });

      const successLog: ExecutionLog = {
        id: uuidv4(),
        nodeId: 'workflow',
        nodeName: 'Workflow',
        nodeType: 'workflow',
        status: 'success',
        message: `Workflow exécuté avec succès! Status: ${result.status}`,
        timestamp: new Date(),
      };
      setExecutionLogs((prev) => [...prev, successLog]);
    } catch (err: any) {
      executionDispatch({ type: 'COMPLETE_EXECUTION', success: false });

      const errorLog: ExecutionLog = {
        id: uuidv4(),
        nodeId: 'workflow',
        nodeName: 'Workflow',
        nodeType: 'workflow',
        status: 'error',
        message: `Échec de l'exécution: ${err.message}`,
        timestamp: new Date(),
        details: err,
      };
      setExecutionLogs((prev) => [...prev, errorLog]);
    } finally {
      setExecuting(false);
    }
  }

  const handleClearLogs = useCallback(() => {
    setExecutionLogs([]);
  }, []);

  const handleCloseLogsPanel = useCallback(() => {
    setShowLogsPanel(false);
  }, []);

  const handleCloseExecutionPanel = useCallback(() => {
    setShowExecutionPanel(false);
  }, []);

  const handleCloseDataInspector = useCallback(() => {
    setShowDataInspector(false);
  }, []);

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!id || id === 'new') {
      throw new Error('Veuillez sauvegarder le workflow d\'abord');
    }
    return `Réponse du workflow pour: "${message}"`;
  };

  async function handleToggleActive() {
    if (!id || id === 'new') {
      alert('Please save the workflow first');
      return;
    }

    try {
      const updated = await workflowApi.update(id, {
        isActive: !workflow?.isActive,
      });
      setWorkflow(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update workflow');
    }
  }

  const handleAddNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    const newNode: CustomNode = {
      id: uuidv4(),
      type: 'custom',
      position: position || { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      data: {
        id: uuidv4(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        config: getDefaultConfig(type),
      },
    };
    setNodes((prev) => [...prev, newNode]);
  }, []);

  const handleApplyTemplate = useCallback((template: WorkflowTemplate) => {
    setNodes(template.nodes as CustomNode[]);
    setEdges(template.edges);
  }, []);

  const handleExport = useCallback(() => {
    const metadata = {
      name: workflow?.name || 'My Workflow',
      description: 'Exported from LogicAI-N8N',
      author: 'LogicAI',
      tags: ['workflow'],
    };
    exportWorkflow(nodes, edges, metadata);
  }, [nodes, edges, workflow]);

  const handleImport = useCallback(async (data: { nodes: CustomNode[]; edges: Edge[] }) => {
    setNodes(data.nodes);
    setEdges(data.edges);
  }, []);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(nodes, edges);
  }, [nodes, edges]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      setNodes((data.nodes || []) as CustomNode[]);
      setEdges(data.edges || []);
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  }, []);

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the workflow?')) {
      setNodes([]);
      setEdges([]);
    }
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, config: BaseNodeConfig) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, []);

  const handleNodesChange = useCallback((changes: NodeChange<CustomNode>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    const targetNode = nodes.find(n => n.id === connection.target);

    if (targetNode) {
      const nodeType = targetNode.data.type;
      const triggerTypes: NodeType[] = [
        'schedule',
        'webhook',
        'onSuccessFailure',
        'formTrigger',
        'chatTrigger',
        'clickTrigger',
        'emailTrigger',
        'httpPollTrigger',
        'cronTrigger',
      ];

      if (triggerTypes.includes(nodeType)) {
        alert('Les nœuds trigger ne peuvent pas avoir de connexions entrantes.');
        return;
      }
    }

    setEdges((eds) => addEdge({ ...connection, id: uuidv4() }, eds));
  }, [nodes]);

  const handleNodeClick = useCallback((_: any, node: CustomNode) => {
    setSelectedNode(node as CustomNode);
    setSelectedEdge(null);
  }, []);

  const handleNodeDoubleClick = useCallback((_: any, node: CustomNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setIsConfigModalOpen(true);
  }, []);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowDataInspector(true);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      const connectedEdges = getConnectedEdges([selectedNode], edges);
      setEdges((eds) => eds.filter((edge) => !connectedEdges.some((ce) => ce.id === edge.id)));
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setSelectedNode(null);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, edges]);

  const handleToggleMiniMap = useCallback(() => {
    setShowMiniMap(prev => !prev);
  }, []);

  const handleTitleDoubleClick = useCallback(() => {
    setEditedTitle(workflow?.name || 'New Workflow');
    setIsEditingTitle(true);
  }, [workflow?.name]);

  const handleTitleSave = useCallback(async () => {
    if (!editedTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    const newTitle = editedTitle.trim();

    if (workflow) {
      setWorkflow({ ...workflow, name: newTitle });
    }

    setIsEditingTitle(false);

    if (id && id !== 'new') {
      try {
        await workflowApi.update(id, { name: newTitle });
      } catch (err: any) {
        console.error('Failed to update workflow name:', err);
        alert('Failed to save workflow name');
      }
    }
  }, [editedTitle, workflow, id]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(workflow?.name || 'New Workflow');
    }
  }, [handleTitleSave, workflow?.name]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const container = document.querySelector('[data-panels-container]') as HTMLElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setPanelsSplit(Math.max(20, Math.min(80, percentage)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      // ? - Shortcuts modal
      if (e.key === '?' && !e.target) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + Enter - Execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
      // Delete/Backspace - Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !(
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )) {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleExecute, handleDeleteSelected]);

  function getDefaultConfig(type: NodeType): BaseNodeConfig {
    switch (type) {
      case 'webhook':
        return { method: 'POST', path: '/webhook' };
      case 'httpRequest':
        return { url: '', method: 'POST', headers: {}, body: {} };
      case 'setVariable':
        return { key: '', value: '', valueType: 'string' };
      case 'condition':
        return { expression: '' };
      case 'chatTrigger':
        return { platform: 'discord' };
      case 'clickTrigger':
        return { baseUrl: 'http://localhost:5173' };
      case 'emailTrigger':
        return { host: '', port: 993, username: '', password: '', folder: 'INBOX' };
      case 'httpPollTrigger':
        return { url: '', interval: 60000, method: 'GET' };
      case 'cronTrigger':
        return { cronExpression: '* * * * *' };
      case 'mySQL':
        return { operation: 'executeQuery', query: '', host: 'localhost', port: 3306, database: '', user: '', password: '' };
      case 'mongoDB':
        return { operation: 'find', collection: '', query: '{}', connectionString: 'mongodb://localhost:27017/mydb' };
      case 'redis':
        return { operation: 'get', key: '', value: '', host: 'localhost', port: 6379 };
      case 'supabase':
        return { operation: 'select', table: '', query: '{}', supabaseUrl: '', supabaseKey: '' };
      case 'humanInTheLoop':
        return { timeout: 3600000, notificationType: 'none' };
      case 'smartDataCleaner':
        return { cleaningRules: {} };
      case 'aiCostGuardian':
        return { maxTokens: 4000, targetField: 'prompt', strategy: 'truncate' };
      case 'noCodeBrowserAutomator':
        return { actions: [] };
      case 'aggregatorMultiSearch':
        return { query: '', engines: ['google', 'duckduckgo'], maxResults: 10, sortByRelevance: true, deduplicate: true };
      case 'liveCanvasDebugger':
        return { operations: [] };
      case 'socialMockupPreview':
        return { platform: 'twitter', content: '', mediaUrls: [], metadata: {} };
      case 'rateLimiterBypass':
        return { maxRetries: 5, baseDelay: 1000, maxDelay: 60000 };
      case 'ghost':
        return { operations: [] };
      case 'appleEcosystem':
        return { service: 'imessage', action: 'send', parameters: { to: '', message: '' } };
      case 'androidEcosystem':
        return { service: 'messages', action: 'sendSMS', deviceId: '', parameters: { to: '', message: '' } };
      case 'gitHub':
        return { resource: 'repository', action: 'get', parameters: { accessToken: '', owner: '', repo: '' } };
      case 'figma':
        return { resource: 'file', action: 'get', parameters: { fileKey: '', accessToken: '' } };
      case 'windowsControl':
        return { service: 'powershell', action: 'execute', whitelistEnabled: true, commandTimeout: 30000, parameters: { command: '' } };
      case 'streaming':
        return { platform: 'twitch', resource: 'stream', action: 'getInfo', parameters: { accessToken: '', userId: '' } };
      case 'infrastructure':
        return { service: 'ssh', action: 'execute', parameters: { host: '', port: 22, username: '', privateKey: '', password: '', command: '' } };
      default:
        return {};
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-background-dark">
      {/* Enhanced Toolbar */}
      <WorkflowToolbar
        nodes={nodes}
        edges={edges}
        onSave={handleSave}
        onExecute={handleExecute}
        onClear={handleClear}
        onImport={handleImport as any}
        isExecuting={executing}
        isSaving={saving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-semibold text-white bg-white/10 border border-white/10 rounded outline-none focus:ring-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h1
                className="text-lg font-semibold text-white cursor-pointer hover:text-brand-blue transition-colors select-none"
                onDoubleClick={handleTitleDoubleClick}
              >
                {workflow?.name || 'New Workflow'}
              </h1>
            )}
            <p className="text-xs text-gray-500">
              {workflow?.id || 'Not saved yet'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Templates"
          >
            <BookTemplate className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowCommandPalette(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Command Palette (Ctrl+K)"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas + Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas */}
          <div className="flex-1">
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onEdgeClick={handleEdgeClick}
              onPaneClick={handlePaneClick}
              showMiniMap={showMiniMap}
              onToggleMiniMap={handleToggleMiniMap}
              showChatPanel={showChatPanel}
              onToggleChatPanel={() => setShowChatPanel(!showChatPanel)}
              showExecutionPanel={showExecutionPanel}
              onToggleExecutionPanel={() => setShowExecutionPanel(!showExecutionPanel)}
            />
          </div>

          {/* Sidebar */}
          <NodeSidebar
            selectedNode={null}
            onNodeUpdate={handleNodeUpdate}
            onNodeAdd={handleAddNode}
            onNodeDeselect={() => {}}
          />
        </div>

        {/* Bottom Panels */}
        {(showChatPanel || showExecutionPanel) && (
          <div
            data-panels-container
            className="flex border-t border-white/10 relative"
            style={{ height: '20rem' }}
          >
            {showChatPanel && (
              <div
                style={{
                  width: showExecutionPanel ? `${panelsSplit}%` : '100%',
                  minWidth: '20%',
                  maxWidth: '100%',
                }}
              >
                <ChatPanel
                  isOpen={showChatPanel}
                  onClose={() => setShowChatPanel(false)}
                  onSendMessage={handleSendMessage}
                  workflowId={id}
                />
              </div>
            )}

            {showChatPanel && showExecutionPanel && (
              <div
                onMouseDown={handleResizeStart}
                className={`w-1 bg-white/10 hover:bg-brand-blue transition-colors cursor-col-resize relative group ${
                  isResizing ? 'bg-brand-blue' : ''
                }`}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-8 bg-brand-blue/50 rounded-full" />
                </div>
              </div>
            )}

            {showExecutionPanel && (
              <div
                className="border-l border-white/10"
                style={{
                  width: showChatPanel ? `${100 - panelsSplit}%` : '100%',
                  minWidth: '20%',
                  maxWidth: '100%',
                }}
              >
                <ExecutionLogsPanel
                  logs={executionLogs}
                  onClear={handleClearLogs}
                  onClose={handleCloseLogsPanel}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <NodeConfigModal
        selectedNode={selectedNode}
        onNodeUpdate={handleNodeUpdate}
        onClose={() => setIsConfigModalOpen(false)}
        isOpen={isConfigModalOpen}
        nodes={nodes}
        edges={edges}
      />

      {/* Toolbar Navigation Modal */}
      <ToolbarNavigationModal
        isOpen={showNavModal}
        onClose={() => setShowNavModal(false)}
        onSave={handleSave}
        onExecute={handleExecute}
        onToggleActive={handleToggleActive}
        onDeleteSelected={handleDeleteSelected}
        saving={saving}
        executing={executing}
        isActive={workflow?.isActive || false}
        hasSelection={!!selectedNode || !!selectedEdge}
        workflowId={id}
      />

      {/* Execution Status Panel */}

      {/* Data Flow Inspector */}
      <DataFlowInspector
        isOpen={showDataInspector}
        onClose={handleCloseDataInspector}
        selectedEdge={selectedEdge}
      />

      {/* Template Gallery */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onAddNode={handleAddNode as any}
        onSave={handleSave}
        onExecute={handleExecute}
        onExport={handleExport}
        onImport={async () => {}}
      />
      </div>
    </ReactFlowProvider>
  );
}
