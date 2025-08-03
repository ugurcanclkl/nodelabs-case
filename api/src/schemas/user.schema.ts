import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(6).optional(),
});
