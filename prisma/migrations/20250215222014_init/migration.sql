-- CreateTable
CREATE TABLE `TradingActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenName` VARCHAR(191) NOT NULL,
    `investmentAmount` DECIMAL(20, 2) NULL,
    `profitLossAmount` DECIMAL(20, 2) NOT NULL,
    `profitLossPercentage` DECIMAL(10, 2) NULL,
    `tradingDate` DATE NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TradingActivity_tradingDate_idx`(`tradingDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalendarStatus` (
    `date` DATE NOT NULL,
    `tradingStatus` ENUM('PROFIT', 'LOSS', 'INACTIVE') NOT NULL,
    `totalProfitLoss` DECIMAL(20, 2) NOT NULL DEFAULT 0,
    `numberOfTrades` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CalendarStatus_date_idx`(`date`),
    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
