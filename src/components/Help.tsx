import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, Star, Send, MessageSquare, Menu, X as CloseIcon } from 'lucide-react';
import { supabase, HelpArticle } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Help: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'articles' | 'feedback'>('articles');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'migration', label: 'Migration' },
    { id: 'agents', label: 'Agents' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
  ];

  useEffect(() => {
    loadArticles();
    loadReviews();
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

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      alert('Please sign in to submit feedback');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!feedback.trim()) {
      alert('Please write your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('product_reviews').insert({
        user_id: user.id,
        rating,
        feedback: feedback.trim(),
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert('Thank you for your feedback!');
      setRating(0);
      setFeedback('');
      loadReviews();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* Page Header - No longer sticky on mobile */}
      <div className="bg-white border-b border-slate-200 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Help Center</h1>
          <p className="text-sm lg:text-base text-slate-600 mt-1">
            Find answers and share your experience
          </p>

          {/* Mobile Tab Selector */}
          <div className="flex gap-2 mt-4 lg:hidden">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                activeTab === 'articles'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Book className="inline-block mr-2" size={16} />
              Articles
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                activeTab === 'feedback'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <MessageSquare className="inline-block mr-2" size={16} />
              Feedback
            </button>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex gap-4 border-b border-slate-200 -mb-px mt-6">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'articles'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Book className="inline-block mr-2" size={18} />
              Help Articles
              {activeTab === 'articles' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'feedback'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="inline-block mr-2" size={18} />
              Feedback & Reviews
              {activeTab === 'feedback' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'articles' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Mobile Category Dropdown */}
              {isMobileMenuOpen && (
                <div className="lg:hidden bg-white rounded-xl shadow-lg border border-slate-200 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-slate-900">Categories</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <CloseIcon size={20} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
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
              )}

              {/* Mobile Category Button */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-700 font-medium hover:border-blue-500 transition-colors"
                >
                  <span>
                    {categories.find((c) => c.id === selectedCategory)?.label || 'All Articles'}
                  </span>
                  <Menu size={20} />
                </button>
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-4">
                  <h2 className="font-semibold text-slate-900 mb-4">Categories</h2>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
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

              {/* Articles Content */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Articles List */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
                    <h2 className="font-semibold text-slate-900 mb-4">Articles</h2>
                    <div className="space-y-1 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
                      {Object.entries(articlesByCategory).map(([category, categoryArticles]) => (
                        <div key={category} className="mb-4">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-3">
                            {category.replace('-', ' ')}
                          </h3>
                          {categoryArticles.map((article) => (
                            <button
                              key={article.id}
                              onClick={() => setSelectedArticle(article)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                                selectedArticle?.id === article.id
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-sm">{article.title}</span>
                              <ChevronRight size={16} className="flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
                    {selectedArticle ? (
                      <div>
                        <div className="mb-4">
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                            {selectedArticle.category.replace('-', ' ')}
                          </span>
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4">
                          {selectedArticle.title}
                        </h2>
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm lg:text-base">
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

                {/* Contact Support Banner */}
                <div className="mt-4 lg:mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 lg:p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Feedback & Reviews Tab */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Submit Feedback Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                    Share Your Feedback
                  </h2>
                  <p className="text-slate-600 text-sm mb-6">
                    Help us improve by sharing your experience with migromat
                  </p>

                  {/* Star Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Rate Your Experience
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={36}
                            className={`${
                              star <= (hover || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-slate-600 mt-2">
                        {rating === 5 && '⭐ Excellent!'}
                        {rating === 4 && '😊 Great!'}
                        {rating === 3 && '😐 Good'}
                        {rating === 2 && '😕 Could be better'}
                        {rating === 1 && '😞 Needs improvement'}
                      </p>
                    )}
                  </div>

                  {/* Feedback Text */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tell us about your experience... What did you like? What could be improved?"
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm lg:text-base"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting || rating === 0 || !feedback.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>

                {/* Reviews List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Reviews</h2>
                  <div className="space-y-4 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-slate-200 pb-4 last:border-0"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            {review.profiles?.avatar_url ? (
                              <img
                                src={review.profiles.avatar_url}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {review.profiles?.full_name?.[0] || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold text-slate-900 text-sm lg:text-base truncate">
                                {review.profiles?.full_name || 'Anonymous'}
                              </p>
                              <div className="flex gap-0.5 flex-shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={`${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-2">
                              {review.feedback}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 sticky top-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Overall Rating</h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-slate-900 mb-2">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`${
                            star <= Math.round(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">
                      Based on {reviews.length} review{reviews.length !== 1 && 's'}
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm text-slate-600 w-3">{star}</span>
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
