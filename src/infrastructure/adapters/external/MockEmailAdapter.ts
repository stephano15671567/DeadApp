import { EmailService } from '../../../domain/ports/out/EmailService';

export class MockEmailAdapter implements EmailService {
  async enviarAcceso(destinatario: string, nombreContacto: string, linkAcceso: string): Promise<void> {
    console.log('===================================================');
    console.log(`?? SIMULACIÓN DE ENVÍO DE LEGADO:`);
    console.log(`   DESTINATARIO: ${nombreContacto} <${destinatario}>`);
    console.log(`   ASUNTO: [Mi Testamento Digital] Acceso a tu Legado`);
    console.log(`   CUERPO: Estimado(a) ${nombreContacto},`);
    console.log(`           Hemos detectado la inactividad del usuario.`);
    console.log(`           Aquí tienes el link único para acceder a la bóveda: ${linkAcceso}`);
    console.log(`   (Link simulado: ${linkAcceso})`);
    console.log('===================================================');
    // En un entorno real, aquí iría la implementación de un servicio como Nodemailer o SendGrid.
  }
}
