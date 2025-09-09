export class CreateTicketDto {
  fecha: string;
  sede: string;
  categoria: string;
  usuario: string;
  asunto: string;
  agente: string;
  descripcion: string;
  hora?: string;
  prioridad?: string;
  estado?: string;
}
