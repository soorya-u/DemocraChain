import { z } from "zod";

export const otpSchema = z.object({
  otp: z.coerce.number().min(10000, "Insuffient OTP Characters").max(999999),
});

export type TOtp = z.infer<typeof otpSchema>;
