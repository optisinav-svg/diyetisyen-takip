CREATE TABLE `mealAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealId` int NOT NULL,
	`estimatedCalories` decimal(7,1),
	`estimatedProtein` decimal(5,1),
	`estimatedCarbs` decimal(5,1),
	`estimatedFat` decimal(5,1),
	`foodItems` text,
	`confidence` decimal(3,2),
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mealAnalysis_id` PRIMARY KEY(`id`),
	CONSTRAINT `mealAnalysis_mealId_unique` UNIQUE(`mealId`)
);
--> statement-breakpoint
CREATE TABLE `pushNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`notificationType` enum('appointment_reminder','meal_reminder','health_alert','report_ready') NOT NULL,
	`relatedId` int,
	`sent` boolean NOT NULL DEFAULT false,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pushNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`weekEndDate` timestamp NOT NULL,
	`totalMeals` int NOT NULL DEFAULT 0,
	`averageDailyCalories` decimal(7,1),
	`weightChange` decimal(5,2),
	`notes` text,
	`pdfUrl` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyReports_id` PRIMARY KEY(`id`)
);
