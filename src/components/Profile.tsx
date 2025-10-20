import React, { useState } from 'react';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600 mt-1">Your account information</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {user.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-slate-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">Member Since</label>
                <p className="text-slate-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">User ID</label>
                <p className="text-slate-900 mt-1 font-mono text-sm break-all">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
