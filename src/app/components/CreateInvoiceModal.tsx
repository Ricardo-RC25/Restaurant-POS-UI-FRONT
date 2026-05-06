import { useState } from 'react';
import { 
  CheckCircle,
  X,
  AlertCircle,
  Receipt,
  FileText,
  Download,
  Mail,
  Info,
  ChevronDown,
  ChevronUp,
  Home,
  Plus,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { InvoiceController } from '../controllers/InvoiceController';
import { Invoice, FiscalData, Ticket, TicketItem } from '../types/invoice';
import { toast } from 'sonner';
import { isValidPrice, PRICE_ERROR_MESSAGE } from '../utils/priceValidation';

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
}

export function CreateInvoiceModal({ onClose, onSuccess }: CreateInvoiceModalProps) {
  const [step, setStep] = useState<'selection' | 'ticket' | 'manual' | 'fiscal' | 'success'>('selection');
  const [invoiceType, setInvoiceType] = useState<'with-ticket' | 'without-ticket' | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketDate, setTicketDate] = useState('');
  const [ticketTotal, setTicketTotal] = useState('');
  const [validatedTicket, setValidatedTicket] = useState<Ticket | null>(null);
  const [manualItems, setManualItems] = useState<TicketItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    description: '',
    quantity: '1',
    unitPrice: ''
  });
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  const [fiscalData, setFiscalData] = useState<FiscalData>({
    rfc: '',
    businessName: '',
    fiscalRegime: '601',
    cfdiUse: 'G03',
    zipCode: '',
    email: ''
  });

  // Autocompletar datos del ticket cuando se ingresa el número
  const handleTicketNumberChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setTicketNumber(upperValue);

    // Buscar el ticket en el sistema
    if (upperValue.length >= 3) {
      const foundTicket = InvoiceController.findTicket(upperValue);
      if (foundTicket) {
        // Autocompletar fecha y total
        setTicketDate(foundTicket.date);
        setTicketTotal(foundTicket.total.toString());
        toast.success('✓ Ticket encontrado. Datos autocompletados.');
      } else {
        // Limpiar campos si no se encuentra
        setTicketDate('');
        setTicketTotal('');
      }
    }
  };

  const handleValidateTicket = () => {
    const total = parseFloat(ticketTotal);

    if (!ticketNumber || !ticketDate || isNaN(total)) {
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    if (!isValidPrice(total)) {
      toast.error(PRICE_ERROR_MESSAGE);
      return;
    }

    const validation = InvoiceController.validateTicket(ticketNumber, ticketDate, total);
    
    if (!validation.valid) {
      toast.error(validation.error || 'Error al validar ticket');
      return;
    }

    setValidatedTicket(validation.ticket!);
    toast.success('Ticket validado correctamente');
    setStep('fiscal');
  };

  const handleRFCChange = (rfc: string) => {
    const upperRFC = rfc.toUpperCase();
    setFiscalData({ ...fiscalData, rfc: upperRFC });
    
    // Autocompletar datos fiscales si el RFC ya existe
    if (upperRFC.length >= 12) {
      const savedData = InvoiceController.getFiscalDataByRFC(upperRFC);
      if (savedData) {
        setFiscalData(savedData);
        toast.success('✓ RFC encontrado. Datos fiscales autocompletados.');
      }
    }
  };

  const handleGenerateInvoice = () => {
    if (!validatedTicket) return;

    if (!fiscalData.rfc || !fiscalData.businessName || !fiscalData.zipCode || !fiscalData.email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const invoice = InvoiceController.createInvoice(validatedTicket, fiscalData);
    setGeneratedInvoice(invoice);
    toast.success('¡Factura generada exitosamente!');
    setStep('success');
  };

  const handleClose = () => {
    if (generatedInvoice) {
      onSuccess(generatedInvoice);
    }
    onClose();
  };

  const handleNewInvoice = () => {
    setStep('selection');
    setInvoiceType(null);
    setTicketNumber('');
    setTicketDate('');
    setTicketTotal('');
    setValidatedTicket(null);
    setManualItems([]);
    setCurrentItem({ description: '', quantity: '1', unitPrice: '' });
    setGeneratedInvoice(null);
    setFiscalData({
      rfc: '',
      businessName: '',
      fiscalRegime: '601',
      cfdiUse: 'G03',
      zipCode: '',
      email: ''
    });
  };

  const handleSelectInvoiceType = (type: 'with-ticket' | 'without-ticket') => {
    setInvoiceType(type);
    if (type === 'with-ticket') {
      setStep('ticket');
    } else {
      setStep('manual');
    }
  };

  const handleAddManualItem = () => {
    const quantity = parseFloat(currentItem.quantity);
    const unitPrice = parseFloat(currentItem.unitPrice);

    if (!currentItem.description || isNaN(quantity) || isNaN(unitPrice)) {
      toast.error('Por favor completa todos los campos del producto');
      return;
    }

    if (!isValidPrice(unitPrice)) {
      toast.error(`Precio unitario: ${PRICE_ERROR_MESSAGE}`);
      return;
    }

    if (quantity <= 0 || unitPrice <= 0) {
      toast.error('La cantidad y el precio deben ser mayores a 0');
      return;
    }

    const newItem: TicketItem = {
      description: currentItem.description,
      quantity: quantity,
      unitPrice: unitPrice,
      total: quantity * unitPrice
    };

    setManualItems([...manualItems, newItem]);
    setCurrentItem({ description: '', quantity: '1', unitPrice: '' });
  };

  const handleRemoveManualItem = (index: number) => {
    setManualItems(manualItems.filter((_, i) => i !== index));
  };

  const getManualTotal = () => {
    return manualItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleContinueFromManual = () => {
    if (manualItems.length === 0) {
      toast.error('Debes agregar al menos un producto');
      return;
    }

    // Crear un ticket ficticio con los productos manuales
    const manualTicket: Ticket = {
      ticketNumber: `MANUAL-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      total: getManualTotal(),
      items: manualItems
    };

    setValidatedTicket(manualTicket);
    setStep('fiscal');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 modal-overlay">
      <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl border-t sm:border border-border max-h-[95vh] sm:max-h-[90vh] flex flex-col modal-content-mobile sm:modal-content">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-border bg-card rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-card-foreground">Portal del Administrador</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {step === 'selection' ? 'Selecciona el tipo de facturación' : 'Genera tu factura electrónica en 3 sencillos pasos'}
              </p>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-card-foreground p-1 touch-manipulation transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps - Solo mostrar si no está en selección */}
          {step !== 'selection' && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4">
              {/* Step 1 */}
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors ${
                  step === 'ticket' || step === 'manual'
                    ? 'bg-primary text-white'
                    : validatedTicket || generatedInvoice
                    ? 'bg-green-600 dark:bg-green-700 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {validatedTicket || generatedInvoice ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                  step === 'ticket' || step === 'manual' ? 'text-primary' : validatedTicket || generatedInvoice ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                }`}>
                  {invoiceType === 'with-ticket' ? 'Validar Ticket' : 'Agregar Productos'}
                </span>
              </div>

              {/* Divider */}
              <div className={`w-8 sm:w-16 h-0.5 transition-colors ${validatedTicket || generatedInvoice ? 'bg-green-600 dark:bg-green-700' : 'bg-muted'}`}></div>

              {/* Step 2 */}
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors ${
                  step === 'fiscal'
                    ? 'bg-primary text-white'
                    : generatedInvoice
                    ? 'bg-green-600 dark:bg-green-700 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {generatedInvoice ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                  step === 'fiscal' ? 'text-primary' : generatedInvoice ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                }`}>
                  Datos Fiscales
                </span>
              </div>

              {/* Divider */}
              <div className={`w-8 sm:w-16 h-0.5 transition-colors ${generatedInvoice ? 'bg-green-600 dark:bg-green-700' : 'bg-muted'}`}></div>

              {/* Step 3 */}
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors ${
                  step === 'success'
                    ? 'bg-green-600 dark:bg-green-700 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                  step === 'success' ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                }`}>
                  Factura Generada
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{/* Content with scroll */}
          {/* Step 0: Selección de tipo de factura */}
          {step === 'selection' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground text-center">¿Cómo deseas facturar?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opción Con Ticket */}
                <button
                  onClick={() => handleSelectInvoiceType('with-ticket')}
                  className="group p-6 border-2 border-border rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">Con Ticket</h4>
                    <p className="text-sm text-muted-foreground">
                      Factura basándose en un ticket de compra existente del sistema
                    </p>
                  </div>
                </button>

                {/* Opción Sin Ticket */}
                <button
                  onClick={() => handleSelectInvoiceType('without-ticket')}
                  className="group p-6 border-2 border-border rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                      <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">Sin Ticket</h4>
                    <p className="text-sm text-muted-foreground">
                      Crea una factura manual agregando productos individualmente
                    </p>
                  </div>
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">Selecciona el método de facturación</p>
                  <p className="text-blue-800 dark:text-blue-300">
                    Si el cliente tiene un ticket de compra, usa "Con Ticket". Si necesitas crear una factura directa, usa "Sin Ticket".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1a: Validar Ticket (flujo existente) */}
          {step === 'ticket' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground">Paso 1: Validar Ticket de Compra</h3>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">Ingresa los datos de tu ticket</p>
                  <p className="text-blue-800 dark:text-blue-300">
                    Los datos deben coincidir exactamente con tu ticket de compra. Solo puedes facturar tickets del mes en curso.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Número de Ticket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => handleTicketNumberChange(e.target.value)}
                    placeholder="Ej: TQ-001"
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">El número de ticket aparece en la parte superior de tu comprobante</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Fecha de Compra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ticketDate}
                    onChange={(e) => setTicketDate(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Total de la Compra <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={ticketTotal}
                      onChange={(e) => setTicketTotal(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ingresa el total exacto que aparece en tu ticket</p>
                </div>

                {/* Tickets de Ejemplo */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Tickets de ejemplo para pruebas:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• TQ-001 - Fecha: 2026-03-14 - Total: $580.00</li>
                    <li>• TQ-002 - Fecha: 2026-03-15 - Total: $348.00</li>
                    <li>• TQ-003 - Fecha: 2026-03-13 - Total: $775.00</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleValidateTicket}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Validar Ticket
              </button>
            </div>
          )}

          {/* Step 1b: Agregar Productos Manualmente */}
          {step === 'manual' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground">Paso 1: Agregar Productos Manualmente</h3>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">Agrega los productos que deseas facturar</p>
                  <p className="text-blue-800 dark:text-blue-300">
                    Ingresa los detalles de cada producto que deseas incluir en la factura.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Descripción del Producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    placeholder="Ej: Servicio de mantenimiento"
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                      placeholder="1"
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Precio Unitario <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={currentItem.unitPrice}
                        onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddManualItem}
                  className="w-full bg-green-600 dark:bg-green-700 text-white py-3.5 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Producto
                </button>

                {/* Lista de Productos Agregados */}
                {manualItems.length > 0 && (
                  <div className="mt-4 bg-surface border border-border rounded-lg p-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Productos Agregados:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {manualItems.map((item, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>{item.description} - {item.quantity}x - ${item.unitPrice.toFixed(2)}</span>
                          <button
                            onClick={() => handleRemoveManualItem(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-bold text-foreground mt-2">Total: ${getManualTotal().toFixed(2)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinueFromManual}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Datos Fiscales */}
          {step === 'fiscal' && validatedTicket && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground">Paso 2: Datos Fiscales</h3>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-900 dark:text-green-200 font-semibold">✓ Ticket validado correctamente</p>
                <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                  {validatedTicket.ticketNumber} - ${(validatedTicket.total ?? 0).toFixed(2)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      RFC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fiscalData.rfc}
                      onChange={(e) => handleRFCChange(e.target.value)}
                      placeholder="XAXX010101000"
                      maxLength={13}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Razón Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fiscalData.businessName}
                      onChange={(e) => setFiscalData({ ...fiscalData, businessName: e.target.value })}
                      placeholder="Nombre completo o razón social"
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Régimen Fiscal <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={fiscalData.fiscalRegime}
                      onChange={(e) => setFiscalData({ ...fiscalData, fiscalRegime: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    >
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="612">612 - Personas Físicas con Actividades</option>
                      <option value="616">616 - Sin obligaciones fiscales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Uso de CFDI <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={fiscalData.cfdiUse}
                      onChange={(e) => setFiscalData({ ...fiscalData, cfdiUse: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    >
                      <option value="G01">G01 - Adquisición de mercancías</option>
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="P01">P01 - Por definir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Código Postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fiscalData.zipCode}
                      onChange={(e) => setFiscalData({ ...fiscalData, zipCode: e.target.value })}
                      placeholder="06600"
                      maxLength={5}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={fiscalData.email}
                      onChange={(e) => setFiscalData({ ...fiscalData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(invoiceType === 'with-ticket' ? 'ticket' : 'manual')}
                  className="flex-1 bg-muted text-foreground py-3.5 rounded-lg hover:bg-muted-foreground/20 transition-colors font-semibold"
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-3.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Factura Generada */}
          {step === 'success' && generatedInvoice && (
            <div className="space-y-6">
              {/* Success Icon */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">¡Factura Generada Exitosamente!</h3>
                <p className="text-muted-foreground">Tu factura electrónica ha sido creada y está lista para descargar</p>
              </div>

              {/* Invoice Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-surface p-4 rounded-lg border border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">UUID</p>
                  <p className="text-sm font-mono font-semibold text-foreground break-all">{generatedInvoice.uuid}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Folio Fiscal</p>
                  <p className="text-sm font-semibold text-foreground">{generatedInvoice.folio}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">RFC</p>
                  <p className="text-sm font-semibold text-foreground">{generatedInvoice.fiscalData.rfc}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fecha de emisión</p>
                  <p className="text-sm font-semibold text-foreground">{generatedInvoice.issueDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Razón Social</p>
                  <p className="text-sm font-semibold text-foreground">{generatedInvoice.fiscalData.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                  <p className="text-sm font-semibold text-foreground">${(generatedInvoice.subtotal ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">IVA (16%)</p>
                  <p className="text-sm font-semibold text-foreground">${(generatedInvoice.iva ?? 0).toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold text-foreground">${(generatedInvoice.total ?? 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const xml = InvoiceController.generateXML(generatedInvoice);
                    const blob = new Blob([xml], { type: 'text/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${generatedInvoice.folio}.xml`;
                    a.click();
                    toast.success('XML descargado exitosamente');
                  }}
                  className="flex-1 bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Descargar XML
                </button>
                <button
                  onClick={() => toast.info('Función de descarga PDF próximamente')}
                  className="flex-1 bg-red-600 dark:bg-red-700 text-white py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
              </div>

              {/* Email Button */}
              <button
                onClick={() => {
                  toast.success(`Factura enviada exitosamente a: ${generatedInvoice.fiscalData.email}`);
                }}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2 text-base"
              >
                <Mail className="w-5 h-5" />
                Enviar por Correo a {generatedInvoice.fiscalData.email}
              </button>

              {/* Product Details Accordion */}
              <div className="border border-border rounded-lg">
                <button
                  onClick={() => setShowProductDetails(!showProductDetails)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface transition-colors rounded-t-lg"
                >
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Detalle de Productos
                  </span>
                  {showProductDetails ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                {showProductDetails && (
                  <div className="border-t border-border p-4">
                    <div className="space-y-2">
                      {generatedInvoice.ticket.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity}x piezas</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">${item.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* New Invoice Button */}
              <button
                onClick={handleNewInvoice}
                className="w-full bg-muted text-foreground py-3.5 rounded-lg hover:bg-muted-foreground/20 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Generar Nueva Factura
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}