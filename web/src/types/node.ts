/**
 * Node Types for LogicAI-N8N Frontend
 */

import type { Node } from '@xyflow/react';

// Les données contenues dans la propriété "data" d'un nœud React Flow
export interface CustomNodeData extends Record<string, unknown> {
  id: string;
  type: NodeType;
  label: string;
  config: BaseNodeConfig;
  status?: NodeStatus;
}

// Le type complet d'un nœud React Flow avec nos données personnalisées
export type CustomNode = Node<CustomNodeData>;

export type NodeType =
  // CORE NODES (Logic & Data)
  | 'webhook'
  | 'httpRequest'
  | 'setVariable'
  | 'condition'
  | 'editFields'
  | 'code'
  | 'filter'
  | 'switch'
  | 'merge'
  | 'splitInBatches'
  | 'wait'
  | 'errorTrigger'
  | 'executeWorkflow'
  | 'limit'
  | 'sort'
  // PAYMENT & E-COMMERCE
  | 'stripe'
  | 'paypal'
  | 'square'
  | 'shopify'
  | 'wooCommerce'
  // CRM & CUSTOMER SUPPORT
  | 'salesforce'
  | 'hubspot'
  | 'zendesk'
  // TRIGGER NODES
  | 'schedule'
  | 'onSuccessFailure'
  | 'formTrigger'
  | 'chatTrigger'
  | 'clickTrigger'
  | 'emailTrigger'
  | 'httpPollTrigger'
  | 'cronTrigger'
  // HTTP & DATA
  | 'htmlExtract'
  | 'rssRead'
  | 'ftp'
  | 'ssh'
  // DATABASE
  | 'mySQL'
  | 'postgreSQL'
  | 'mongoDB'
  | 'redis'
  | 'supabase'
  // COMMUNICATION
  | 'email'
  | 'slack'
  | 'discord'
  | 'telegram'
  | 'whatsapp'
  | 'twilio'
  | 'sendgrid'
  | 'mailchimp'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  // INSTAGRAM NODES
  | 'instagramPost'
  | 'instagramStory'
  | 'instagramReels'
  // FACEBOOK NODES
  | 'facebookPost'
  | 'facebookUploadPhoto'
  | 'facebookPagePost'
  // TWITTER NODES
  | 'twitterTweet'
  | 'twitterReply'
  | 'twitterLike'
  | 'twitterRetweet'
  // LINKEDIN NODES
  | 'linkedinPost'
  | 'linkedinShareArticle'
  | 'linkedinMessage'
  // WHATSAPP NODES
  | 'whatsappSendMessage'
  | 'whatsappSendMedia'
  | 'whatsappSendLocation'
  // TELEGRAM NODES
  | 'telegramSendMessage'
  | 'telegramSendPhoto'
  | 'telegramBotCommand'
  // TIKTOK NODES
  | 'tiktokUploadVideo'
  | 'tiktokGetVideoInfo'
  | 'tiktokGetUserInfo'
  // CLOUD PRODUCTIVITY
  | 'googleSheets'
  | 'googleDrive'
  | 'airtable'
  | 'notion'
  | 'trello'
  // PROJECT MANAGEMENT
  | 'asana'
  | 'linear'
  // CLOUD STORAGE
  | 'dropbox'
  | 'onedrive'
  | 'box'
  // AI/LLM
  | 'openAI'
  | 'aiAgent'
  | 'vectorStore'
  | 'embeddings'
  // BINARY
  | 'readWriteBinaryFile'
  | 'compression'
  | 'crypto'
  // EXCLUSIVE CUSTOM NODES
  | 'humanInTheLoop'
  | 'smartDataCleaner'
  | 'aiCostGuardian'
  | 'noCodeBrowserAutomator'
  | 'aggregatorMultiSearch'
  | 'liveCanvasDebugger'
  | 'socialMockupPreview'
  | 'rateLimiterBypass'
  | 'ghost'
  // ADVANCED INTEGRATION NODES
  | 'appleEcosystem'
  | 'androidEcosystem'
  | 'gitHub'
  | 'figma'
  | 'windowsControl'
  | 'streaming'
  | 'infrastructure'
  // INDIVIDUAL APPLE NODES
  | 'imessage'
  | 'icloudReminders'
  | 'icloudNotes'
  | 'icloudCalendar'
  | 'icloudDrive'
  // INDIVIDUAL ANDROID NODES
  | 'androidMessages'
  | 'androidContacts'
  | 'androidADB'
  | 'androidAPK'
  | 'androidNotifications';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface BaseNodeConfig {
  [key: string]: any;
}

// Core node configs
export interface WebhookConfig extends BaseNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
}

export interface HttpRequestConfig extends BaseNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
}

export interface SetVariableConfig extends BaseNodeConfig {
  key: string;
  value: string;
  valueType?: 'string' | 'number' | 'boolean' | 'json';
}

export interface ConditionConfig extends BaseNodeConfig {
  expression: string;
  truePath?: string;
  falsePath?: string;
}

// Exclusive custom node configs
export interface HumanInTheLoopConfig extends BaseNodeConfig {
  timeout?: number;
  notificationType?: 'email' | 'slack' | 'none';
  notificationEmail?: string;
  approvalBaseUrl?: string;
}

