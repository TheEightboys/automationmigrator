import React, { useState } from 'react';
import { User, Mail, Calendar, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Profile: React.FC = () => {
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;
      setMessage('Profile updated successfully');
    } catch (error: any) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Account Information</h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </div>
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Member Since
                  </div>
                </label>
                <input
                  type="text"
                  value={
                    profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : ''
                  }
                  disabled
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes('Error')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Subscription</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Current Plan</p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {profile?.subscription_tier || 'Free'}
                </p>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Manage Subscription
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Account Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-slate-700 hover:bg-white rounded-lg transition-colors text-sm">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-2 text-slate-700 hover:bg-white rounded-lg transition-colors text-sm">
                Download Data
              </button>
              <button className="w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 text-sm">
          If you have any questions about your account or need assistance, our support team
          is here to help.
        </p>
      </div>
    </div>
  );
};
