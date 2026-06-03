CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dietitianUserId` int NOT NULL,
	`clientUserId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`note` text,
	`appointmentStatus` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foodRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`foodId` int NOT NULL,
	`foodRuleType` enum('allowed','forbidden') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `foodRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`calories` int NOT NULL,
	`portionLabel` varchar(80) NOT NULL,
	`category` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `foods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`recordedByUserId` int NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL DEFAULT 'snack',
	`eatenAt` timestamp NOT NULL,
	`description` text,
	`photoUri` text,
	`mealStatus` enum('planned','eaten','skipped') NOT NULL DEFAULT 'eaten',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`heightCm` decimal(6,2) NOT NULL,
	`weightKg` decimal(6,2) NOT NULL,
	`bodyFatPercent` decimal(5,2),
	`muscleMassKg` decimal(6,2),
	`notes` text,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `measurements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pairings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dietitianUserId` int NOT NULL,
	`clientUserId` int NOT NULL,
	`pairingStatus` enum('pending','active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pairings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileRole` enum('dietitian','client') NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`inviteCode` varchar(12),
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `profiles_inviteCode_unique` UNIQUE(`inviteCode`)
);
