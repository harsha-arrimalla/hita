-- CreateTable
CREATE TABLE "SafetyZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cityName" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "safetyScore" INTEGER NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "safeHavens" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cityName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "EmotionalScript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "triggerCategory" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en'
);

-- CreateTable
CREATE TABLE "Affirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "context" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FareBenchmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cityName" TEXT NOT NULL,
    "transportType" TEXT NOT NULL,
    "baseFare" DECIMAL NOT NULL,
    "perKmRate" DECIMAL NOT NULL,
    "nightSurchargeFactor" DECIMAL NOT NULL DEFAULT 1.0,
    "currency" TEXT NOT NULL DEFAULT 'INR'
);

-- CreateTable
CREATE TABLE "ScamAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationKeyword" TEXT NOT NULL,
    "warningText" TEXT NOT NULL,
    "preventionTip" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startLocation" TEXT,
    "destination" TEXT,
    "contextFlags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "moodLog" TEXT,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
