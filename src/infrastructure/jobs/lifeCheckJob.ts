import cron from 'node-cron';
import { GestionarVidaUseCase } from '../../application/use-cases/GestionarVidaUseCase';
import { MongoChequeoVidaAdapter } from '../database/adapters/MongoChequeoVidaAdapter';
import { MongoBovedaAdapter } from '../database/adapters/MongoBovedaAdapter';
import { MongoContactoAdapter } from '../database/adapters/MongoContactoAdapter';
import { MockEmailAdapter } from '../adapters/external/MockEmailAdapter';

// Repositorios e Infraestructura
const chequeoVidaRepo = new MongoChequeoVidaAdapter();
const bovedaRepo = new MongoBovedaAdapter(); 
const contactoRepo = new MongoContactoAdapter();
const emailService = new MockEmailAdapter();

// Caso de Uso (Inyecci�n de Dependencias)
const gestionarVidaUseCase = new GestionarVidaUseCase(
    chequeoVidaRepo, 
    bovedaRepo, // Boveda Repository (Nuevo)
    contactoRepo, // Contacto Repository (Nuevo)
    emailService // Email Service (Nuevo)
);

export const initLifeCheckJob = () => {
    // Definición del Cron Job (corre cada minuto para depuración)
    const lifeCheckJob = cron.schedule('* * * * *', async () => {
        console.log('🔄 CronJob disparado: Verificando vida de usuarios...');
        try {
            await gestionarVidaUseCase.verificarUsuarios();
        } catch (error) {
            console.error('❌ Error en CronJob:', error);
        }
    }, {
        timezone: "America/Santiago" 
    });

    console.log('⏰ Job de Chequeo de Vida programado (Corre cada minuto para pruebas).');
    return lifeCheckJob;
};
