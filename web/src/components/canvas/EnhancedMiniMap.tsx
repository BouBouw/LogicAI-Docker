/**
 * Enhanced Mini-Map
 *
 * An enhanced mini-map for large workflow navigation with:
 * - Customizable node colors by type
 * - Pan and zoom indicator
 * - Click to navigate
 * - Compact and full modes
 */

import React, { useMemo } from 'react';
import { MiniMap as ReactFlowMiniMap, useReactFlow } from '@xyflow/react';
import { NODE_TYPES_METADATA } from '../../types/node';
import type { MiniMapProps, Node } from '@xyflow/react';

/**
 * Get node color based on type
 */
const getNodeColor = (node: Node): string => {
  const metadata = NODE_TYPES_METADATA[node.type || ''];
  return metadata?.color || '#6b7280';
};

/**
 * Get node stroke color (lighter version of fill)
 */
const getNodeStroke = (node: Node): string => {
  const color = getNodeColor(node);
  // Lighten the color for stroke
  return color + '40'; // Add transparency
};

/**
 * Enhanced MiniMap Component
 */
export const EnhancedMiniMap: React.FC<
  Omit<MiniMapProps, 'nodeColor'> & {
    /** Show node labels in mini-map */
    showLabels?: boolean;
    /** Compact mode (smaller, no labels) */
    compact?: boolean;
    /** Position of mini-map */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }
> = ({
  showLabels = false,
  compact = false,
  position = 'bottom-right',
  ...props
}) => {
  const { getNodes } = useReactFlow();

  // Memoize node color function to avoid re-renders
  const nodeColor = useMemo(() => {
    return (node: Node) => getNodeColor(node);
  }, []);

  const nodeStrokeColor = useMemo(() => {
    return (node: Node) => getNodeStroke(node);
  }, []);

  const maskColor = 'rgba(0, 0, 0, 0.6)';

  // Get position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`
      ${positionClasses[position]}
      transition-all duration-200
      ${compact ? 'scale-75 origin-bottom-right' : ''}
    `}>
      <ReactFlowMiniMap
        nodeColor={nodeColor}
        nodeStrokeColor={nodeStrokeColor}
        maskColor={maskColor}
        pannable={true}
        zoomable={true}
        // Hide labels in compact mode
        nodeComponent={showLabels ? undefined : () => null}
        // Custom styling
        className="!bg-black !border-2 !border-white/5 !rounded-lg !shadow-lg"
        style={{
          width: compact ? 160 : 200,
          height: compact ? 120 : 150,
        }}
        {...props}
      />
    </div>
  );
};

/**
 * Mini-map with legend showing node types
 */
export const MiniMapWithLegend: React.FC<{
  /** Show/hide the legend */
  showLegend?: boolean;
  /** Compact mode */
  compact?: boolean;
}> = ({ showLegend = true, compact = false }) => {
  const { getNodes } = useReactFlow();
  const nodes = getNodes();

  // Get unique node types and their counts
  const nodeTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((node) => {
      const type = node.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [nodes]);

  return (
    <div className="flex flex-col gap-2">
      {/* Mini-map */}
      <EnhancedMiniMap compact={compact} position="top-right" />

      {/* Legend */}
      {showLegend && !compact && (
        <div className="absolute top-4 right-4 mt-[170px] bg-black border border-white/5 rounded-lg shadow-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Node Types ({Object.keys(nodeTypeCounts).length})
          </h3>
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {Object.entries(nodeTypeCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([type, count]) => {
                const metadata = NODE_TYPES_METADATA[type];
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: metadata?.color || '#6b7280' }}
                    />
                    <span className="flex-1 truncate">{metadata?.displayName || type}</span>
                    <span className="font-mono text-gray-500">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMiniMap;
