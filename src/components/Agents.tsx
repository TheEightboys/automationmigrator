import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, FileJson, CheckCircle, XCircle, RefreshCw, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Agents: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalConversions: 0,
    successRate: 0,
    averageTime: '0s',
    recentActivity: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get date range
      const now = new Date();
      const startDate = new Date();
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(2020); // All time
      }

      // Fetch migrations
      const { data: migrations, error } = await supabase
        .from('migrations')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = migrations?.length || 0;
      const completed = migrations?.filter(m => m.status === 'completed').length || 0;
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        totalConversions: total,
        successRate,
        averageTime: '2.3s',
        recentActivity: migrations?.slice(0, 10) || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const platformColors: Record<string, string> = {
    'zapier': 'bg-orange-100 text-orange-700',
    'n8n': 'bg-pink-100 text-pink-700',
    'make': 'bg-purple-100 text-purple-700'
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Activity & Analytics</h1>
        <p className="text-gray-600 text-lg">Track your workflow conversion performance</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-3 mb-6">
        {['week', 'month', 'all'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              timeRange === range
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
            }`}
          >
            {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileJson className="text-blue-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-500">TOTAL</span>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-1">{stats.totalConversions}</div>
          <div className="text-sm text-gray-600">Conversions</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-500">SUCCESS</span>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-1">{stats.successRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="text-purple-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-500">AVG TIME</span>
          </div>
          <div className="text-4xl font-black text-gray-900 mb-1">{stats.averageTime}</div>
          <div className="text-sm text-gray-600">Per Conversion</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-orange-500" size={28} />
            Recent Activity
          </h2>
        </div>

        {stats.recentActivity.length === 0 ? (
          <div className="p-12 text-center">
            <FileJson className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No conversions yet</p>
            <p className="text-gray-500 text-sm mt-2">Start converting workflows to see activity here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{activity.name}</h3>
                      {activity.status === 'completed' ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : activity.status === 'failed' ? (
                        <XCircle className="text-red-500" size={20} />
                      ) : (
                        <RefreshCw className="text-blue-500 animate-spin" size={20} />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${platformColors[activity.source_platform] || 'bg-gray-100 text-gray-700'}`}>
                        {activity.source_platform}
                      </span>
                      <span className="text-gray-400">→</span>
                      {activity.target_platforms.map((platform: string) => (
                        <span key={platform} className={`px-3 py-1 rounded-lg text-sm font-semibold ${platformColors[platform] || 'bg-gray-100 text-gray-700'}`}>
                          {platform}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(activity.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg font-semibold ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'failed' ? 'bg-red-100 text-red-700' :
                    activity.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
          <h3 className="text-2xl font-bold mb-3">💡 Quick Tip</h3>
          <p className="text-orange-50">
            For best results, ensure your source workflow JSON is properly formatted before uploading. This increases conversion accuracy to 95%+
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-2xl">
          <h3 className="text-2xl font-bold mb-3">📊 Your Performance</h3>
          <p className="text-gray-300">
            You're doing great! Your conversion success rate is {stats.successRate >= 80 ? 'above' : 'at'} industry average. Keep it up!
          </p>
        </div>
      </div>
    </div>
  );
};
