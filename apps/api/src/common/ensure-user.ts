import type { SessionUser } from "@my-miro/contracts";
import { PrismaService } from "../prisma.service.js";

export async function ensureUser(prisma: PrismaService, user: SessionUser) {
  return prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      displayName: user.displayName
    },
    create: {
      id: user.id,
      email: user.email,
      displayName: user.displayName
    }
  });
}
