import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";
import { ChatError } from "@shared/domain/errors/AppError";

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE_MB = 5;
// El UseCase de UploadImage ahora solo se encarga de la lógica de validación y delega la subida al repositorio, 
// que devuelve la URL pública de la imagen
export class UploadImageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(uri: string, userId: string): Promise<string> {
    const extMatch = uri.match(/\.(\w+)(?:\?\w+=.*)?$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new ChatError('Solo se permiten imágenes JPG, PNG o WEBP');
    }
    return this.chatRepo.uploadImage(uri, userId);
  }
}