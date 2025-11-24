// Puerto de salida para cualquier servicio de correo (SendGrid, Mailgun, Mock)
export interface EmailService {
  enviarAcceso(
    destinatario: string, 
    nombreContacto: string, 
    linkAcceso: string
  ): Promise<void>;
}
