/**
 * نظام التعدد اللغوي (Internationalization)
 * يدعم العربية والإنجليزية والفرنسية
 */

export type Language = 'ar' | 'en' | 'fr';
export type Direction = 'rtl' | 'ltr';

// إعدادات اللغات
export const languages: Record<Language, {
  name: string;
  nativeName: string;
  direction: Direction;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currency: string;
}> = {
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
    currency: 'SAR',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
    currency: 'SAR',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
    currency: 'SAR',
  },
};

// الترجمات
type TranslationKeys = {
  // عام
  'app.name': string;
  'app.tagline': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.filter': string;
  'common.export': string;
  'common.import': string;
  'common.print': string;
  'common.loading': string;
  'common.noData': string;
  'common.confirm': string;
  'common.yes': string;
  'common.no': string;
  'common.all': string;
  'common.none': string;
  'common.actions': string;
  'common.status': string;
  'common.date': string;
  'common.time': string;
  'common.amount': string;
  'common.total': string;
  'common.details': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.submit': string;
  'common.reset': string;
  'common.close': string;
  'common.open': string;
  'common.view': string;
  'common.download': string;
  'common.upload': string;
  'common.refresh': string;
  'common.settings': string;
  'common.help': string;
  'common.logout': string;
  'common.profile': string;
  
  // المصادقة
  'auth.login': string;
  'auth.logout': string;
  'auth.username': string;
  'auth.password': string;
  'auth.rememberMe': string;
  'auth.forgotPassword': string;
  'auth.resetPassword': string;
  'auth.newPassword': string;
  'auth.confirmPassword': string;
  'auth.loginSuccess': string;
  'auth.loginFailed': string;
  'auth.logoutSuccess': string;
  
  // لوحة التحكم
  'dashboard.title': string;
  'dashboard.welcome': string;
  'dashboard.totalCustomers': string;
  'dashboard.totalRevenue': string;
  'dashboard.pendingInvoices': string;
  'dashboard.activeMeters': string;
  'dashboard.recentActivities': string;
  'dashboard.quickActions': string;
  
  // العملاء
  'customers.title': string;
  'customers.add': string;
  'customers.edit': string;
  'customers.delete': string;
  'customers.name': string;
  'customers.phone': string;
  'customers.email': string;
  'customers.address': string;
  'customers.type': string;
  'customers.status': string;
  'customers.balance': string;
  'customers.meters': string;
  'customers.invoices': string;
  'customers.payments': string;
  
  // الفواتير
  'invoices.title': string;
  'invoices.create': string;
  'invoices.number': string;
  'invoices.date': string;
  'invoices.dueDate': string;
  'invoices.amount': string;
  'invoices.status': string;
  'invoices.paid': string;
  'invoices.unpaid': string;
  'invoices.overdue': string;
  'invoices.partial': string;
  'invoices.cancelled': string;
  
  // العدادات
  'meters.title': string;
  'meters.number': string;
  'meters.type': string;
  'meters.location': string;
  'meters.status': string;
  'meters.lastReading': string;
  'meters.consumption': string;
  
  // القراءات
  'readings.title': string;
  'readings.add': string;
  'readings.date': string;
  'readings.value': string;
  'readings.consumption': string;
  'readings.notes': string;
  
  // المدفوعات
  'payments.title': string;
  'payments.add': string;
  'payments.amount': string;
  'payments.method': string;
  'payments.reference': string;
  'payments.date': string;
  
  // التقارير
  'reports.title': string;
  'reports.generate': string;
  'reports.type': string;
  'reports.period': string;
  'reports.from': string;
  'reports.to': string;
  
  // الإعدادات
  'settings.title': string;
  'settings.general': string;
  'settings.security': string;
  'settings.notifications': string;
  'settings.language': string;
  'settings.theme': string;
  'settings.timezone': string;
  
  // الرسائل
  'messages.success': string;
  'messages.error': string;
  'messages.warning': string;
  'messages.info': string;
  'messages.confirmDelete': string;
  'messages.saved': string;
  'messages.deleted': string;
  'messages.updated': string;
  'messages.created': string;
};

