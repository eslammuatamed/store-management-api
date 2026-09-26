import { z } from 'zod';

export const bigintIdSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => BigInt(value));