export interface SmartDataCleanerConfig extends BaseNodeConfig {
  cleaningRules?: Record<string, {
    type: 'trim' | 'capitalize' | 'uppercase' | 'lowercase' | 'normalizePhone' |
          'normalizeDate' | 'normalizeEmail' | 'removeAccents' | 'removeExtraSpaces' |
          'typeConversion' | 'removeSpecialChars' | 'maskSensitive';
    format?: string;
    targetType?: string;
    visibleChars?: number;
    maskChar?: string;
  }>;
}

export interface AICostGuardianConfig extends BaseNodeConfig {
  maxTokens: number;
  targetField: string;
  strategy: 'truncate' | 'summarize' | 'compress' | 'smartTruncate';
}

export interface NoCodeBrowserAutomatorConfig extends BaseNodeConfig {
  actions?: Array<{
    type: 'goto' | 'click' | 'fill' | 'select' | 'scroll' | 'waitFor' |
          'waitForSelector' | 'screenshot' | 'extract' | 'extractMultiple' |
          'evaluate' | 'waitForNavigation';
    selector?: string;
    url?: string;
    value?: string;
    duration?: number;
    filename?: string;
    attribute?: string;
    script?: string;
    direction?: string;
    amount?: number;
  }>;
}

export interface AggregatorMultiSearchConfig extends BaseNodeConfig {
  query?: string;
  engines?: Array<'google' | 'duckduckgo' | 'linkedin' | 'bing'>;
  maxResults?: number;
  sortByRelevance?: boolean;
  deduplicate?: boolean;
}

export interface PDFIntelligentParserConfig extends BaseNodeConfig {
  pdfUrl?: string;
  documentType?: 'auto' | 'invoice' | 'cv' | 'purchaseOrder' | 'receipt';
  extractFields?: string[];
}

export interface LiveCanvasDebuggerConfig extends BaseNodeConfig {
  operations?: Array<{
    type: 'log' | 'measure' | 'inspect' | 'breakpoint' | 'trace';
    level?: string;
    message?: string;
    data?: any;
    label?: string;
    path?: string;
    condition?: string;
  }>;
}

export interface SocialMockupPreviewConfig extends BaseNodeConfig {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok';
  content?: string;
  mediaUrls?: string[];
  metadata?: {
    authorName?: string;
    username?: string;
    headline?: string;
    avatar?: string;
    verified?: boolean;
    scheduledAt?: string;
    privacy?: string;
    feeling?: string;
    activity?: string;
    location?: string;
    music?: string;
    mediaAlt?: string[];
  };
}

export interface RateLimiterBypassConfig extends BaseNodeConfig {
  url?: string;
  method?: string;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface GhostNodeConfig extends BaseNodeConfig {
  operations?: Array<{
    type: 'transform' | 'filter' | 'aggregate' | 'enrich' | 'validate' |
          'encrypt' | 'mask' | 'process';
    transformations?: any[];
    conditions?: any[];
    aggregations?: any[];
    enrichments?: any[];
    schema?: any;
    fields?: string[];
    handler?: string;
  }>;
}

export interface NodeMetadata {
  type: NodeType;
  icon: string;
  category: 'trigger' | 'action' | 'logic' | 'advanced' | 'data' | 'ai' |
            'automation' | 'debug' | 'social' | 'apple' | 'android' |
            'payment' | 'ecommerce' | 'crm' | 'support' | 'marketing' |
            'project' | 'storage' | 'http' | 'database' | 'communication' |
            'productivity' | 'devops' | 'design' | 'streaming';
  description: string;
  config: Record<string, {
    type: 'text' | 'textarea' | 'select' | 'number' | 'boolean';
    label: string;
    placeholder?: string;
    description?: string;
    options?: { label: string; value: string }[];
    defaultValue?: any;
    rows?: number;
  }>;
}

export const NODE_TYPES_METADATA: Partial<Record<NodeType, NodeMetadata>> = {
  // Core nodes
  webhook: {
    type: 'webhook',
    icon: 'Webhook',
    category: 'trigger',
    description: 'Triggers the workflow when an HTTP request is received',
    config: {
      method: {
        type: 'select',
        label: 'HTTP Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
        defaultValue: 'POST',
      },
      path: {
        type: 'text',
        label: 'Path',
        placeholder: '/webhook',
        defaultValue: '/webhook',
      },
    },
  },
  httpRequest: {
    type: 'httpRequest',
    icon: 'Globe',
    category: 'action',
    description: 'Makes an HTTP request to an external API',
    config: {
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://api.example.com/endpoint',
      },
      method: {
        type: 'select',
        label: 'Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
        defaultValue: 'POST',
      },
      headers: {
        type: 'textarea',
        label: 'Headers (JSON)',
        placeholder: '{"Authorization": "Bearer {{ $json.token }}"}',
      },
      body: {
        type: 'textarea',
        label: 'Body (JSON)',
        placeholder: '{"data": "{{ $json }}"}',
      },
    },
  },
  setVariable: {
    type: 'setVariable',
    icon: 'Variable',
    category: 'logic',
    description: 'Sets or modifies variables in the data flow',
    config: {
      key: {
        type: 'text',
        label: 'Variable Key',
        placeholder: 'output.value',
      },
      value: {
        type: 'text',
        label: 'Value',
        placeholder: '{{ $json.field }}',
      },
      valueType: {
        type: 'select',
        label: 'Value Type',
        options: [
          { label: 'String', value: 'string' },
          { label: 'Number', value: 'number' },
          { label: 'Boolean', value: 'boolean' },
          { label: 'JSON', value: 'json' },
        ],
        defaultValue: 'string',
      },
    },
  },
  condition: {
    type: 'condition',
    icon: 'GitBranch',
    category: 'logic',
    description: 'Splits the workflow based on a condition',
    config: {
      expression: {
        type: 'text',
        label: 'Expression',
        placeholder: 'user.age > 18',
      },
      truePath: {
        type: 'text',
        label: 'True Path (Node ID)',
        placeholder: 'node-id-1',
      },
      falsePath: {
        type: 'text',
        label: 'False Path (Node ID)',
        placeholder: 'node-id-2',
      },
    },
  },

