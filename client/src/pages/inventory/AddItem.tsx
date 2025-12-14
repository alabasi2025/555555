// AddItem.tsx
// واجهة نموذج إضافة صنف (AddItem.tsx) - نموذج كامل لإضافة صنف جديد للمخزون
// يستخدم React 19 + TypeScript، shadcn/ui، Tailwind CSS 4، وتصميم عربي متكامل.

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddItemSchema,
  AddItemFormValues,
  InventoryItem,
  mockInventory,
  mockCategories,
  ItemSpecification,
} from './item_data';

// استيراد مكونات shadcn/ui (افتراضية)
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Trash2, Plus, Upload, Search, Edit, Eye } from 'lucide-react';
import { toast } from './components/ui/use-toast'; // افتراض وجود نظام إشعارات

// *****************************************************************
// 1. مكون تخطيط لوحة التحكم (DashboardLayout Placeholder)
// *****************************************************************
// في بيئة العمل الحقيقية، سيتم استيراد هذا المكون. هنا، نستخدم هيكلاً مبسطاً.
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المخزون</h1>
        <p className="text-sm text-gray-500">لوحة تحكم متكاملة لإضافة وتعديل الأصناف.</p>
      </header>
      <main className="max-w-7xl mx-auto">{children}</main>
    </div>
  );
};

// *****************************************************************
// 2. مكون تحميل الصورة (Image Upload Component)
// *****************************************************************
const ImageUpload: React.FC<{ onFileChange: (file: File | null) => void }> = ({ onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">صورة الصنف</Label>
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="معاينة الصورة" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-3 file:py-1 file:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">صيغ مدعومة: JPG، PNG. الحد الأقصى: 5 ميجابايت.</p>
        </div>
      </div>
    </div>
  );
};

// *****************************************************************
// 3. مكون نموذج إضافة صنف (AddItemForm)
// *****************************************************************
const AddItemForm: React.FC<{ onAddItem: (item: InventoryItem) => void }> = ({ onAddItem }) => {
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(AddItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      price: 0.00,
      description: "",
      specifications: [{ key: "اللون", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const onSubmit = (data: AddItemFormValues) => {
    // محاكاة عملية الإضافة
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: data.name,
      sku: data.sku,
      category: data.category,
      quantity: data.quantity,
      price: data.price,
      image: data.imageFile ? URL.createObjectURL(data.imageFile as File) : "/images/default.jpg",
      specifications: data.specifications || [],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAddItem(newItem);
    form.reset();
    toast({
      title: "تم بنجاح",
      description: `تم إضافة الصنف "${newItem.name}" إلى المخزون.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">إضافة صنف جديد</CardTitle>
        <CardDescription>املأ الحقول التالية لإضافة صنف جديد إلى قائمة المخزون.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* حقول الإدخال الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الصنف</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: هاتف ذكي X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز الصنف (SKU)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: PH-SMART-X" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر فئة الصنف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {mockCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية المتوفرة</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e: React.FormEvent) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سعر الوحدة (ريال)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e: React.FormEvent) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* حقل تحميل الصورة */}
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload onFileChange={(file) => field.onChange(file)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* حقل المواصفات الديناميكية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">المواصفات التفصيلية</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 space-x-reverse">
                  <FormField
                    control={form.control}
                    name={`specifications.${index}.key`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index > 0 ? "sr-only" : ""}>المفتاح</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: اللون" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`specifications.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index > 0 ? "sr-only" : ""}>القيمة</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: أزرق" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mt-6"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ id: `temp-${Date.now()}`, key: "", value: "" } as ItemSpecification)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة مواصفة
              </Button>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              إضافة الصنف
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// *****************************************************************
// 4. مكون جدول الأصناف (InventoryTable)
// *****************************************************************
const InventoryTable: React.FC<{ inventory: InventoryItem[] }> = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'ascending' | 'descending' } | null>(null);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInventory = React.useMemo(() => {
    let sortableItems = [...filteredInventory];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredInventory, sortConfig]);

  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof InventoryItem) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleDelete = (id: string) => {
    // محاكاة عملية الحذف
    console.log(`Deleting item with ID: ${id}`);
    toast({
      title: "تم الحذف",
      description: `تم حذف الصنف بنجاح (ID: ${id}).`,
      variant: "destructive",
    });
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-xl">قائمة الأصناف الحالية</CardTitle>
        <CardDescription>عرض وإدارة الأصناف الموجودة في المخزون.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="ابحث بالاسم أو الرمز أو الفئة..."
              value={searchTerm}
              onChange={(e: React.FormEvent) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الصورة</TableHead>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                  الاسم {getSortIndicator('name')}
                </TableHead>
                <TableHead onClick={() => requestSort('sku')} className="cursor-pointer">
                  الرمز {getSortIndicator('sku')}
                </TableHead>
                <TableHead onClick={() => requestSort('category')} className="cursor-pointer">
                  الفئة {getSortIndicator('category')}
                </TableHead>
                <TableHead onClick={() => requestSort('quantity')} className="cursor-pointer" className="text-right">
                  الكمية {getSortIndicator('quantity')}
                </TableHead>
                <TableHead onClick={() => requestSort('price')} className="cursor-pointer" className="text-right">
                  السعر {getSortIndicator('price')}
                </TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInventory.length > 0 ? (
                sortedInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e: React.FormEvent) => (e.currentTarget.src = "/images/placeholder.jpg")} // صورة بديلة
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)} ر.س</TableCell>
                    <TableCell className="text-center space-x-2 space-x-reverse">
                      <Button variant="outline" size="icon" title="عرض التفاصيل">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="تعديل الصنف">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" title="حذف الصنف" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    لا توجد أصناف مطابقة لنتائج البحث.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// *****************************************************************
// 5. المكون الرئيسي (AddItem)
// *****************************************************************
const AddItem: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
  };

  // ملاحظة: في تطبيق React حقيقي، يجب أن يكون هناك مكون <Toaster /> في الجذر لعرض الإشعارات (toasts).

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* قسم إضافة صنف جديد */}
        <AddItemForm onAddItem={handleAddItem} />

        {/* قسم قائمة الأصناف */}
        <InventoryTable inventory={inventory} />
      </div>
    </DashboardLayout>
  );
};

export default AddItem;

// ملاحظة: هذا الكود يفترض وجود المكونات الأساسية لـ shadcn/ui في المسار './components/ui/'
// مثل Button، Input، Card، Table، إلخ.
// كما يفترض وجود نظام إشعارات (toast) ومكتبات react-hook-form و zod.
