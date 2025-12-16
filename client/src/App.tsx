import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import SimpleLogin from "./pages/SimpleLogin";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

// Accounts
import AccountsList from "./pages/accounts/AccountsList";
import AccountDetails from "./pages/accounts/AccountDetails";
import AccountTreePage from "./pages/accounts/AccountTreePage";
import EditAccount from "./pages/accounts/EditAccount";
import NewAccountForm from "./pages/accounting/NewAccountForm";

// Customers
import CustomersList from "./pages/customers/CustomersList";
import CustomerDetails from "./pages/customers/CustomerDetails";
import AddNewCustomer from "./pages/customers/AddNewCustomer";
import EditCustomer from "./pages/customers/EditCustomer";

// Suppliers
import SuppliersList from "./pages/suppliers/SuppliersList";
import SupplierDetails from "./pages/suppliers/SupplierDetails";
import AddSupplier from "./pages/suppliers/AddSupplier";
import EditSupplier from "./pages/suppliers/EditSupplier";

// Invoices
import InvoicesList from "./pages/invoices/InvoicesList";
import NewInvoiceForm from "./pages/invoices/NewInvoiceForm";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";

// Billing & Payments
import NewPaymentForm from "./pages/billing/NewPaymentForm";
import BillingReports from "./pages/billing/BillingReports";
import PaymentForm from "./pages/payments/PaymentForm";
import PaymentsList from "./pages/payments/PaymentsList";

// Inventory
import CategoriesList from "./pages/inventory/CategoriesList";
import AddItem from "./pages/inventory/AddItem";
import ItemDetailsPage from "./pages/inventory/ItemDetailsPage";
import StockMovement from "./pages/inventory/StockMovement";
import { StockMovementsList } from "@/pages/inventory/StockMovementsList";
import CurrentInventoryReport from "./pages/inventory/CurrentInventoryReport";
// import ItemsList from "./pages/inventory/ItemsList";

// Purchases
import PurchaseOrder from "./pages/purchases/PurchaseOrder";
import PurchaseOrdersList from "./pages/purchases/PurchaseOrdersList";
import CreatePurchaseRequest from "./pages/purchases/CreatePurchaseRequest";
import MaterialReceiptForm from "./pages/purchases/MaterialReceiptForm";

// Reports
import AccountBalancesReport from "./pages/reports/AccountBalancesReport";
import BalanceSheetReport from "./pages/reports/BalanceSheetReport";
import IncomeStatementReport from "./pages/reports/IncomeStatementReport";
import CashFlowStatementReport from "./pages/financial/CashFlowStatementReport";
import AccountsReceivableAging from "./pages/reports/AccountsReceivableAging";
import AccountsPayableAgingReport from "./pages/reports/AccountsPayableAgingReport";

// Journal & Accounting
import DailyJournalsPage from "./pages/accounting/DailyJournalsPage";
import AddJournalEntry from "./pages/journal/AddJournalEntry";
import PostJournalEntries from "./pages/journal/PostJournalEntries";
import BankReconciliation from "./pages/journal/BankReconciliation";
import GeneralLedger from "./pages/journal/GeneralLedger";

// Phase 1 - Users & Roles
import UsersList from "./pages/users/UsersList";
import RolesList from "./pages/roles/RolesList";

// Phase 1 - Subscriptions & Meters
import SubscriptionsList from "./pages/subscriptions/SubscriptionsList";
import MetersList from "./pages/meters/MetersList";

// Phase 1 - Work Orders & Assets
import WorkOrdersList from "./pages/work-orders/WorkOrdersList";
import AssetsList from "./pages/assets/AssetsList";

// Phase 1 - Maintenance
import MaintenanceSchedule from "./pages/maintenance/MaintenanceSchedule";

