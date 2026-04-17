import { z } from "zod";

export const enrollmentSchema = z.object({
  studyId: z.string().cuid(),
  siteId: z.string().cuid(),
  subjectIdentifier: z.string().trim().min(1),
  fullName: z.string().trim().min(1),
  dateOfBirthUtc: z.coerce.date(),
  enrolledAtUtc: z.coerce.date().optional(),
});