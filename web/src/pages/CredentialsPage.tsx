/**
 * Credentials Manager Page
 *
 * Full page for managing workflow credentials.
 * Create, edit, test, and delete credentials.
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
} from 'lucide-react';
import { CredentialTypeIcon } from '../components/credentials/CredentialTypeIcon';

/**
 * Credential data structure
 */
export interface Credential {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  isEncrypted: boolean;
}

/**
 * Credential type schema
 */
export interface CredentialTypeSchema {
  type: string;
  displayName: string;
  icon: string;
  fields: CredentialField[];
  documentationUrl?: string;
}

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
}

/**
 * Mock credential types (would come from backend)
 */
const CREDENTIAL_TYPES: CredentialTypeSchema[] = [
  {
    type: 'apiKey',
    displayName: 'API Key',
    icon: 'key',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'My API Key',
        description: 'A friendly name for this credential',
      },
      {
        key: 'key',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'Enter your API key',
      },
    ],
  },
  {
    type: 'basicAuth',
    displayName: 'Basic Auth',
    icon: 'lock',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'My Basic Auth',
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        required: true,
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        required: true,
      },
    ],
  },
  {
    type: 'oauth2',
    displayName: 'OAuth2',
    icon: 'shield',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'My OAuth2',
      },
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text',
        required: true,
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        required: true,
      },
      {
        key: 'scope',
        label: 'Scopes',
        type: 'textarea',
        required: false,
        description: 'Space-separated list of scopes',
      },
    ],
  },
  {
    type: 'http',
    displayName: 'HTTP',
    icon: 'globe',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'url',
        label: 'Base URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com',
      },
      {
        key: 'headers',
        label: 'Default Headers',
        type: 'textarea',
        required: false,
        description: 'JSON format headers',
        defaultValue: '{}',
      },
    ],
  },
  {
    type: 'slack',
    displayName: 'Slack',
    icon: 'message-square',
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'botToken',
        label: 'Bot Token',
        type: 'password',
        required: true,
        placeholder: 'xoxb-...',
      },
      {
        key: 'signingSecret',
        label: 'Signing Secret',
        type: 'password',
        required: false,
      },
    ],
  },
];

/**
 * Credential Form Modal
 */
const CredentialFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingCredential?: Credential;
}> = ({ isOpen, onClose, onSave, editingCredential }) => {
  const [selectedType, setSelectedType] = useState(editingCredential?.type || 'apiKey');
  const [formData, setFormData] = useState<Record<string, any>>(
    editingCredential?.data || {}
  );
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const schema = useMemo(
    () => CREDENTIAL_TYPES.find((t) => t.type === selectedType),
    [selectedType]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCredential) {
      onSave({
        name: formData.name,
        type: selectedType,
        data: formData,
        isEncrypted: true,
      });
    } else {
      onSave({
        name: formData.name,
        type: selectedType,
        data: formData,
        isEncrypted: true,
      });
    }
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Mock test - would call backend API
    setTimeout(() => {
      setTesting(false);
      setTestResult('success');
    }, 1500);
  };

  if (!isOpen || !schema) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingCredential ? 'Edit Credential' : 'New Credential'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Credential type selector (only for new credentials) */}
            {!editingCredential && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setFormData({});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CREDENTIAL_TYPES.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic fields */}
            {schema.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || field.defaultValue || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={
                        field.type === 'password' && !showSecrets[field.key]
                          ? 'password'
                          : 'text'
                      }
                      value={formData[field.key] || field.defaultValue || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowSecrets({
                            ...showSecrets,
                            [field.key]: !showSecrets[field.key],
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showSecrets[field.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {field.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            ))}

            {/* Test button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>

              {testResult === 'success' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Connection successful!
                </div>
              )}
              {testResult === 'error' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <XCircle className="w-4 h-4" />
                  Connection failed. Please check your credentials.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Credentials Page
 */
export const CredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | undefined>();
  const [testing, setTesting] = useState<Set<string>>(new Set());

  // Filter credentials by search
  const filteredCredentials = useMemo(() => {
    if (!searchQuery) return credentials;
    return credentials.filter((cred) =>
      cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [credentials, searchQuery]);

  const handleSave = (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCredential) {
      setCredentials(
        credentials.map((c) =>
          c.id === editingCredential.id
            ? { ...credential, id: c.id, createdAt: c.createdAt, updatedAt: new Date() }
            : c
        )
      );
    } else {
      const newCredential: Credential = {
        ...credential,
        id: Math.random().toString(36),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCredentials([...credentials, newCredential]);
    }
    setEditingCredential(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      setCredentials(credentials.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setShowAddModal(true);
  };

  const handleTest = async (id: string) => {
    setTesting((prev) => new Set(prev).add(id));

    // Mock test - would call backend API
    setTimeout(() => {
      setTesting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Credentials
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage API keys, tokens, and other sensitive data
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCredential(undefined);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Credential
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Credentials list */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCredentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Shield className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No credentials yet</p>
            <p className="text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Create your first credential to get started'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCredentials.map((credential) => (
              <div
                key={credential.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <CredentialTypeIcon type={credential.type} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {credential.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {CREDENTIAL_TYPES.find((t) => t.type === credential.type)?.displayName ||
                          credential.type}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Created {new Date(credential.createdAt).toLocaleDateString()}
                        </span>
                        {credential.lastUsed && (
                          <span>
                            Last used {new Date(credential.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTest(credential.id)}
                      disabled={testing.has(credential.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
                      title="Test connection"
                    >
                      {testing.has(credential.id) ? (
                        <Loader2 className="w-4 h-4 text-gray-600 dark:text-gray-400 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(credential)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(credential.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <CredentialFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCredential(undefined);
        }}
        onSave={handleSave}
        editingCredential={editingCredential}
      />
    </div>
  );
};

export default CredentialsPage;
