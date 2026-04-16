/*
  Warnings:

  - The primary key for the `Participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `age` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Participant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studyId,subjectIdentifier]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirthUtc` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyId` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectIdentifier` to the `Participant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_pkey",
DROP COLUMN "age",
DROP COLUMN "condition",
DROP COLUMN "name",
ADD COLUMN     "dateOfBirthUtc" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "enrolledAtUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "siteId" TEXT NOT NULL,
ADD COLUMN     "studyId" TEXT NOT NULL,
ADD COLUMN     "subjectIdentifier" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Participant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Participant_id_seq";

-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "protocolCode" TEXT NOT NULL,
    "startDateUtc" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitTemplate" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offsetDays" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantVisit" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "visitTemplateId" TEXT,
    "templateName" TEXT NOT NULL,
    "offsetDaysSnapshot" INTEGER NOT NULL,
    "scheduledAtUtc" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completedAtUtc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Study_protocolCode_key" ON "Study"("protocolCode");

-- CreateIndex
CREATE INDEX "Site_studyId_idx" ON "Site"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_id_studyId_key" ON "Site"("id", "studyId");

-- CreateIndex
CREATE UNIQUE INDEX "Site_studyId_name_key" ON "Site"("studyId", "name");

-- CreateIndex
CREATE INDEX "VisitTemplate_studyId_idx" ON "VisitTemplate"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitTemplate_studyId_sortOrder_key" ON "VisitTemplate"("studyId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VisitTemplate_studyId_name_key" ON "VisitTemplate"("studyId", "name");

-- CreateIndex
CREATE INDEX "ParticipantVisit_participantId_idx" ON "ParticipantVisit"("participantId");

-- CreateIndex
CREATE INDEX "ParticipantVisit_visitTemplateId_idx" ON "ParticipantVisit"("visitTemplateId");

-- CreateIndex
CREATE INDEX "Participant_studyId_idx" ON "Participant"("studyId");

-- CreateIndex
CREATE INDEX "Participant_siteId_idx" ON "Participant"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_studyId_subjectIdentifier_key" ON "Participant"("studyId", "subjectIdentifier");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitTemplate" ADD CONSTRAINT "VisitTemplate_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_siteId_studyId_fkey" FOREIGN KEY ("siteId", "studyId") REFERENCES "Site"("id", "studyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantVisit" ADD CONSTRAINT "ParticipantVisit_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantVisit" ADD CONSTRAINT "ParticipantVisit_visitTemplateId_fkey" FOREIGN KEY ("visitTemplateId") REFERENCES "VisitTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
