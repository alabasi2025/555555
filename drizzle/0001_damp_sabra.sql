CREATE TABLE `account_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_id` int NOT NULL,
	`balance_date` date NOT NULL,
	`opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`debit_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`credit_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`closing_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`currency` varchar(3) NOT NULL DEFAULT 'SAR',
	CONSTRAINT `account_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `account_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_code` varchar(50) NOT NULL,
	`category_name` varchar(100) NOT NULL,
	`account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`description` text,
	CONSTRAINT `account_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_categories_category_code_unique` UNIQUE(`category_code`)
);
--> statement-breakpoint
CREATE TABLE `account_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type_code` varchar(50) NOT NULL,
	`type_name` varchar(100) NOT NULL,
	`description` text,
	CONSTRAINT `account_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_types_type_code_unique` UNIQUE(`type_code`)
);
--> statement-breakpoint
CREATE TABLE `bank_reconciliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reconciliation_number` varchar(50) NOT NULL,
	`reconciliation_date` date NOT NULL,
	`bank_account_id` int NOT NULL,
	`statement_date` date NOT NULL,
	`statement_balance` decimal(15,2) NOT NULL,
	`book_balance` decimal(15,2) NOT NULL,
	`adjusted_balance` decimal(15,2) NOT NULL,
	`status` enum('in_progress','completed','approved') NOT NULL DEFAULT 'in_progress',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_reconciliations_id` PRIMARY KEY(`id`),
	CONSTRAINT `bank_reconciliations_reconciliation_number_unique` UNIQUE(`reconciliation_number`)
);
--> statement-breakpoint
CREATE TABLE `chart_of_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_code` varchar(50) NOT NULL,
	`account_name` varchar(255) NOT NULL,
	`account_name_en` varchar(255),
	`account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`parent_account_id` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_header` boolean NOT NULL DEFAULT false,
	`level` int NOT NULL DEFAULT 1,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` int,
	CONSTRAINT `chart_of_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `chart_of_accounts_account_code_unique` UNIQUE(`account_code`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_code` varchar(50) NOT NULL,
	`customer_name` varchar(255) NOT NULL,
	`customer_type` enum('individual','company','government') NOT NULL DEFAULT 'individual',
	`contact_person` varchar(255),
	`phone` varchar(20),
	`mobile` varchar(20),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`region` varchar(100),
	`postal_code` varchar(20),
	`tax_number` varchar(50),
	`credit_limit` decimal(15,2) DEFAULT '0.00',
	`current_balance` decimal(15,2) DEFAULT '0.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_customer_code_unique` UNIQUE(`customer_code`)
);
--> statement-breakpoint
CREATE TABLE `general_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transaction_date` date NOT NULL,
	`account_id` int NOT NULL,
	`entry_id` int NOT NULL,
	`description` text,
	`debit_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`credit_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`balance` decimal(15,2) NOT NULL DEFAULT '0.00',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `general_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movement_number` varchar(50) NOT NULL,
	`movement_date` date NOT NULL,
	`movement_type` enum('in','out','adjustment','transfer') NOT NULL,
	`item_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
	`total_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
	`from_location` varchar(100),
	`to_location` varchar(100),
	`reference_type` varchar(50),
	`reference_id` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_movements_movement_number_unique` UNIQUE(`movement_number`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_id` int NOT NULL,
	`item_description` varchar(500) NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
	`unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
	`tax_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`discount_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`invoice_date` date NOT NULL,
	`due_date` date NOT NULL,
	`customer_id` int NOT NULL,
	`invoice_type` enum('sales','service','subscription') NOT NULL DEFAULT 'sales',
	`status` enum('draft','pending','paid','partially_paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
	`tax_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`remaining_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`item_code` varchar(50) NOT NULL,
	`item_name` varchar(255) NOT NULL,
	`item_name_en` varchar(255),
	`item_type` enum('material','spare_part','tool','consumable') NOT NULL DEFAULT 'material',
	`category` varchar(100),
	`unit` varchar(50) NOT NULL DEFAULT 'piece',
	`current_quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
	`min_quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
	`max_quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
	`unit_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
	`selling_price` decimal(15,2) NOT NULL DEFAULT '0.00',
	`location` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `items_id` PRIMARY KEY(`id`),
	CONSTRAINT `items_item_code_unique` UNIQUE(`item_code`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entry_number` varchar(50) NOT NULL,
	`entry_date` date NOT NULL,
	`entry_type` enum('manual','automatic','adjustment','closing') NOT NULL DEFAULT 'manual',
	`reference_type` varchar(50),
	`reference_id` int,
	`description` text,
	`total_debit` decimal(15,2) NOT NULL DEFAULT '0.00',
	`total_credit` decimal(15,2) NOT NULL DEFAULT '0.00',
	`status` enum('draft','posted','reversed') NOT NULL DEFAULT 'draft',
	`posted_date` date,
	`posted_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `journal_entries_entry_number_unique` UNIQUE(`entry_number`)
);
--> statement-breakpoint
CREATE TABLE `journal_entry_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entry_id` int NOT NULL,
	`line_number` int NOT NULL,
	`account_id` int NOT NULL,
	`description` text,
	`debit_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`credit_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`cost_center` varchar(50),
	CONSTRAINT `journal_entry_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_receipt_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`receipt_id` int NOT NULL,
	`item_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit_cost` decimal(15,2) NOT NULL,
	`total_cost` decimal(15,2) NOT NULL,
	CONSTRAINT `material_receipt_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`receipt_number` varchar(50) NOT NULL,
	`receipt_date` date NOT NULL,
	`supplier_id` int NOT NULL,
	`purchase_order_number` varchar(50),
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`received_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `material_receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `material_receipts_receipt_number_unique` UNIQUE(`receipt_number`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payment_number` varchar(50) NOT NULL,
	`payment_date` date NOT NULL,
	`invoice_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`payment_method` enum('cash','bank_transfer','check','credit_card','online') NOT NULL DEFAULT 'cash',
	`reference_number` varchar(100),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_payment_number_unique` UNIQUE(`payment_number`)
);
--> statement-breakpoint
CREATE TABLE `purchase_request_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`item_id` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`estimated_cost` decimal(15,2) DEFAULT '0.00',
	`notes` text,
	CONSTRAINT `purchase_request_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_number` varchar(50) NOT NULL,
	`request_date` date NOT NULL,
	`required_date` date,
	`status` enum('draft','pending','approved','rejected','completed') NOT NULL DEFAULT 'draft',
	`requested_by` int NOT NULL,
	`approved_by` int,
	`approval_date` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_requests_request_number_unique` UNIQUE(`request_number`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplier_code` varchar(50) NOT NULL,
	`supplier_name` varchar(255) NOT NULL,
	`supplier_type` enum('local','international') NOT NULL DEFAULT 'local',
	`contact_person` varchar(255),
	`phone` varchar(20),
	`mobile` varchar(20),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`region` varchar(100),
	`postal_code` varchar(20),
	`tax_number` varchar(50),
	`current_balance` decimal(15,2) DEFAULT '0.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`),
	CONSTRAINT `suppliers_supplier_code_unique` UNIQUE(`supplier_code`)
);
