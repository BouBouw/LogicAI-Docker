/**
 * WorkflowCanvas - Main React Flow Canvas Component
 * Features:
 * - React Flow integration with CustomNode
 * - Dark mode styling
 * - Drag and drop node support
 * - Node and edge change handling
 * - Grid background
 * - Enhanced zoom controls and mini-map
 * - Execution-aware nodes and data flow edges
 */

import { useState } from 'react';
import { MessageSquare, ScrollText } from 'lucide-react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import type {
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeMouseHandler,
  EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNodeComponent from './CustomNode';
import { ZoomControls } from './ZoomControls';
import { EnhancedMiniMap } from './EnhancedMiniMap';
import type { CustomNode } from '../../types/node';

const nodeTypes = {
  custom: CustomNodeComponent,
};

interface WorkflowCanvasProps {
  nodes?: CustomNode[];
  edges?: Edge[];
  onNodesChange?: OnNodesChange<CustomNode>;
  onEdgesChange?: OnEdgesChange<Edge>;
  onConnect?: OnConnect;
  onNodeClick?: NodeMouseHandler<CustomNode>;
  onNodeDoubleClick?: NodeMouseHandler<CustomNode>;
  onEdgeClick?: EdgeMouseHandler<Edge>;
  onPaneClick?: (event: React.MouseEvent) => void;
  readOnly?: boolean;
  showMiniMap?: boolean;
  onToggleMiniMap?: () => void;
  showChatPanel?: boolean;
  onToggleChatPanel?: () => void;
  showExecutionPanel?: boolean;
  onToggleExecutionPanel?: () => void;
}

export default function WorkflowCanvas({
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onPaneClick,
  readOnly = false,
  showMiniMap = true,
  onToggleMiniMap,
  showChatPanel = false,
  onToggleChatPanel,
  showExecutionPanel = false,
  onToggleExecutionPanel,
}: WorkflowCanvasProps) {
  const [miniMapPosition, setMiniMapPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  return (
    <div className="w-full h-full relative" style={{
      background: 'linear-gradient(135deg, #010101 0%, #0a0a0a 50%, #010101 100%)'
    }}>
      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 112, 255, 0.03) 0%, transparent 50%)'
      }} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        deleteKeyCode="Delete"
        className="bg-transparent"
        style={{ background: 'transparent' }}
        defaultEdgeOptions={{
          animated: false,
          style: { stroke: '#4A4A4E', strokeWidth: 2 },
        }}
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode="Control"
        zoomOnScroll
        zoomOnPinch
        panOnDrag
        minZoom={0.2}
        maxZoom={4}
        preventScrolling={false}
        elevateNodesOnSelect
        elevateEdgesOnSelect
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#2A2A2E"
          style={{
            opacity: 0.6
          }}
        />
      </ReactFlow>

      {/* Enhanced Zoom Controls */}
      <ZoomControls
        showMiniMap={showMiniMap}
        onToggleMiniMap={onToggleMiniMap}
      />

      {/* Enhanced Zoom Controls */}
      <ZoomControls
        showMiniMap={showMiniMap}
        onToggleMiniMap={onToggleMiniMap}
      />

      {/* Mini-Map */}
      {showMiniMap && (
        <EnhancedMiniMap
          showLabels={false}
          compact={false}
          position={miniMapPosition}
        />
      )}

      {/* Chat & Logs buttons - positioned above mini-map */}
      {(onToggleChatPanel || onToggleExecutionPanel) && (
        <div className="absolute bottom-42 right-4 flex gap-2 z-20">
          {onToggleChatPanel && (
            <button
              onClick={onToggleChatPanel}
              className={`flex items-center gap-2 px-4.5 py-2 text-white rounded-lg transition-colors ${
                showChatPanel ? 'bg-orange-500 hover:bg-orange-600' : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
          )}
          {onToggleExecutionPanel && (
            <button
              onClick={onToggleExecutionPanel}
              className={`flex items-center gap-2 px-4.5 py-2 text-white rounded-lg transition-colors ${
                showExecutionPanel ? 'bg-brand-blue hover:bg-brand-hover' : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              Logs
            </button>
          )}
        </div>
      )}
    </div>
  );
}
