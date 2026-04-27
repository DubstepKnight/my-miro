import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class BoardsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getBoard(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId },
          take: 1
        }
      }
    });

    if (!board) {
      throw new NotFoundException("Board not found");
    }

    if (board.members.length === 0) {
      throw new ForbiddenException("No access to board");
    }

    return {
      id: board.id,
      workspaceId: board.workspaceId,
      title: board.title,
      createdById: board.createdById,
      role: board.members[0].role,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString()
    };
  }
}
