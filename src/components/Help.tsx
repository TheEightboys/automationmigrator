import React, { useState, useEffect } from 'react';
import { Book, ChevronRight } from 'lucide-react';
import { supabase, HelpArticle } from '../lib/supabase';

export const Help: React.FC = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'migration', label: 'Migration' },
    { id: 'agents', label: 'Agents' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .order('category')
        .order('order');

      if (error) throw error;
      setArticles(data || []);
      if (data && data.length > 0) {
        setSelectedArticle(data[0]);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  const articlesByCategory = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Help Center</h1>
        <p className="text-slate-600 mt-1">Find answers and learn how to use FlowMigrate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-8">
            <h2 className="font-semibold text-slate-900 mb-4">Categories</h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Articles</h2>
              <div className="space-y-1">
                {Object.entries(articlesByCategory).map(([category, categoryArticles]) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-3">
                      {category.replace('-', ' ')}
                    </h3>
                    {categoryArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedArticle?.id === article.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm">{article.title}</span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {selectedArticle ? (
                <div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {selectedArticle.category.replace('-', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {selectedArticle.title}
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedArticle.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Book size={48} className="mx-auto mb-4" />
                    <p>Select an article to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
            <p className="text-blue-800 text-sm mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
