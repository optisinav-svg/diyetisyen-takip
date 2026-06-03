CREATE TABLE `appointmentReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`clientUserId` int NOT NULL,
	`reminderAt` timestamp NOT NULL,
	`sent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointmentReminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientHealthConditions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`condition` varchar(80) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientHealthConditions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foodGroupItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`foodGroupId` int NOT NULL,
	`foodId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foodGroupItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foodGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `foodGroups_id` PRIMARY KEY(`id`)
);
