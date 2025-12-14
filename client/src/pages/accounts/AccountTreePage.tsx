// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, FileText, Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// -----------------------------------------------------------------------------
// 1. Types and Mock Data
// -----------------------------------------------------------------------------

interface Account {
  id: string;
  name: string; // اسم الحساب
  code: string; // كود الحساب
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'; // نوع الحساب
  balance: number; // الرصيد
  children?: Account[];
}

// Mock API endpoint: GET /api/accounts/tree
const mockAccountTree: Account[] = [
  {
    id: '1',
    name: 'الأصول',
    code: '1000',
    type: 'Asset',
    balance: 500000,
    children: [
      {
        id: '1.1',
        name: 'الأصول المتداولة',
        code: '1100',
        type: 'Asset',
        balance: 300000,
        children: [
          { id: '1.1.1', name: 'النقدية بالصندوق', code: '1110', type: 'Asset', balance: 50000 },
          { id: '1.1.2', name: 'البنوك', code: '1120', type: 'Asset', balance: 250000 },
        ],
      },
      {
        id: '1.2',
        name: 'الأصول الثابتة',
        code: '1200',
        type: 'Asset',
        balance: 200000,
        children: [
          { id: '1.2.1', name: 'المباني', code: '1210', type: 'Asset', balance: 150000 },
          { id: '1.2.2', name: 'الآلات والمعدات', code: '1220', type: 'Asset', balance: 50000 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'الخصوم وحقوق الملكية',
    code: '2000',
    type: 'Liability',
    balance: 500000,
    children: [
      { id: '2.1', name: 'الخصوم المتداولة', code: '2100', type: 'Liability', balance: 100000 },
      { id: '2.2', name: 'حقوق الملكية', code: '2200', type: 'Equity', balance: 400000 },
    ],
  },
];

const fetchAccountTree = (): Promise<Account[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate an error 10% of the time
      if (Math.random() < 0.1) {
        reject(new Error('فشل في جلب شجرة الحسابات من الخادم.'));
      } else {
        resolve(mockAccountTree);
      }
    }, 1500); // Simulate network delay
  });
};

// -----------------------------------------------------------------------------
// 2. Account Node Component (Recursive)
// -----------------------------------------------------------------------------

interface AccountNodeProps {
  account: Account;
  level: number;
  onSelect: (account: Account) => void;
  selectedAccount: Account | null;
}

const AccountNode: React.FC<AccountNodeProps> = ({ account, level, onSelect, selectedAccount }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedAccount?.id === account.id;

  const hasChildren = account.children && account.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onSelect(account);
  };

  const balanceFormatted = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(account.balance);

  return (
    <div className="rtl">
      <div
        className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-md ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/50 border-r-4 border-blue-600' : ''
        }`}
        style={{ paddingRight: `${level * 1.5 + 0.5}rem` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <Button variant="ghost" size="icon" onClick={handleToggle} className="h-6 w-6 ml-2">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <FileText className="h-4 w-4 text-gray-500 ml-2" />
        )}
        <span className="font-medium text-sm flex-1 truncate">{account.name}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-4">{account.code}</span>
        <span className={`text-sm font-mono ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {balanceFormatted}
        </span>
      </div>
      {isExpanded && hasChildren && (
        <div className="pr-4">
          {account.children!.map((child) => (
            <AccountNode
              key={child.id}
              account={child}
              level={level + 1}
              onSelect={onSelect}
              selectedAccount={selectedAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. Account Details/Form Component
// -----------------------------------------------------------------------------

const formSchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يحتوي الاسم على حرفين على الأقل.' }),
  code: z.string().regex(/^\d+$/, { message: 'يجب أن يكون الكود أرقامًا فقط.' }).min(4, { message: 'يجب أن يحتوي الكود على 4 أرقام على الأقل.' }),
  type: z.enum(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'], {
    required_error: 'يجب اختيار نوع الحساب.',
  }),
  balance: z.number().min(0, { message: 'يجب أن يكون الرصيد قيمة موجبة.' }),
});

type AccountFormValues = z.infer<typeof formSchema>;

interface AccountDetailsProps {
  account: Account;
  onUpdate: (data: AccountFormValues) => void;
  isLoading: boolean;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ account, onUpdate, isLoading }) => {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account.name,
      code: account.code,
      type: account.type,
      balance: account.balance,
    },
  });

  const onSubmit = (data: AccountFormValues) => {
    onUpdate(data);
  };

  // Reset form when a new account is selected
  useEffect(() => {
    form.reset({
      name: account.name,
      code: account.code,
      type: account.type,
      balance: account.balance,
    });
  }, [account, form]);

  return (
    <div className="rtl">
      <h3 className="text-xl font-bold mb-4 border-b pb-2">تفاصيل الحساب: {account.name}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>اسم الحساب</FormLabel>
                <FormControl>
                  <Input placeholder="اسم الحساب" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>كود الحساب</FormLabel>
                <FormControl>
                  <Input placeholder="كود الحساب" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Note: In a real app, 'type' and 'balance' would likely be read-only or handled differently based on account level */}
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>نوع الحساب</FormLabel>
              <Input value={account.type} disabled />
            </FormItem>
            <FormField
              control={form.control}
              name="balance"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>الرصيد</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="الرصيد"
                      {...field}
                      onChange={(e: any) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تحديث
            </Button>
            <Button variant="outline" disabled={isLoading}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة فرعي
            </Button>
            <Button variant="destructive" disabled={isLoading}>
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. Main Page Component
// -----------------------------------------------------------------------------

// Placeholder for the actual DashboardLayout component
const DashboardLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen rtl">
    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">{title}</h1>
    {children}
  </div>
);

