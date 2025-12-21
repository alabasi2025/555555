CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`user_name` varchar(255),
	`action` enum('create','read','update','delete','login','logout','export','import','approve','reject') NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` int,
	`entity_name` varchar(255),
	`old_values` text,
	`new_values` text,
	`ip_address` varchar(45),
	`user_agent` text,
	`session_id` varchar(255),
	`module` varchar(100),
	`description` text,
	`status` enum('success','failed','pending') DEFAULT 'success',
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100) NOT NULL,
	`description` text,
	`widget_type` enum('stat','chart','table','list','calendar','map') NOT NULL,
	`data_source` varchar(100) NOT NULL,
	`default_config` text,
	`min_width` int DEFAULT 1,
	`min_height` int DEFAULT 1,
	`max_width` int DEFAULT 4,
	`max_height` int DEFAULT 4,
	`required_permission` varchar(100),
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_widgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `dashboard_widgets_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `detailed_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100) NOT NULL,
	`description` text,
	`resource` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detailed_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `detailed_permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `kpi_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100) NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`calculation_formula` text,
	`data_source` varchar(100),
	`unit` varchar(20),
	`target_value` decimal(15,2),
	`warning_threshold` decimal(15,2),
	`critical_threshold` decimal(15,2),
	`trend_direction` enum('up_good','down_good','neutral') DEFAULT 'up_good',
	`refresh_interval` int DEFAULT 3600,
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpi_definitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `kpi_definitions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `kpi_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kpi_id` int NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`previous_value` decimal(15,2),
	`change_percent` decimal(10,2),
	`period_type` enum('daily','weekly','monthly','quarterly','yearly') NOT NULL,
	`period_start` timestamp NOT NULL,
	`period_end` timestamp NOT NULL,
	`metadata` text,
	`calculated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kpi_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','warning','error','success','reminder') DEFAULT 'info',
	`category` varchar(50),
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`action_url` varchar(500),
	`action_label` varchar(100),
	`metadata` text,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permission_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100) NOT NULL,
	`description` text,
	`module` varchar(100) NOT NULL,
	`sort_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permission_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `permission_groups_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `recent_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`activity_type` varchar(50) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` int,
	`entity_name` varchar(255),
	`description` text,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recent_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	`granted_by` int,
	`granted_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_token` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`device_info` text,
	`is_active` boolean DEFAULT true,
	`last_activity` timestamp DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_session_token_unique` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `user_dashboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`widget_id` int NOT NULL,
	`position_x` int DEFAULT 0,
	`position_y` int DEFAULT 0,
	`width` int DEFAULT 2,
	`height` int DEFAULT 2,
	`config` text,
	`is_visible` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_dashboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`language` varchar(10) DEFAULT 'ar',
	`timezone` varchar(50) DEFAULT 'Asia/Riyadh',
	`date_format` varchar(20) DEFAULT 'DD/MM/YYYY',
	`number_format` varchar(20) DEFAULT '1,234.56',
	`currency` varchar(3) DEFAULT 'SAR',
	`theme` enum('light','dark','system') DEFAULT 'light',
	`notifications` text,
	`dashboard_layout` text,
	`default_page` varchar(100) DEFAULT '/dashboard',
	`items_per_page` int DEFAULT 25,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`date` date NOT NULL,
	`check_in_time` time,
	`check_out_time` time,
	`check_in_location` varchar(255),
	`check_out_location` varchar(255),
	`scheduled_hours` decimal(5,2) DEFAULT '8',
	`worked_hours` decimal(5,2) DEFAULT '0',
	`overtime_hours` decimal(5,2) DEFAULT '0',
	`late_minutes` int DEFAULT 0,
	`early_leave_minutes` int DEFAULT 0,
	`status` enum('present','absent','late','half_day','on_leave','holiday','weekend') DEFAULT 'present',
	`notes` text,
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`description` text,
	`parent_department_id` int,
	`manager_id` int,
	`cost_center_id` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `employee_bonuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`bonus_type` enum('performance','annual','project','overtime','special','other') DEFAULT 'performance',
	`amount` decimal(12,2) NOT NULL,
	`reason` text,
	`effective_date` date NOT NULL,
	`payroll_period_id` int,
	`status` enum('pending','approved','paid','cancelled') DEFAULT 'pending',
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_bonuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`loan_type` enum('advance','loan') DEFAULT 'advance',
	`amount` decimal(12,2) NOT NULL,
	`remaining_amount` decimal(12,2) NOT NULL,
	`monthly_deduction` decimal(10,2) NOT NULL,
	`number_of_installments` int NOT NULL,
	`paid_installments` int DEFAULT 0,
	`start_date` date NOT NULL,
	`end_date` date,
	`reason` text,
	`status` enum('pending','approved','active','completed','cancelled') DEFAULT 'pending',
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`shift_id` int NOT NULL,
	`day_of_week` enum('sunday','monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL,
	`is_working_day` boolean DEFAULT true,
	`effective_from` date NOT NULL,
	`effective_to` date,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_number` varchar(20) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`full_name_ar` varchar(255),
	`national_id` varchar(20),
	`date_of_birth` date,
	`gender` enum('male','female'),
	`marital_status` enum('single','married','divorced','widowed'),
	`nationality` varchar(100),
	`email` varchar(255),
	`phone` varchar(20),
	`mobile_phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`emergency_contact_name` varchar(255),
	`emergency_contact_phone` varchar(20),
	`department_id` int,
	`position_id` int,
	`manager_id` int,
	`employment_type` enum('full_time','part_time','contract','temporary','intern') DEFAULT 'full_time',
	`hire_date` date NOT NULL,
	`probation_end_date` date,
	`contract_end_date` date,
	`termination_date` date,
	`termination_reason` text,
	`base_salary` decimal(12,2) DEFAULT '0',
	`housing_allowance` decimal(10,2) DEFAULT '0',
	`transport_allowance` decimal(10,2) DEFAULT '0',
	`other_allowances` decimal(10,2) DEFAULT '0',
	`bank_name` varchar(100),
	`bank_account_number` varchar(50),
	`iban` varchar(50),
	`social_insurance_number` varchar(20),
	`tax_number` varchar(20),
	`status` enum('active','on_leave','suspended','terminated','resigned') DEFAULT 'active',
	`photo_url` varchar(500),
	`user_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`updated_by` int,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_employee_number_unique` UNIQUE(`employee_number`),
	CONSTRAINT `employees_national_id_unique` UNIQUE(`national_id`),
	CONSTRAINT `employees_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `holidays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`year` int NOT NULL,
	`is_recurring` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holidays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`leave_type_id` int NOT NULL,
	`year` int NOT NULL,
	`opening_balance` decimal(5,2) DEFAULT '0',
	`accrued` decimal(5,2) DEFAULT '0',
	`used` decimal(5,2) DEFAULT '0',
	`adjusted` decimal(5,2) DEFAULT '0',
	`carried_forward` decimal(5,2) DEFAULT '0',
	`remaining_balance` decimal(5,2) DEFAULT '0',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`description` text,
	`annual_balance` decimal(5,2) DEFAULT '0',
	`is_paid` boolean DEFAULT true,
	`requires_approval` boolean DEFAULT true,
	`requires_attachment` boolean DEFAULT false,
	`max_consecutive_days` int,
	`min_advance_notice` int DEFAULT 1,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leave_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `leave_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `leaves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`leave_type_id` int NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`total_days` decimal(5,2) NOT NULL,
	`reason` text,
	`attachment_url` varchar(500),
	`status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
	`approved_by` int,
	`approved_at` timestamp,
	`rejection_reason` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	CONSTRAINT `leaves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payroll_period_id` int NOT NULL,
	`employee_id` int NOT NULL,
	`base_salary` decimal(12,2) DEFAULT '0',
	`housing_allowance` decimal(10,2) DEFAULT '0',
	`transport_allowance` decimal(10,2) DEFAULT '0',
	`other_allowances` decimal(10,2) DEFAULT '0',
	`overtime_pay` decimal(10,2) DEFAULT '0',
	`bonuses` decimal(10,2) DEFAULT '0',
	`commissions` decimal(10,2) DEFAULT '0',
	`other_earnings` decimal(10,2) DEFAULT '0',
	`social_insurance` decimal(10,2) DEFAULT '0',
	`tax_deduction` decimal(10,2) DEFAULT '0',
	`loan_deduction` decimal(10,2) DEFAULT '0',
	`absence_deduction` decimal(10,2) DEFAULT '0',
	`late_deduction` decimal(10,2) DEFAULT '0',
	`other_deductions` decimal(10,2) DEFAULT '0',
	`gross_salary` decimal(12,2) DEFAULT '0',
	`total_deductions` decimal(12,2) DEFAULT '0',
	`net_salary` decimal(12,2) DEFAULT '0',
	`payment_method` enum('bank_transfer','cash','check') DEFAULT 'bank_transfer',
	`payment_status` enum('pending','processed','paid','cancelled') DEFAULT 'pending',
	`payment_date` date,
	`payment_reference` varchar(100),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_by` int,
	`approved_by` int,
	`approved_at` timestamp,
	CONSTRAINT `payroll_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payroll_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`payment_date` date,
	`status` enum('draft','processing','approved','paid','closed') DEFAULT 'draft',
	`total_employees` int DEFAULT 0,
	`total_gross_salary` decimal(14,2) DEFAULT '0',
	`total_deductions` decimal(14,2) DEFAULT '0',
	`total_net_salary` decimal(14,2) DEFAULT '0',
	`processed_by` int,
	`processed_at` timestamp,
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payroll_periods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`reviewer_id` int NOT NULL,
	`review_period` varchar(50) NOT NULL,
	`review_date` date NOT NULL,
	`performance_score` decimal(3,2),
	`attendance_score` decimal(3,2),
	`teamwork_score` decimal(3,2),
	`communication_score` decimal(3,2),
	`technical_score` decimal(3,2),
	`overall_score` decimal(3,2),
	`strengths` text,
	`areas_for_improvement` text,
	`goals` text,
	`employee_comments` text,
	`reviewer_comments` text,
	`status` enum('draft','submitted','acknowledged','completed') DEFAULT 'draft',
	`acknowledged_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`title_ar` varchar(255) NOT NULL,
	`title_en` varchar(255),
	`description` text,
	`department_id` int,
	`level` int DEFAULT 1,
	`min_salary` decimal(12,2),
	`max_salary` decimal(12,2),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`),
	CONSTRAINT `positions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `safety_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incident_number` varchar(20) NOT NULL,
	`employee_id` int,
	`incident_date` timestamp NOT NULL,
	`location` varchar(255),
	`incident_type` enum('injury','near_miss','property_damage','environmental','other') DEFAULT 'other',
	`severity` enum('minor','moderate','major','critical') DEFAULT 'minor',
	`description` text NOT NULL,
	`immediate_action` text,
	`root_cause` text,
	`corrective_action` text,
	`preventive_action` text,
	`status` enum('reported','investigating','resolved','closed') DEFAULT 'reported',
	`reported_by` int NOT NULL,
	`investigated_by` int,
	`closed_by` int,
	`closed_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `safety_incidents_id` PRIMARY KEY(`id`),
	CONSTRAINT `safety_incidents_incident_number_unique` UNIQUE(`incident_number`)
);
--> statement-breakpoint
CREATE TABLE `training_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`title_ar` varchar(255) NOT NULL,
	`title_en` varchar(255),
	`description` text,
	`category` varchar(100),
	`provider` varchar(255),
	`duration` int,
	`cost` decimal(10,2),
	`is_internal` boolean DEFAULT true,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `training_courses_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `training_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`course_id` int NOT NULL,
	`enrollment_date` date NOT NULL,
	`start_date` date,
	`end_date` date,
	`status` enum('enrolled','in_progress','completed','cancelled','failed') DEFAULT 'enrolled',
	`score` decimal(5,2),
	`certificate_url` varchar(500),
	`feedback` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_en` varchar(255),
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`break_duration` int DEFAULT 60,
	`working_hours` decimal(4,2) DEFAULT '8',
	`is_flexible` boolean DEFAULT false,
	`flexible_start_time` time,
	`flexible_end_time` time,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_shifts_id` PRIMARY KEY(`id`),
	CONSTRAINT `work_shifts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `coupon_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coupon_code` varchar(50) NOT NULL,
	`discount_rule_id` int NOT NULL,
	`usage_limit` int NOT NULL DEFAULT 1,
	`usage_count` int NOT NULL DEFAULT 0,
	`expiry_date` date,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupon_codes_coupon_code_unique` UNIQUE(`coupon_code`)
);
--> statement-breakpoint
CREATE TABLE `coupon_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coupon_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`invoice_id` int NOT NULL,
	`discount_amount` decimal(15,2) NOT NULL,
	`used_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`feedback_type` enum('suggestion','complaint','compliment','inquiry') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`rating` int,
	`status` enum('pending','reviewed','responded','closed') NOT NULL DEFAULT 'pending',
	`response` text,
	`responded_by` int,
	`responded_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`notification_type` enum('invoice','payment','service','promotion','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`action_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_portal_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portal_user_id` int NOT NULL,
	`session_token` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_portal_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_portal_sessions_session_token_unique` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `customer_portal_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`username` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_verified` boolean NOT NULL DEFAULT false,
	`verification_token` varchar(255),
	`reset_token` varchar(255),
	`reset_token_expiry` timestamp,
	`last_login` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_portal_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_portal_users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `discount_rule_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discount_rule_id` int NOT NULL,
	`item_id` int,
	`category_id` int,
	`customer_id` int,
	CONSTRAINT `discount_rule_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discount_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rule_name` varchar(255) NOT NULL,
	`rule_code` varchar(50) NOT NULL,
	`discount_type` enum('percentage','fixed_amount','buy_x_get_y','tiered') NOT NULL,
	`discount_value` decimal(15,2) NOT NULL,
	`min_purchase_amount` decimal(15,2),
	`max_discount_amount` decimal(15,2),
	`start_date` date NOT NULL,
	`end_date` date,
	`usage_limit` int,
	`usage_count` int NOT NULL DEFAULT 0,
	`per_customer_limit` int,
	`applicable_to` enum('all','specific_items','specific_categories','specific_customers') NOT NULL DEFAULT 'all',
	`is_active` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 0,
	`description` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discount_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_rules_rule_code_unique` UNIQUE(`rule_code`)
);
--> statement-breakpoint
CREATE TABLE `field_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_number` varchar(50) NOT NULL,
	`team_id` int NOT NULL,
	`schedule_date` date NOT NULL,
	`schedule_type` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
	`status` enum('draft','published','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`total_tasks` int NOT NULL DEFAULT 0,
	`completed_tasks` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_schedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `field_schedules_schedule_number_unique` UNIQUE(`schedule_number`)
);
--> statement-breakpoint
CREATE TABLE `field_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_number` varchar(50) NOT NULL,
	`schedule_id` int,
	`work_order_id` int,
	`team_id` int,
	`assigned_to` int,
	`task_type` enum('installation','maintenance','meter_reading','collection','inspection','disconnection','reconnection') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`customer_id` int,
	`subscription_id` int,
	`meter_id` int,
	`address` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`scheduled_date` date NOT NULL,
	`scheduled_time` varchar(10),
	`estimated_duration` int,
	`actual_start_time` timestamp,
	`actual_end_time` timestamp,
	`status` enum('pending','assigned','in_progress','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`completion_notes` text,
	`customer_signature` text,
	`photos` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `field_tasks_task_number_unique` UNIQUE(`task_number`)
);
--> statement-breakpoint
CREATE TABLE `field_team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`team_id` int NOT NULL,
	`employee_id` int NOT NULL,
	`role` enum('leader','technician','assistant') NOT NULL DEFAULT 'technician',
	`join_date` date NOT NULL,
	`leave_date` date,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `field_team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`team_code` varchar(50) NOT NULL,
	`team_name` varchar(255) NOT NULL,
	`team_leader_id` int,
	`team_type` enum('installation','maintenance','meter_reading','collection','inspection') NOT NULL,
	`region` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_teams_id` PRIMARY KEY(`id`),
	CONSTRAINT `field_teams_team_code_unique` UNIQUE(`team_code`)
);
--> statement-breakpoint
CREATE TABLE `inventory_adjustment_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adjustment_id` int NOT NULL,
	`item_id` int NOT NULL,
	`location_id` int,
	`adjustment_quantity` decimal(15,3) NOT NULL,
	`unit_cost` decimal(15,2) NOT NULL,
	`total_value` decimal(15,2) NOT NULL,
	`reason` text,
	CONSTRAINT `inventory_adjustment_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_adjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adjustment_number` varchar(50) NOT NULL,
	`count_id` int,
	`warehouse_id` int NOT NULL,
	`adjustment_date` date NOT NULL,
	`adjustment_type` enum('count_variance','damage','expiry','theft','other') NOT NULL,
	`status` enum('draft','pending_approval','approved','rejected') NOT NULL DEFAULT 'draft',
	`total_value` decimal(15,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`created_by` int,
	`approved_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_adjustments_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_adjustments_adjustment_number_unique` UNIQUE(`adjustment_number`)
);
--> statement-breakpoint
CREATE TABLE `inventory_count_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`count_id` int NOT NULL,
	`item_id` int NOT NULL,
	`location_id` int,
	`system_quantity` decimal(15,3) NOT NULL,
	`counted_quantity` decimal(15,3),
	`variance` decimal(15,3),
	`variance_value` decimal(15,2),
	`counted_by` int,
	`counted_at` timestamp,
	`notes` text,
	CONSTRAINT `inventory_count_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_counts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`count_number` varchar(50) NOT NULL,
	`count_type` enum('full','partial','cycle','spot') NOT NULL,
	`warehouse_id` int NOT NULL,
	`count_date` date NOT NULL,
	`status` enum('draft','in_progress','pending_approval','approved','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_by` int,
	`approved_by` int,
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_counts_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_counts_count_number_unique` UNIQUE(`count_number`)
);
--> statement-breakpoint
CREATE TABLE `meter_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meter_id` int NOT NULL,
	`subscription_id` int,
	`reading_date` date NOT NULL,
	`reading_time` varchar(10),
	`previous_reading` decimal(15,3) NOT NULL,
	`current_reading` decimal(15,3) NOT NULL,
	`consumption` decimal(15,3) NOT NULL,
	`reading_type` enum('scheduled','manual','estimated','final') NOT NULL DEFAULT 'scheduled',
	`read_by` int,
	`field_task_id` int,
	`photo` varchar(500),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`is_verified` boolean NOT NULL DEFAULT false,
	`verified_by` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meter_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotion_name` varchar(255) NOT NULL,
	`promotion_code` varchar(50) NOT NULL,
	`promotion_type` enum('seasonal','clearance','loyalty','bundle','flash_sale') NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`discount_rule_id` int,
	`banner_image` varchar(500),
	`description` text,
	`terms_conditions` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_promotion_code_unique` UNIQUE(`promotion_code`)
);
--> statement-breakpoint
CREATE TABLE `recurring_invoice_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recurring_invoice_id` int NOT NULL,
	`invoice_id` int NOT NULL,
	`generated_date` timestamp NOT NULL DEFAULT (now()),
	`status` enum('success','failed') NOT NULL,
	`error_message` text,
	CONSTRAINT `recurring_invoice_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recurring_invoice_id` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`quantity` decimal(15,3) NOT NULL DEFAULT '1.000',
	`unit_price` decimal(15,2) NOT NULL,
	`tax_rate` decimal(5,2) DEFAULT '0.00',
	`discount_rate` decimal(5,2) DEFAULT '0.00',
	`line_total` decimal(15,2) NOT NULL,
	CONSTRAINT `recurring_invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_name` varchar(255) NOT NULL,
	`customer_id` int NOT NULL,
	`frequency` enum('daily','weekly','biweekly','monthly','quarterly','yearly') NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date,
	`next_invoice_date` date NOT NULL,
	`last_invoice_date` date,
	`day_of_month` int,
	`day_of_week` int,
	`subtotal` decimal(15,2) NOT NULL DEFAULT '0.00',
	`tax_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`discount_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`status` enum('active','paused','completed','cancelled') NOT NULL DEFAULT 'active',
	`auto_send` boolean NOT NULL DEFAULT false,
	`invoices_generated` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurring_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_transfer_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transfer_id` int NOT NULL,
	`item_id` int NOT NULL,
	`requested_quantity` decimal(15,3) NOT NULL,
	`sent_quantity` decimal(15,3),
	`received_quantity` decimal(15,3),
	`notes` text,
	CONSTRAINT `stock_transfer_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_transfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transfer_number` varchar(50) NOT NULL,
	`from_warehouse_id` int NOT NULL,
	`to_warehouse_id` int NOT NULL,
	`transfer_date` date NOT NULL,
	`status` enum('draft','pending','in_transit','received','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_by` int,
	`approved_by` int,
	`received_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_transfers_id` PRIMARY KEY(`id`),
	CONSTRAINT `stock_transfers_transfer_number_unique` UNIQUE(`transfer_number`)
);
--> statement-breakpoint
CREATE TABLE `ticket_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_name` varchar(255) NOT NULL,
	`category_code` varchar(50) NOT NULL,
	`parent_category_id` int,
	`sla_hours` int NOT NULL DEFAULT 24,
	`default_assignee` int,
	`default_team` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `ticket_categories_category_code_unique` UNIQUE(`category_code`)
);
--> statement-breakpoint
CREATE TABLE `ticket_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`comment_type` enum('public','internal') NOT NULL DEFAULT 'public',
	`comment` text NOT NULL,
	`attachments` json,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`old_value` text,
	`new_value` text,
	`changed_by` int,
	`changed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_number` varchar(50) NOT NULL,
	`customer_id` int,
	`subscription_id` int,
	`meter_id` int,
	`category` enum('billing','technical','service','complaint','inquiry','other') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`subject` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`status` enum('open','in_progress','pending_customer','resolved','closed','cancelled') NOT NULL DEFAULT 'open',
	`assigned_to` int,
	`assigned_team` varchar(100),
	`source` enum('web','mobile','phone','email','walk_in') NOT NULL DEFAULT 'web',
	`due_date` timestamp,
	`resolved_at` timestamp,
	`closed_at` timestamp,
	`satisfaction_rating` int,
	`satisfaction_comment` text,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticket_number_unique` UNIQUE(`ticket_number`)
);
--> statement-breakpoint
CREATE TABLE `warehouse_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`warehouse_id` int NOT NULL,
	`location_code` varchar(50) NOT NULL,
	`location_name` varchar(255) NOT NULL,
	`location_type` enum('shelf','bin','zone','area') NOT NULL DEFAULT 'shelf',
	`parent_location_id` int,
	`capacity` decimal(15,2),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouse_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouse_stock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`warehouse_id` int NOT NULL,
	`location_id` int,
	`item_id` int NOT NULL,
	`quantity` decimal(15,3) NOT NULL DEFAULT '0.000',
	`reserved_quantity` decimal(15,3) NOT NULL DEFAULT '0.000',
	`available_quantity` decimal(15,3) NOT NULL DEFAULT '0.000',
	`last_count_date` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouse_stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`warehouse_code` varchar(50) NOT NULL,
	`warehouse_name` varchar(255) NOT NULL,
	`warehouse_type` enum('main','branch','transit','virtual') NOT NULL DEFAULT 'main',
	`address` text,
	`city` varchar(100),
	`region` varchar(100),
	`manager_id` int,
	`phone` varchar(20),
	`email` varchar(320),
	`capacity` decimal(15,2),
	`current_occupancy` decimal(15,2) DEFAULT '0.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_warehouse_code_unique` UNIQUE(`warehouse_code`)
);
--> statement-breakpoint
CREATE TABLE `api_documentation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` enum('GET','POST','PUT','PATCH','DELETE') NOT NULL,
	`description` text,
	`request_schema` json,
	`response_schema` json,
	`example_request` json,
	`example_response` json,
	`authentication` varchar(100),
	`rate_limit` varchar(50),
	`version` varchar(20),
	`is_deprecated` boolean DEFAULT false,
	`deprecation_date` date,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_documentation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backup_code` varchar(50) NOT NULL,
	`backup_type` enum('full','incremental','differential') NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`file_size` int,
	`file_path` varchar(500),
	`checksum` varchar(64),
	`encryption_key` varchar(255),
	`retention_days` int DEFAULT 30,
	`expires_at` timestamp,
	`started_at` timestamp,
	`completed_at` timestamp,
	`error_message` text,
	`triggered_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_id` int,
	`recipient_id` int,
	`recipient_email` varchar(255),
	`recipient_phone` varchar(20),
	`channel` enum('email','sms','push','in_app') NOT NULL,
	`subject` varchar(255),
	`body` text,
	`status` enum('pending','sent','delivered','failed','bounced') DEFAULT 'pending',
	`sent_at` timestamp,
	`delivered_at` timestamp,
	`error_message` text,
	`metadata` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notification_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_code` varchar(50) NOT NULL,
	`template_name` varchar(255) NOT NULL,
	`channel` enum('email','sms','push','in_app') NOT NULL,
	`subject` varchar(255),
	`body` text,
	`variables` json,
	`is_active` boolean DEFAULT true,
	`language` varchar(10) DEFAULT 'ar',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metric_name` varchar(100) NOT NULL,
	`metric_value` decimal(15,4),
	`metric_unit` varchar(50),
	`source` varchar(100),
	`tags` json,
	`recorded_at` timestamp DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privacy_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`consent_type` varchar(100) NOT NULL,
	`consent_version` varchar(20),
	`is_granted` boolean DEFAULT false,
	`granted_at` timestamp,
	`revoked_at` timestamp,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `privacy_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privacy_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_number` varchar(50) NOT NULL,
	`request_type` enum('access','deletion','correction','portability','objection') NOT NULL,
	`requester_id` int,
	`requester_email` varchar(255),
	`requester_name` varchar(255),
	`description` text,
	`status` enum('pending','in_progress','completed','rejected') DEFAULT 'pending',
	`assigned_to` int,
	`response_notes` text,
	`completed_at` timestamp,
	`due_date` date,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `privacy_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restore_operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backup_id` int NOT NULL,
	`restore_type` enum('full','partial','point_in_time') NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`target_database` varchar(100),
	`tables_restored` json,
	`started_at` timestamp,
	`completed_at` timestamp,
	`error_message` text,
	`triggered_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `restore_operations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_code` varchar(50) NOT NULL,
	`assessment_type` enum('vulnerability','penetration','compliance','audit') NOT NULL,
	`scope` text,
	`status` enum('planned','in_progress','completed','cancelled') DEFAULT 'planned',
	`findings` int DEFAULT 0,
	`critical_findings` int DEFAULT 0,
	`high_findings` int DEFAULT 0,
	`medium_findings` int DEFAULT 0,
	`low_findings` int DEFAULT 0,
	`assessor_id` int,
	`start_date` date,
	`end_date` date,
	`report_url` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`finding_code` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('critical','high','medium','low','info') NOT NULL,
	`category` varchar(100),
	`affected_component` varchar(255),
	`recommendation` text,
	`status` enum('open','in_progress','resolved','accepted','false_positive') DEFAULT 'open',
	`assigned_to` int,
	`due_date` date,
	`resolved_at` timestamp,
	`resolved_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policy_code` varchar(50) NOT NULL,
	`policy_name` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`content` text,
	`version` varchar(20),
	`status` enum('draft','active','archived') DEFAULT 'draft',
	`effective_date` date,
	`review_date` date,
	`approved_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_id` int NOT NULL,
	`old_value` text,
	`new_value` text,
	`changed_by` int,
	`change_reason` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `settings_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alert_code` varchar(50) NOT NULL,
	`alert_type` enum('performance','security','error','warning','info') NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`source` varchar(100),
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledged_by` int,
	`acknowledged_at` timestamp,
	`resolved_by` int,
	`resolved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `system_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_code` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('user_guide','admin_guide','api_docs','technical','training','policy') NOT NULL,
	`content` text,
	`version` varchar(20),
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`language` varchar(10) DEFAULT 'ar',
	`file_url` varchar(500),
	`author_id` int,
	`reviewer_id` int,
	`published_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`log_level` enum('debug','info','warning','error','critical') NOT NULL,
	`source` varchar(100),
	`message` text,
	`context` json,
	`stack_trace` text,
	`user_id` int,
	`request_id` varchar(100),
	`ip_address` varchar(45),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`setting_type` enum('string','number','boolean','json','date') DEFAULT 'string',
	`category` varchar(100),
	`description` text,
	`is_public` boolean DEFAULT false,
	`is_editable` boolean DEFAULT true,
	`default_value` text,
	`validation_rules` json,
	`updated_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`suite_id` int NOT NULL,
	`test_name` varchar(255) NOT NULL,
	`test_code` varchar(50) NOT NULL,
	`description` text,
	`expected_result` text,
	`priority` enum('critical','high','medium','low') DEFAULT 'medium',
	`is_automated` boolean DEFAULT true,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `test_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_coverage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`run_id` int NOT NULL,
	`module` varchar(100) NOT NULL,
	`total_lines` int DEFAULT 0,
	`covered_lines` int DEFAULT 0,
	`coverage_percent` decimal(5,2),
	`total_functions` int DEFAULT 0,
	`covered_functions` int DEFAULT 0,
	`total_branches` int DEFAULT 0,
	`covered_branches` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `test_coverage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`run_id` int NOT NULL,
	`test_case_id` int NOT NULL,
	`status` enum('passed','failed','skipped','error') NOT NULL,
	`actual_result` text,
	`error_message` text,
	`stack_trace` text,
	`duration` int,
	`screenshots` json,
	`executed_at` timestamp DEFAULT (now()),
	CONSTRAINT `test_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`run_number` varchar(50) NOT NULL,
	`suite_id` int,
	`run_type` enum('manual','automated','scheduled') DEFAULT 'automated',
	`environment` enum('development','staging','production') DEFAULT 'development',
	`status` enum('pending','running','completed','failed','cancelled') DEFAULT 'pending',
	`total_tests` int DEFAULT 0,
	`passed_tests` int DEFAULT 0,
	`failed_tests` int DEFAULT 0,
	`skipped_tests` int DEFAULT 0,
	`duration` int,
	`started_at` timestamp,
	`completed_at` timestamp,
	`triggered_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `test_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_suites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`suite_name` varchar(255) NOT NULL,
	`suite_type` enum('unit','integration','e2e','performance','security') NOT NULL,
	`description` text,
	`module` varchar(100),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `test_suites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`step_number` int NOT NULL,
	`approver_id` int NOT NULL,
	`action` enum('approve','reject','return','delegate','escalate') NOT NULL,
	`comments` text,
	`attachments` json,
	`action_at` timestamp DEFAULT (now()),
	CONSTRAINT `approval_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflow_id` int NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` int NOT NULL,
	`requester_id` int NOT NULL,
	`current_step` int DEFAULT 1,
	`total_steps` int NOT NULL,
	`status` enum('pending','in_progress','approved','rejected','cancelled','escalated') DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`due_date` datetime,
	`completed_at` datetime,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_collection_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rule_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`invoice_id` int,
	`action_taken` varchar(100) NOT NULL,
	`action_result` enum('success','failed','pending','skipped') NOT NULL,
	`result_details` text,
	`amount_collected` decimal(15,2),
	`executed_at` timestamp DEFAULT (now()),
	CONSTRAINT `auto_collection_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_collection_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rule_name` varchar(255) NOT NULL,
	`description` text,
	`trigger_type` enum('due_date','overdue_days','amount_threshold','schedule') NOT NULL,
	`trigger_value` varchar(100),
	`action_type` enum('send_reminder','charge_wallet','apply_penalty','suspend_service','escalate') NOT NULL,
	`action_config` json,
	`customer_segment` varchar(100),
	`priority` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_collection_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_note_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credit_note_id` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit_price` decimal(15,2) NOT NULL,
	`tax_rate` decimal(5,2) DEFAULT '0',
	`tax_amount` decimal(15,2) DEFAULT '0',
	`total_amount` decimal(15,2) NOT NULL,
	`original_invoice_item_id` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `credit_note_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credit_note_number` varchar(50) NOT NULL,
	`original_invoice_id` int,
	`customer_id` int NOT NULL,
	`issue_date` date NOT NULL,
	`reason` enum('return','discount','error','cancellation','other') NOT NULL,
	`reason_description` text,
	`subtotal` decimal(15,2) NOT NULL,
	`tax_amount` decimal(15,2) DEFAULT '0',
	`total_amount` decimal(15,2) NOT NULL,
	`status` enum('draft','issued','applied','cancelled') DEFAULT 'draft',
	`applied_to_invoice_id` int,
	`applied_amount` decimal(15,2) DEFAULT '0',
	`applied_at` datetime,
	`notes` text,
	`created_by` int,
	`approved_by` int,
	`approved_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_notes_credit_note_number_unique` UNIQUE(`credit_note_number`)
);
--> statement-breakpoint
CREATE TABLE `custom_report_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_name` varchar(255) NOT NULL,
	`report_type` enum('financial','operational','customer','inventory','hr','custom') NOT NULL,
	`description` text,
	`base_query` text,
	`columns` json,
	`filters` json,
	`group_by` json,
	`order_by` json,
	`chart_type` enum('table','bar','line','pie','area','scatter','mixed'),
	`chart_config` json,
	`schedule_type` enum('manual','daily','weekly','monthly'),
	`schedule_config` json,
	`recipients` json,
	`is_public` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_report_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`wallet_number` varchar(50) NOT NULL,
	`balance` decimal(15,2) DEFAULT '0',
	`currency` varchar(3) DEFAULT 'YER',
	`status` enum('active','suspended','closed') DEFAULT 'active',
	`last_transaction_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_wallets_wallet_number_unique` UNIQUE(`wallet_number`)
);
--> statement-breakpoint
CREATE TABLE `debt_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`debt_type` enum('invoice','service','penalty','other') NOT NULL,
	`reference_type` varchar(50),
	`reference_id` int,
	`original_amount` decimal(15,2) NOT NULL,
	`paid_amount` decimal(15,2) DEFAULT '0',
	`remaining_amount` decimal(15,2) NOT NULL,
	`penalty_amount` decimal(15,2) DEFAULT '0',
	`interest_amount` decimal(15,2) DEFAULT '0',
	`due_date` date NOT NULL,
	`status` enum('active','partially_paid','paid','written_off','in_collection','disputed') DEFAULT 'active',
	`aging_days` int DEFAULT 0,
	`last_payment_date` date,
	`last_reminder_date` date,
	`reminder_count` int DEFAULT 0,
	`collection_stage` enum('normal','reminder','warning','final_notice','legal','written_off') DEFAULT 'normal',
	`assigned_collector_id` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debt_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_plan_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_id` int NOT NULL,
	`task_type` varchar(100) NOT NULL,
	`customer_id` int,
	`meter_id` int,
	`subscription_id` int,
	`address` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`scheduled_date` date,
	`scheduled_time` varchar(20),
	`assigned_worker_id` int,
	`priority` int DEFAULT 0,
	`status` enum('pending','assigned','in_progress','completed','failed','skipped') DEFAULT 'pending',
	`start_time` datetime,
	`end_time` datetime,
	`result` json,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_plan_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_name` varchar(255) NOT NULL,
	`plan_type` enum('reading','collection','maintenance','installation','inspection','disconnection','reconnection') NOT NULL,
	`description` text,
	`area_id` int,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`target_count` int,
	`completed_count` int DEFAULT 0,
	`status` enum('draft','scheduled','in_progress','completed','cancelled') DEFAULT 'draft',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`assigned_team_id` int,
	`supervisor_id` int,
	`estimated_hours` decimal(10,2),
	`actual_hours` decimal(10,2),
	`notes` text,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_worker_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`total_tasks` int DEFAULT 0,
	`completed_tasks` int DEFAULT 0,
	`failed_tasks` int DEFAULT 0,
	`avg_completion_time` decimal(10,2),
	`total_working_hours` decimal(10,2),
	`total_distance` decimal(10,2),
	`customer_rating` decimal(3,2),
	`quality_score` decimal(5,2),
	`punctuality_score` decimal(5,2),
	`overall_score` decimal(5,2),
	`bonus_amount` decimal(15,2),
	`penalty_amount` decimal(15,2),
	`notes` text,
	`calculated_at` timestamp DEFAULT (now()),
	CONSTRAINT `field_worker_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`forecast_name` varchar(255) NOT NULL,
	`forecast_type` enum('revenue','expense','cash_flow','profit','collection') NOT NULL,
	`period_type` enum('daily','weekly','monthly','quarterly','yearly') NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`baseline_data` json,
	`forecast_data` json,
	`assumptions` json,
	`methodology` enum('linear','exponential','seasonal','ml_based','manual') DEFAULT 'linear',
	`confidence_level` decimal(5,2),
	`actual_data` json,
	`variance_analysis` json,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`created_by` int,
	`approved_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`item_id` int NOT NULL,
	`warehouse_id` int,
	`alert_type` enum('low_stock','overstock','expiring','expired','reorder_point','stockout') NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'warning',
	`current_value` decimal(15,4),
	`threshold_value` decimal(15,4),
	`message` text,
	`is_read` boolean DEFAULT false,
	`is_resolved` boolean DEFAULT false,
	`resolved_by` int,
	`resolved_at` datetime,
	`resolution_notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `inventory_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`item_id` int NOT NULL,
	`warehouse_id` int,
	`forecast_date` date NOT NULL,
	`forecast_type` enum('demand','supply','stock_level') NOT NULL,
	`forecast_quantity` decimal(15,4) NOT NULL,
	`actual_quantity` decimal(15,4),
	`variance` decimal(15,4),
	`confidence_level` decimal(5,2),
	`methodology` varchar(100),
	`factors` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_lots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`item_id` int NOT NULL,
	`warehouse_id` int NOT NULL,
	`lot_number` varchar(100) NOT NULL,
	`serial_number` varchar(100),
	`batch_number` varchar(100),
	`quantity` decimal(15,4) NOT NULL,
	`reserved_quantity` decimal(15,4) DEFAULT '0',
	`available_quantity` decimal(15,4) NOT NULL,
	`unit_cost` decimal(15,4),
	`manufacturing_date` date,
	`expiry_date` date,
	`received_date` date,
	`supplier_id` int,
	`purchase_order_id` int,
	`status` enum('available','reserved','quarantine','expired','damaged') DEFAULT 'available',
	`location` varchar(100),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_lots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`item_id` int NOT NULL,
	`warehouse_id` int NOT NULL,
	`lot_id` int,
	`reserved_quantity` decimal(15,4) NOT NULL,
	`reservation_type` enum('sales_order','work_order','transfer','production','other') NOT NULL,
	`reference_type` varchar(50),
	`reference_id` int,
	`reserved_by` int,
	`reserved_at` timestamp DEFAULT (now()),
	`expires_at` datetime,
	`status` enum('active','fulfilled','cancelled','expired') DEFAULT 'active',
	`fulfilled_at` datetime,
	`notes` text,
	CONSTRAINT `inventory_reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_name` varchar(255) NOT NULL,
	`template_type` enum('standard','recurring','credit_note','debit_note','proforma') DEFAULT 'standard',
	`description` text,
	`header_html` text,
	`body_html` text,
	`footer_html` text,
	`css_styles` text,
	`logo_url` varchar(500),
	`company_info` json,
	`terms_and_conditions` text,
	`notes` text,
	`is_default` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoice_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`team_id` int,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`accuracy` decimal(10,2),
	`altitude` decimal(10,2),
	`speed` decimal(10,2),
	`heading` decimal(5,2),
	`battery_level` int,
	`is_online` boolean DEFAULT true,
	`activity_type` enum('stationary','walking','driving','unknown'),
	`recorded_at` timestamp DEFAULT (now()),
	CONSTRAINT `location_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_gateways` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gateway_name` varchar(100) NOT NULL,
	`gateway_type` enum('bank_transfer','credit_card','mobile_wallet','cash','check','online') NOT NULL,
	`provider_name` varchar(100),
	`api_key` varchar(500),
	`api_secret` varchar(500),
	`merchant_id` varchar(100),
	`webhook_url` varchar(500),
	`configuration` json,
	`supported_currencies` json,
	`transaction_fee_percent` decimal(5,2) DEFAULT '0',
	`transaction_fee_fixed` decimal(10,2) DEFAULT '0',
	`min_amount` decimal(15,2),
	`max_amount` decimal(15,2),
	`is_active` boolean DEFAULT true,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_gateways_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_plan_installments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_id` int NOT NULL,
	`installment_number` int NOT NULL,
	`due_date` date NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`principal_amount` decimal(15,2) NOT NULL,
	`interest_amount` decimal(15,2) DEFAULT '0',
	`late_fee` decimal(15,2) DEFAULT '0',
	`paid_amount` decimal(15,2) DEFAULT '0',
	`paid_date` date,
	`status` enum('pending','paid','partial','overdue','waived') DEFAULT 'pending',
	`payment_id` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_plan_installments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`plan_name` varchar(255) NOT NULL,
	`total_amount` decimal(15,2) NOT NULL,
	`paid_amount` decimal(15,2) DEFAULT '0',
	`remaining_amount` decimal(15,2) NOT NULL,
	`number_of_installments` int NOT NULL,
	`installment_amount` decimal(15,2) NOT NULL,
	`frequency` enum('weekly','biweekly','monthly','quarterly') DEFAULT 'monthly',
	`start_date` date NOT NULL,
	`end_date` date,
	`next_payment_date` date,
	`interest_rate` decimal(5,2) DEFAULT '0',
	`late_fee_percent` decimal(5,2) DEFAULT '0',
	`status` enum('draft','active','completed','defaulted','cancelled') DEFAULT 'draft',
	`approved_by` int,
	`approved_at` datetime,
	`notes` text,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `penalties_and_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`debt_record_id` int,
	`invoice_id` int,
	`penalty_type` enum('late_fee','interest','reconnection_fee','legal_fee','other') NOT NULL,
	`calculation_type` enum('fixed','percentage','daily_rate') NOT NULL,
	`rate` decimal(10,4),
	`base_amount` decimal(15,2) NOT NULL,
	`calculated_amount` decimal(15,2) NOT NULL,
	`days_overdue` int,
	`applied_date` date NOT NULL,
	`status` enum('pending','applied','waived','paid') DEFAULT 'pending',
	`waived_by` int,
	`waived_at` datetime,
	`waiver_reason` text,
	`notes` text,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `penalties_and_interests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_execution_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_id` int NOT NULL,
	`executed_by` int,
	`execution_type` enum('manual','scheduled','api') NOT NULL,
	`parameters` json,
	`start_time` datetime NOT NULL,
	`end_time` datetime,
	`duration` int,
	`row_count` int,
	`status` enum('running','completed','failed','cancelled') DEFAULT 'running',
	`error_message` text,
	`output_format` enum('json','csv','excel','pdf'),
	`output_path` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `report_execution_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wallet_id` int NOT NULL,
	`transaction_type` enum('deposit','withdrawal','payment','refund','transfer','adjustment') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`balance_before` decimal(15,2) NOT NULL,
	`balance_after` decimal(15,2) NOT NULL,
	`reference_type` varchar(50),
	`reference_id` int,
	`description` text,
	`status` enum('pending','completed','failed','cancelled') DEFAULT 'pending',
	`processed_at` datetime,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflow_name` varchar(255) NOT NULL,
	`workflow_type` enum('approval','review','process','notification') NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`description` text,
	`steps` json,
	`conditions` json,
	`escalation_rules` json,
	`notification_config` json,
	`sla_hours` int,
	`is_active` boolean DEFAULT true,
	`version` int DEFAULT 1,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflow_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` int NOT NULL,
	`signer_id` int NOT NULL,
	`signer_role` varchar(50) NOT NULL,
	`signature_type` varchar(50) NOT NULL,
	`signature_data` text,
	`signed_at` datetime NOT NULL,
	`ip_address` varchar(50),
	`device_info` varchar(255),
	`comments` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `approval_signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_depreciation_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_id` int NOT NULL,
	`depreciation_method` varchar(50) NOT NULL,
	`period_start` datetime NOT NULL,
	`period_end` datetime NOT NULL,
	`opening_value` decimal(15,2) NOT NULL,
	`depreciation_amount` decimal(15,2) NOT NULL,
	`accumulated_depreciation` decimal(15,2) NOT NULL,
	`closing_value` decimal(15,2) NOT NULL,
	`journal_entry_id` int,
	`status` varchar(50) DEFAULT 'calculated',
	`created_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `asset_depreciation_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_inventory_count_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`count_id` int NOT NULL,
	`asset_id` int NOT NULL,
	`expected_location` varchar(255),
	`actual_location` varchar(255),
	`expected_condition` varchar(50),
	`actual_condition` varchar(50),
	`is_found` boolean DEFAULT true,
	`has_discrepancy` boolean DEFAULT false,
	`discrepancy_type` varchar(50),
	`notes` text,
	`counted_by` int,
	`counted_at` datetime,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `asset_inventory_count_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_inventory_counts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`count_number` varchar(50) NOT NULL,
	`count_date` datetime NOT NULL,
	`location_id` int,
	`category_id` int,
	`status` varchar(50) DEFAULT 'in_progress',
	`total_assets` int DEFAULT 0,
	`counted_assets` int DEFAULT 0,
	`matched_assets` int DEFAULT 0,
	`discrepancies` int DEFAULT 0,
	`notes` text,
	`conducted_by` int,
	`approved_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `asset_inventory_counts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_maintenance_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_number` varchar(50) NOT NULL,
	`asset_id` int,
	`equipment_id` int,
	`requester_id` int NOT NULL,
	`problem_description` text NOT NULL,
	`urgency_level` varchar(20) NOT NULL,
	`location` varchar(255),
	`contact_phone` varchar(20),
	`photos` json,
	`status` varchar(50) DEFAULT 'submitted',
	`assigned_technician_id` int,
	`assigned_at` datetime,
	`estimated_arrival` datetime,
	`arrived_at` datetime,
	`completed_at` datetime,
	`resolution` text,
	`labor_cost` decimal(15,2),
	`parts_cost` decimal(15,2),
	`total_cost` decimal(15,2),
	`customer_satisfaction` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `emergency_maintenance_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment_maintenance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipment_id` int NOT NULL,
	`maintenance_type` varchar(50) NOT NULL,
	`scheduled_date` datetime,
	`completed_date` datetime,
	`description` text,
	`cost` decimal(15,2),
	`performed_by` varchar(255),
	`status` varchar(50) DEFAULT 'scheduled',
	`next_maintenance_date` datetime,
	`notes` text,
	`created_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `equipment_maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipment_id` int NOT NULL,
	`assigned_to_worker_id` int,
	`assigned_to_team_id` int,
	`assignment_date` datetime NOT NULL,
	`return_date` datetime,
	`current_location` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`condition` varchar(50) DEFAULT 'good',
	`status` varchar(50) DEFAULT 'assigned',
	`notes` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `equipment_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_number` varchar(50) NOT NULL,
	`inspection_type` varchar(50) NOT NULL,
	`related_task_id` int,
	`related_work_order_id` int,
	`inspector_id` int NOT NULL,
	`inspection_date` datetime NOT NULL,
	`location` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`status` varchar(50) DEFAULT 'pending',
	`result` varchar(50),
	`score` decimal(5,2),
	`findings` text,
	`recommendations` text,
	`photos` json,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `field_inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_operation_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_name` varchar(255) NOT NULL,
	`plan_type` varchar(50) NOT NULL,
	`description` text,
	`start_date` datetime NOT NULL,
	`end_date` datetime NOT NULL,
	`status` varchar(50) DEFAULT 'draft',
	`priority` varchar(20) DEFAULT 'medium',
	`assigned_team_id` int,
	`target_area` varchar(255),
	`estimated_cost` decimal(15,2),
	`actual_cost` decimal(15,2),
	`completion_rate` decimal(5,2) DEFAULT '0',
	`created_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.148',
	`updated_at` datetime DEFAULT '2025-12-21 08:30:09.148',
	CONSTRAINT `field_operation_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `field_operation_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_id` int NOT NULL,
	`task_name` varchar(255) NOT NULL,
	`task_type` varchar(50) NOT NULL,
	`scheduled_date` datetime NOT NULL,
	`scheduled_time` varchar(10),
	`duration` int,
	`assigned_worker_id` int,
	`location` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`status` varchar(50) DEFAULT 'scheduled',
	`notes` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.148',
	CONSTRAINT `field_operation_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_id` int NOT NULL,
	`checklist_item_id` int,
	`item_name` varchar(255) NOT NULL,
	`expected_value` varchar(255),
	`actual_value` varchar(255),
	`is_passed` boolean,
	`score` decimal(5,2),
	`notes` text,
	`photos` json,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `inspection_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rule_name` varchar(255) NOT NULL,
	`source_module` varchar(50) NOT NULL,
	`target_module` varchar(50) NOT NULL,
	`trigger_event` varchar(50) NOT NULL,
	`conditions` json,
	`actions` json,
	`is_active` boolean DEFAULT true,
	`priority` int DEFAULT 0,
	`description` text,
	`created_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `integration_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_parts_used` (
	`id` int AUTO_INCREMENT NOT NULL,
	`maintenance_record_id` int,
	`emergency_request_id` int,
	`part_id` int NOT NULL,
	`part_name` varchar(255) NOT NULL,
	`quantity` decimal(15,3) NOT NULL,
	`unit_cost` decimal(15,2),
	`total_cost` decimal(15,2),
	`warehouse_id` int,
	`notes` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `maintenance_parts_used_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_distribution_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distribution_id` int NOT NULL,
	`item_id` int NOT NULL,
	`quantity` decimal(15,3) NOT NULL,
	`unit_cost` decimal(15,2),
	`total_cost` decimal(15,2),
	`returned_quantity` decimal(15,3) DEFAULT '0',
	`used_quantity` decimal(15,3) DEFAULT '0',
	`status` varchar(50) DEFAULT 'distributed',
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `material_distribution_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `material_distributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distribution_number` varchar(50) NOT NULL,
	`from_warehouse_id` int NOT NULL,
	`to_worker_id` int,
	`to_team_id` int,
	`distribution_date` datetime NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`total_items` int DEFAULT 0,
	`total_value` decimal(15,2),
	`notes` text,
	`approved_by` int,
	`created_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `material_distributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_integration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_module` varchar(50) NOT NULL,
	`target_module` varchar(50) NOT NULL,
	`operation_type` varchar(50) NOT NULL,
	`source_entity_type` varchar(50),
	`source_entity_id` int,
	`target_entity_type` varchar(50),
	`target_entity_id` int,
	`status` varchar(50) DEFAULT 'success',
	`error_message` text,
	`request_data` json,
	`response_data` json,
	`execution_time` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `module_integration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preventive_maintenance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_id` int NOT NULL,
	`maintenance_number` varchar(50) NOT NULL,
	`scheduled_date` datetime NOT NULL,
	`started_at` datetime,
	`completed_at` datetime,
	`technician_id` int,
	`status` varchar(50) DEFAULT 'scheduled',
	`actual_duration` int,
	`labor_cost` decimal(15,2),
	`parts_cost` decimal(15,2),
	`total_cost` decimal(15,2),
	`findings` text,
	`actions_performed` text,
	`parts_used` json,
	`next_maintenance_date` datetime,
	`notes` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `preventive_maintenance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preventive_maintenance_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_name` varchar(255) NOT NULL,
	`asset_id` int,
	`equipment_id` int,
	`maintenance_type` varchar(50) NOT NULL,
	`frequency` varchar(50) NOT NULL,
	`interval_days` int,
	`last_maintenance_date` datetime,
	`next_maintenance_date` datetime,
	`estimated_duration` int,
	`estimated_cost` decimal(15,2),
	`assigned_technician_id` int,
	`checklist_id` int,
	`is_active` boolean DEFAULT true,
	`priority` varchar(20) DEFAULT 'medium',
	`notes` text,
	`created_by` int,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `preventive_maintenance_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technician_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technician_id` int NOT NULL,
	`assignment_type` varchar(50) NOT NULL,
	`related_request_id` int,
	`related_schedule_id` int,
	`assigned_at` datetime NOT NULL,
	`accepted_at` datetime,
	`started_at` datetime,
	`completed_at` datetime,
	`status` varchar(50) DEFAULT 'assigned',
	`travel_time` int,
	`work_time` int,
	`notes` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `technician_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technician_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`technician_code` varchar(50) NOT NULL,
	`specializations` json,
	`certifications` json,
	`experience_years` int,
	`hourly_rate` decimal(15,2),
	`availability` varchar(50) DEFAULT 'available',
	`current_location` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`rating` decimal(3,2),
	`total_jobs` int DEFAULT 0,
	`completed_jobs` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `technician_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technician_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technician_id` int NOT NULL,
	`related_request_id` int,
	`related_record_id` int,
	`rater_id` int,
	`quality_rating` int,
	`timeliness_rating` int,
	`professionalism_rating` int,
	`overall_rating` int,
	`comments` text,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.150',
	CONSTRAINT `technician_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worker_incentives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`incentive_type` varchar(50) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`reason` varchar(255) NOT NULL,
	`related_task_id` int,
	`evaluation_id` int,
	`status` varchar(50) DEFAULT 'pending',
	`approved_by` int,
	`approved_at` datetime,
	`paid_at` datetime,
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `worker_incentives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worker_location_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`accuracy` decimal(10,2),
	`speed` decimal(10,2),
	`heading` decimal(5,2),
	`altitude` decimal(10,2),
	`battery_level` int,
	`is_online` boolean DEFAULT true,
	`last_seen` datetime DEFAULT '2025-12-21 08:30:09.149',
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `worker_location_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `worker_performance_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`worker_id` int NOT NULL,
	`evaluation_period` varchar(50) NOT NULL,
	`evaluation_date` datetime NOT NULL,
	`evaluator_id` int,
	`tasks_completed` int DEFAULT 0,
	`tasks_on_time` int DEFAULT 0,
	`quality_score` decimal(5,2),
	`attendance_score` decimal(5,2),
	`customer_satisfaction_score` decimal(5,2),
	`overall_score` decimal(5,2),
	`strengths` text,
	`areas_for_improvement` text,
	`comments` text,
	`status` varchar(50) DEFAULT 'draft',
	`created_at` datetime DEFAULT '2025-12-21 08:30:09.149',
	CONSTRAINT `worker_performance_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`metric_name` varchar(100),
	`condition` varchar(50) NOT NULL,
	`threshold` decimal(15,4) NOT NULL,
	`duration` int DEFAULT 0,
	`severity` varchar(50) DEFAULT 'medium',
	`notification_channels` json,
	`is_active` boolean DEFAULT true,
	`last_triggered_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `change_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`update_id` int,
	`change_type` varchar(50) NOT NULL,
	`module` varchar(100),
	`description` text NOT NULL,
	`issue_reference` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `change_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_migration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_id` int NOT NULL,
	`record_id` varchar(100),
	`source_data` json,
	`target_data` json,
	`status` varchar(50) NOT NULL,
	`error_message` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_migration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_migration_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`source_system` varchar(100),
	`target_table` varchar(100),
	`status` varchar(50) DEFAULT 'pending',
	`priority` int DEFAULT 1,
	`total_records` int,
	`processed_records` int DEFAULT 0,
	`failed_records` int DEFAULT 0,
	`started_at` timestamp,
	`completed_at` timestamp,
	`error_log` text,
	`mapping_config` json,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_migration_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_validation_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`migration_task_id` int NOT NULL,
	`rule_id` int NOT NULL,
	`record_id` varchar(100),
	`is_valid` boolean NOT NULL,
	`error_details` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_validation_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_validation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`table_name` varchar(100) NOT NULL,
	`field_name` varchar(100) NOT NULL,
	`rule_type` varchar(50) NOT NULL,
	`rule_config` json,
	`error_message` varchar(255),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `data_validation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployment_environments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`url` varchar(255),
	`server_ip` varchar(50),
	`database_host` varchar(255),
	`database_name` varchar(100),
	`status` varchar(50) DEFAULT 'inactive',
	`last_deployed_at` timestamp,
	`last_deployed_by` int,
	`configuration` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deployment_environments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployment_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deployment_id` int NOT NULL,
	`step` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`message` text,
	`duration` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `deployment_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`environment_id` int NOT NULL,
	`version` varchar(50) NOT NULL,
	`commit_hash` varchar(100),
	`branch` varchar(100),
	`status` varchar(50) DEFAULT 'pending',
	`deployed_by` int NOT NULL,
	`started_at` timestamp,
	`completed_at` timestamp,
	`rollback_version` varchar(50),
	`notes` text,
	`logs` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `deployments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(100),
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`view_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_check_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`check_id` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`response_time` int,
	`status_code` int,
	`error_message` text,
	`details` json,
	`checked_at` timestamp DEFAULT (now()),
	CONSTRAINT `health_check_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `improvement_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`priority` varchar(50) DEFAULT 'medium',
	`status` varchar(50) DEFAULT 'submitted',
	`submitted_by` int,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`implemented_at` timestamp,
	`feedback` text,
	`votes` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `improvement_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text,
	`category` varchar(100),
	`tags` json,
	`status` varchar(50) DEFAULT 'draft',
	`view_count` int DEFAULT 0,
	`helpful_count` int DEFAULT 0,
	`not_helpful_count` int DEFAULT 0,
	`author_id` int,
	`published_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_base_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_base_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `launch_checklist_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklist_id` int NOT NULL,
	`deployment_id` int NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`completed_by` int,
	`completed_at` timestamp,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `launch_checklist_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `launch_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`category` varchar(100),
	`description` text,
	`is_required` boolean DEFAULT true,
	`order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `launch_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_windows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`status` varchar(50) DEFAULT 'scheduled',
	`scheduled_start` timestamp NOT NULL,
	`scheduled_end` timestamp NOT NULL,
	`actual_start` timestamp,
	`actual_end` timestamp,
	`affected_services` json,
	`notification_sent` boolean DEFAULT false,
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_windows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_type` varchar(50) NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`metrics` json,
	`summary` text,
	`recommendations` text,
	`generated_at` timestamp DEFAULT (now()),
	`generated_by` int,
	CONSTRAINT `performance_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_ticket_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`user_id` int NOT NULL,
	`comment` text NOT NULL,
	`is_internal` boolean DEFAULT false,
	`attachments` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `support_ticket_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_number` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`priority` varchar(50) DEFAULT 'medium',
	`status` varchar(50) DEFAULT 'open',
	`reported_by` int,
	`assigned_to` int,
	`affected_module` varchar(100),
	`affected_version` varchar(50),
	`resolution` text,
	`resolved_at` timestamp,
	`closed_at` timestamp,
	`sla_deadline` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_tickets_ticket_number_unique` UNIQUE(`ticket_number`)
);
--> statement-breakpoint
CREATE TABLE `system_health_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`service_name` varchar(100) NOT NULL,
	`check_type` varchar(50) NOT NULL,
	`endpoint` varchar(255),
	`expected_status` varchar(50),
	`timeout` int DEFAULT 30,
	`interval` int DEFAULT 60,
	`is_active` boolean DEFAULT true,
	`last_check_at` timestamp,
	`last_status` varchar(50),
	`last_response_time` int,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `system_health_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(50) NOT NULL,
	`release_type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`changelog` text,
	`breaking_changes` text,
	`status` varchar(50) DEFAULT 'draft',
	`release_date` date,
	`download_url` varchar(500),
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_satisfaction_surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`overall_rating` int,
	`ease_of_use` int,
	`performance` int,
	`features` int,
	`support` int,
	`comments` text,
	`would_recommend` boolean,
	`submitted_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_satisfaction_surveys_id` PRIMARY KEY(`id`)
);
