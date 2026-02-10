/**
 * Dashboard - Page principale affichant tous les workflows
 * Fonctionnalités :
 * - Header bar avec navigation
 * - Sidebar gauche avec menu
 * - Liste des workflows avec cartes
 * - Bouton créer un nouveau workflow
 * - Actions rapides (éditer, supprimer, activer/désactiver)
 * - Indicateurs de statut
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Play,
  Square,
  Trash2,
  Edit,
  FolderOpen,
  Home,
  Settings,
  FileText,
  Zap,
  Users,
  Archive,
  ChevronDown,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { workflowApi } from '../lib/api';
import type { Workflow } from '../types/workflow';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowApi.getAll();
      setWorkflows(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce workflow ?')) {
      return;
    }

    try {
      await workflowApi.delete(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Échec de la suppression du workflow');
    }
  }

  async function handleToggleActive(workflow: Workflow) {
    try {
      const updated = await workflowApi.update(workflow.id, {
        isActive: !workflow.isActive,
      });
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update workflow');
    }
  }

  async function handleCreateNew() {
    try {
      const newWorkflow = await workflowApi.create({
        name: 'Nouveau Workflow',
        description: '',
        nodes: [],
        edges: [],
      });
      navigate(`/workflow/${newWorkflow.id}`);
    } catch (err: any) {
      alert(err.message || 'Échec de la création du workflow');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des workflows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadWorkflows}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-hover transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex flex-col">
      {/* Header Bar - Toute la largeur */}
      <header className="bg-bg-card border-b border-white/10 px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={"./LogicAI.ico"} alt="LogicAI" className='w-8 h-8' />
            <div>
              <h1 className="text-xl font-bold text-white">LogicAI</h1>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className='flex flex-row bg-brand-blue rounded-md'>
              <button 
              onClick={handleCreateNew}
              className='py-1.5 flex flex-row items-center gap-2 px-4 rounded-lg hover:bg-brand-hover transition-colors'
              >
                <Plus className='w-5 h-5 text-white' />
                <span className='text-white font-medium'>
                  Nouveau workflow
                </span>
              </button>
              <button className='border-l border-white/50 px-1'>
                <ChevronDown className='w-4 h-4 text-white' />
              </button>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-100" />
            </button>
            <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">U</span>
              </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - En dessous de la header */}
        <aside className="w-64 bg-card border-r border-white/10 flex flex-col">
          {/* Navigation - Haut */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href="/"
              className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 text-amber-500 rounded-lg border border-orange-500/30"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Workflows</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Exécutions</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Archive className="w-5 h-5" />
              <span>Templates</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Équipe</span>
            </a>
          </nav>

          {/* Navigation - Bas */}
          <nav className="p-4 space-y-2 border-t border-white/10">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Aide</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-black">
          {/* Content Area */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-8xl mx-auto">
              {/* Workflow Grid */}
              {workflows.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aucun workflow pour le moment
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Créez votre premier workflow pour commencer
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="px-8 py-4 bg-brand-blue hover:bg-brand-hover text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-xl shadow-brand-blue/30 font-medium text-lg"
                  >
                    Créer votre premier Workflow
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="bg-bg-card border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-200 hover:shadow-xl hover:shadow-brand-blue/5"
                      style={{
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${workflow.isActive
                              ? 'bg-green-900 text-green-300'
                              : 'bg-gray-700 text-gray-300'
                            }`}
                        >
                          {workflow.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {workflow.nodes.length} nœuds
                        </span>
                      </div>

                      {/* Workflow Info */}
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}

                      {/* Webhook URL */}
                      {workflow.webhookPath && (
                        <p className="text-xs text-gray-500 mb-4 font-mono break-all bg-gray-800/50 p-2 rounded">
                          {`${window.location.origin}/webhook/${workflow.id}`}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                        <button
                          onClick={() => navigate(`/workflow/${workflow.id}`)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Éditer
                        </button>
                        <button
                          onClick={() => handleToggleActive(workflow)}
                          className={`p-2.5 rounded transition-colors ${workflow.isActive
                              ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-900/70'
                              : 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                            }`}
                          title={workflow.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {workflow.isActive ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(workflow.id)}
                          className="p-2.5 bg-red-900/50 text-red-300 rounded hover:bg-red-900/70 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
