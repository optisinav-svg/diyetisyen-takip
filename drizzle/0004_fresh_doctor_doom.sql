CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`achievementType` enum('consistency_7days','goal_met','water_goal','weekly_challenge') NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mealApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`approvalStatus` enum('pending','approved','warning','needs_revision') NOT NULL DEFAULT 'pending',
	`feedback` text,
	`approvedAt` timestamp,
	CONSTRAINT `mealApprovals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pairingId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`content` text NOT NULL,
	`mealId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutritionGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`dailyCalorieGoal` int,
	`dailyProteinGoal` decimal(6,2),
	`dailyCarbsGoal` decimal(6,2),
	`dailyFatGoal` decimal(6,2),
	`waterIntakeGoal` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutritionGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutritionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dietitianUserId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nutritionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dietitianUserId` int NOT NULL,
	`clientUserId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`clientUserId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `planAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waterIntake` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`amountMl` int NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waterIntake_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyChallenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`challenge` text NOT NULL,
	`completed` boolean DEFAULT false,
	`completedAt` timestamp,
	CONSTRAINT `weeklyChallenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientUserId` int NOT NULL,
	`dietitianUserId` int NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyFeedback_id` PRIMARY KEY(`id`)
);