const AccountTreePage: React.FC = () => {
  const [treeData, setTreeData] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const loadTreeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAccountTree();
      setTreeData(data);
      setSelectedAccount(data[0] || null); // Select the first root node by default
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء جلب البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  const handleUpdateAccount = (data: AccountFormValues) => {
    // Simulate API call for update
    console.log('Updating account:', selectedAccount?.id, data);
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, you would update the state with the new data from the server
      if (selectedAccount) {
        setTreeData((prevData) => {
          if (!prevData) return null;
          const updateNode = (nodes: Account[]): Account[] => {
            return nodes.map((node) => {
              if (node.id === selectedAccount.id) {
                const updatedNode = { ...node, ...data };
                setSelectedAccount(updatedNode);
                return updatedNode;
              }
              if (node.children) {
                return { ...node, children: updateNode(node.children) };
              }
              return node;
            });
          };
          return updateNode(prevData);
        });
      }
      setIsLoading(false);
      alert('تم تحديث الحساب بنجاح (وهمي).');
    }, 1000);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="rtl">
          <AlertTriangle className="h-4 w-4 ml-2" />
          <AlertTitle>خطأ في التحميل</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={loadTreeData} className="mt-4">
            إعادة المحاولة
          </Button>
        </Alert>
      );
    }

    if (!treeData || treeData.length === 0) {
      return (
        <Alert className="rtl">
          <AlertTitle>لا توجد بيانات</AlertTitle>
          <AlertDescription>لم يتم العثور على شجرة حسابات لعرضها.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Tree View Panel */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">شجرة الحسابات</CardTitle>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إضافة حساب رئيسي
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[600px] w-full p-4">
              {treeData.map((account) => (
                <AccountNode
                  key={account.id}
                  account={account}
                  level={0}
                  onSelect={setSelectedAccount}
                  selectedAccount={selectedAccount}
                />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Details/Form Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">إدارة الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAccount ? (
              <AccountDetails account={selectedAccount} onUpdate={handleUpdateAccount} isLoading={isLoading} />
            ) : (
              <div className="text-center p-10 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-3" />
                <p>الرجاء اختيار حساب من الشجرة لعرض تفاصيله وإدارته.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <DashboardLayout title="شجرة الحسابات الهرمية">
      {renderContent()}
    </DashboardLayout>
  );
};

// Export the component for use in the application
export default AccountTreePage;
