CREATE TABLE `exportRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exportType` enum('meals','measurements','income','performance','user-data') NOT NULL,
	`exportFormat` enum('csv','json') NOT NULL,
	`exportStatus` enum('completed','failed','pending') NOT NULL,
	`fileSize` int,
	`downloadUrl` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exportRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentReminders` boolean NOT NULL DEFAULT true,
	`mealApprovals` boolean NOT NULL DEFAULT true,
	`achievements` boolean NOT NULL DEFAULT true,
	`weeklyReports` boolean NOT NULL DEFAULT true,
	`messages` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `webhookLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookType` enum('stripe','expo') NOT NULL,
	`event` varchar(255) NOT NULL,
	`webhookStatus` enum('success','failed','pending') NOT NULL,
	`payload` text,
	`response` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookLogs_id` PRIMARY KEY(`id`)
);
