import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function DocumentationDashboard() {
  const [activeTab, setActiveTab] = useState<"documents" | "api" | "create">("documents");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { data: dashboard, isLoading } = trpc.documentation.getDocumentationDashboard.useQuery();
  const { data: documents } = trpc.documentation.getDocuments.useQuery({});
  const { data: apiDocs } = trpc.documentation.getApiDocs.useQuery({});
  
  const utils = trpc.useUtils();
  
  const createDocument = trpc.documentation.createDocument.useMutation({
    onSuccess: () => {
      utils.documentation.getDocuments.invalidate();
      utils.documentation.getDocumentationDashboard.invalidate();
      setShowForm(false);
    },
  });
  
  const updateDocument = trpc.documentation.updateDocument.useMutation({
    onSuccess: () => {
      utils.documentation.getDocuments.invalidate();
    },
  });
  
  const deleteDocument = trpc.documentation.deleteDocument.useMutation({
    onSuccess: () => {
      utils.documentation.getDocuments.invalidate();
      utils.documentation.getDocumentationDashboard.invalidate();
    },
  });

  const [newDoc, setNewDoc] = useState({
    title: "",
    category: "user_guide" as const,
    content: "",
    version: "1.0",
    language: "ar",
  });

  const categoryLabels: Record<string, string> = {
    user_guide: "دليل المستخدم",
    admin_guide: "دليل المدير",
    api_docs: "توثيق API",
    technical: "وثائق تقنية",
    training: "مواد تدريبية",
    policy: "سياسات",
  };

  if (isLoading) {
    return (
      <DashboardLayout title="التوثيق">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredDocs = selectedCategory 
    ? documents?.filter(d => d.category === selectedCategory)
    : documents;

  return (
    <DashboardLayout title="التوثيق">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">إجمالي الوثائق</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalDocuments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">المنشورة</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.publishedDocuments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">توثيق API</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalApiDocs || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm text-gray-500">أدلة المستخدم</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.documentsByCategory?.user_guide || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-lg text-sm ${
                !selectedCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              الكل
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedCategory === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label} ({dashboard?.documentsByCategory?.[key as keyof typeof dashboard.documentsByCategory] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "documents", label: "الوثائق" },
                { id: "api", label: "توثيق API" },
                { id: "create", label: "إنشاء وثيقة" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "documents" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">الوثائق</h3>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    إضافة وثيقة
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocs?.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                            doc.category === "user_guide" ? "bg-blue-100 text-blue-800" :
                            doc.category === "admin_guide" ? "bg-purple-100 text-purple-800" :
                            doc.category === "api_docs" ? "bg-green-100 text-green-800" :
                            doc.category === "technical" ? "bg-yellow-100 text-yellow-800" :
                            doc.category === "training" ? "bg-pink-100 text-pink-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {categoryLabels[doc.category]}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.status === "published" ? "bg-green-100 text-green-800" :
                          doc.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {doc.status === "published" ? "منشور" : doc.status === "draft" ? "مسودة" : "مؤرشف"}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <span>الإصدار: {doc.version}</span>
                        <span>{doc.language === "ar" ? "عربي" : "English"}</span>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {doc.status === "draft" && (
                          <button
                            onClick={() => updateDocument.mutate({ id: doc.id, status: "published" })}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            نشر
                          </button>
                        )}
                        <button
                          onClick={() => deleteDocument.mutate({ id: doc.id })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div>
                <h3 className="text-lg font-medium mb-4">توثيق API</h3>
                <div className="space-y-4">
                  {apiDocs?.map((api) => (
                    <div key={api.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                          api.method === "GET" ? "bg-green-100 text-green-800" :
                          api.method === "POST" ? "bg-blue-100 text-blue-800" :
                          api.method === "PUT" ? "bg-yellow-100 text-yellow-800" :
                          api.method === "PATCH" ? "bg-purple-100 text-purple-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {api.method}
                        </span>
                        <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">{api.endpoint}</code>
                        {api.isDeprecated && (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">متوقف</span>
                        )}
                      </div>
                      <p className="mt-2 text-gray-600">{api.description}</p>
                      <div className="mt-3 flex gap-4 text-sm text-gray-500">
                        <span>الإصدار: {api.version}</span>
                        {api.authentication && <span>المصادقة: {api.authentication}</span>}
                        {api.rateLimit && <span>الحد: {api.rateLimit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div>
                <h3 className="text-lg font-medium mb-4">إنشاء وثيقة جديدة</h3>
                <div className="max-w-2xl space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="عنوان الوثيقة"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                      <select
                        value={newDoc.category}
                        onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اللغة</label>
                      <select
                        value={newDoc.language}
                        onChange={(e) => setNewDoc({ ...newDoc, language: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الإصدار</label>
                    <input
                      type="text"
                      value={newDoc.version}
                      onChange={(e) => setNewDoc({ ...newDoc, version: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="1.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
                    <textarea
                      value={newDoc.content}
                      onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 h-64"
                      placeholder="محتوى الوثيقة (يدعم Markdown)"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => createDocument.mutate(newDoc)}
                      disabled={!newDoc.title}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      حفظ كمسودة
                    </button>
                    <button
                      onClick={() => {
                        setNewDoc({
                          title: "",
                          category: "user_guide",
                          content: "",
                          version: "1.0",
                          language: "ar",
                        });
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      إعادة تعيين
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
