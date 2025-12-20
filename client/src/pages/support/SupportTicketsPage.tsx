import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function SupportTicketsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'question',
    priority: 'medium',
    affectedModule: '',
  });
  const [comment, setComment] = useState('');

  const { data: tickets, refetch } = trpc.support.getTickets.useQuery();
  const { data: stats } = trpc.support.getSupportStats.useQuery();
  const { data: ticketComments, refetch: refetchComments } = trpc.support.getTicketComments.useQuery(
    { ticketId: selectedTicket?.id },
    { enabled: !!selectedTicket }
  );

  const createMutation = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'question', priority: 'medium', affectedModule: '' });
    },
  });

  const addCommentMutation = trpc.support.addTicketComment.useMutation({
    onSuccess: () => {
      refetchComments();
      setComment('');
    },
  });

  const resolveMutation = trpc.support.resolveTicket.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedTicket(null);
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleAddComment = () => {
    if (!selectedTicket || !comment.trim()) return;
    addCommentMutation.mutate({
      ticketId: selectedTicket.id,
      userId: 1,
      comment,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      waiting: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      open: 'مفتوح',
      in_progress: 'قيد المعالجة',
      waiting: 'في الانتظار',
      resolved: 'تم الحل',
      closed: 'مغلق',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">تذاكر الدعم الفني</h1>
        <p className="text-gray-600">إدارة طلبات الدعم والمساعدة</p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">إجمالي التذاكر</div>
          <div className="text-2xl font-bold text-blue-600">{stats?.totalTickets || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">تذاكر مفتوحة</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.openTickets || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">تذاكر حرجة</div>
          <div className="text-2xl font-bold text-red-600">{stats?.criticalTickets || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">تم حلها</div>
          <div className="text-2xl font-bold text-green-600">{stats?.resolvedTickets || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة التذاكر */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">التذاكر</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              تذكرة جديدة
            </button>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {tickets?.map((ticket: any) => (
              <div
                key={ticket.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm text-gray-500">{ticket.ticketNumber}</span>
                    <h3 className="font-medium">{ticket.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(ticket.createdAt).toLocaleString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* تفاصيل التذكرة */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">تفاصيل التذكرة</h2>
          </div>
          {selectedTicket ? (
            <div className="p-4">
              <div className="mb-4">
                <span className="text-sm text-gray-500">{selectedTicket.ticketNumber}</span>
                <h3 className="text-lg font-semibold">{selectedTicket.title}</h3>
                <div className="flex gap-2 mt-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500">الوصف</label>
                <p className="text-sm">{selectedTicket.description}</p>
              </div>
              {selectedTicket.affectedModule && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500">الوحدة المتأثرة</label>
                  <p className="text-sm">{selectedTicket.affectedModule}</p>
                </div>
              )}

              {/* التعليقات */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">التعليقات</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                  {ticketComments?.map((c: any) => (
                    <div key={c.id} className="bg-gray-50 rounded p-2 text-sm">
                      <p>{c.comment}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="أضف تعليق..."
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                  >
                    إرسال
                  </button>
                </div>
              </div>

              {/* إجراءات */}
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => {
                      const resolution = prompt('أدخل الحل:');
                      if (resolution) {
                        resolveMutation.mutate({ id: selectedTicket.id, resolution });
                      }
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    تم الحل
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              اختر تذكرة لعرض التفاصيل
            </div>
          )}
        </div>
      </div>

      {/* نموذج إضافة تذكرة */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">تذكرة دعم جديدة</h3>
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
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">التصنيف</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="bug">خطأ برمجي</option>
                  <option value="feature_request">طلب ميزة</option>
                  <option value="question">استفسار</option>
                  <option value="incident">حادث</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الأولوية</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="critical">حرجة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوحدة المتأثرة</label>
                <input
                  type="text"
                  value={formData.affectedModule}
                  onChange={(e) => setFormData({ ...formData, affectedModule: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
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
                إنشاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
