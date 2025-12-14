CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_code` varchar(50) NOT NULL,
	`asset_name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`purchase_date` timestamp,
	`purchase_price` decimal(12,2),
	`current_value` decimal(12,2),
	`location` varchar(255),
	`status` enum('active','under_maintenance','retired','disposed') DEFAULT 'active',
	`warranty_expiry` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_asset_code_unique` UNIQUE(`asset_code`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_id` int NOT NULL,
	`maintenance_type` enum('preventive','corrective','predictive') NOT NULL,
	`frequency` enum('daily','weekly','monthly','quarterly','yearly') NOT NULL,
	`last_maintenance_date` timestamp,
	`next_maintenance_date` timestamp NOT NULL,
	`assigned_to` int,
	`estimated_cost` decimal(10,2),
	`actual_cost` decimal(10,2),
	`status` enum('scheduled','in_progress','completed','overdue','cancelled') DEFAULT 'scheduled',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `maintenance_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meter_number` varchar(50) NOT NULL,
	`customer_id` int NOT NULL,
	`meter_type` enum('electric','water','gas') NOT NULL,
	`location` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`installation_date` timestamp,
	`last_reading_date` timestamp,
	`last_reading` decimal(10,2),
	`status` enum('active','inactive','faulty','replaced') DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `meters_id` PRIMARY KEY(`id`),
	CONSTRAINT `meters_meter_number_unique` UNIQUE(`meter_number`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int NOT NULL,
	`resource` varchar(100) NOT NULL,
	`action` enum('create','read','update','delete','all') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`created_by` int,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`plan_name` varchar(100) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`billing_cycle` enum('monthly','quarterly','yearly') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('active','suspended','cancelled','expired') DEFAULT 'active',
	`auto_renew` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`customer_id` int,
	`meter_id` int,
	`order_type` enum('installation','maintenance','repair','reading','disconnection') NOT NULL,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`assigned_to` int,
	`description` text,
	`scheduled_date` timestamp,
	`completed_date` timestamp,
	`status` enum('pending','assigned','in_progress','completed','cancelled') DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_orders_order_number_unique` UNIQUE(`order_number`)
);
