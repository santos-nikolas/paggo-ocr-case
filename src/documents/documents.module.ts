import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { GeminiService } from './gemini.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, GeminiService, PrismaClient],
  exports: [GeminiService],
})
export class DocumentsModule {}
