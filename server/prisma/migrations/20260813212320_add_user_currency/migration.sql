-- AlterTable
ALTER TABLE `User` ADD COLUMN `currency` ENUM('NGN', 'USD', 'GBP', 'EUR') NOT NULL DEFAULT 'NGN';

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
