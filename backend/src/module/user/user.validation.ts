import { z } from "zod";

export const RegisterInput = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\u1200-\u137F\s]+$/, "First name must only contain characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\u1200-\u137F\s]+$/, "Last name must only contain characters"),
  gender: z.enum(["Male", "Female"], {
    error: "Gender must be Male or Female",
  }),
  address: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters")
    .refine((val) => isNaN(Number(val)), {
      message: "Address cannot be just a number",
    }),
});

export const UpdateProfileInput = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\u1200-\u137F\s]+$/, "First name must only contain characters")
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\u1200-\u137F\s]+$/, "Last name must only contain characters")
    .optional(),
  gender: z
    .enum(["Male", "Female"], {
      error: "Gender must be Male or Female",
    })
    .optional(),
  address: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters")
    .refine((val) => val === undefined || isNaN(Number(val)), {
      message: "Address cannot be just a number",
    })
    .optional(),
});

