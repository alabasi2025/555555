import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  Users, 
  FileText, 
  Gauge, 
  CreditCard,
  Package,
  Settings,
  ArrowRight,
  Clock,
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  path: string;
  keywords: string[];
}

// نتائج البحث المتاحة
const searchableItems: SearchResult[] = [
  // العملاء
  { id: "customers", title: "العملاء", description: "إدارة وعرض قائمة العملاء", category: "إدارة", icon: Users, path: "/customers", keywords: ["عميل", "عملاء", "زبون", "customer"] },
  { id: "add-customer", title: "إضافة عميل جديد", description: "إنشاء حساب عميل جديد", category: "إدارة", icon: Users, path: "/customers/new", keywords: ["إضافة", "جديد", "عميل", "add"] },
  
  // الفواتير
  { id: "invoices", title: "الفواتير", description: "عرض وإدارة الفواتير", category: "المالية", icon: FileText, path: "/invoices", keywords: ["فاتورة", "فواتير", "invoice"] },
  { id: "new-invoice", title: "إنشاء فاتورة", description: "إنشاء فاتورة جديدة", category: "المالية", icon: FileText, path: "/invoices/new", keywords: ["فاتورة", "جديدة", "إنشاء"] },
  { id: "payments", title: "المدفوعات", description: "عرض وإدارة المدفوعات", category: "المالية", icon: CreditCard, path: "/invoices/payments", keywords: ["دفع", "مدفوعات", "payment"] },
  
  // العدادات
  { id: "meters", title: "العدادات", description: "إدارة العدادات والقراءات", category: "العمليات", icon: Gauge, path: "/meters", keywords: ["عداد", "عدادات", "meter", "قراءة"] },
  
  // المخزون
  { id: "inventory", title: "المخزون", description: "إدارة المخزون والمواد", category: "المخزون", icon: Package, path: "/inventory", keywords: ["مخزون", "مواد", "inventory", "stock"] },
  
  // الإعدادات
  { id: "settings", title: "الإعدادات", description: "إعدادات النظام", category: "النظام", icon: Settings, path: "/settings", keywords: ["إعدادات", "settings", "تكوين"] },
  { id: "users", title: "المستخدمين", description: "إدارة المستخدمين", category: "النظام", icon: Users, path: "/users", keywords: ["مستخدم", "مستخدمين", "user"] },
  
  // المزيد
  { id: "dashboard", title: "لوحة التحكم", description: "الصفحة الرئيسية", category: "الرئيسية", icon: Settings, path: "/dashboard", keywords: ["رئيسية", "dashboard", "لوحة"] },
  { id: "reports", title: "التقارير المالية", description: "عرض التقارير المالية", category: "التقارير", icon: FileText, path: "/reports/account-balances", keywords: ["تقرير", "تقارير", "report", "مالية"] },
  { id: "subscriptions", title: "الاشتراكات", description: "إدارة الاشتراكات", category: "العمليات", icon: CreditCard, path: "/subscriptions", keywords: ["اشتراك", "اشتراكات", "subscription"] },
  { id: "maintenance", title: "الصيانة", description: "جدولة الصيانة", category: "العمليات", icon: Settings, path: "/maintenance", keywords: ["صيانة", "maintenance"] },
  { id: "work-orders", title: "أوامر العمل", description: "إدارة أوامر العمل", category: "العمليات", icon: FileText, path: "/work-orders", keywords: ["أمر", "عمل", "work order"] },
  { id: "employees", title: "الموظفين", description: "إدارة الموظفين", category: "الموارد البشرية", icon: Users, path: "/hr/employees", keywords: ["موظف", "موظفين", "employee"] },
  { id: "payroll", title: "الرواتب", description: "إدارة الرواتب", category: "الموارد البشرية", icon: CreditCard, path: "/hr/payroll", keywords: ["راتب", "رواتب", "payroll"] },
];

// البحث الأخير
const getRecentSearches = (): string[] => {
  const stored = localStorage.getItem("recent-searches");
  return stored ? JSON.parse(stored) : [];
};

const saveRecentSearch = (query: string) => {
  const recent = getRecentSearches();
  const updated = [query, ...recent.filter(s => s !== query)].slice(0, 5);
  localStorage.setItem("recent-searches", JSON.stringify(updated));
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // فتح البحث بـ Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // تحميل البحث الأخير
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // البحث
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = searchableItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.keywords.some(k => k.toLowerCase().includes(searchQuery))
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // التنقل بالأسهم
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? results : searchableItems.slice(0, 6);
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && items[selectedIndex]) {
      e.preventDefault();
      navigateTo(items[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const navigateTo = (item: SearchResult) => {
    if (query) {
      saveRecentSearch(query);
    }
    setLocation(item.path);
    setOpen(false);
    setQuery("");
  };

  const displayItems = query ? results : searchableItems.slice(0, 6);

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="h-9 w-64 justify-start text-muted-foreground hover:text-foreground hover:bg-accent px-3 gap-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-right text-sm">بحث...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن صفحة، عميل، فاتورة..."
              className="border-0 focus-visible:ring-0 h-12 text-base"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <ScrollArea className="max-h-[400px]">
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  البحث الأخير
                </p>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded-lg hover:bg-accent text-right"
                    onClick={() => setQuery(search)}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results or Quick Links */}
            <div className="p-2">
              {query && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Search className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">لا توجد نتائج لـ "{query}"</p>
                </div>
              ) : (
                <>
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {query ? `نتائج البحث (${results.length})` : "روابط سريعة"}
                  </p>
                  {displayItems.map((item, index) => (
                    <button
                      key={item.id}
                      className={`flex items-center gap-3 w-full px-2 py-2.5 text-sm rounded-lg transition-colors text-right ${
                        index === selectedIndex 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => navigateTo(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        index === selectedIndex 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {item.category}
                      </Badge>
                      {index === selectedIndex && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd>
              <span>للتنقل</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Enter</kbd>
              <span>للفتح</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd>
              <span>للإغلاق</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
