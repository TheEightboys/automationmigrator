import React, { useState, useEffect } from 'react';
import { Plus, Bot, Play, Pause, Archive, Trash2 } from 'lucide-react';
import { supabase, Agent } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Agents: React.FC = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      loadAgents();
    }
  }, [user]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('agents').insert({
        user_id: user!.id,
        name: formData.name,
        description: formData.description,
        status: 'active',
        config: {},
      });

      if (error) throw error;
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      loadAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const updateAgentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      loadAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await supabase.from('agents').delete().eq('id', id);
      if (error) throw error;
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-600 mt-1">Automate recurring migration tasks</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus size={20} />
          New Agent
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Agent</h2>
          <form onSubmit={createAgent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Migration Processor"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this agent does..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: '', description: '' });
                }}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Agent
              </button>
            </div>
          </form>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Bot className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No agents yet</h3>
          <p className="text-slate-600">
            Create your first agent to automate workflow migrations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Bot className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        agent.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : agent.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              {agent.description && (
                <p className="text-sm text-slate-600 mb-4">{agent.description}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                {agent.status === 'active' ? (
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'paused')}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'active')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Play size={16} />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => updateAgentStatus(agent.id, 'archived')}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Archive size={16} />
                </button>
                <button
                  onClick={() => deleteAgent(agent.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
        <p className="text-blue-800 text-sm">
          Advanced agent features including scheduled migrations, automatic retry logic,
          batch processing, and AI-powered workflow optimization are currently in development.
        </p>
      </div>
    </div>
  );
};
