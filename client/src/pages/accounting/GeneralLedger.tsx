// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowUpDown, PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// 1. Interfaces
// -----------------------------------------------------------------------------

interface LedgerEntry {
  id: string;
  date: string; // ISO date string
  description: string; // البيان
  ref: string; // رقم المستند/المرجع
  debit: number; // مدين
  credit: number; // دائن
  type: 'قيد افتتاحي' | 'قيد يومية' | 'سند صرف' | 'سند قبض'; // نوع الحركة
}

interface AccountInfo {
  id: string;
  name: string; // اسم الحساب
  number: string; // رقم الحساب
  initialBalance: number; // الرصيد الافتتاحي
  balanceType: 'مدين' | 'دائن'; // طبيعة الرصيد الافتتاحي
}

// 2. Mock Data Generation
// -----------------------------------------------------------------------------

const mockAccount: AccountInfo = {
  id: 'A101',
  name: 'صندوق النقدية الرئيسي',
  number: '10101',
  initialBalance: 50000.00,
  balanceType: 'مدين',
};

const generateMockData = (account: AccountInfo): LedgerEntry[] => {
  const entries: Omit<LedgerEntry, 'balance'>[] = [
    {
      id: 'E001',
      date: '2024-01-01',
      description: 'قيد افتتاحي للسنة المالية',
      ref: 'OPN-2024',
      debit: account.balanceType === 'مدين' ? account.initialBalance : 0,
      credit: account.balanceType === 'دائن' ? account.initialBalance : 0,
      type: 'قيد افتتاحي',
    },
    {
      id: 'E002',
      date: '2024-01-05',
      description: 'تحصيل إيرادات مبيعات نقدية',
      ref: 'RCV-001',
      debit: 15000.00,
      credit: 0,
      type: 'سند قبض',
    },
    {
      id: 'E003',
      date: '2024-01-10',
      description: 'دفع إيجار المكتب لشهر يناير',
      ref: 'PAY-001',
      debit: 0,
      credit: 5000.00,
      type: 'سند صرف',
    },
    {
      id: 'E004',
      date: '2024-01-15',
      description: 'إيداع نقدي في البنك',
      ref: 'DEP-001',
      debit: 0,
      credit: 10000.00,
      type: 'قيد يومية',
    },
    {
      id: 'E005',
      date: '2024-01-20',
      description: 'تحصيل دفعة من عميل (أحمد)',
      ref: 'RCV-002',
      debit: 8000.00,
      credit: 0,
      type: 'سند قبض',
    },
    {
      id: 'E006',
      date: '2024-01-25',
      description: 'شراء لوازم مكتبية نقدًا',
      ref: 'PUR-001',
      debit: 0,
      credit: 1500.00,
      type: 'سند صرف',
    },
  ];

  let currentBalance = 0;
  if (account.balanceType === 'مدين') {
    currentBalance = account.initialBalance;
  } else {
    currentBalance = -account.initialBalance; // For Daa'n accounts, initial balance is a negative debit
  }

  const ledger: LedgerEntry[] = entries.map((entry) => {
    // For a 'Madin' (Debit) account, Debit increases balance, Credit decreases it.
    // For a 'Daa'n' (Credit) account, Credit increases balance, Debit decreases it.
    // However, in a General Ledger, the balance is always calculated as:
    // New Balance = Old Balance + Debit - Credit
    // The 'balanceType' is only for display/initial balance context.
    currentBalance = currentBalance + entry.debit - entry.credit;

    return {
      ...entry,
      balance: currentBalance,
    };
  });

  return ledger;
};

// 3. Form Schema and Component for CRUD Operations
// -----------------------------------------------------------------------------

const formSchema = z.object({
  date: z.string().min(1, { message: 'التاريخ مطلوب' }),
  description: z.string().min(5, { message: 'الوصف يجب أن لا يقل عن 5 أحرف' }),
  ref: z.string().min(3, { message: 'رقم المستند مطلوب' }),
  debit: z.number().min(0, { message: 'يجب أن يكون المدين قيمة موجبة' }),
  credit: z.number().min(0, { message: 'يجب أن يكون الدائن قيمة موجبة' }),
  type: z.enum(['قيد يومية', 'سند صرف', 'سند قبض'], {
    required_error: 'نوع الحركة مطلوب',
  }),
}).refine(data => data.debit > 0 || data.credit > 0, {
    message: 'يجب إدخال قيمة في حقل المدين أو الدائن على الأقل',
    path: ['debit'],
});

