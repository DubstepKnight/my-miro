import { Controller, Get, Inject, Param, Req } from "@nestjs/common";
import type { Request } from "express";
import { getRequestUser } from "../common/request-user.js";
import { BoardsService } from "./boards.service.js";

@Controller("boards")
export class BoardsController {
  constructor(@Inject(BoardsService) private readonly boardsService: BoardsService) {}

  @Get(":boardId")
  async getBoard(@Req() request: Request, @Param("boardId") boardId: string) {
    const user = getRequestUser(request);
    return this.boardsService.getBoard(boardId, user.id);
  }
}
