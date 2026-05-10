import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { BoardDocument, BoardElement } from "@my-miro/contracts";
import { BoardRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

const defaultBoardDocument: BoardDocument = {
  schemaVersion: 1,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1
  },
  elements: {}
};

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

  async getBoardState(boardId: string, userId: string): Promise<BoardDocument> {
    await this.getBoard(boardId, userId);

    const state = await this.prisma.boardState.findUnique({
      where: { boardId }
    });

    if (!state) {
      return defaultBoardDocument;
    }

    return this.parseBoardDocument(state.data);
  }

  async saveBoardState(boardId: string, userId: string, data: BoardDocument): Promise<BoardDocument> {
    const board = await this.getBoard(boardId, userId);
    if (board.role !== BoardRole.OWNER && board.role !== BoardRole.EDITOR) {
      throw new ForbiddenException("Only board OWNER or EDITOR can update board state");
    }

    const document = this.parseBoardDocument(data);
    await this.prisma.boardState.upsert({
      where: { boardId },
      create: {
        boardId,
        data: document as unknown as Prisma.InputJsonValue
      },
      update: {
        data: document as unknown as Prisma.InputJsonValue
      }
    });

    await this.prisma.board.update({
      where: { id: boardId },
      data: { updatedAt: new Date() }
    });

    return document;
  }

  private parseBoardDocument(value: unknown): BoardDocument {
    if (!value || typeof value !== "object") {
      throw new BadRequestException("Invalid board document");
    }

    const candidate = value as Partial<BoardDocument>;
    if (candidate.schemaVersion !== 1 || !candidate.viewport || !candidate.elements) {
      throw new BadRequestException("Unsupported board document");
    }

    if (!this.isFiniteNumber(candidate.viewport.x) || !this.isFiniteNumber(candidate.viewport.y) || !this.isFiniteNumber(candidate.viewport.zoom)) {
      throw new BadRequestException("Invalid board viewport");
    }

    for (const element of Object.values(candidate.elements)) {
      this.assertBoardElement(element);
    }

    return {
      schemaVersion: 1,
      viewport: {
        x: candidate.viewport.x,
        y: candidate.viewport.y,
        zoom: candidate.viewport.zoom
      },
      elements: candidate.elements
    };
  }

  private assertBoardElement(element: BoardElement | undefined): asserts element is BoardElement {
    if (!element || (element.type !== "note" && element.type !== "path")) {
      throw new BadRequestException("Invalid board element");
    }

    if (
      !element.id ||
      !this.isFiniteNumber(element.x) ||
      !this.isFiniteNumber(element.y) ||
      !this.isFiniteNumber(element.zIndex) ||
      !element.createdById ||
      !element.createdAt ||
      !element.updatedAt
    ) {
      throw new BadRequestException("Invalid board element metadata");
    }

    if (element.type === "note") {
      if (
        !this.isFiniteNumber(element.width) ||
        !this.isFiniteNumber(element.height) ||
        typeof element.text !== "string" ||
        typeof element.color !== "string"
      ) {
        throw new BadRequestException("Invalid note element");
      }
      return;
    }

    if (
      !Array.isArray(element.points) ||
      typeof element.stroke !== "string" ||
      !this.isFiniteNumber(element.strokeWidth)
    ) {
      throw new BadRequestException("Invalid path element");
    }

    for (const point of element.points) {
      if (!this.isFiniteNumber(point.x) || !this.isFiniteNumber(point.y)) {
        throw new BadRequestException("Invalid path point");
      }
    }
  }

  private isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }
}
