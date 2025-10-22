import React, { useState, useEffect } from 'react';
import { Store, Search, Filter, ShoppingCart, Star, Download, Plus, Eye, TrendingUp, Package, DollarSign, X, Upload, Tag, CheckCircle } from 'lucide-react';
import { supabase, WorkflowTemplate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Agents: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');
  const [activeTab, setActiveTab] = useState<'browse' | 'myTemplates' | 'purchases'>('browse');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', icon: Package },
    { id: 'crm', label: 'CRM', icon: TrendingUp },
    { id: 'marketing', label: 'Marketing', icon: Star },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'productivity', label: 'Productivity', icon: CheckCircle },
    { id: 'data', label: 'Data Processing', icon: Download },
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, sortBy]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('workflow_templates')
        .select(`
          *,
          seller:seller_id (
            email,
            user_metadata
          )
        `)
        .eq('status', 'active');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'popular') {
        query = query.order('downloads', { ascending: false });
      } else if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurchase = async (template: WorkflowTemplate) => {
    if (!user) {
      alert('Please sign in to purchase templates');
      return;
    }

    // In production, integrate with actual payment gateway
    try {
      const { error } = await supabase.from('template_purchases').insert({
        buyer_id: user.id,
        template_id: template.id,
        amount: template.price,
        payment_status: 'completed'
      });

      if (error) {
        if (error.code === '23505') {
          alert('You already own this template!');
        } else {
          throw error;
        }
        return;
      }

      // Update download count
      await supabase
        .from('workflow_templates')
        .update({ downloads: template.downloads + 1 })
        .eq('id', template.id);

      alert('Purchase successful! Check "My Purchases" to download.');
      loadTemplates();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Store className="text-orange-500" size={32} />
                Template Marketplace
              </h1>
              <p className="text-gray-600 mt-1">Buy and sell workflow automation templates</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-lg"
            >
              <Plus size={20} />
              Sell Template
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'browse', label: 'Browse', icon: Store },
              { id: 'myTemplates', label: 'My Templates', icon: Package },
              { id: 'purchases', label: 'My Purchases', icon: ShoppingCart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none font-medium"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Categories */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
                  }`}
                >
                  <category.icon size={18} />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-20">
                <Package className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-600 text-lg">This Marketplace feature is still under development . it will be available soon</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPurchase={handlePurchase}
                    onView={setSelectedTemplate}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'myTemplates' && (
          <MyTemplates userId={user?.id} />
        )}

        {activeTab === 'purchases' && (
          <MyPurchases userId={user?.id} />
        )}
      </div>

      {/* Upload Template Modal */}
      {showUploadModal && (
        <UploadTemplateModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadTemplates();
          }}
        />
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: WorkflowTemplate;
  onPurchase: (template: WorkflowTemplate) => void;
  onView: (template: WorkflowTemplate) => void;
}> = ({ template, onPurchase, onView }) => {
  const platformColors: Record<string, string> = {
    'zapier': 'bg-orange-100 text-orange-700',
    'n8n': 'bg-pink-100 text-pink-700',
    'make': 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-orange-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
      {/* Preview Image */}
      <div className="h-48 bg-gradient-to-br from-orange-500 to-pink-500 relative">
        {template.preview_image ? (
          <img src={template.preview_image} alt={template.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="text-white/50" size={64} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${platformColors[template.source_platform]}`}>
            {template.source_platform}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{template.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
            <span className="font-semibold">{template.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={16} />
            <span>{template.downloads}</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-black text-gray-900">
            ${template.price.toFixed(2)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onView(template)}
              className="p-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-all"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={() => onPurchase(template)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Upload Template Modal Component
const UploadTemplateModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'productivity',
    source_platform: 'zapier' as 'zapier' | 'n8n' | 'make',
    price: '',
    tags: '',
  });
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !workflowFile) return;

    setUploading(true);
    try {
      // Read workflow JSON
      const fileText = await workflowFile.text();
      const workflowJson = JSON.parse(fileText);

      const { error } = await supabase.from('workflow_templates').insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        source_platform: formData.source_platform,
        target_platforms: ['zapier', 'n8n', 'make'],
        workflow_json: workflowJson,
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'active'
      });

      if (error) throw error;
      alert('Template uploaded successfully!');
      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload template. Please check your JSON file and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sell Your Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                required
              >
                <option value="crm">CRM</option>
                <option value="marketing">Marketing</option>
                <option value="ecommerce">E-commerce</option>
                <option value="productivity">Productivity</option>
                <option value="data">Data Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
              <select
                value={formData.source_platform}
                onChange={(e) => setFormData({ ...formData, source_platform: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                required
              >
                <option value="zapier">Zapier</option>
                <option value="n8n">n8n</option>
                <option value="make">Make</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="automation, crm, email"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Workflow JSON File *</label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setWorkflowFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Template'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Template Detail Modal Component
const TemplateDetailModal: React.FC<{
  template: WorkflowTemplate;
  onClose: () => void;
  onPurchase: (template: WorkflowTemplate) => void;
}> = ({ template, onClose, onPurchase }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{template.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="font-bold text-lg">{template.rating.toFixed(1)}</span>
                <span className="text-gray-600">({template.total_reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Download size={20} />
                <span>{template.downloads} downloads</span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{template.description}</p>

            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {template.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">What's Included</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span>Complete workflow JSON</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span>Implementation guide</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-4xl font-black text-gray-900">
                ${template.price.toFixed(2)}
              </div>
              <button
                onClick={() => {
                  onPurchase(template);
                  onClose();
                }}
                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-all shadow-lg"
              >
                Purchase Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Templates Component
const MyTemplates: React.FC<{ userId?: string }> = ({ userId }) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadMyTemplates();
    }
  }, [userId]);

  const loadMyTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-gray-600 text-lg">You haven't listed any templates yet</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div key={template.id} className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-2">{template.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Download size={16} />
              {template.downloads}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={16} />
              ${(template.downloads * template.price).toFixed(2)}
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">${template.price}</div>
        </div>
      ))}
    </div>
  );
};

// My Purchases Component
const MyPurchases: React.FC<{ userId?: string }> = ({ userId }) => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadPurchases();
    }
  }, [userId]);

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('template_purchases')
        .select(`
          *,
          template:template_id (
            id,
            title,
            description,
            workflow_json,
            source_platform
          )
        `)
        .eq('buyer_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (purchase: any) => {
    const dataStr = JSON.stringify(purchase.template.workflow_json, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${purchase.template.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-gray-600 text-lg">No purchases yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">{purchase.template.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{purchase.template.description}</p>
            <p className="text-gray-500 text-xs">
              Purchased on {new Date(purchase.purchased_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleDownload(purchase)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
          >
            <Download size={20} />
            Download
          </button>
        </div>
      ))}
    </div>
  );
};
