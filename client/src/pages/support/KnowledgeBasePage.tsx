import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function KnowledgeBasePage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    status: 'draft',
  });

  const { data: articles, refetch } = trpc.support.getKnowledgeArticles.useQuery();
  const { data: faqs } = trpc.support.getFaqs.useQuery();

  const createMutation = trpc.support.createKnowledgeArticle.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ title: '', slug: '', content: '', category: '', status: 'draft' });
    },
  });

  const updateMutation = trpc.support.updateKnowledgeArticle.useMutation({
    onSuccess: () => refetch(),
  });

  const rateMutation = trpc.support.rateKnowledgeArticle.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
    });
  };

  const filteredArticles = articles?.filter((a: any) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">قاعدة المعرفة</h1>
        <p className="text-gray-600">مقالات ومستندات المساعدة</p>
      </div>

      {/* البحث */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="ابحث في قاعدة المعرفة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border rounded-lg px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المقالات */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">المقالات</h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                مقال جديد
              </button>
            </div>
            <div className="divide-y">
              {filteredArticles?.map((article: any) => (
                <div
                  key={article.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedArticle?.id === article.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{article.title}</h3>
                    {getStatusBadge(article.status)}
                  </div>
                  {article.category && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{article.category}</span>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span>{article.viewCount || 0} مشاهدة</span>
                    <span>{article.helpfulCount || 0} مفيد</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* تفاصيل المقال */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">تفاصيل المقال</h2>
          </div>
          {selectedArticle ? (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{selectedArticle.title}</h3>
              <div className="flex gap-2 mb-4">
                {getStatusBadge(selectedArticle.status)}
                {selectedArticle.category && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{selectedArticle.category}</span>
                )}
              </div>
              <div className="prose prose-sm max-w-none mb-4">
                <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">هل كان هذا المقال مفيداً؟</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => rateMutation.mutate({ id: selectedArticle.id, helpful: true })}
                    className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-green-50"
                  >
                    نعم
                  </button>
                  <button
                    onClick={() => rateMutation.mutate({ id: selectedArticle.id, helpful: false })}
                    className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-red-50"
                  >
                    لا
                  </button>
                </div>
              </div>
              {selectedArticle.status === 'draft' && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => updateMutation.mutate({ id: selectedArticle.id, status: 'published' })}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    نشر المقال
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              اختر مقالاً لعرض التفاصيل
            </div>
          )}
        </div>
      </div>

      {/* الأسئلة الشائعة */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">الأسئلة الشائعة</h2>
        </div>
        <div className="divide-y">
          {faqs?.map((faq: any) => (
            <details key={faq.id} className="p-4 group">
              <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                {faq.question}
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-gray-600 pr-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* نموذج إضافة مقال */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">مقال جديد</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الرابط (Slug)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="سيتم إنشاؤه تلقائياً"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المحتوى</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