// Phase 1 Extended - Dashboard, Permissions, Users Management
import DashboardNew from "./pages/DashboardNew";
import PermissionsManagement from "./pages/permissions/PermissionsManagement";
import UsersManagement from "./pages/users/UsersManagement";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Switch>
            {/* Main */}
            <Route path="/" component={Home} />
            <Route path="/login" component={SimpleLogin} />
            <Route path="/dashboard" component={DashboardNew} />
            <Route path="/dashboard-old" component={Dashboard} />
            
            {/* Accounts */}
            <Route path="/accounts" component={AccountsList} />
            <Route path="/accounts/new" component={NewAccountForm} />
            <Route path="/accounts/tree" component={AccountTreePage} />
            <Route path="/accounts/:id" component={AccountDetails} />
            <Route path="/accounts/:id/edit" component={EditAccount} />
            
            {/* Customers */}
            <Route path="/customers" component={CustomersList} />
            <Route path="/customers/new" component={AddNewCustomer} />
            <Route path="/customers/:id" component={CustomerDetails} />
            <Route path="/customers/:id/edit" component={EditCustomer} />
            
            {/* Suppliers */}
            <Route path="/suppliers" component={SuppliersList} />
            <Route path="/suppliers/new" component={AddSupplier} />
            <Route path="/suppliers/:id" component={SupplierDetails} />
            <Route path="/suppliers/:id/edit" component={EditSupplier} />
            
            {/* Invoices */}
            <Route path="/invoices" component={InvoicesList} />
            <Route path="/invoices/new" component={NewInvoiceForm} />
            <Route path="/invoices/:id" component={InvoiceDetails} />
            
            {/* Billing & Payments */}
            <Route path="/payments/new" component={NewPaymentForm} />
            <Route path="/invoices/payments" component={PaymentsList} />           <Route path="/billing/reports" component={BillingReports} />
            
            {/* Inventory */}
            <Route path="/inventory" component={CategoriesList} />
            <Route path="/inventory/add-item" component={AddItem} />
            <Route path="/inventory/:id" component={ItemDetailsPage} />
            <Route path="/inventory/movements" component={StockMovementsList} />
            <Route path="/inventory/add-movement" component={StockMovement} />
            <Route path="/inventory/report" component={CurrentInventoryReport} />
            
            {/* Purchases */}
            <Route path="/purchases/requests" component={PurchaseOrdersList} />
            <Route path="/purchases/new" component={CreatePurchaseRequest} />
            <Route path="/purchases/receipt" component={MaterialReceiptForm} />
            
            {/* Reports */}
            <Route path="/reports/account-balances" component={AccountBalancesReport} />
            <Route path="/reports/balance-sheet" component={BalanceSheetReport} />
            <Route path="/reports/income-statement" component={IncomeStatementReport} />
            <Route path="/reports/cash-flow" component={CashFlowStatementReport} />
            <Route path="/reports/receivables" component={AccountsReceivableAging} />
            <Route path="/reports/payables" component={AccountsPayableAgingReport} />
            
            {/* Journal & Accounting */}
            <Route path="/journal-entries" component={DailyJournalsPage} />
            <Route path="/journal-entries/new" component={AddJournalEntry} />
            <Route path="/journal-entries/post" component={PostJournalEntries} />
            <Route path="/journal-entries/reconciliation" component={BankReconciliation} />
            <Route path="/ledger" component={GeneralLedger} />
            
            {/* Phase 1 - Users & Roles */}
            <Route path="/users" component={UsersList} />
            <Route path="/users/management" component={UsersManagement} />
            <Route path="/roles" component={RolesList} />
            
            {/* Phase 1 - Permissions Management */}
            <Route path="/permissions" component={PermissionsManagement} />
            
            {/* Phase 1 - Subscriptions & Meters */}
            <Route path="/subscriptions" component={SubscriptionsList} />
            <Route path="/meters" component={MetersList} />
            
            {/* Phase 1 - Work Orders & Assets */}
            <Route path="/work-orders" component={WorkOrdersList} />
            <Route path="/assets" component={AssetsList} />
            
            {/* Phase 1 - Maintenance */}
            <Route path="/maintenance" component={MaintenanceSchedule} />
            
            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
