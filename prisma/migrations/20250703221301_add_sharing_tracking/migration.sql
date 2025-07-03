/*
  Warnings:

  - A unique constraint covering the columns `[share_id]` on the table `trips` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `analytics_summary` ADD COLUMN `total_downloads` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_shares` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `trips` ADD COLUMN `owner_name` VARCHAR(191) NULL,
    ADD COLUMN `share_expiry` DATETIME(3) NULL,
    ADD COLUMN `share_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `trip_shares` (
    `id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `share_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trip_shares_trip_id_idx`(`trip_id`),
    INDEX `trip_shares_share_id_idx`(`share_id`),
    INDEX `trip_shares_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_downloads` (
    `id` VARCHAR(191) NOT NULL,
    `trip_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `download_type` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trip_downloads_trip_id_idx`(`trip_id`),
    INDEX `trip_downloads_download_type_idx`(`download_type`),
    INDEX `trip_downloads_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `trips_share_id_key` ON `trips`(`share_id`);

-- CreateIndex
CREATE INDEX `trips_share_id_idx` ON `trips`(`share_id`);
