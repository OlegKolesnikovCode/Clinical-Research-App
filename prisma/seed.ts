import { PrismaClient, VisitStatus } from "@prisma/client";

const prisma = new PrismaClient();

function fixedUtc(dateString: string): Date {
  return new Date(dateString);
}

function addDaysUtc(base: Date, offsetDays: number): Date {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + offsetDays);
  return result;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Delete children first, then parents, due to FK restrictions.
  await prisma.participantVisit.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.visitTemplate.deleteMany();
  await prisma.site.deleteMany();
  await prisma.study.deleteMany();

  // 1) Study
  const study = await prisma.study.create({
    data: {
      name: "Hypertension Outcomes Study",
      protocolCode: "HTN-2026-001",
      startDateUtc: fixedUtc("2026-04-01T09:00:00.000Z"),
    },
  });

  // 2) Sites
  const sacramentoSite = await prisma.site.create({
    data: {
      studyId: study.id,
      name: "Sacramento Site",
      location: "Sacramento, CA",
    },
  });

  const bayAreaSite = await prisma.site.create({
    data: {
      studyId: study.id,
      name: "Bay Area Site",
      location: "San Francisco, CA",
    },
  });

  // 3) Visit templates
  const screeningTemplate = await prisma.visitTemplate.create({
    data: {
      studyId: study.id,
      name: "Screening",
      offsetDays: 0,
      sortOrder: 1,
    },
  });

  const baselineTemplate = await prisma.visitTemplate.create({
    data: {
      studyId: study.id,
      name: "Baseline",
      offsetDays: 7,
      sortOrder: 2,
    },
  });

  const followUpTemplate = await prisma.visitTemplate.create({
    data: {
      studyId: study.id,
      name: "Follow-up",
      offsetDays: 30,
      sortOrder: 3,
    },
  });

  // 4) Participants
  const participant1EnrolledAt = fixedUtc("2026-04-15T09:00:00.000Z");
  const participant2EnrolledAt = fixedUtc("2026-04-18T09:00:00.000Z");

  const participant1 = await prisma.participant.create({
    data: {
      studyId: study.id,
      siteId: sacramentoSite.id,
      subjectIdentifier: "ABC-001",
      fullName: "John Carter",
      dateOfBirthUtc: fixedUtc("1985-06-15T00:00:00.000Z"),
      enrolledAtUtc: participant1EnrolledAt,
    },
  });

  const participant2 = await prisma.participant.create({
    data: {
      studyId: study.id,
      siteId: bayAreaSite.id,
      subjectIdentifier: "ABC-002",
      fullName: "Maria Lopez",
      dateOfBirthUtc: fixedUtc("1990-11-03T00:00:00.000Z"),
      enrolledAtUtc: participant2EnrolledAt,
    },
  });

  // 5) Participant visits
  await prisma.participantVisit.createMany({
    data: [
      {
        participantId: participant1.id,
        visitTemplateId: screeningTemplate.id,
        templateName: screeningTemplate.name,
        offsetDaysSnapshot: screeningTemplate.offsetDays,
        scheduledAtUtc: addDaysUtc(participant1EnrolledAt, screeningTemplate.offsetDays),
        status: VisitStatus.SCHEDULED,
      },
      {
        participantId: participant1.id,
        visitTemplateId: baselineTemplate.id,
        templateName: baselineTemplate.name,
        offsetDaysSnapshot: baselineTemplate.offsetDays,
        scheduledAtUtc: addDaysUtc(participant1EnrolledAt, baselineTemplate.offsetDays),
        status: VisitStatus.SCHEDULED,
      },
      {
        participantId: participant1.id,
        visitTemplateId: followUpTemplate.id,
        templateName: followUpTemplate.name,
        offsetDaysSnapshot: followUpTemplate.offsetDays,
        scheduledAtUtc: addDaysUtc(participant1EnrolledAt, followUpTemplate.offsetDays),
        status: VisitStatus.SCHEDULED,
      },
      {
        participantId: participant2.id,
        visitTemplateId: screeningTemplate.id,
        templateName: screeningTemplate.name,
        offsetDaysSnapshot: screeningTemplate.offsetDays,
        scheduledAtUtc: addDaysUtc(participant2EnrolledAt, screeningTemplate.offsetDays),
        status: VisitStatus.COMPLETED,
      },
      {
        participantId: participant2.id,
        visitTemplateId: baselineTemplate.id,
        templateName: baselineTemplate.name,
        offsetDaysSnapshot: baselineTemplate.offsetDays,
        scheduledAtUtc: addDaysUtc(participant2EnrolledAt, baselineTemplate.offsetDays),
        status: VisitStatus.SCHEDULED,
      },
      {
        participantId: participant2.id,
        visitTemplateId: followUpTemplate.id,
        templateName: followUpTemplate.name,
        offsetDaysSnapshot: followUpTemplate.offsetDays,
        scheduledAtUtc: addDaysUtc(participant2EnrolledAt, followUpTemplate.offsetDays),
        status: VisitStatus.SCHEDULED,
      },
    ],
  });

  // Optional: set completedAtUtc for the completed visit
  const participant2ScreeningVisit = await prisma.participantVisit.findFirst({
    where: {
      participantId: participant2.id,
      templateName: "Screening",
    },
  });

  if (participant2ScreeningVisit) {
    await prisma.participantVisit.update({
      where: { id: participant2ScreeningVisit.id },
      data: {
        completedAtUtc: fixedUtc("2026-04-18T10:30:00.000Z"),
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log({
    studyId: study.id,
    sacramentoSiteId: sacramentoSite.id,
    bayAreaSiteId: bayAreaSite.id,
    participant1Id: participant1.id,
    participant2Id: participant2.id,
  });
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });