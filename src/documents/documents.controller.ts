import { 
  Controller, 
  Post, 
  Get, 
  Query, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { GeminiService } from './gemini.service';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly geminiService: GeminiService,
  ) {}

  // 1. Rota de Upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string
  ) {
    if (!file) throw new BadRequestException('File is required');

    // Extrair texto via Gemini
    const extractedText = await this.geminiService.extractTextFromImage(
      file.buffer,
      file.mimetype
    );

    // Salvar no banco
    const document = await this.documentsService.create({
      filename: file.originalname,
      extractedText: extractedText,
      fileUrl: '', 
      userId: userId || 'user-default-id',
    });

    return {
      message: 'Upload successful',
      documentId: document.id,
      extractedText: extractedText,
    };
  }

  // 2. NOVA ROTA: Listar todos (É essa que estava dando 404)
  @Get()
  async findAll(@Query('userId') userId: string) {
    if (!userId) {
       throw new BadRequestException('UserId is required');
    }
    return this.documentsService.findAllByUserId(userId);
  }

  // 3. Rota de Chat
  @Post(':id/chat')
  async chat(
    @Param('id') id: string,
    @Body('message') message: string
  ) {
    const document = await this.documentsService.findOne(id);
    
    if (!document) throw new NotFoundException('Document not found');
    if (!document.extractedText) throw new BadRequestException('No text extracted');

    const answer = await this.geminiService.chatWithDocument(
      document.extractedText,
      message
    );

    await this.documentsService.saveInteraction(id, message, answer);

    return { question: message, answer: answer };
  }

  // 4. Rota de Detalhes (Deve ficar por último para não conflitar com rotas fixas se houver)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }
}