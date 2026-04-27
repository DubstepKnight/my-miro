import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import type { WorkspaceDto } from "@my-miro/contracts";
import { BoardRole, WorkspaceRole } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class WorkspacesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<WorkspaceDto[]> {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { workspace: { updatedAt: "desc" } }
    });

    return memberships.map((row) => ({
      id: row.workspace.id,
      name: row.workspace.name,
      ownerId: row.workspace.ownerId,
      role: row.role,
      createdAt: row.workspace.createdAt.toISOString(),
      updatedAt: row.workspace.updatedAt.toISOString()
    }));
  }

  async createWorkspace(input: { name: string; user: { id: string; email: string; displayName?: string } }): Promise<WorkspaceDto> {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: input.name,
        ownerId: input.user.id,
        members: {
          create: {
            userId: input.user.id,
            role: WorkspaceRole.OWNER
          }
        }
      }
    });

    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      role: "OWNER",
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString()
    };
  }

  async listBoards(params: { workspaceId: string; userId: string }) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: params.userId
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException("No access to workspace");
    }

    const boards = await this.prisma.board.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { updatedAt: "desc" }
    });

    return boards.map((board) => ({
      id: board.id,
      workspaceId: board.workspaceId,
      title: board.title,
      createdById: board.createdById,
      role: BoardRole.EDITOR,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString()
    }));
  }

  async createBoard(params: { workspaceId: string; title: string; userId: string }) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: params.userId
        }
      }
    });

    if (!membership) {
      throw new ForbiddenException("No access to workspace");
    }

    const canCreateBoard =
      membership.role === WorkspaceRole.OWNER || membership.role === WorkspaceRole.ADMIN;
    if (!canCreateBoard) {
      throw new ForbiddenException("Only workspace OWNER or ADMIN can create boards");
    }

    const board = await this.prisma.board.create({
      data: {
        workspaceId: params.workspaceId,
        title: params.title,
        createdById: params.userId,
        members: {
          create: {
            userId: params.userId,
            role: BoardRole.OWNER
          }
        }
      }
    });

    return {
      id: board.id,
      workspaceId: board.workspaceId,
      title: board.title,
      createdById: board.createdById,
      role: "OWNER",
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString()
    };
  }
}
