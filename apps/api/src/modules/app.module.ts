import { Module } from "@nestjs/common";
import { AuthController } from "../auth/auth.controller.js";
import { AuthService } from "../auth/auth.service.js";
import { BoardsController } from "../boards/boards.controller.js";
import { BoardsService } from "../boards/boards.service.js";
import { HealthController } from "../health.controller.js";
import { PrismaService } from "../prisma.service.js";
import { WorkspacesController } from "../workspaces/workspaces.controller.js";
import { WorkspacesService } from "../workspaces/workspaces.service.js";

@Module({
  imports: [],
  controllers: [HealthController, AuthController, WorkspacesController, BoardsController],
  providers: [PrismaService, AuthService, WorkspacesService, BoardsService]
})
export class AppModule {}
