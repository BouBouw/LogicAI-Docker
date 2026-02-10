/**
 * CustomNode - Custom React Flow Node Component
 * Features:
 * - Dark mode styling with TailwindCSS
 * - Dynamic Lucide icons based on node type
 * - Real brand SVG logos for major services
 * - Input/Output handles
 * - Status badge (idle, running, success, error)
 * - Type-specific border colors
 */

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import {
  Webhook, Globe, Variable, GitBranch, UserCheck, Sparkles, Shield, Search, FileText,
  Bug, Eye, Zap, Ghost, Edit, Code, Filter, Hash, Grid, Clock, AlertCircle,
  PlaySquare, Activity, FileInput, Rss, Upload, Terminal, Database, Mail,
  MessageSquare, MessageCircle, Send, HardDrive, CheckSquare,
  Smartphone, Laptop, Monitor, Radio, Server, MousePointerClick, RefreshCw,
  Cpu, Archive, Lock, ArrowUpDown, File, GitMerge, Mic,
} from 'lucide-react';
import type { CustomNodeData } from '../../types/node';
import {
  StripeIcon, PayPalIcon, SquareIcon, ShopifyIcon, WooCommerceIcon,
  SalesforceIcon, HubSpotIcon, ZendeskIcon, TwilioIcon, SendGridIcon,
  MailchimpIcon, AsanaIcon, LinearIcon, DropboxIcon, OneDriveIcon,
  BoxIcon, OpenAIIcon, GitHubIcon, FigmaIcon, GoogleSheetsIcon,
  GoogleDriveIcon, AirtableIcon, NotionIcon, TrelloIcon, PostgreSQLIcon,
  MongoDBIcon, RedisIcon, SupabaseIcon, InstagramIcon, FacebookIcon,
  TwitterIcon, LinkedInIcon, TikTokIcon,
} from '../icons/BrandIcons';
import '@xyflow/react/dist/style.css';

// Icon mapping for ALL node types (50+ nodes)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // CORE NODES (Logic & Data)
  webhook: Webhook,
  httpRequest: Globe,
  setVariable: Variable,
  condition: GitBranch,
  editFields: Edit,
  code: Code,
  filter: Filter,
  switch: GitBranch,
  merge: GitMerge,
  splitInBatches: Grid,
  wait: Clock,
  errorTrigger: AlertCircle,
  executeWorkflow: PlaySquare,
  limit: Hash,
  sort: ArrowUpDown,

  // TRIGGER NODES
  schedule: Clock,
  onSuccessFailure: Activity,
  formTrigger: FileInput,
  chatTrigger: MessageCircle,
  clickTrigger: MousePointerClick,
  emailTrigger: Mail,
  httpPollTrigger: RefreshCw,
  cronTrigger: Clock,

  // HTTP & DATA
  htmlExtract: Globe,
  rssRead: Rss,
  ftp: Upload,
  ssh: Terminal,

  // DATABASE
  mySQL: Database,
  postgreSQL: PostgreSQLIcon as any,
  mongoDB: MongoDBIcon as any,
  redis: RedisIcon as any,
  supabase: SupabaseIcon as any,

  // COMMUNICATION
  email: Mail,
  slack: MessageSquare,
  discord: MessageCircle,
  telegram: Send,
  whatsApp: MessageSquare,
  twilio: TwilioIcon as any,
  sendgrid: SendGridIcon as any,
  mailchimp: MailchimpIcon as any,

  // CLOUD PRODUCTIVITY
  googleSheets: GoogleSheetsIcon as any,
  googleDrive: GoogleDriveIcon as any,
  airtable: AirtableIcon as any,
  notion: NotionIcon as any,
  trello: TrelloIcon as any,

  // PROJECT MANAGEMENT
  asana: AsanaIcon as any,
  linear: LinearIcon as any,

  // CLOUD STORAGE
  dropbox: DropboxIcon as any,
  onedrive: OneDriveIcon as any,
  box: BoxIcon as any,

  // PAYMENT & E-COMMERCE
  stripe: StripeIcon as any,
  paypal: PayPalIcon as any,
  square: SquareIcon as any,
  shopify: ShopifyIcon as any,
  wooCommerce: WooCommerceIcon as any,

  // CRM & CUSTOMER SUPPORT
  salesforce: SalesforceIcon as any,
  hubspot: HubSpotIcon as any,
  zendesk: ZendeskIcon as any,

  // AI/LLM
  openAI: OpenAIIcon as any,
  aiAgent: Mic,
  vectorStore: Database,
  embeddings: Cpu,

  // BINARY
  readWriteBinaryFile: File,
  compression: Archive,
  crypto: Lock,

  // EXCLUSIVE CUSTOM NODES
  humanInTheLoop: UserCheck,
  smartDataCleaner: Sparkles,
  aiCostGuardian: Shield,
  noCodeBrowserAutomator: Globe,
  aggregatorMultiSearch: Search,
  pdfIntelligentParser: FileText,
  liveCanvasDebugger: Bug,
  socialMockupPreview: Eye,
  rateLimiterBypass: Zap,
  ghost: Ghost,

  // ADVANCED INTEGRATION NODES
  appleEcosystem: Laptop,
  androidEcosystem: Smartphone,
  gitHub: GitHubIcon as any,
  figma: FigmaIcon as any,
  windowsControl: Monitor,
  streaming: Radio,
  infrastructure: Server,

  // INDIVIDUAL APPLE NODES
  imessage: MessageCircle,
  icloudReminders: CheckSquare,
  icloudNotes: FileText,
  icloudCalendar: Clock,
  icloudDrive: HardDrive,

  // INDIVIDUAL ANDROID NODES
  androidMessages: MessageSquare,
  androidContacts: Database,
  androidADB: Terminal,
  androidAPK: Archive,
  androidNotifications: AlertCircle,

  // SOCIAL MEDIA NODES
  instagram: InstagramIcon as any,
  facebook: FacebookIcon as any,
  twitter: TwitterIcon as any,
  linkedin: LinkedInIcon as any,
  tiktok: TikTokIcon as any,
};

