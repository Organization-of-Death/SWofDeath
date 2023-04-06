import z, { ZodSchema } from "zod";

import { Role } from "@prisma/client";
export const signUpSchema: ZodSchema = z.object({
  email: z.string(),
  password: z.string().min(5, "too short password"),
  name: z.string(),
  phoneNumber: z.string(),
  role: z.enum(["USER", "ADMIN"]),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema: ZodSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const reservationSchema = z.object({
  userId  : z.number(),
  date: z.date(),
  musicURL: z.string().optional(),
  massageShopId: z.number(),
});
export type reservationInput = z.infer<typeof reservationSchema>;
