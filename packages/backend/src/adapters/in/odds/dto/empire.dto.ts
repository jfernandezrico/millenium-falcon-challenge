import { z } from 'zod';

const bountyHunterSchema = z.object({
  planet: z.string().min(1),
  day: z.number().int().nonnegative(),
});

export const empireDtoSchema = z.object({
  countdown: z.number().int().nonnegative(),
  bounty_hunters: z.array(bountyHunterSchema),
});

export type EmpireDto = z.infer<typeof empireDtoSchema>;
