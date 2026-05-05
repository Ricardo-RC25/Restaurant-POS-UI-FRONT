// Tipos para el sistema de facturación

export interface Ticket {
  ticketNumber: string;
  date: string;
  total: number;
  items: TicketItem[];
}

export interface TicketItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FiscalData {
  rfc: string;
  businessName: string;
  fiscalRegime: string;
  cfdiUse: string;
  zipCode: string;
  email: string;
}

export interface Invoice {
  id: string;
  folio: string;
  uuid: string;
  ticket: Ticket;
  fiscalData: FiscalData;
  issueDate: string;
  status: 'active' | 'cancelled';
  subtotal: number;
  iva: number;
  total: number;
  xmlUrl: string;
  pdfUrl: string;
  cancellationDate?: string;
  cancellationReason?: string;
}
