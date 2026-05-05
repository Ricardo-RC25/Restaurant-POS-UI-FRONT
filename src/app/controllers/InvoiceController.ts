import { Invoice, Ticket, FiscalData } from '../types/invoice';

export class InvoiceController {
  private static STORAGE_KEY = 'invoices';
  private static FISCAL_DATA_KEY = 'fiscal_data_history';
  private static TICKETS_KEY = 'valid_tickets';

  // Obtener todas las facturas
  static getAllInvoices(): Invoice[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Guardar facturas
  private static saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(invoices));
  }

  // Guardar datos fiscales por RFC
  static saveFiscalDataByRFC(rfc: string, fiscalData: FiscalData): void {
    const stored = localStorage.getItem(this.FISCAL_DATA_KEY);
    const allData: Record<string, FiscalData> = stored ? JSON.parse(stored) : {};
    allData[rfc.toUpperCase()] = fiscalData;
    localStorage.setItem(this.FISCAL_DATA_KEY, JSON.stringify(allData));
  }

  // Obtener datos fiscales por RFC
  static getFiscalDataByRFC(rfc: string): FiscalData | null {
    const stored = localStorage.getItem(this.FISCAL_DATA_KEY);
    if (!stored) return null;
    const allData: Record<string, FiscalData> = JSON.parse(stored);
    return allData[rfc.toUpperCase()] || null;
  }

  // Inicializar tickets válidos
  static initializeValidTickets(): void {
    const existing = localStorage.getItem(this.TICKETS_KEY);
    if (!existing) {
      const validTickets: Ticket[] = [
        {
          ticketNumber: 'TQ-001',
          date: '2026-03-14',
          total: 580.00,
          items: [
            { description: 'Tacos al Pastor (5 piezas)', quantity: 1, unitPrice: 125.00, total: 125.00 },
            { description: 'Tacos de Bistec (5 piezas)', quantity: 1, unitPrice: 150.00, total: 150.00 },
            { description: 'Quesadilla de Queso', quantity: 2, unitPrice: 60.00, total: 120.00 },
            { description: 'Agua de Horchata 1L', quantity: 1, unitPrice: 45.00, total: 45.00 },
            { description: 'Agua de Jamaica 1L', quantity: 1, unitPrice: 45.00, total: 45.00 }
          ]
        },
        {
          ticketNumber: 'TQ-002',
          date: '2026-03-15',
          total: 348.00,
          items: [
            { description: 'Tacos de Carnitas (5 piezas)', quantity: 1, unitPrice: 130.00, total: 130.00 },
            { description: 'Orden de Frijoles Charros', quantity: 1, unitPrice: 50.00, total: 50.00 },
            { description: 'Coca-Cola 600ml', quantity: 2, unitPrice: 30.00, total: 60.00 },
            { description: 'Orden de Guacamole', quantity: 1, unitPrice: 55.00, total: 55.00 }
          ]
        },
        {
          ticketNumber: 'TQ-003',
          date: '2026-03-13',
          total: 775.00,
          items: [
            { description: 'Parrillada Familiar', quantity: 1, unitPrice: 450.00, total: 450.00 },
            { description: 'Tacos al Pastor (5 piezas)', quantity: 1, unitPrice: 125.00, total: 125.00 },
            { description: 'Agua de Limón 1L', quantity: 2, unitPrice: 45.00, total: 90.00 },
            { description: 'Orden de Nopales', quantity: 1, unitPrice: 40.00, total: 40.00 },
            { description: 'Orden de Cebollas Asadas', quantity: 1, unitPrice: 35.00, total: 35.00 }
          ]
        }
      ];
      localStorage.setItem(this.TICKETS_KEY, JSON.stringify(validTickets));
    }
  }

  // Buscar ticket
  static findTicket(ticketNumber: string): Ticket | null {
    const stored = localStorage.getItem(this.TICKETS_KEY);
    if (!stored) return null;
    const tickets: Ticket[] = JSON.parse(stored);
    return tickets.find(t => t.ticketNumber.toUpperCase() === ticketNumber.toUpperCase()) || null;
  }

  // Verificar si un ticket ya fue facturado
  static isTicketInvoiced(ticketNumber: string): boolean {
    const invoices = this.getAllInvoices();
    return invoices.some(
      inv => inv.ticket.ticketNumber === ticketNumber && inv.status === 'active'
    );
  }

  // Validar ticket
  static validateTicket(ticketNumber: string, date: string, total: number): { 
    valid: boolean; 
    error?: string; 
    ticket?: Ticket 
  } {
    // Verificar si ya fue facturado
    if (this.isTicketInvoiced(ticketNumber)) {
      return { 
        valid: false, 
        error: 'Este ticket ya ha sido facturado. No se puede facturar el mismo ticket dos veces.' 
      };
    }

    // Buscar ticket
    const foundTicket = this.findTicket(ticketNumber);
    
    if (!foundTicket) {
      return { 
        valid: false, 
        error: 'Ticket no encontrado en el sistema. Verifica el número de ticket.' 
      };
    }

    // Validar fecha
    if (foundTicket.date !== date) {
      return { 
        valid: false, 
        error: `La fecha del ticket no coincide. Fecha esperada: ${foundTicket.date}` 
      };
    }

    // Validar monto
    if (Math.abs(foundTicket.total - total) > 0.01) {
      return { 
        valid: false, 
        error: `El monto no coincide. Monto esperado: $${foundTicket.total.toFixed(2)}` 
      };
    }

    return { valid: true, ticket: foundTicket };
  }

  // Generar factura
  static createInvoice(ticket: Ticket, fiscalData: FiscalData): Invoice {
    const subtotal = ticket.total / 1.16;
    const iva = ticket.total - subtotal;
    
    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      folio: `F-${Math.floor(100000 + Math.random() * 900000)}`,
      uuid: this.generateUUID(),
      ticket,
      fiscalData,
      issueDate: new Date().toISOString(),
      status: 'active',
      subtotal: parseFloat(subtotal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: ticket.total,
      xmlUrl: `#xml-${Date.now()}`,
      pdfUrl: `#pdf-${Date.now()}`
    };

    // Guardar datos fiscales
    this.saveFiscalDataByRFC(fiscalData.rfc, fiscalData);

    // Guardar factura
    const invoices = this.getAllInvoices();
    invoices.push(invoice);
    this.saveInvoices(invoices);

    return invoice;
  }

  // Cancelar factura
  static cancelInvoice(id: string, reason: string): { success: boolean; error?: string } {
    const invoices = this.getAllInvoices();
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);

    if (invoiceIndex === -1) {
      return { success: false, error: 'Factura no encontrada' };
    }

    const invoice = invoices[invoiceIndex];

    if (invoice.status === 'cancelled') {
      return { success: false, error: 'Esta factura ya está cancelada' };
    }

    invoices[invoiceIndex] = {
      ...invoice,
      status: 'cancelled',
      cancellationDate: new Date().toISOString(),
      cancellationReason: reason
    };

    this.saveInvoices(invoices);
    return { success: true };
  }

  // Buscar facturas
  static searchInvoices(query: string): Invoice[] {
    const invoices = this.getAllInvoices();
    const lowerQuery = query.toLowerCase();

    return invoices.filter(inv => 
      inv.folio.toLowerCase().includes(lowerQuery) ||
      inv.uuid.toLowerCase().includes(lowerQuery) ||
      inv.fiscalData.rfc.toLowerCase().includes(lowerQuery) ||
      inv.fiscalData.businessName.toLowerCase().includes(lowerQuery) ||
      inv.ticket.ticketNumber.toLowerCase().includes(lowerQuery)
    );
  }

  // Filtrar por estado
  static filterInvoicesByStatus(status?: 'active' | 'cancelled'): Invoice[] {
    const invoices = this.getAllInvoices();
    if (!status) return invoices;
    return invoices.filter(inv => inv.status === status);
  }

  // Generar UUID
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Generar XML
  static generateXML(invoice: Invoice): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  Version="4.0"
  Folio="${invoice.folio}"
  Fecha="${invoice.issueDate}"
  SubTotal="${invoice.subtotal}"
  Total="${invoice.total}">
  <cfdi:Emisor Rfc="XAXX010101000" Nombre="Restaurante Taquería POS"/>
  <cfdi:Receptor 
    Rfc="${invoice.fiscalData.rfc}" 
    Nombre="${invoice.fiscalData.businessName}"
    UsoCFDI="${invoice.fiscalData.cfdiUse}"/>
  <cfdi:Conceptos>
    ${invoice.ticket.items.map(item => `
    <cfdi:Concepto 
      Descripcion="${item.description}"
      Cantidad="${item.quantity}"
      ValorUnitario="${item.unitPrice}"
      Importe="${item.total}"/>
    `).join('')}
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${invoice.iva}">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${invoice.iva}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital UUID="${invoice.uuid}"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
  }

  // Inicializar datos de ejemplo
  static initializeMockData(): void {
    this.initializeValidTickets();
    
    const existing = this.getAllInvoices();
    if (existing.length === 0) {
      const mockInvoices: Invoice[] = [
        {
          id: 'INV-1',
          folio: 'F-100001',
          uuid: 'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d',
          ticket: {
            ticketNumber: 'TQ-001',
            date: '2026-03-10',
            total: 580.00,
            items: [
              { description: 'Tacos al Pastor (5 piezas)', quantity: 2, unitPrice: 125.00, total: 250.00 },
              { description: 'Agua de Horchata 1L', quantity: 2, unitPrice: 45.00, total: 90.00 }
            ]
          },
          fiscalData: {
            rfc: 'XAXX010101000',
            businessName: 'Empresa Ejemplo SA de CV',
            fiscalRegime: '601',
            cfdiUse: 'G03',
            zipCode: '06600',
            email: 'ejemplo@empresa.com'
          },
          issueDate: '2026-03-10T10:30:00Z',
          status: 'active',
          subtotal: 500.00,
          iva: 80.00,
          total: 580.00,
          xmlUrl: '#xml-1',
          pdfUrl: '#pdf-1'
        }
      ];

      this.saveInvoices(mockInvoices);
    }
  }
}