type LedgerFormValues = z.infer<typeof formSchema>;

interface CrudDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry?: LedgerEntry;
  mode: 'add' | 'edit' | 'view';
  onSubmit: (data: LedgerFormValues) => void;
}

const CrudDialog: React.FC<CrudDialogProps> = ({ isOpen, setIsOpen, entry, mode, onSubmit }) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';

  const defaultValues: Partial<LedgerFormValues> = entry
    ? {
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        description: entry.description,
        ref: entry.ref,
        debit: entry.debit,
        credit: entry.credit,
        type: entry.type as 'قيد يومية' | 'سند صرف' | 'سند قبض',
      }
    : {
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        ref: '',
        debit: 0,
        credit: 0,
        type: 'قيد يومية',
      };

  const form = useForm<LedgerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (data: LedgerFormValues) => {
    onSubmit(data);
    setIsOpen(false);
  };

  const title = isAdd ? 'إضافة قيد جديد' : isEdit ? 'تعديل القيد' : 'عرض تفاصيل القيد';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
          <DialogDescription className="text-right">
            {isView ? 'تفاصيل القيد المحاسبي.' : 'أدخل تفاصيل القيد المحاسبي الجديد أو المعدل.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }: { field: any }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">التاريخ</FormLabel>
                    <FormControl className="col-span-3">
                      <Input type="date" disabled={isView} {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }: { field: any }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">البيان</FormLabel>
                    <FormControl className="col-span-3">
                      <Input disabled={isView} {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ref"
                render={({ field }: { field: any }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">رقم المستند</FormLabel>
                    <FormControl className="col-span-3">
                      <Input disabled={isView} {...field} />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="debit"
                render={({ field }: { field: any }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">مدين</FormLabel>
                    <FormControl className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        disabled={isView}
                        {...field}
                        onChange={(e: any) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credit"
                render={({ field }: { field: any }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">دائن</FormLabel>
                    <FormControl className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        disabled={isView}
                        {...field}
                        onChange={(e: any) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }: { field: any }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">نوع الحركة</FormLabel>
                    <FormControl className="col-span-3">
                      <select
                        disabled={isView}
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="قيد يومية">قيد يومية</option>
                        <option value="سند صرف">سند صرف</option>
                        <option value="سند قبض">سند قبض</option>
                      </select>
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex-row-reverse justify-between">
              <Button type={isView ? 'button' : 'submit'} disabled={isView}>
                {isView ? 'إغلاق' : isEdit ? 'حفظ التعديلات' : 'إضافة القيد'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// 4. Main Component
// -----------------------------------------------------------------------------

// Simulate DashboardLayout by providing a simple container
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen bg-gray-50 dark:bg-gray-900">
    {children}
  </div>
);

const GeneralLedger: React.FC = () => {
  const initialData = useMemo(() => generateMockData(mockAccount), []);
  const [data, setData] = useState<LedgerEntry[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof LedgerEntry; direction: 'ascending' | 'descending' } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<LedgerEntry | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');

  // Helper function to calculate the balance for a new/edited entry
  const calculateBalance = (entries: LedgerEntry[]): LedgerEntry[] => {
    let currentBalance = mockAccount.initialBalance;
    if (mockAccount.balanceType === 'دائن') {
        currentBalance = -mockAccount.initialBalance; // Treat Daa'n as negative debit for calculation
    }

    // Start from the first entry (which is the opening balance entry)
    const calculatedEntries = entries.map((entry, index) => {
        if (index === 0) {
            // The first entry is the opening balance, its balance is its value
            currentBalance = entry.debit - entry.credit;
        } else {
            // Recalculate balance based on the previous entry's balance
            const previousBalance = calculatedEntries[index - 1].balance;
            currentBalance = previousBalance + entry.debit - entry.credit;
        }
        return { ...entry, balance: currentBalance };
    });

    return calculatedEntries;
  };

  // CRUD Operations
  const handleAddEntry = (formData: LedgerFormValues) => {
    const newEntry: LedgerEntry = {
      id: `E${data.length + 1}`,
      date: formData.date,
      description: formData.description,
      ref: formData.ref,
      debit: formData.debit,
      credit: formData.credit,
      type: formData.type,
      balance: 0, // Will be recalculated
    };
    const newData = [...data, newEntry];
    setData(calculateBalance(newData));
  };

  const handleEditEntry = (formData: LedgerFormValues) => {
    if (!currentEntry) return;

    const updatedEntry: LedgerEntry = {
      ...currentEntry,
      date: formData.date,
      description: formData.description,
      ref: formData.ref,
      debit: formData.debit,
      credit: formData.credit,
      type: formData.type,
    };

    const newData = data.map((entry) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setData(calculateBalance(newData));
  };

  const handleDeleteEntry = (id: string) => {
    const newData = data.filter((entry) => entry.id !== id);
    setData(calculateBalance(newData));
  };

  const openDialog = (mode: 'add' | 'edit' | 'view', entry?: LedgerEntry) => {
    setCurrentEntry(entry);
    setDialogMode(mode);
    setIsDialogOpen(true);
  };

  // Sorting Logic
  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key: keyof LedgerEntry) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filtering Logic
  const filteredData = useMemo(() => {
    return sortedData.filter((entry) =>
      Object.values(entry).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm]);

  // Total Balance Calculation
  const finalBalance = useMemo(() => {
    if (data.length === 0) return mockAccount.initialBalance;
    return data[data.length - 1].balance;
  }, [data]);

  // Table Headers
  const headers: { key: keyof LedgerEntry; label: string; isNumeric?: boolean }[] = [
    { key: 'date', label: 'التاريخ' },
    { key: 'ref', label: 'المرجع' },
    { key: 'description', label: 'البيان' },
    { key: 'type', label: 'النوع' },
    { key: 'debit', label: 'مدين', isNumeric: true },
    { key: 'credit', label: 'دائن', isNumeric: true },
    { key: 'balance', label: 'الرصيد', isNumeric: true },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 dark:text-green-400';
    if (balance < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <DashboardLayout>
      <div className="rtl space-y-6">
        <h1 className="text-3xl font-bold text-right">دفتر الأستاذ العام</h1>

        {/* Account Info Card */}
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              بيانات الحساب
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold mb-2">{mockAccount.name}</div>
            <p className="text-sm text-muted-foreground">
              رقم الحساب: {mockAccount.number}
            </p>
            <p className="text-sm text-muted-foreground">
              الرصيد الافتتاحي: {formatCurrency(mockAccount.initialBalance)} ({mockAccount.balanceType})
            </p>
            <div className="mt-4 pt-2 border-t">
                <p className="text-lg font-semibold">
                    الرصيد النهائي: <span className={getBalanceColor(finalBalance)}>{formatCurrency(Math.abs(finalBalance))}</span>
                    <Badge variant="secondary" className={`mr-2 ${finalBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {finalBalance >= 0 ? 'مدين' : 'دائن'}
                    </Badge>
                </p>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Table */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">حركات دفتر الأستاذ</CardTitle>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog('add')} size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  إضافة قيد
                </span>
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex items-center py-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الحركات..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm((e.target as HTMLInputElement).value)}
                  className="w-full pr-10 text-right"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full table-auto">
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    {headers.map((header) => (
                      <TableHead
                        key={header.key}
                        className={`text-right cursor-pointer ${header.isNumeric ? 'text-left' : ''}`}
                        onClick={() => requestSort(header.key)}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {header.label}
                          {sortConfig?.key === header.key && (
                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-right font-medium">
                          {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell className="text-right">{entry.ref}</TableCell>
                        <TableCell className="text-right max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant="outline">{entry.type}</Badge>
                        </TableCell>
                        <TableCell className="text-left font-mono text-green-600 dark:text-green-400">
                          {formatCurrency(entry.debit)}
                        </TableCell>
                        <TableCell className="text-left font-mono text-red-600 dark:text-red-400">
                          {formatCurrency(entry.credit)}
                        </TableCell>
                        <TableCell className={`text-left font-bold font-mono ${getBalanceColor(entry.balance)}`}>
                          {formatCurrency(Math.abs(entry.balance))}
                          <span className="mr-1 text-xs font-normal">
                            ({entry.balance >= 0 ? 'مدين' : 'دائن'})
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu dir="rtl">
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">فتح القائمة</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openDialog('view', entry)}>
                                <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDialog('edit', entry)}>
                                <Edit className="ml-2 h-4 w-4" /> تعديل القيد
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <Trash2 className="ml-2 h-4 w-4" /> حذف القيد
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                        لا توجد حركات مطابقة لنتائج البحث.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CRUD Dialog */}
      <CrudDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        entry={currentEntry}
        mode={dialogMode}
        onSubmit={dialogMode === 'add' ? handleAddEntry : handleEditEntry}
      />
    </DashboardLayout>
  );
};

export default GeneralLedger;
