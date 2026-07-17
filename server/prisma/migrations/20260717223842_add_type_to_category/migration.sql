/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,type]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_userId_fkey`;

-- DropIndex
DROP INDEX `Category_userId_name_key` ON `Category`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `type` ENUM('INCOME', 'EXPENSE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Category_userId_name_type_key` ON `Category`(`userId`, `name`, `type`);

