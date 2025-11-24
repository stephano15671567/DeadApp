import { FrecuenciaChequeo } from "../../domain/strategies/FrecuenciaStrategies";

// Utiliza la misma lógica de Strategy para calcular la fecha límite
// Esto asegura que la lógica de negocio no tenga que preocuparse por la implementación de fechas.
export const calcularSiguienteChequeo = (ultimaSenal: Date, frecuencia: FrecuenciaChequeo): Date => {
    const fechaLimite = new Date(ultimaSenal);
    let mesesAAgregar = 0;

    switch (frecuencia) {
        case FrecuenciaChequeo.TRES_MESES:
            mesesAAgregar = 3;
            break;
        case FrecuenciaChequeo.SEIS_MESES:
            mesesAAgregar = 6;
            break;
        case FrecuenciaChequeo.DOCE_MESES:
            mesesAAgregar = 12;
            break;
        default:
            mesesAAgregar = 3; 
    }
    
    fechaLimite.setMonth(fechaLimite.getMonth() + mesesAAgregar);
    return fechaLimite;
};
