/**
 * NodeSidebar - Configuration Panel for Selected Nodes
 * Features:
 * - Two modes: Node List (drag & drop) and Configuration
 * - Dynamic form based on node type
 * - Variable suggestions with {{ $json.* }} syntax
 * - Organized by categories with accordion
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, Settings, Plus, Search, ArrowLeft } from 'lucide-react';
import {
  Webhook, Globe, Variable, GitBranch, Edit, Code, Filter, Hash, Grid, Clock,
  AlertCircle, PlaySquare, Activity, FileInput, Rss, Upload, Terminal, Database,
  Mail, MessageSquare, MessageCircle, Send, Table, HardDrive, Table2, Book,
  Bot, Mic, Archive, Lock, ArrowUpDown, File, GitMerge, Cpu, CheckSquare, FileText,
  UserCheck, Sparkles, Shield, Bug, Eye, Zap, Ghost, RefreshCw, CreditCard,
  Smartphone, Laptop, PenTool, Monitor, Radio, Server, MousePointerClick,
  Kanban, Music, Zap as ZapIcon, Puzzle, Database as DatabaseIcon, MessageSquareQuote,
  Folder, Link, Settings as SettingsIcon, Bolt, ShoppingBag, Wallet, Square,
  Cloud, Users, Ticket, Phone, SendHorizontal, Mail as MailIcon, CheckCircle,
  Rocket, FolderOpen, Package, Magnet,
} from 'lucide-react';
import type { CustomNode, NodeType, BaseNodeConfig } from '../../types/node';
import { NODE_TYPES_METADATA } from '../../types/node';
import { suggestVariables } from '../../lib/variableParser';
import {
  StripeIcon, PayPalIcon, SquareIcon, ShopifyIcon, WooCommerceIcon,
  SalesforceIcon, HubSpotIcon, ZendeskIcon, TwilioIcon, SendGridIcon,
  MailchimpIcon, AsanaIcon, LinearIcon, DropboxIcon, OneDriveIcon,
  BoxIcon as BoxLogoIcon, OpenAIIcon, GitHubIcon, FigmaIcon, GoogleSheetsIcon,
  GoogleDriveIcon, AirtableIcon, NotionIcon, TrelloIcon, PostgreSQLIcon,
  MongoDBIcon, RedisIcon, SupabaseIcon, InstagramIcon, FacebookIcon,
  TwitterIcon, LinkedInIcon, TikTokIcon,
} from '../icons/BrandIcons';

// Category Icons Components
const AppleIcon = () => (
  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const AndroidIcon = () => (
  <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9995-.4484-.9995-.9995s.4484-.9995.9995-.9995c.5511 0 .9995.4484.9995.9995s-.4484.9995-.9995.9995m-11.046 0c-.5511 0-.9995-.4484-.9995-.9995s.4484-.9995.9995-.9995c.5511 0 .9995.4484.9995.9995s-.4483.9995-.9995.9995M17.86 12.4531l1.878-3.2546c.1087-.1882.0441-.4281-.1441-.5368-.1882-.1087-.4281-.0441-.5368.1441l-1.913 3.3137c-1.588-.7248-3.401-1.1348-5.31-1.1348-1.909 0-3.722.4101-5.31 1.1348L4.6096 8.8058c-.1087-.1882-.3486-.2527-.5368-.1441-.1882.1088-.2527.3487-.1441.5368l1.878 3.2546C2.4121 14.1522 0 17.3865 0 21.1738h24c0-3.7872-2.4122-7.0216-6.14-8.7207M12 22.1738c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2"/>
  </svg>
);

// Define categories with icon component names
const CATEGORIES = {
  trigger: { label: 'Triggers', icon: Bolt, color: 'purple' },
  logic: { label: 'Logic & Data', icon: Puzzle, color: 'blue' },
  action: { label: 'Actions', icon: ZapIcon, color: 'green' },
  data: { label: 'Data', icon: DatabaseIcon, color: 'cyan' },
  http: { label: 'HTTP & APIs', icon: Globe, color: 'blue' },
  communication: { label: 'Communication', icon: MessageSquareQuote, color: 'pink' },
  social: { label: 'Social Media', icon: MessageCircle, color: 'rose' },
  productivity: { label: 'Productivity', icon: Folder, color: 'indigo' },
  payment: { label: 'Payment', icon: CreditCard, color: 'violet' },
  ecommerce: { label: 'E-commerce', icon: ShoppingBag, color: 'emerald' },
  crm: { label: 'CRM', icon: Users, color: 'blue' },
  support: { label: 'Customer Support', icon: Ticket, color: 'red' },
  marketing: { label: 'Marketing', icon: MailIcon, color: 'orange' },
  project: { label: 'Project Management', icon: CheckCircle, color: 'sky' },
  storage: { label: 'Cloud Storage', icon: Cloud, color: 'cyan' },
  database: { label: 'Database', icon: Database, color: 'blue' },
  ai: { label: 'AI & LLM', icon: Bot, color: 'emerald' },
  devops: { label: 'DevOps', icon: GitBranch, color: 'gray' },
  design: { label: 'Design', icon: PenTool, color: 'pink' },
  streaming: { label: 'Streaming', icon: Radio, color: 'purple' },
  automation: { label: 'Automation', icon: Zap, color: 'yellow' },
  debug: { label: 'Debug', icon: Bug, color: 'lime' },
  apple: { label: 'Apple Ecosystem', icon: AppleIcon, color: 'gray' },
  android: { label: 'Android Ecosystem', icon: AndroidIcon, color: 'green' },
  integration: { label: 'Integrations', icon: Link, color: 'orange' },
  advanced: { label: 'Advanced', icon: SettingsIcon, color: 'red' },
} as const;

interface NodeSidebarProps {
  selectedNode: CustomNode | null;
  onNodeUpdate: (nodeId: string, config: BaseNodeConfig) => void;
  onNodeAdd: (type: NodeType) => void;
  onNodeDeselect: () => void;
}

export default function NodeSidebar({
  selectedNode,
  onNodeUpdate,
  onNodeAdd,
  onNodeDeselect,
}: NodeSidebarProps) {
  const [config, setConfig] = useState<BaseNodeConfig>(
    selectedNode?.data.config || {}
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Update config when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  // Group nodes by category
  const nodesByCategory = useMemo(() => {
    const grouped: Record<string, NodeType[]> = {} as any;

    Object.entries(NODE_TYPES_METADATA).forEach(([type, metadata]) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const typeLabel = type.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        const description = metadata.description.toLowerCase();
        if (!typeLabel.includes(query) && !description.includes(query)) {
          return;
        }
      }

      const category = metadata.category || 'action';

      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(type as NodeType);
    });

    return grouped;
  }, [searchQuery]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, newConfig);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const nodeTypeMetadata = selectedNode
    ? NODE_TYPES_METADATA[selectedNode.data.type]
    : null;

  const variableSuggestions = suggestVariables({
    $json: {},
    $workflow: { id: 'workflow-id', name: 'Workflow Name' },
    $node: { id: 'node-id', name: 'Node Name', type: 'node-type' },
  });

  // Get nodes for selected category
  const categoryNodes = selectedCategory ? nodesByCategory[selectedCategory] || [] : [];

  return (
    <div className="w-80 h-full bg-bg-card border-l border-white/10 flex flex-col" style={{
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {selectedNode ? (
            <>
              <Settings className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-semibold text-white">
                Node Configuration
              </h2>
            </>
          ) : selectedCategory ? (
            <>
              <button
                onClick={handleBackToCategories}
                className="p-1 hover:bg-gray-700 rounded transition-colors mr-1"
                title="Retour aux catégories"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-sm font-semibold text-white">
                {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.label || selectedCategory}
              </h2>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-white">Noeuds</h2>
            </>
          )}
        </div>
        {selectedNode && (
          <button
            onClick={onNodeDeselect}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode ? (
          // Configuration Mode
          <div className="space-y-4">
            {/* Node Info */}
            <div className="p-3 bg-bg-card rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getNodeIcon(selectedNode.data.type)}
                <h3 className="text-lg font-semibold text-white">
                  {selectedNode.data.label}
                </h3>
              </div>
              <p className="text-sm text-gray-400 capitalize">
                {selectedNode.data.type}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {nodeTypeMetadata?.description}
              </p>
            </div>

            {/* Configuration Form */}
            <div className="space-y-3">
              {nodeTypeMetadata &&
                Object.entries(nodeTypeMetadata.config).map(([key, fieldConfig]) => {
                  const fieldMeta = fieldConfig as {
                    type: 'text' | 'textarea' | 'select' | 'number' | 'boolean';
                    label: string;
                    placeholder?: string;
                    options?: { label: string; value: string }[];
                    defaultValue?: any;
                  };
                  return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {fieldMeta.label}
                    </label>
                    {fieldMeta.type === 'select' ? (
                      <div className="relative">
                        <select
                          value={config[key] || fieldMeta.defaultValue || ''}
                          onChange={(e) =>
                            handleConfigChange(key, e.target.value)
                          }
                          className="w-full px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue appearance-none cursor-pointer transition-all hover:border-white/20"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23868686' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '16px',
                          }}
                        >
                          {fieldMeta.options?.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              className="bg-bg-card text-white py-2"
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : fieldMeta.type === 'textarea' ? (
                      <textarea
                        value={config[key] || ''}
                        onChange={(e) =>
                          handleConfigChange(key, e.target.value)
                        }
                        placeholder={fieldMeta.placeholder}
                        rows={4}
                        className="w-full px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue font-mono transition-all hover:border-white/20 placeholder:text-gray-600 resize-none"
                      />
                    ) : fieldMeta.type === 'boolean' ? (
                      <label className="flex items-center gap-3 px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-all">
                        <input
                          type="checkbox"
                          checked={config[key] || false}
                          onChange={(e) =>
                            handleConfigChange(key, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-600 text-brand-blue focus:ring-brand-blue focus:ring-2 focus:ring-offset-0 focus:ring-offset-bg-card"
                        />
                        <span className="text-sm text-gray-300">Enabled</span>
                      </label>
                    ) : (
                      <input
                        type={fieldMeta.type === 'number' ? 'number' : 'text'}
                        value={config[key] || ''}
                        onChange={(e) =>
                          handleConfigChange(
                            key,
                            fieldMeta.type === 'number'
                              ? parseFloat(e.target.value) || 0
                              : e.target.value
                          )
                        }
                        placeholder={fieldMeta.placeholder}
                        className="w-full px-3 py-2.5 bg-bg-card border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all hover:border-white/20 placeholder:text-gray-600"
                      />
                    )}
                  </div>
                  );
                })}
            </div>

            {/* Variable Suggestions */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                Available Variables
              </h4>
              <div className="space-y-1">
                {variableSuggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      navigator.clipboard.writeText(suggestion);
                    }}
                    className="block w-full text-left px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-300 rounded font-mono"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click to copy to clipboard
              </p>
            </div>
          </div>
        ) : (
          // Node List Mode - Categories or Nodes in Category
          <div className="space-y-2">
            {/* Search Bar - Only show when not in category view */}
            {!selectedCategory && (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un nœud..."
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue placeholder-gray-500"
                  />
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  Cliquez sur une catégorie pour voir les nœuds
                </p>
              </>
            )}

            {/* Categories Grid or Category Nodes */}
            <div className={selectedCategory ? 'animate-fadeIn' : ''}>
              {selectedCategory ? (
                // Show nodes in selected category
                <div className="space-y-2">
                  {categoryNodes.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">
                      Aucun nœud dans cette catégorie
                    </p>
                  ) : (
                    categoryNodes.map((type) => {
                      const metadata = NODE_TYPES_METADATA[type];
                      return (
                        <button
                          key={type}
                          onClick={() => onNodeAdd(type)}
                          className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 text-left group animate-slideInRight"
                          style={{ animationDelay: `${categoryNodes.indexOf(type) * 50}ms` }}
                        >
                          {getNodeIcon(type)}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white capitalize group-hover:text-brand-blue transition-colors">
                              {type.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {metadata?.description || 'Add this node to your workflow'}
                            </p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-600 group-hover:text-brand-blue transition-colors shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                // Show categories list
                <div className="space-y-2">
                  {Object.entries(nodesByCategory).map(([category, nodeTypes]) => {
                    const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES] || {
                      label: category,
                      icon: Archive,
                      color: 'gray'
                    };
                    const IconComponent = categoryInfo.icon;

                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 text-left group"
                      >
                        <div className="group-hover:scale-110 transition-transform flex items-center justify-center w-6 h-6">
                          <IconComponent className={`w-6 h-6 text-${categoryInfo.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-white capitalize">
                            {categoryInfo.label}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {nodeTypes.length} nœud{nodeTypes.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-600 group-hover:text-brand-blue transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getNodeIcon(type: NodeType) {
  // Helper for creating SVG icons
  const createSvgIcon = (path: string, color: string) => React.createElement('svg', { className: `w-5 h-5 ${color}`, viewBox: '0 0 24 24', fill: 'currentColor' },
    React.createElement('path', { d: path })
  );

  const createWrappedSvg = (path: string, color: string) => React.createElement('div', { className: 'w-5 h-5 flex items-center justify-center' },
    createSvgIcon(path, color)
  );

  const iconMap: Partial<Record<NodeType, { component?: any; svgPath?: string; color?: string; wrapped?: boolean; className?: string }>> = {
    // CORE NODES
    webhook: { component: Webhook, className: 'w-5 h-5 text-purple-400' },
    httpRequest: { component: Globe, className: 'w-5 h-5 text-blue-400' },
    setVariable: { component: Variable, className: 'w-5 h-5 text-green-400' },
    condition: { component: GitBranch, className: 'w-5 h-5 text-orange-400' },
    editFields: { component: Edit, className: 'w-5 h-5 text-indigo-400' },
    code: { component: Code, className: 'w-5 h-5 text-violet-400' },
    filter: { component: Filter, className: 'w-5 h-5 text-cyan-400' },
    switch: { component: GitBranch, className: 'w-5 h-5 text-orange-400' },
    merge: { component: GitMerge, className: 'w-5 h-5 text-pink-400' },
    splitInBatches: { component: Grid, className: 'w-5 h-5 text-teal-400' },
    wait: { component: Clock, className: 'w-5 h-5 text-gray-400' },
    errorTrigger: { component: AlertCircle, className: 'w-5 h-5 text-red-400' },
    executeWorkflow: { component: PlaySquare, className: 'w-5 h-5 text-emerald-400' },
    limit: { component: Hash, className: 'w-5 h-5 text-lime-400' },
    sort: { component: ArrowUpDown, className: 'w-5 h-5 text-sky-400' },

    // PAYMENT & E-COMMERCE
    stripe: { component: StripeIcon },
    paypal: { component: PayPalIcon },
    square: { component: SquareIcon },
    shopify: { component: ShopifyIcon },
    wooCommerce: { component: WooCommerceIcon },

    // CRM & CUSTOMER SUPPORT
    salesforce: { component: SalesforceIcon },
    hubspot: { component: HubSpotIcon },
    zendesk: { component: ZendeskIcon },

    // TRIGGER NODES
    schedule: { component: Clock, className: 'w-5 h-5 text-amber-500' },
    onSuccessFailure: { component: Activity, className: 'w-5 h-5 text-rose-500' },
    formTrigger: { component: FileInput, className: 'w-5 h-5 text-blue-400' },
    chatTrigger: { component: MessageCircle, className: 'w-5 h-5 text-indigo-500' },
    clickTrigger: { component: MousePointerClick, className: 'w-5 h-5 text-pink-500' },
    emailTrigger: { component: Mail, className: 'w-5 h-5 text-gray-500' },
    httpPollTrigger: { component: RefreshCw, className: 'w-5 h-5 text-teal-500' },
    cronTrigger: { component: Clock, className: 'w-5 h-5 text-yellow-500' },

    // HTTP & DATA
    htmlExtract: { component: Globe, className: 'w-5 h-5 text-green-400' },
    rssRead: { component: Rss, className: 'w-5 h-5 text-orange-400' },
    ftp: { component: Upload, className: 'w-5 h-5 text-purple-400' },
    ssh: { component: Terminal, className: 'w-5 h-5 text-gray-500' },

    // DATABASE
    mySQL: { component: Database, className: 'w-5 h-5 text-blue-600' },
    postgreSQL: { component: PostgreSQLIcon },
    mongoDB: { component: MongoDBIcon },
    redis: { component: RedisIcon },
    supabase: { component: SupabaseIcon },

    // COMMUNICATION
    email: { component: Mail, className: 'w-5 h-5 text-gray-500' },
    slack: { component: MessageSquare, className: 'w-5 h-5 text-purple-600' },
    discord: { component: MessageCircle, className: 'w-5 h-5 text-indigo-500' },
    telegram: { component: Send, className: 'w-5 h-5 text-cyan-500' },
    whatsapp: { component: MessageSquare, className: 'w-5 h-5 text-green-500' },
    twilio: { component: TwilioIcon },
    sendgrid: { component: SendGridIcon },
    mailchimp: { component: MailchimpIcon },

    // SOCIAL MEDIA SVG icons
    instagram: {
      svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      color: 'text-pink-500',
      wrapped: true
    },
    facebook: {
      svgPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
      color: 'text-blue-600',
      wrapped: true
    },
    twitter: {
      svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      color: 'text-sky-500',
      wrapped: true
    },
    linkedin: {
      svgPath: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
      color: 'text-blue-700',
      wrapped: true
    },
    tiktok: { component: Music, className: 'w-5 h-5 text-gray-800' },

    // CLOUD PRODUCTIVITY
    googleSheets: { component: GoogleSheetsIcon },
    googleDrive: { component: GoogleDriveIcon },
    airtable: { component: AirtableIcon },
    notion: { component: NotionIcon },
    trello: { component: TrelloIcon },

    // PROJECT MANAGEMENT
    asana: { component: AsanaIcon },
    linear: { component: LinearIcon },

    // CLOUD STORAGE
    dropbox: { component: DropboxIcon },
    onedrive: { component: OneDriveIcon },
    box: { component: BoxLogoIcon },

    // AI/LLM
    openAI: { component: OpenAIIcon },
    aiAgent: { component: Mic, className: 'w-5 h-5 text-violet-400' },
    vectorStore: { component: Database, className: 'w-5 h-5 text-pink-400' },
    embeddings: { component: Cpu, className: 'w-5 h-5 text-cyan-400' },

    // BINARY
    readWriteBinaryFile: { component: File, className: 'w-5 h-5 text-gray-400' },
    compression: { component: Archive, className: 'w-5 h-5 text-orange-400' },
    crypto: { component: Lock, className: 'w-5 h-5 text-red-400' },

    // EXCLUSIVE CUSTOM NODES
    humanInTheLoop: { component: UserCheck, className: 'w-5 h-5 text-pink-500' },
    smartDataCleaner: { component: Sparkles, className: 'w-5 h-5 text-yellow-500' },
    aiCostGuardian: { component: Shield, className: 'w-5 h-5 text-cyan-500' },
    noCodeBrowserAutomator: { component: Globe, className: 'w-5 h-5 text-indigo-500' },
    aggregatorMultiSearch: { component: Search, className: 'w-5 h-5 text-teal-500' },
    liveCanvasDebugger: { component: Bug, className: 'w-5 h-5 text-lime-500' },
    socialMockupPreview: { component: Eye, className: 'w-5 h-5 text-violet-500' },
    rateLimiterBypass: { component: Zap, className: 'w-5 h-5 text-amber-500' },
    ghost: { component: Ghost, className: 'w-5 h-5 text-gray-400' },

    // ADVANCED INTEGRATION NODES
    appleEcosystem: { component: Laptop, className: 'w-5 h-5 text-gray-300' },
    androidEcosystem: { component: Smartphone, className: 'w-5 h-5 text-green-400' },
    gitHub: { component: GitHubIcon },
    figma: { component: FigmaIcon },
    windowsControl: { component: Monitor, className: 'w-5 h-5 text-blue-400' },
    streaming: { component: Radio, className: 'w-5 h-5 text-purple-400' },
    infrastructure: { component: Server, className: 'w-5 h-5 text-orange-400' },

    // INDIVIDUAL APPLE NODES
    imessage: { component: MessageCircle, className: 'w-5 h-5 text-blue-400' },
    icloudReminders: { component: CheckSquare, className: 'w-5 h-5 text-blue-400' },
    icloudNotes: { component: FileText, className: 'w-5 h-5 text-blue-400' },
    icloudCalendar: { component: Clock, className: 'w-5 h-5 text-blue-400' },
    icloudDrive: { component: HardDrive, className: 'w-5 h-5 text-blue-400' },

    // INDIVIDUAL ANDROID NODES
    androidMessages: { component: MessageSquare, className: 'w-5 h-5 text-green-400' },
    androidContacts: { component: Database, className: 'w-5 h-5 text-green-400' },
    androidADB: { component: Terminal, className: 'w-5 h-5 text-green-400' },
    androidAPK: { component: Archive, className: 'w-5 h-5 text-green-400' },
    androidNotifications: { component: AlertCircle, className: 'w-5 h-5 text-green-400' },
  };

  const iconData = iconMap[type];
  if (!iconData) {
    return React.createElement(Variable, { className: 'w-5 h-5 text-gray-400' });
  }

  // SVG-based icons
  if (iconData.svgPath && iconData.color) {
    if (iconData.wrapped) {
      return createWrappedSvg(iconData.svgPath, iconData.color);
    }
    return createSvgIcon(iconData.svgPath, iconData.color);
  }

  // Component-based icons
  if (iconData.component) {
    return React.createElement(iconData.component, iconData.className ? { className: iconData.className } : {});
  }

  return React.createElement(Variable, { className: 'w-5 h-5 text-gray-400' });
}
