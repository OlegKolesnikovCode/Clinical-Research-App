import { z } from "zod";

export const studySchema = z.object({
  name: z.string().trim().min(1),
  protocolCode: z.string().trim().min(1),
  startDateUtc: z.string().datetime(),
});