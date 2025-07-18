/*
  Warnings:

  - You are about to alter the column `currency` on the `itinerary_generations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(3)`.
  - You are about to alter the column `ip_address` on the `itinerary_generations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(45)`.
  - You are about to alter the column `ip_address` on the `page_views` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(45)`.
  - You are about to alter the column `download_type` on the `trip_downloads` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `ip_address` on the `trip_downloads` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(45)`.
  - You are about to alter the column `share_id` on the `trip_shares` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `ip_address` on the `trip_shares` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(45)`.
  - You are about to alter the column `currency` on the `trips` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(3)`.
  - You are about to alter the column `share_id` on the `trips` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `admins` MODIFY `name` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `itinerary_generations` MODIFY `destination` VARCHAR(255) NOT NULL,
    MODIFY `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    MODIFY `ip_address` VARCHAR(45) NULL;

-- AlterTable
ALTER TABLE `page_views` MODIFY `path` VARCHAR(255) NOT NULL,
    MODIFY `referrer` VARCHAR(255) NULL,
    MODIFY `ip_address` VARCHAR(45) NULL;

-- AlterTable
ALTER TABLE `trip_downloads` MODIFY `download_type` VARCHAR(10) NOT NULL,
    MODIFY `ip_address` VARCHAR(45) NULL;

-- AlterTable
ALTER TABLE `trip_shares` MODIFY `share_id` VARCHAR(100) NOT NULL,
    MODIFY `ip_address` VARCHAR(45) NULL;

-- AlterTable
ALTER TABLE `trips` MODIFY `destination` VARCHAR(255) NOT NULL,
    MODIFY `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    MODIFY `owner_name` VARCHAR(255) NULL,
    MODIFY `share_id` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `image` VARCHAR(255) NULL,
    MODIFY `name` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `provider_account_id` VARCHAR(100) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(50) NULL,
    `scope` VARCHAR(100) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(100) NULL,

    INDEX `accounts_user_id_idx`(`user_id`),
    UNIQUE INDEX `accounts_provider_provider_account_id_key`(`provider`, `provider_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `session_token` VARCHAR(100) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessions_session_token_key`(`session_token`),
    INDEX `sessions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_tokens` (
    `identifier` VARCHAR(100) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verification_tokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
