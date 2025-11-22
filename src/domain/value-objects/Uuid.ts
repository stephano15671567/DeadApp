import { v4 as uuidv4 } from 'uuid';

export class Uuid {
  public readonly value: string;

  constructor(value?: string) {
    this.value = value || uuidv4();
    // Aquí podrías añadir validaciones de formato UUID si quisieras ser estricto
  }

  toString(): string {
    return this.value;
  }
}