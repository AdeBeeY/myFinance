-- CreateTable
CREATE TABLE `TaxSetting` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `taxRate` DECIMAL(5, 2) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TaxSetting_userId_idx`(`userId`),
    UNIQUE INDEX `TaxSetting_userId_year_key`(`userId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaxSetting` ADD CONSTRAINT `TaxSetting_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