// Color mapping for ALL node types
const COLOR_MAP: Record<string, string> = {
  // CORE NODES
  webhook: 'border-purple-500',
  httpRequest: 'border-blue-500',
  setVariable: 'border-green-500',
  condition: 'border-orange-500',
  editFields: 'border-indigo-400',
  code: 'border-violet-400',
  filter: 'border-cyan-400',
  switch: 'border-orange-400',
  merge: 'border-pink-400',
  splitInBatches: 'border-teal-400',
  wait: 'border-gray-400',
  errorTrigger: 'border-red-400',
  executeWorkflow: 'border-emerald-400',
  limit: 'border-lime-400',
  sort: 'border-sky-400',

  // TRIGGER NODES
  schedule: 'border-amber-500',
  onSuccessFailure: 'border-rose-500',
  formTrigger: 'border-blue-400',
  chatTrigger: 'border-indigo-500',
  clickTrigger: 'border-pink-500',
  emailTrigger: 'border-gray-500',
  httpPollTrigger: 'border-teal-500',
  cronTrigger: 'border-yellow-500',

  // HTTP & DATA
  htmlExtract: 'border-green-400',
  rssRead: 'border-orange-400',
  ftp: 'border-purple-400',
  ssh: 'border-gray-500',

  // DATABASE
  mySQL: 'border-blue-600',
  mongoDB: 'border-green-600',
  redis: 'border-red-600',
  supabase: 'border-emerald-500',

  // COMMUNICATION
  email: 'border-gray-500',
  slack: 'border-purple-600',
  discord: 'border-indigo-500',
  telegram: 'border-cyan-500',
  whatsApp: 'border-green-500',

  // CLOUD PRODUCTIVITY
  googleSheets: 'border-green-600',
  googleDrive: 'border-yellow-500',
  airtable: 'border-blue-500',
  notion: 'border-gray-400',
  trello: 'border-orange-500',

  // AI/LLM
  openAI: 'border-emerald-400',
  aiAgent: 'border-violet-400',
  vectorStore: 'border-pink-400',
  embeddings: 'border-cyan-400',

  // BINARY
  readWriteBinaryFile: 'border-gray-400',
  compression: 'border-orange-400',
  crypto: 'border-red-400',

  // EXCLUSIVE CUSTOM NODES
  humanInTheLoop: 'border-pink-500',
  smartDataCleaner: 'border-yellow-500',
  aiCostGuardian: 'border-cyan-500',
  noCodeBrowserAutomator: 'border-indigo-500',
  aggregatorMultiSearch: 'border-teal-500',
  pdfIntelligentParser: 'border-rose-500',
  liveCanvasDebugger: 'border-lime-500',
  socialMockupPreview: 'border-violet-500',
  rateLimiterBypass: 'border-amber-500',
  ghost: 'border-gray-400',

  // ADVANCED INTEGRATION NODES
  appleEcosystem: 'border-gray-300',
  androidEcosystem: 'border-green-400',
  gitHub: 'border-gray-300',
  figma: 'border-pink-400',
  windowsControl: 'border-blue-400',
  streaming: 'border-purple-400',
  infrastructure: 'border-orange-400',

  // INDIVIDUAL APPLE NODES
  imessage: 'border-blue-400',
  icloudReminders: 'border-blue-400',
  icloudNotes: 'border-blue-400',
  icloudCalendar: 'border-blue-400',
  icloudDrive: 'border-blue-400',

  // INDIVIDUAL ANDROID NODES
  androidMessages: 'border-green-400',
  androidContacts: 'border-green-400',
  androidADB: 'border-green-400',
  androidAPK: 'border-green-400',
  androidNotifications: 'border-green-400',

  // SOCIAL MEDIA NODES
  instagram: 'border-pink-500',
  facebook: 'border-blue-600',
  twitter: 'border-sky-500',
  linkedin: 'border-blue-700',
  tiktok: 'border-gray-800',
};

