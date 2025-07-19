-- DropIndex
DROP INDEX `itinerary_generations_destination_idx` ON `itinerary_generations`;

-- DropIndex
DROP INDEX `page_views_path_idx` ON `page_views`;

-- AlterTable
ALTER TABLE `accounts` MODIFY `scope` TEXT NULL;

-- CreateIndex
CREATE INDEX `itinerary_generations_destination_idx` ON `itinerary_generations`(`destination`);

-- CreateIndex
CREATE INDEX `page_views_path_idx` ON `page_views`(`path`);

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
