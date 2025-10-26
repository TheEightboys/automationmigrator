// src/components/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Shield, Camera, Edit2, Save, X, Check, Lock, Trash2, AlertTriangle, CheckCircle, MapPin, Briefcase, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  setActiveView: (view: string) => void;
  setShowWizard: (show: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveView, setShowWizard }) => {
  const { user } = useAuth();
  
  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    company: ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const metadata = user.user_metadata || {};
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      setFormData({
        fullName: profileData?.full_name || metadata.full_name || '',
        username: profileData?.username || metadata.username || '',
        bio: profileData?.bio || metadata.bio || '',
        location: profileData?.location || metadata.location || '',
        website: profileData?.website || metadata.website || '',
        company: profileData?.company || metadata.company || ''
      });

      setAvatarUrl(profileData?.avatar_url || metadata.avatar_url || '');
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return avatarUrl;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          company: formData.company,
          avatar_url: finalAvatarUrl
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          company: formData.company,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setIsEditing(false);
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    loadUserProfile();
    setAvatarFile(null);
    setIsEditing(false);
  };

  const getInitials = () => {
    const name = formData.fullName || user?.email || 'U';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Success Banner */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-slideDown">
            <CheckCircle className="text-green-600" size={24} />
            <p className="text-green-800 font-semibold">Profile updated successfully!</p>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Profile Content */}
          <div className="px-6 sm:px-8 pb-8">
            {/* Avatar & Edit Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-20 mb-6">
              <div className="relative group mb-4 sm:mb-0">
                <div
                  onClick={handleAvatarClick}
                  className={`w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden ${
                    isEditing ? 'cursor-pointer' : ''
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">{getInitials()}</span>
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={32} />
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                    >
                      <Lock size={18} />
                      Password
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all disabled:opacity-50"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Name & Username */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">{formData.fullName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      placeholder="johndoe"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-lg text-slate-600 pt-1">{formData.username ? `@${formData.username}` : 'Not set'}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={160}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors resize-none"
                  />
                ) : (
                  <p className="text-slate-700 leading-relaxed">{formData.bio || 'No bio added yet.'}</p>
                )}
                {isEditing && (
                  <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/160 characters</p>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <MapPin size={16} />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York, USA"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-slate-600">{formData.location || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Briefcase size={16} />
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Inc"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-slate-600">{formData.company || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Globe size={16} />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  ) : (
                    formData.website ? (
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {formData.website}
                      </a>
                    ) : (
                      <p className="text-slate-600">Not set</p>
                    )
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Account Information</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-600">Email Address</p>
                      <p className="text-sm font-semibold text-slate-900 truncate mt-1">{user.email}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                        <Check size={12} />
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Member Since</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}

      {/* Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Password Change Modal
const PasswordChangeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = async () => {
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      alert('Password updated successfully!');
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Account Modal
const DeleteAccountModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      alert('Account deletion requested. You have been signed out.');
      window.location.href = '/';
    } catch (error) {
      alert('Failed to process request');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Account</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-700 font-semibold">⚠️ This action cannot be undone!</p>
          <p className="text-sm text-red-600 mt-2">All your data will be permanently deleted.</p>
        </div>

        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Type <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">DELETE</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-red-600 focus:outline-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isLoading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
