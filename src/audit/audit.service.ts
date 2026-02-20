import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument } from './schemas/audit.schema';

@Injectable()
export class AuditService {
  constructor(@InjectModel(Audit.name) private auditModel: Model<AuditDocument>) {}

  // 🔒 Enregistre un audit avec vérification et logs
  async log(auditData: Partial<Audit>): Promise<Audit> {
    if (!auditData.userId) {
      console.error('Audit non créé : userId manquant', auditData);
      throw new Error('userId est requis pour créer un audit');
    }

    // Assure que userId est string
    auditData.userId = auditData.userId.toString();

    console.log('Création audit:', auditData);

    const audit = new this.auditModel(auditData);
    const saved = await audit.save();

    console.log('Audit sauvegardé:', saved);
    return saved;
  }

  // 🔍 Récupère tous les audits d’un utilisateur
  async findByUser(userId: string): Promise<Audit[]> {
    console.log('Recherche audits pour userId =', userId);
    const audits = await this.auditModel.find({ userId }).sort({ createdAt: -1 }).exec();
    console.log('Audits trouvés =', audits.length);
    return audits;
  }
  async findAll(): Promise<Audit[]> {
  return this.auditModel.find().sort({ createdAt: -1 }).exec();
}

}