  // DATABASE NODES
  mySQL: {
    type: 'mySQL',
    icon: 'Database',
    category: 'data',
    description: 'MySQL/PostgreSQL database operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Execute Query', value: 'executeQuery' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'Select', value: 'select' },
        ],
        defaultValue: 'executeQuery',
      },
      query: {
        type: 'textarea',
        label: 'SQL Query',
        placeholder: 'SELECT * FROM users WHERE id = {{ $json.id }}',
      },
      host: {
        type: 'text',
        label: 'Host',
        placeholder: 'localhost',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 3306,
      },
      database: {
        type: 'text',
        label: 'Database Name',
        placeholder: 'mydb',
      },
      user: {
        type: 'text',
        label: 'Username',
        placeholder: 'root',
      },
      password: {
        type: 'text',
        label: 'Password',
      },
    },
  },
  mongoDB: {
    type: 'mongoDB',
    icon: 'Database',
    category: 'data',
    description: 'MongoDB NoSQL operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Find', value: 'find' },
          { label: 'Insert One', value: 'insertOne' },
          { label: 'Insert Many', value: 'insertMany' },
          { label: 'Update One', value: 'updateOne' },
          { label: 'Update Many', value: 'updateMany' },
          { label: 'Delete One', value: 'deleteOne' },
          { label: 'Delete Many', value: 'deleteMany' },
          { label: 'Aggregate', value: 'aggregate' },
        ],
        defaultValue: 'find',
      },
      collection: {
        type: 'text',
        label: 'Collection Name',
        placeholder: 'users',
      },
      query: {
        type: 'textarea',
        label: 'Query (JSON)',
        placeholder: '{"age": {"$gt": 18}}',
      },
      connectionString: {
        type: 'text',
        label: 'Connection String',
        placeholder: 'mongodb://localhost:27017/mydb',
      },
    },
  },
  redis: {
    type: 'redis',
    icon: 'Database',
    category: 'data',
    description: 'Redis key-value cache operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get', value: 'get' },
          { label: 'Set', value: 'set' },
          { label: 'Delete', value: 'delete' },
          { label: 'Exists', value: 'exists' },
          { label: 'Expire', value: 'expire' },
          { label: 'Incr', value: 'incr' },
          { label: 'Decr', value: 'decr' },
        ],
        defaultValue: 'get',
      },
      key: {
        type: 'text',
        label: 'Key',
        placeholder: 'mykey',
      },
      value: {
        type: 'text',
        label: 'Value',
        placeholder: 'myvalue',
      },
      host: {
        type: 'text',
        label: 'Host',
        defaultValue: 'localhost',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 6379,
      },
    },
  },
  supabase: {
    type: 'supabase',
    icon: 'Database',
    category: 'data',
    description: 'Supabase backend integration',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Select', value: 'select' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'RPC', value: 'rpc' },
        ],
        defaultValue: 'select',
      },
      table: {
        type: 'text',
        label: 'Table Name',
        placeholder: 'users',
      },
      query: {
        type: 'textarea',
        label: 'Query (JSON)',
        placeholder: '{"select": "*", "filter": {"id": "eq.123"}}',
      },
      supabaseUrl: {
        type: 'text',
        label: 'Supabase URL',
        placeholder: 'https://yourproject.supabase.co',
      },
      supabaseKey: {
        type: 'text',
        label: 'Supabase Key',
        placeholder: 'your-supabase-anon-key',
      },
    },
  },

  // New trigger nodes
  chatTrigger: {
    type: 'chatTrigger',
    icon: 'MessageCircle',
    category: 'trigger',
    description: 'Trigger workflow from chat messages (Discord, Telegram, Slack, WhatsApp)',
    config: {
      platform: {
        type: 'select',
        label: 'Platform',
        options: [
          { label: 'Discord', value: 'discord' },
          { label: 'Telegram', value: 'telegram' },
          { label: 'Slack', value: 'slack' },
          { label: 'WhatsApp', value: 'whatsapp' },
        ],
        defaultValue: 'discord',
      },
      webhookUrl: {
        type: 'text',
        label: 'Webhook URL',
        placeholder: 'Auto-generated or paste existing webhook',
      },
    },
  },
  clickTrigger: {
    type: 'clickTrigger',
    icon: 'MousePointerClick',
    category: 'trigger',
    description: 'Manual trigger - execute workflow by clicking a button in the UI',
    config: {
      buttonText: {
        type: 'text',
        label: 'Button Text',
        defaultValue: 'Execute',
        placeholder: 'Execute',
      },
      buttonStyle: {
        type: 'select',
        label: 'Button Style',
        options: [
          { label: 'Primary (Blue)', value: 'primary' },
          { label: 'Success (Green)', value: 'success' },
          { label: 'Warning (Orange)', value: 'warning' },
          { label: 'Danger (Red)', value: 'danger' },
        ],
        defaultValue: 'primary',
      },
      requireConfirmation: {
        type: 'boolean',
        label: 'Require Confirmation',
        defaultValue: false,
      },
      confirmationMessage: {
        type: 'text',
        label: 'Confirmation Message',
        defaultValue: 'Execute this workflow?',
        placeholder: 'Execute this workflow?',
      },
      minInterval: {
        type: 'text',
        label: 'Minimum Interval',
        placeholder: '30s',
        description: 'Minimum time between executions (e.g., 30s, 5m, 1h)',
      },
      data: {
        type: 'textarea',
        label: 'Additional Data (JSON)',
        placeholder: '{"key": "value"}',
        description: 'Additional data to pass with the trigger',
      },
    },
  },
  emailTrigger: {
    type: 'emailTrigger',
    icon: 'Mail',
    category: 'trigger',
    description: 'Monitor email inbox via IMAP/POP3',
    config: {
      host: {
        type: 'text',
        label: 'IMAP Host',
        placeholder: 'imap.gmail.com',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 993,
      },
      username: {
        type: 'text',
        label: 'Email Address',
        placeholder: 'your-email@example.com',
      },
      password: {
        type: 'text',
        label: 'Password/App Password',
        placeholder: 'Your email password or app password',
      },
      folder: {
        type: 'text',
        label: 'Folder',
        defaultValue: 'INBOX',
      },
    },
  },
  httpPollTrigger: {
    type: 'httpPollTrigger',
    icon: 'RefreshCw',
    category: 'trigger',
    description: 'Poll HTTP endpoint at regular intervals',
    config: {
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://api.example.com/endpoint',
      },
      interval: {
        type: 'number',
        label: 'Polling Interval (ms)',
        defaultValue: 60000,
      },
      method: {
        type: 'select',
        label: 'HTTP Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
        ],
        defaultValue: 'GET',
      },
    },
  },
  cronTrigger: {
    type: 'cronTrigger',
    icon: 'Clock',
    category: 'trigger',
    description: 'Advanced scheduling with cron expressions',
    config: {
      cronExpression: {
        type: 'text',
        label: 'Cron Expression',
        placeholder: '* * * * *',
        defaultValue: '* * * * *',
      },
    },
  },

  // Exclusive custom nodes
  humanInTheLoop: {
    type: 'humanInTheLoop',
    icon: 'UserCheck',
    category: 'advanced',
    description: 'Pauses workflow and generates approval URL for human confirmation',
    config: {
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        defaultValue: 3600000,
      },
      notificationType: {
        type: 'select',
        label: 'Notification Type',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Email', value: 'email' },
          { label: 'Slack', value: 'slack' },
        ],
        defaultValue: 'none',
      },
      notificationEmail: {
        type: 'text',
        label: 'Notification Email',
        placeholder: 'admin@example.com',
      },
      approvalBaseUrl: {
        type: 'text',
        label: 'Approval Base URL',
        defaultValue: 'http://localhost:5173',
      },
    },
  },
  smartDataCleaner: {
    type: 'smartDataCleaner',
    icon: 'Sparkles',
    category: 'data',
    description: 'Automatically normalizes and cleans data (dates, phones, text)',
    config: {
      cleaningRules: {
        type: 'textarea',
        label: 'Cleaning Rules (JSON)',
        placeholder: '{"field1": {"type": "trim"}, "field2": {"type": "normalizePhone", "format": "E164"}}',
      },
    },
  },
  aiCostGuardian: {
    type: 'aiCostGuardian',
    icon: 'Shield',
    category: 'ai',
    description: 'Optimizes text to fit LLM token budgets and prevent cost overruns',
    config: {
      maxTokens: {
        type: 'number',
        label: 'Max Tokens',
        defaultValue: 4000,
      },
      targetField: {
        type: 'text',
        label: 'Target Field',
        defaultValue: 'prompt',
      },
      strategy: {
        type: 'select',
        label: 'Strategy',
        options: [
          { label: 'Truncate', value: 'truncate' },
          { label: 'Summarize', value: 'summarize' },
          { label: 'Compress', value: 'compress' },
          { label: 'Smart Truncate', value: 'smartTruncate' },
        ],
        defaultValue: 'truncate',
      },
    },
  },
  noCodeBrowserAutomator: {
    type: 'noCodeBrowserAutomator',
    icon: 'Globe',
    category: 'automation',
    description: 'Browser automation with visual selectors (Puppeteer/Playwright)',
    config: {
      actions: {
        type: 'textarea',
        label: 'Actions (JSON)',
        placeholder: '[{"type": "goto", "url": "https://example.com"}, {"type": "click", "selector": "#submit"}]',
      },
    },
  },
  aggregatorMultiSearch: {
    type: 'aggregatorMultiSearch',
    icon: 'Search',
    category: 'data',
    description: 'Search multiple engines simultaneously and consolidate results',
    config: {
      query: {
        type: 'text',
        label: 'Search Query',
        placeholder: 'your search terms',
      },
      engines: {
        type: 'textarea',
        label: 'Engines (JSON array)',
        placeholder: '["google", "duckduckgo", "linkedin"]',
        defaultValue: '["google", "duckduckgo"]',
      },
      maxResults: {
        type: 'number',
        label: 'Max Results per Engine',
        defaultValue: 10,
      },
      sortByRelevance: {
        type: 'boolean',
        label: 'Sort by Relevance',
        defaultValue: true,
      },
      deduplicate: {
        type: 'boolean',
        label: 'Deduplicate Results',
        defaultValue: true,
      },
    },
  },
  liveCanvasDebugger: {
    type: 'liveCanvasDebugger',
    icon: 'Bug',
    category: 'debug',
    description: 'Visual debugging with logs and performance metrics on canvas',
    config: {
      operations: {
        type: 'textarea',
        label: 'Debug Operations (JSON)',
        placeholder: '[{"type": "log", "level": "info", "message": "Processing data"}]',
      },
    },
  },
  socialMockupPreview: {
    type: 'socialMockupPreview',
    icon: 'Eye',
    category: 'social',
    description: 'Generate visual previews of social media posts before publishing',
    config: {
      platform: {
        type: 'select',
        label: 'Platform',
        options: [
          { label: 'Twitter/X', value: 'twitter' },
          { label: 'LinkedIn', value: 'linkedin' },
          { label: 'Facebook', value: 'facebook' },
          { label: 'Instagram', value: 'instagram' },
          { label: 'TikTok', value: 'tiktok' },
        ],
        defaultValue: 'twitter',
      },
      content: {
        type: 'textarea',
        label: 'Post Content',
        placeholder: 'Your post content here...',
      },
      mediaUrls: {
        type: 'textarea',
        label: 'Media URLs (JSON array)',
        placeholder: '["https://example.com/image1.jpg"]',
      },
    },
  },
  rateLimiterBypass: {
    type: 'rateLimiterBypass',
    icon: 'Zap',
    category: 'automation',
    description: 'Smart queue management with adaptive delays for API rate limits',
    config: {
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://api.example.com/endpoint',
      },
      method: {
        type: 'select',
        label: 'Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
        defaultValue: 'GET',
      },
      maxRetries: {
        type: 'number',
        label: 'Max Retries',
        defaultValue: 5,
      },
      baseDelay: {
        type: 'number',
        label: 'Base Delay (ms)',
        defaultValue: 1000,
      },
      maxDelay: {
        type: 'number',
        label: 'Max Delay (ms)',
        defaultValue: 60000,
      },
    },
  },
  ghost: {
    type: 'ghost',
    icon: 'Ghost',
    category: 'advanced',
    description: 'Silent mode for GDPR compliance - no logging or data storage',
    config: {
      operations: {
        type: 'textarea',
        label: 'Ghost Operations (JSON)',
        placeholder: '[{"type": "mask", "fields": ["ssn", "creditCard"]}]',
      },
    },
  },

  // ADVANCED INTEGRATION NODES
  appleEcosystem: {
    type: 'appleEcosystem',
    icon: 'Laptop',
    category: 'apple',
    description: 'iCloud Bridge: iMessage, Reminders, Notes, Music',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'iMessage', value: 'imessage' },
          { label: 'Reminders', value: 'reminders' },
          { label: 'Notes', value: 'notes' },
          { label: 'Music', value: 'music' },
        ],
      },
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Send', value: 'send' },
          { label: 'Read', value: 'read' },
          { label: 'Create', value: 'create' },
          { label: 'List', value: 'list' },
        ],
      },
    },
  },

  androidEcosystem: {
    type: 'androidEcosystem',
    icon: 'Smartphone',
    category: 'android',
    description: 'Google/APK Bridge: Messages, Contacts, ADB, APK',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'Messages (SMS/RCS)', value: 'messages' },
          { label: 'Contacts', value: 'contacts' },
          { label: 'ADB', value: 'adb' },
          { label: 'APK', value: 'apk' },
        ],
      },
      deviceId: {
        type: 'text',
        label: 'Device ID',
        placeholder: 'Optional device identifier',
      },
    },
  },

  gitHub: {
    type: 'gitHub',
    icon: 'Github',
    category: 'action',
    description: 'DevOps: Repos, PRs, Issues, GitHub Actions',
    config: {
      resource: {
        type: 'select',
        label: 'Resource',
        options: [
          { label: 'Repository', value: 'repository' },
          { label: 'Pull Request', value: 'pullRequest' },
          { label: 'Issue', value: 'issue' },
          { label: 'Actions', value: 'actions' },
          { label: 'Commit', value: 'commit' },
        ],
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'ghp_xxxxxxxxxxxx',
      },
      owner: {
        type: 'text',
        label: 'Owner',
        placeholder: 'repository owner',
      },
      repo: {
        type: 'text',
        label: 'Repository',
        placeholder: 'repository name',
      },
    },
  },

  figma: {
    type: 'figma',
    icon: 'PenTool',
    category: 'action',
    description: 'Design Ops: Components, Assets, Comments, Variables',
    config: {
      resource: {
        type: 'select',
        label: 'Resource',
        options: [
          { label: 'File', value: 'file' },
          { label: 'Components', value: 'components' },
          { label: 'Assets', value: 'assets' },
          { label: 'Comments', value: 'comments' },
          { label: 'Variables', value: 'variables' },
        ],
      },
      fileKey: {
        type: 'text',
        label: 'File Key',
        placeholder: 'Figma file key from URL',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Figma personal access token',
      },
    },
  },

  windowsControl: {
    type: 'windowsControl',
    icon: 'Monitor',
    category: 'advanced',
    description: 'PC Master: PowerShell, System, Process, Volume (CRITICAL SECURITY)',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'PowerShell', value: 'powershell' },
          { label: 'System', value: 'system' },
          { label: 'Process', value: 'process' },
          { label: 'Volume', value: 'volume' },
          { label: 'File', value: 'file' },
        ],
      },
      whitelistEnabled: {
        type: 'boolean',
        label: 'Enable Whitelist',
        defaultValue: true,
      },
      commandTimeout: {
        type: 'number',
        label: 'Command Timeout (ms)',
        defaultValue: 30000,
      },
    },
  },

  streaming: {
    type: 'streaming',
    icon: 'Radio',
    category: 'action',
    description: 'Twitch/YouTube/Kick: Live alerts, moderation, chat',
    config: {
      platform: {
        type: 'select',
        label: 'Platform',
        options: [
          { label: 'Twitch', value: 'twitch' },
          { label: 'YouTube', value: 'youtube' },
          { label: 'Kick', value: 'kick' },
        ],
      },
      resource: {
        type: 'select',
        label: 'Resource',
        options: [
          { label: 'Stream', value: 'stream' },
          { label: 'Channel', value: 'channel' },
          { label: 'Chat', value: 'chat' },
          { label: 'Moderation', value: 'moderation' },
        ],
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'OAuth2 access token',
      },
    },
  },

  infrastructure: {
    type: 'infrastructure',
    icon: 'Server',
    category: 'action',
    description: 'SSH/SFTP/SMTP: Remote commands, file transfer, email',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'SSH', value: 'ssh' },
          { label: 'SFTP', value: 'sftp' },
          { label: 'SMTP', value: 'smtp' },
        ],
      },
      host: {
        type: 'text',
        label: 'Host',
        placeholder: 'server hostname or IP',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 22,
      },
      username: {
        type: 'text',
        label: 'Username',
        placeholder: 'SSH/SMTP username',
      },
    },
  },

  // INDIVIDUAL APPLE NODES
  imessage: {
    type: 'imessage',
    icon: 'MessageCircle',
    category: 'apple',
    description: 'Send iMessages from iCloud account',
    config: {
      recipient: {
        type: 'text',
        label: 'Recipient (Email or Phone)',
        placeholder: '+1234567890 or email@example.com',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message here...',
        rows: 3,
      },
    },
  },
  icloudReminders: {
    type: 'icloudReminders',
    icon: 'CheckSquare',
    category: 'apple',
    description: 'Create/read/update iCloud Reminders',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create', value: 'create' },
          { label: 'Read', value: 'read' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'List All', value: 'list' },
        ],
        defaultValue: 'create',
      },
      title: {
        type: 'text',
        label: 'Reminder Title',
        placeholder: 'Buy groceries',
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        placeholder: 'Additional details...',
        rows: 3,
      },
      dueDate: {
        type: 'text',
        label: 'Due Date',
        placeholder: '2024-12-31T14:00:00',
      },
    },
  },
  icloudNotes: {
    type: 'icloudNotes',
    icon: 'FileText',
    category: 'apple',
    description: 'Manage iCloud Notes folders and notes',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create', value: 'create' },
          { label: 'Read', value: 'read' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'List Folders', value: 'listFolders' },
          { label: 'List Notes', value: 'listNotes' },
        ],
        defaultValue: 'create',
      },
      folder: {
        type: 'text',
        label: 'Folder Name',
        placeholder: 'Notes',
      },
      title: {
        type: 'text',
        label: 'Note Title',
        placeholder: 'Meeting Notes',
      },
      content: {
        type: 'textarea',
        label: 'Note Content',
        placeholder: 'Write your note here...',
        rows: 5,
      },
    },
  },
  icloudCalendar: {
    type: 'icloudCalendar',
    icon: 'Calendar',
    category: 'apple',
    description: 'Create/read/update iCloud Calendar events',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create Event', value: 'create' },
          { label: 'Read Events', value: 'read' },
          { label: 'Update Event', value: 'update' },
          { label: 'Delete Event', value: 'delete' },
        ],
        defaultValue: 'create',
      },
      title: {
        type: 'text',
        label: 'Event Title',
        placeholder: 'Team Meeting',
      },
      startDate: {
        type: 'text',
        label: 'Start Date',
        placeholder: '2024-12-31T14:00:00',
      },
      endDate: {
        type: 'text',
        label: 'End Date',
        placeholder: '2024-12-31T15:00:00',
      },
      location: {
        type: 'text',
        label: 'Location',
        placeholder: 'Conference Room A',
      },
      notes: {
        type: 'textarea',
        label: 'Event Notes',
        placeholder: 'Agenda items...',
        rows: 3,
      },
    },
  },
  icloudDrive: {
    type: 'icloudDrive',
    icon: 'Cloud',
    category: 'apple',
    description: 'Upload/download files from iCloud Drive',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Upload', value: 'upload' },
          { label: 'Download', value: 'download' },
          { label: 'List Files', value: 'list' },
          { label: 'Delete', value: 'delete' },
          { label: 'Create Folder', value: 'createFolder' },
        ],
        defaultValue: 'upload',
      },
      localPath: {
        type: 'text',
        label: 'Local File Path',
        placeholder: '/path/to/local/file',
      },
      iCloudPath: {
        type: 'text',
        label: 'iCloud Path (optional)',
        placeholder: '/Documents',
      },
    },
  },

  // INDIVIDUAL ANDROID NODES
  androidMessages: {
    type: 'androidMessages',
    icon: 'MessageSquare',
    category: 'android',
    description: 'Send SMS/RCS messages via Android',
    config: {
      recipient: {
        type: 'text',
        label: 'Recipient Phone Number',
        placeholder: '+1234567890',
      },
      message: {
        type: 'textarea',
        label: 'Message Content',
        placeholder: 'Your SMS message here...',
        rows: 3,
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },
  androidContacts: {
    type: 'androidContacts',
    icon: 'Users',
    category: 'android',
    description: 'Query Android contacts',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Get All', value: 'getAll' },
          { label: 'Get by ID', value: 'getById' },
          { label: 'Search', value: 'search' },
          { label: 'Create', value: 'create' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
        ],
        defaultValue: 'getAll',
      },
      contactId: {
        type: 'text',
        label: 'Contact ID',
        placeholder: '1',
      },
      limit: {
        type: 'number',
        label: 'Limit Results',
        defaultValue: 10,
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },
  androidADB: {
    type: 'androidADB',
    icon: 'Terminal',
    category: 'android',
    description: 'Execute ADB commands on connected device',
    config: {
      command: {
        type: 'textarea',
        label: 'ADB Command',
        placeholder: 'devices, install <apk>, shell pm list packages...',
        rows: 3,
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        defaultValue: 30000,
      },
    },
  },
  androidAPK: {
    type: 'androidAPK',
    icon: 'Package',
    category: 'android',
    description: 'Install/uninstall Android APK packages',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Install', value: 'install' },
          { label: 'Uninstall', value: 'uninstall' },
          { label: 'List Packages', value: 'listPackages' },
        ],
        defaultValue: 'install',
      },
      apkPath: {
        type: 'text',
        label: 'APK File Path',
        placeholder: '/path/to/app.apk',
      },
      packageName: {
        type: 'text',
        label: 'Package Name (for uninstall)',
        placeholder: 'com.example.app',
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },
  androidNotifications: {
    type: 'androidNotifications',
    icon: 'Bell',
    category: 'android',
    description: 'Send push notifications to Android device',
    config: {
      title: {
        type: 'text',
        label: 'Notification Title',
        placeholder: 'New Message',
      },
      text: {
        type: 'textarea',
        label: 'Notification Text',
        placeholder: 'You have a new message!',
        rows: 3,
      },
      packageName: {
        type: 'text',
        label: 'Package Name (optional)',
        placeholder: 'com.example.app',
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },

  // Additional Social Media nodes
  instagram: {
    type: 'instagram',
    icon: 'Instagram',
    category: 'social',
    description: 'Post content and manage Instagram',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Post Image', value: 'postImage' },
          { label: 'Post Video', value: 'postVideo' },
          { label: 'Post Story', value: 'postStory' },
          { label: 'Get Insights', value: 'getInsights' },
        ],
        defaultValue: 'postImage',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Your caption here...',
        rows: 3,
      },
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/image.jpg',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your Instagram access token',
      },
    },
  },
  facebook: {
    type: 'facebook',
    icon: 'Facebook',
    category: 'social',
    description: 'Post to Facebook pages and groups',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Post to Page', value: 'postToPage' },
          { label: 'Post to Group', value: 'postToGroup' },
          { label: 'Upload Photo', value: 'uploadPhoto' },
        ],
        defaultValue: 'postToPage',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your post content...',
        rows: 3,
      },
      pageId: {
        type: 'text',
        label: 'Page/Group ID',
        placeholder: '123456789',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your Facebook access token',
      },
    },
  },
  twitter: {
    type: 'twitter',
    icon: 'Twitter',
    category: 'social',
    description: 'Post tweets and manage Twitter account',
    config: {
      tweet: {
        type: 'textarea',
        label: 'Tweet Content',
        placeholder: 'What\'s happening?',
        rows: 3,
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your Twitter access token',
      },
      accessTokenSecret: {
        type: 'text',
        label: 'Access Token Secret',
        placeholder: 'Your Twitter access token secret',
      },
      apiKey: {
        type: 'text',
        label: 'API Key',
        placeholder: 'Your Twitter API key',
      },
      apiSecret: {
        type: 'text',
        label: 'API Secret',
        placeholder: 'Your Twitter API secret',
      },
    },
  },
  linkedin: {
    type: 'linkedin',
    icon: 'Linkedin',
    category: 'social',
    description: 'Share posts and articles on LinkedIn',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Share Post', value: 'sharePost' },
          { label: 'Publish Article', value: 'publishArticle' },
          { label: 'Share Article', value: 'shareArticle' },
        ],
        defaultValue: 'sharePost',
      },
      content: {
        type: 'textarea',
        label: 'Content',
        placeholder: 'Your post content...',
        rows: 5,
      },
      articleUrl: {
        type: 'text',
        label: 'Article URL (for sharing)',
        placeholder: 'https://example.com/article',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your LinkedIn access token',
      },
    },
  },
  tiktok: {
    type: 'tiktok',
    icon: 'Music',
    category: 'social',
    description: 'Manage TikTok content and analytics',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Upload Video', value: 'uploadVideo' },
          { label: 'Get Video Info', value: 'getVideoInfo' },
          { label: 'Get User Info', value: 'getUserInfo' },
        ],
        defaultValue: 'uploadVideo',
      },
      description: {
        type: 'textarea',
        label: 'Video Description',
        placeholder: 'Video description or caption...',
        rows: 3,
      },
      videoPath: {
        type: 'text',
        label: 'Video File Path/URL',
        placeholder: '/path/to/video.mp4',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your TikTok access token',
      },
    },
  },

  // PAYMENT NODES
  stripe: {
    type: 'stripe',
    icon: 'CreditCard',
    category: 'action',
    description: 'Stripe payment processing and subscription management',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create Payment Intent', value: 'createPaymentIntent' },
          { label: 'Create Customer', value: 'createCustomer' },
          { label: 'Create Subscription', value: 'createSubscription' },
          { label: 'Cancel Subscription', value: 'cancelSubscription' },
          { label: 'Retrieve Payment', value: 'retrievePayment' },
          { label: 'List Customers', value: 'listCustomers' },
          { label: 'List Products', value: 'listProducts' },
          { label: 'Create Price', value: 'createPrice' },
        ],
        defaultValue: 'createPaymentIntent',
      },
      apiKey: {
        type: 'text',
        label: 'Stripe API Key',
        placeholder: 'sk_live_... or sk_test_...',
      },
      amount: {
        type: 'number',
        label: 'Amount (in cents)',
        placeholder: '1000',
        defaultValue: 1000,
      },
      currency: {
        type: 'select',
        label: 'Currency',
        options: [
          { label: 'USD', value: 'usd' },
          { label: 'EUR', value: 'eur' },
          { label: 'GBP', value: 'gbp' },
          { label: 'CAD', value: 'cad' },
          { label: 'CHF', value: 'chf' },
          { label: 'AUD', value: 'aud' },
          { label: 'JPY', value: 'jpy' },
        ],
        defaultValue: 'usd',
      },
      description: {
        type: 'text',
        label: 'Description',
        placeholder: 'Payment for order #1234',
      },
      customerId: {
        type: 'text',
        label: 'Customer ID',
        placeholder: 'cus_...',
      },
      priceId: {
        type: 'text',
        label: 'Price ID',
        placeholder: 'price_...',
      },
      productId: {
        type: 'text',
        label: 'Product ID',
        placeholder: 'prod_...',
      },
    },
  },

  // WHATSAPP NODES
  whatsappSendMessage: {
    type: 'whatsappSendMessage',
    icon: 'MessageSquare',
    category: 'action',
    description: 'Send text messages via WhatsApp Business API',
    config: {
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message content...',
      },
      accessToken: {
        type: 'text',
        label: 'WhatsApp Access Token',
        placeholder: 'Your WhatsApp Business API token',
      },
    },
  },

  whatsappSendMedia: {
    type: 'whatsappSendMedia',
    icon: 'MessageSquare',
    category: 'action',
    description: 'Send media (images, videos, documents) via WhatsApp',
    config: {
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890',
      },
      mediaType: {
        type: 'select',
        label: 'Media Type',
        options: [
          { label: 'Image', value: 'image' },
          { label: 'Video', value: 'video' },
          { label: 'Document', value: 'document' },
          { label: 'Audio', value: 'audio' },
        ],
        defaultValue: 'image',
      },
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/media.jpg',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Optional caption for the media...',
      },
      accessToken: {
        type: 'text',
        label: 'WhatsApp Access Token',
        placeholder: 'Your WhatsApp Business API token',
      },
    },
  },

  whatsappSendLocation: {
    type: 'whatsappSendLocation',
    icon: 'MessageSquare',
    category: 'action',
    description: 'Send location coordinates via WhatsApp',
    config: {
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890',
      },
      latitude: {
        type: 'text',
        label: 'Latitude',
        placeholder: '40.7128',
      },
      longitude: {
        type: 'text',
        label: 'Longitude',
        placeholder: '-74.0060',
      },
      name: {
        type: 'text',
        label: 'Location Name',
        placeholder: 'Empire State Building',
      },
      address: {
        type: 'text',
        label: 'Address',
        placeholder: '350 Fifth Avenue, New York, NY 10118',
      },
      accessToken: {
        type: 'text',
        label: 'WhatsApp Access Token',
        placeholder: 'Your WhatsApp Business API token',
      },
    },
  },

  // TELEGRAM NODES
  telegramSendMessage: {
    type: 'telegramSendMessage',
    icon: 'Send',
    category: 'action',
    description: 'Send text messages via Telegram Bot API',
    config: {
      chatId: {
        type: 'text',
        label: 'Chat ID',
        placeholder: '-1001234567890 or @channelname',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message content...',
      },
      parseMode: {
        type: 'select',
        label: 'Parse Mode',
        options: [
          { label: 'None', value: '' },
          { label: 'Markdown', value: 'markdown' },
          { label: 'MarkdownV2', value: 'MarkdownV2' },
          { label: 'HTML', value: 'html' },
        ],
        defaultValue: '',
      },
      disableNotification: {
        type: 'boolean',
        label: 'Disable Notification',
        defaultValue: false,
      },
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      },
    },
  },

  telegramSendPhoto: {
    type: 'telegramSendPhoto',
    icon: 'Send',
    category: 'action',
    description: 'Send photos via Telegram Bot API',
    config: {
      chatId: {
        type: 'text',
        label: 'Chat ID',
        placeholder: '-1001234567890 or @channelname',
      },
      photoUrl: {
        type: 'text',
        label: 'Photo URL',
        placeholder: 'https://example.com/photo.jpg',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Optional caption for the photo...',
      },
      parseMode: {
        type: 'select',
        label: 'Parse Mode',
        options: [
          { label: 'None', value: '' },
          { label: 'Markdown', value: 'markdown' },
          { label: 'MarkdownV2', value: 'MarkdownV2' },
          { label: 'HTML', value: 'html' },
        ],
        defaultValue: '',
      },
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      },
    },
  },

  telegramBotCommand: {
    type: 'telegramBotCommand',
    icon: 'Send',
    category: 'action',
    description: 'Set up bot commands for Telegram Bot',
    config: {
      command: {
        type: 'text',
        label: 'Command',
        placeholder: '/start',
      },
      description: {
        type: 'text',
        label: 'Description',
        placeholder: 'Start the bot',
      },
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      },
    },
  },
};