const translations: Record<Language, TranslationKeys> = {
  ar: {
    // عام
    'app.name': 'نظام إدارة محطات الكهرباء',
    'app.tagline': 'حلول متكاملة لإدارة الطاقة',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.print': 'طباعة',
    'common.loading': 'جاري التحميل...',
    'common.noData': 'لا توجد بيانات',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.all': 'الكل',
    'common.none': 'لا شيء',
    'common.actions': 'الإجراءات',
    'common.status': 'الحالة',
    'common.date': 'التاريخ',
    'common.time': 'الوقت',
    'common.amount': 'المبلغ',
    'common.total': 'الإجمالي',
    'common.details': 'التفاصيل',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.reset': 'إعادة تعيين',
    'common.close': 'إغلاق',
    'common.open': 'فتح',
    'common.view': 'عرض',
    'common.download': 'تحميل',
    'common.upload': 'رفع',
    'common.refresh': 'تحديث',
    'common.settings': 'الإعدادات',
    'common.help': 'المساعدة',
    'common.logout': 'تسجيل الخروج',
    'common.profile': 'الملف الشخصي',
    
    // المصادقة
    'auth.login': 'تسجيل الدخول',
    'auth.logout': 'تسجيل الخروج',
    'auth.username': 'اسم المستخدم',
    'auth.password': 'كلمة المرور',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.resetPassword': 'إعادة تعيين كلمة المرور',
    'auth.newPassword': 'كلمة المرور الجديدة',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.loginSuccess': 'تم تسجيل الدخول بنجاح',
    'auth.loginFailed': 'فشل تسجيل الدخول',
    'auth.logoutSuccess': 'تم تسجيل الخروج بنجاح',
    
    // لوحة التحكم
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً',
    'dashboard.totalCustomers': 'إجمالي العملاء',
    'dashboard.totalRevenue': 'إجمالي الإيرادات',
    'dashboard.pendingInvoices': 'الفواتير المعلقة',
    'dashboard.activeMeters': 'العدادات النشطة',
    'dashboard.recentActivities': 'الأنشطة الأخيرة',
    'dashboard.quickActions': 'إجراءات سريعة',
    
    // العملاء
    'customers.title': 'العملاء',
    'customers.add': 'إضافة عميل',
    'customers.edit': 'تعديل العميل',
    'customers.delete': 'حذف العميل',
    'customers.name': 'اسم العميل',
    'customers.phone': 'رقم الهاتف',
    'customers.email': 'البريد الإلكتروني',
    'customers.address': 'العنوان',
    'customers.type': 'نوع العميل',
    'customers.status': 'حالة العميل',
    'customers.balance': 'الرصيد',
    'customers.meters': 'العدادات',
    'customers.invoices': 'الفواتير',
    'customers.payments': 'المدفوعات',
    
    // الفواتير
    'invoices.title': 'الفواتير',
    'invoices.create': 'إنشاء فاتورة',
    'invoices.number': 'رقم الفاتورة',
    'invoices.date': 'تاريخ الفاتورة',
    'invoices.dueDate': 'تاريخ الاستحقاق',
    'invoices.amount': 'المبلغ',
    'invoices.status': 'الحالة',
    'invoices.paid': 'مدفوعة',
    'invoices.unpaid': 'غير مدفوعة',
    'invoices.overdue': 'متأخرة',
    'invoices.partial': 'مدفوعة جزئياً',
    'invoices.cancelled': 'ملغاة',
    
    // العدادات
    'meters.title': 'العدادات',
    'meters.number': 'رقم العداد',
    'meters.type': 'نوع العداد',
    'meters.location': 'الموقع',
    'meters.status': 'الحالة',
    'meters.lastReading': 'آخر قراءة',
    'meters.consumption': 'الاستهلاك',
    
    // القراءات
    'readings.title': 'القراءات',
    'readings.add': 'إضافة قراءة',
    'readings.date': 'تاريخ القراءة',
    'readings.value': 'القيمة',
    'readings.consumption': 'الاستهلاك',
    'readings.notes': 'ملاحظات',
    
    // المدفوعات
    'payments.title': 'المدفوعات',
    'payments.add': 'إضافة دفعة',
    'payments.amount': 'المبلغ',
    'payments.method': 'طريقة الدفع',
    'payments.reference': 'رقم المرجع',
    'payments.date': 'تاريخ الدفع',
    
    // التقارير
    'reports.title': 'التقارير',
    'reports.generate': 'إنشاء تقرير',
    'reports.type': 'نوع التقرير',
    'reports.period': 'الفترة',
    'reports.from': 'من',
    'reports.to': 'إلى',
    
    // الإعدادات
    'settings.title': 'الإعدادات',
    'settings.general': 'عام',
    'settings.security': 'الأمان',
    'settings.notifications': 'الإشعارات',
    'settings.language': 'اللغة',
    'settings.theme': 'المظهر',
    'settings.timezone': 'المنطقة الزمنية',
    
    // الرسائل
    'messages.success': 'نجاح',
    'messages.error': 'خطأ',
    'messages.warning': 'تحذير',
    'messages.info': 'معلومات',
    'messages.confirmDelete': 'هل أنت متأكد من الحذف؟',
    'messages.saved': 'تم الحفظ بنجاح',
    'messages.deleted': 'تم الحذف بنجاح',
    'messages.updated': 'تم التحديث بنجاح',
    'messages.created': 'تم الإنشاء بنجاح',
  },
  
  en: {
    // General
    'app.name': 'Power Station Management System',
    'app.tagline': 'Integrated Energy Management Solutions',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.print': 'Print',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.all': 'All',
    'common.none': 'None',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.amount': 'Amount',
    'common.total': 'Total',
    'common.details': 'Details',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.refresh': 'Refresh',
    'common.settings': 'Settings',
    'common.help': 'Help',
    'common.logout': 'Logout',
    'common.profile': 'Profile',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.resetPassword': 'Reset Password',
    'auth.newPassword': 'New Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.loginSuccess': 'Login successful',
    'auth.loginFailed': 'Login failed',
    'auth.logoutSuccess': 'Logout successful',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.totalCustomers': 'Total Customers',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.pendingInvoices': 'Pending Invoices',
    'dashboard.activeMeters': 'Active Meters',
    'dashboard.recentActivities': 'Recent Activities',
    'dashboard.quickActions': 'Quick Actions',
    
    // Customers
    'customers.title': 'Customers',
    'customers.add': 'Add Customer',
    'customers.edit': 'Edit Customer',
    'customers.delete': 'Delete Customer',
    'customers.name': 'Customer Name',
    'customers.phone': 'Phone Number',
    'customers.email': 'Email',
    'customers.address': 'Address',
    'customers.type': 'Customer Type',
    'customers.status': 'Status',
    'customers.balance': 'Balance',
    'customers.meters': 'Meters',
    'customers.invoices': 'Invoices',
    'customers.payments': 'Payments',
    
    // Invoices
    'invoices.title': 'Invoices',
    'invoices.create': 'Create Invoice',
    'invoices.number': 'Invoice Number',
    'invoices.date': 'Invoice Date',
    'invoices.dueDate': 'Due Date',
    'invoices.amount': 'Amount',
    'invoices.status': 'Status',
    'invoices.paid': 'Paid',
    'invoices.unpaid': 'Unpaid',
    'invoices.overdue': 'Overdue',
    'invoices.partial': 'Partially Paid',
    'invoices.cancelled': 'Cancelled',
    
    // Meters
    'meters.title': 'Meters',
    'meters.number': 'Meter Number',
    'meters.type': 'Meter Type',
    'meters.location': 'Location',
    'meters.status': 'Status',
    'meters.lastReading': 'Last Reading',
    'meters.consumption': 'Consumption',
    
    // Readings
    'readings.title': 'Readings',
    'readings.add': 'Add Reading',
    'readings.date': 'Reading Date',
    'readings.value': 'Value',
    'readings.consumption': 'Consumption',
    'readings.notes': 'Notes',
    
    // Payments
    'payments.title': 'Payments',
    'payments.add': 'Add Payment',
    'payments.amount': 'Amount',
    'payments.method': 'Payment Method',
    'payments.reference': 'Reference Number',
    'payments.date': 'Payment Date',
    
    // Reports
    'reports.title': 'Reports',
    'reports.generate': 'Generate Report',
    'reports.type': 'Report Type',
    'reports.period': 'Period',
    'reports.from': 'From',
    'reports.to': 'To',
    
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.timezone': 'Timezone',
    
    // Messages
    'messages.success': 'Success',
    'messages.error': 'Error',
    'messages.warning': 'Warning',
    'messages.info': 'Information',
    'messages.confirmDelete': 'Are you sure you want to delete?',
    'messages.saved': 'Saved successfully',
    'messages.deleted': 'Deleted successfully',
    'messages.updated': 'Updated successfully',
    'messages.created': 'Created successfully',
  },
  
  fr: {
    // Général
    'app.name': 'Système de Gestion des Centrales Électriques',
    'app.tagline': 'Solutions Intégrées de Gestion de l\'Énergie',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.print': 'Imprimer',
    'common.loading': 'Chargement...',
    'common.noData': 'Aucune donnée disponible',
    'common.confirm': 'Confirmer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.all': 'Tout',
    'common.none': 'Aucun',
    'common.actions': 'Actions',
    'common.status': 'Statut',
    'common.date': 'Date',
    'common.time': 'Heure',
    'common.amount': 'Montant',
    'common.total': 'Total',
    'common.details': 'Détails',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.submit': 'Soumettre',
    'common.reset': 'Réinitialiser',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',
    'common.refresh': 'Actualiser',
    'common.settings': 'Paramètres',
    'common.help': 'Aide',
    'common.logout': 'Déconnexion',
    'common.profile': 'Profil',
    
    // Authentification
    'auth.login': 'Connexion',
    'auth.logout': 'Déconnexion',
    'auth.username': 'Nom d\'utilisateur',
    'auth.password': 'Mot de passe',
    'auth.rememberMe': 'Se souvenir de moi',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.resetPassword': 'Réinitialiser le mot de passe',
    'auth.newPassword': 'Nouveau mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.loginSuccess': 'Connexion réussie',
    'auth.loginFailed': 'Échec de la connexion',
    'auth.logoutSuccess': 'Déconnexion réussie',
    
    // Tableau de bord
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.totalCustomers': 'Total des clients',
    'dashboard.totalRevenue': 'Revenus totaux',
    'dashboard.pendingInvoices': 'Factures en attente',
    'dashboard.activeMeters': 'Compteurs actifs',
    'dashboard.recentActivities': 'Activités récentes',
    'dashboard.quickActions': 'Actions rapides',
    
    // Clients
    'customers.title': 'Clients',
    'customers.add': 'Ajouter un client',
    'customers.edit': 'Modifier le client',
    'customers.delete': 'Supprimer le client',
    'customers.name': 'Nom du client',
    'customers.phone': 'Numéro de téléphone',
    'customers.email': 'Email',
    'customers.address': 'Adresse',
    'customers.type': 'Type de client',
    'customers.status': 'Statut',
    'customers.balance': 'Solde',
    'customers.meters': 'Compteurs',
    'customers.invoices': 'Factures',
    'customers.payments': 'Paiements',
    
    // Factures
    'invoices.title': 'Factures',
    'invoices.create': 'Créer une facture',
    'invoices.number': 'Numéro de facture',
    'invoices.date': 'Date de facture',
    'invoices.dueDate': 'Date d\'échéance',
    'invoices.amount': 'Montant',
    'invoices.status': 'Statut',
    'invoices.paid': 'Payée',
    'invoices.unpaid': 'Non payée',
    'invoices.overdue': 'En retard',
    'invoices.partial': 'Partiellement payée',
    'invoices.cancelled': 'Annulée',
    
    // Compteurs
    'meters.title': 'Compteurs',
    'meters.number': 'Numéro de compteur',
    'meters.type': 'Type de compteur',
    'meters.location': 'Emplacement',
    'meters.status': 'Statut',
    'meters.lastReading': 'Dernière lecture',
    'meters.consumption': 'Consommation',
    
    // Lectures
    'readings.title': 'Lectures',
    'readings.add': 'Ajouter une lecture',
    'readings.date': 'Date de lecture',
    'readings.value': 'Valeur',
    'readings.consumption': 'Consommation',
    'readings.notes': 'Notes',
    
    // Paiements
    'payments.title': 'Paiements',
    'payments.add': 'Ajouter un paiement',
    'payments.amount': 'Montant',
    'payments.method': 'Mode de paiement',
    'payments.reference': 'Numéro de référence',
    'payments.date': 'Date de paiement',
    
    // Rapports
    'reports.title': 'Rapports',
    'reports.generate': 'Générer un rapport',
    'reports.type': 'Type de rapport',
    'reports.period': 'Période',
    'reports.from': 'De',
    'reports.to': 'À',
    
    // Paramètres
    'settings.title': 'Paramètres',
    'settings.general': 'Général',
    'settings.security': 'Sécurité',
    'settings.notifications': 'Notifications',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.timezone': 'Fuseau horaire',
    
    // Messages
    'messages.success': 'Succès',
    'messages.error': 'Erreur',
    'messages.warning': 'Avertissement',
    'messages.info': 'Information',
    'messages.confirmDelete': 'Êtes-vous sûr de vouloir supprimer?',
    'messages.saved': 'Enregistré avec succès',
    'messages.deleted': 'Supprimé avec succès',
    'messages.updated': 'Mis à jour avec succès',
    'messages.created': 'Créé avec succès',
  },
};

// الحصول على الترجمة
export function t(key: keyof TranslationKeys, lang: Language = 'ar'): string {
  return translations[lang][key] || key;
}

// تنسيق الأرقام
export function formatNumber(value: number, lang: Language = 'ar'): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(locale, languages[lang].numberFormat).format(value);
}

// تنسيق العملة
export function formatCurrency(value: number, lang: Language = 'ar'): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: languages[lang].currency,
  }).format(value);
}

// تنسيق التاريخ
export function formatDate(date: Date, lang: Language = 'ar'): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// تنسيق التاريخ والوقت
export function formatDateTime(date: Date, lang: Language = 'ar'): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default { t, formatNumber, formatCurrency, formatDate, formatDateTime, languages };
