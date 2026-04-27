import { Body, Controller, Get, Inject, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { getRequestUser } from "../common/request-user.js";
import { CreateBoardDto, CreateWorkspaceDto } from "./dto.js";
import { WorkspacesService } from "./workspaces.service.js";

@Controller("workspaces")
export class WorkspacesController {
  constructor(@Inject(WorkspacesService) private readonly workspacesService: WorkspacesService) {}

  @Get()
  async listWorkspaces(@Req() request: Request) {
    const user = getRequestUser(request);
    return this.workspacesService.listForUser(user.id);
  }

  @Post()
  async createWorkspace(@Req() request: Request, @Body() body: CreateWorkspaceDto) {
    const user = getRequestUser(request);
    return this.workspacesService.createWorkspace({ name: body.name, user });
  }

  @Get(":workspaceId/boards")
  async listBoards(@Req() request: Request, @Param("workspaceId") workspaceId: string) {
    const user = getRequestUser(request);
    return this.workspacesService.listBoards({ workspaceId, userId: user.id });
  }

  @Post(":workspaceId/boards")
  async createBoard(
    @Req() request: Request,
    @Param("workspaceId") workspaceId: string,
    @Body() body: CreateBoardDto
  ) {
    const user = getRequestUser(request);
    return this.workspacesService.createBoard({ workspaceId, title: body.title, userId: user.id });
  }
}
