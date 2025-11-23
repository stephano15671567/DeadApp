import cron from 'node-cron';
import { GestionarVidaUseCase } from '../../application/use-cases/GestionarVidaUseCase';
import { MongoChequeoVidaAdapter } from '../database/adapters/MongoChequeoVidaAdapter';

export const initLifeCheckJob = () => {
  const repo = new MongoChequeoVidaAdapter();
  const useCase = new GestionarVidaUseCase(repo);

  // Programar: Todos los días a las 00:00 (Midnight)
  // Formato Cron: segundo(opc) minuto hora dia mes dia-semana
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ CronJob disparado: Verificando vida de usuarios...');
    try {
      await useCase.verificarUsuarios();
    } catch (error) {
      console.error('❌ Error en CronJob:', error);
    }
  });

  console.log('📅 Job de Chequeo de Vida programado (00:00 diario).');
};