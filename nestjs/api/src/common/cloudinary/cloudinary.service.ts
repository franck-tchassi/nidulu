//nestjs/api/src/common/cloudinary/cloudinary.service.ts

// nestjs/api/src/common/cloudinary/cloudinary.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    // Validation des configurations
    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Configuration Cloudinary manquante !');
      this.logger.error('Vérifiez les variables d\'environnement :');
      this.logger.error('- CLOUDINARY_CLOUD_NAME');
      this.logger.error('- CLOUDINARY_API_KEY');
      this.logger.error('- CLOUDINARY_API_SECRET');
      throw new Error('Configuration Cloudinary manquante');
    }

    this.logger.log(`Configuration Cloudinary chargée - Cloud Name: ${cloudName}`);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true, // Utiliser HTTPS
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
    this.logger.log('Tentative d\'upload d\'image vers Cloudinary', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder,
    });

    if (!file || !file.buffer) {
      this.logger.error('Fichier invalide : buffer manquant');
      throw new Error('Fichier invalide : buffer manquant');
    }

    // Vérifier le type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.error(`Type de fichier non autorisé : ${file.mimetype}`);
      throw new Error(`Type de fichier non autorisé. Types acceptés : ${allowedMimeTypes.join(', ')}`);
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.logger.error(`Fichier trop volumineux : ${file.size} bytes (max: ${maxSize} bytes)`);
      throw new Error(`Fichier trop volumineux. Taille maximum : 10MB`);
    }

    try {
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
            // Ajouter des métadonnées pour faciliter la gestion
            context: {
              original_filename: file.originalname,
              uploaded_via: 'nestjs-api',
            },
          },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) {
              this.logger.error('Erreur Cloudinary:', error);
              reject(new Error(`Échec de l'upload Cloudinary : ${error.message}`));
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload échoué : aucune réponse de Cloudinary'));
            }
          }
        );

        // Utiliser streamifier pour convertir le buffer en stream
        const bufferStream = streamifier.createReadStream(file.buffer);
        bufferStream.pipe(uploadStream);
        
        // Gestion des erreurs du stream
        bufferStream.on('error', (error) => {
          this.logger.error('Erreur de stream:', error);
          reject(new Error(`Erreur de traitement du fichier : ${error.message}`));
        });
      });

      this.logger.log('Upload Cloudinary réussi', {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      });

      return uploadResult.secure_url;
    } catch (error) {
      this.logger.error('Exception lors de l\'upload Cloudinary:', error);
      throw new Error(`Impossible d'uploader l'image : ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    this.logger.log(`Tentative de suppression d'image Cloudinary: ${publicId}`);
    
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        this.logger.log(`Image supprimée avec succès: ${publicId}`);
      } else if (result.result === 'not found') {
        this.logger.warn(`Image non trouvée: ${publicId}`);
        // Ne pas throw une erreur si l'image n'existe pas déjà
      } else {
        this.logger.error(`Échec de suppression Cloudinary: ${result.result}`);
        throw new Error(`Échec de suppression de l'image : ${result.result}`);
      }
    } catch (error) {
      this.logger.error('Erreur lors de la suppression Cloudinary:', error);
      throw new Error(`Impossible de supprimer l'image : ${error.message}`);
    }
  }

  extractPublicId(url: string): string {
    if (!url) {
      return '';
    }

    try {
      // Plusieurs patterns possibles pour extraire le public_id
      const patterns = [
        /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/, // Avec extension optionnelle
        /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/, // Pattern alternatif
      ];

      for (const pattern of patterns) {
        const matches = url.match(pattern);
        if (matches && matches[1]) {
          // Supprimer le dossier du public_id si présent
          return matches[1].replace(/^products\//, '');
        }
      }

      this.logger.warn(`Impossible d'extraire le public_id de l'URL: ${url}`);
      return '';
    } catch (error) {
      this.logger.error('Erreur lors de l\'extraction du public_id:', error);
      return '';
    }
  }

  // Méthode utilitaire pour obtenir l'URL optimisée
  getOptimizedUrl(publicId: string, transformations: any = {}): string {
    const defaultTransformations = {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      format: 'auto',
    };

    const finalTransformations = { ...defaultTransformations, ...transformations };
    
    return cloudinary.url(publicId, {
      ...finalTransformations,
      secure: true,
    });
  }

  // Méthode pour vérifier la configuration
  async testConnection(): Promise<boolean> {
    try {
      // Simple ping pour tester la connexion
      const result = await cloudinary.api.ping();
      this.logger.log('Connexion Cloudinary testée avec succès');
      return true;
    } catch (error) {
      this.logger.error('Échec de connexion à Cloudinary:', error);
      return false;
    }
  }
}