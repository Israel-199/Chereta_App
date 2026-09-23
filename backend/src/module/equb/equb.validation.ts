import { z } from "zod";

export const EqubTypeEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "HOUSE",
  "VEHICLE",
  "PHONE",
]);
export const PayoutOrderTypeEnum = z.enum(["MANUAL", "RANDOM"]);
export const EqubStateEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "IN_PROGRESS",
  "COMPLETED",
  "SUSPENDED",
]);

export const createEqubSchema = z.object({
  name: z.string().min(3, "Equb name must be at least 3 characters"),
  contributionAmount: z.number().positive("Contribution must be positive"),
  numberOfMembers: z
    .number()
    .int()
    .positive("Members must be a positive integer"),
  type: EqubTypeEnum,
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  payoutOrderType: PayoutOrderTypeEnum,
  inviteCode: z.string().optional(),
});

export const updateEqubSchema = createEqubSchema.partial();
