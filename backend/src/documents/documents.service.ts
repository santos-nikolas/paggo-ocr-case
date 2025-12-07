import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaClient) {}

  // 1. Criar Documento (e usuário se não existir)
  async create(data: { 
    filename: string; 
    extractedText: string; 
    fileUrl: string;
    userId: string;
  }) {
    let user = await this.prisma.user.findFirst({ where: { id: data.userId } });
    
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: data.userId,
          email: `test-${Date.now()}@example.com`,
        }
      });
    }

    return this.prisma.document.create({
      data: {
        title: data.filename,
        extractedText: data.extractedText,
        fileUrl: data.fileUrl,
        userId: user.id,
      },
    });
  }

  // 2. Buscar um único documento (com histórico do chat)
  async findOne(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: { interactions: { orderBy: { createdAt: 'asc' } } },
    });
  }

  // 3. O MÉTODO QUE FALTAVA: Buscar todos do usuário
  async findAllByUserId(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        fileUrl: true,
        // Não trazemos extractedText aqui para a lista ficar leve
      }
    });
  }

  // 4. Salvar Interação do Chat
  async saveInteraction(documentId: string, question: string, answer: string) {
    await this.prisma.interaction.create({
      data: {
        role: 'user',
        content: question,
        documentId: documentId,
      },
    });

    return this.prisma.interaction.create({
      data: {
        role: 'assistant',
        content: answer,
        documentId: documentId,
      },
    });
  }
}