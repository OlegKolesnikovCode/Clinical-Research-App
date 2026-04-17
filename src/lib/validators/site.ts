import { z } from "zod";

export const siteSchema = z.object({
  studyId: z.string().cuid(),
  name: z.string().trim().min(1),
  location: z.string().trim().min(1),
});