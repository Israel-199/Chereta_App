import { Prisma } from "@prisma/client";

export function isMissingColumnError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2022"
  );
}
