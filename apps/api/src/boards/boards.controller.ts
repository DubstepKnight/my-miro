import { Body, Controller, Get, Inject, Param, Put, Req } from "@nestjs/common";
import type { BoardDocument } from "@my-miro/contracts";
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

  @Get(":boardId/state")
  async getBoardState(@Req() request: Request, @Param("boardId") boardId: string) {
    const user = getRequestUser(request);
    return this.boardsService.getBoardState(boardId, user.id);
  }

  @Put(":boardId/state")
  async saveBoardState(
    @Req() request: Request,
    @Param("boardId") boardId: string,
    @Body() body: BoardDocument
  ) {
    const user = getRequestUser(request);
    return this.boardsService.saveBoardState(boardId, user.id, body);
  }
}