export default function CustomNode({ data, selected }: NodeProps) {
  const nodeData = (data as unknown) as CustomNodeData;
  const Icon = ICON_MAP[nodeData.type] || Variable;
  const borderColor = COLOR_MAP[nodeData.type] || 'border-gray-600';
  const status = nodeData.status || 'idle';

  // Check if this is a brand icon (returns JSX, not a component)
  const isBrandIcon = typeof Icon !== 'function' || (
    nodeData.type in ['stripe', 'paypal', 'square', 'shopify', 'wooCommerce',
      'salesforce', 'hubspot', 'zendesk', 'twilio', 'sendgrid', 'mailchimp',
      'asana', 'linear', 'dropbox', 'onedrive', 'box', 'openAI', 'gitHub',
      'figma', 'googleSheets', 'googleDrive', 'airtable', 'notion', 'trello',
      'postgreSQL', 'mongoDB', 'redis', 'supabase', 'instagram', 'facebook',
      'twitter', 'linkedin', 'tiktok']
  );

  return (
    <div
      className={`
        relative w-16 h-16 bg-black rounded-lg border-2
        ${borderColor}
        ${selected ? 'ring-2 ring-brand-blue/60 shadow-[0_0_12px_rgba(0,112,255,0.4)]' : 'shadow-md'}
        hover:shadow-lg hover:scale-105
        group
        flex items-center justify-center
        transition-all duration-200
      `}
      style={{
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        pointerEvents: 'all',
        willChange: 'transform',
      }}
      title={`${nodeData.label} (${nodeData.type})`}
    >
      {/* Input Handle (left side) - NOT shown for trigger nodes */}
      {nodeData.type !== 'webhook' &&
       nodeData.type !== 'schedule' &&
       nodeData.type !== 'formTrigger' &&
       nodeData.type !== 'chatTrigger' &&
       nodeData.type !== 'clickTrigger' &&
       nodeData.type !== 'emailTrigger' &&
       nodeData.type !== 'httpPollTrigger' &&
       nodeData.type !== 'cronTrigger' &&
       nodeData.type !== 'onSuccessFailure' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-600 border-2 border-white/10 -left-0.5!"
        />
      )}

      {/* Icon - Brand icons render as-is, Lucide icons get className */}
      {isBrandIcon ? (
        <Icon />
      ) : (
        <Icon className={`w-8 h-8 ${borderColor.replace('border-', 'text-').replace('-500', '-400').replace('-600', '-400')} transition-colors duration-200`} />
      )}

      {/* Status indicator dot */}
      {status !== 'idle' && (
        <div
          className={`
            absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-black
            ${status === 'running' ? 'bg-blue-500 animate-pulse' : ''}
            ${status === 'success' ? 'bg-green-500' : ''}
            ${status === 'error' ? 'bg-red-500' : ''}
          `}
        />
      )}

      {/* Label tooltip - shows on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
        <div className="font-semibold">{nodeData.label}</div>
        <div className="text-gray-400 text-[10px] capitalize">{nodeData.type}</div>
      </div>

      {/* Output Handle (right side) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-600 !border-2 !border-gray-400 -right-0.5!"
      />
    </div>
  );
}
