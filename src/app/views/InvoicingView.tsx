import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  XCircle, 
  CheckCircle,
  Eye,
  Filter,
  Receipt,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ActionButton, IconButton } from '../components/ui/ActionButton';
import { InvoiceController } from '../controllers/InvoiceController';
import { Invoice } from '../types/invoice';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';
import { toast } from 'sonner';

export function InvoicingView() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    InvoiceController.initializeMockData();
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = InvoiceController.getAllInvoices();
    setInvoices(allInvoices);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = searchQuery === '' || 
      inv.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.fiscalData.rfc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.fiscalData.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (invoice: Invoice) => {
    loadInvoices();
    setShowCreateModal(false);
  };

  const handleCancelInvoice = (reason: string) => {
    if (selectedInvoice) {
      const result = InvoiceController.cancelInvoice(selectedInvoice.id, reason);
      if (result.success) {
        toast.success('Factura cancelada exitosamente');
        loadInvoices();
        setShowCancelModal(false);
        setSelectedInvoice(null);
      } else {
        toast.error(result.error || 'Error al cancelar la factura');
      }
    }
  };

  const handleDownloadXML = (invoice: Invoice) => {
    const xml = InvoiceController.generateXML(invoice);
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.folio}.xml`;
    a.click();
  };

  const stats = {
    total: invoices.length,
    active: invoices.filter(i => i.status === 'active').length,
    cancelled: invoices.filter(i => i.status === 'cancelled').length,
    totalAmount: invoices
      .filter(i => i.status === 'active')
      .reduce((sum, i) => sum + i.total, 0)
  };

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      <PageHeader
        breadcrumb="GESTIÓN / FACTURACIÓN"
        title="Portal de Facturación"
        subtitle="Gestión de facturas electrónicas CFDI 4.0"
        actions={
          <ActionButton
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            icon={Plus}
          >
            Nueva Factura
          </ActionButton>
        }
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Activas</p>
                <p className="text-xl font-bold text-foreground">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Canceladas</p>
                <p className="text-xl font-bold text-foreground">{stats.cancelled}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#a2774c]/20 dark:bg-[#c8956b]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#a2774c] dark:text-[#c8956b]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monto Total</p>
                <p className="text-lg font-bold text-foreground">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por folio, RFC, razón social o ticket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent appearance-none text-foreground"
                >
                  <option value="all">Todas las facturas</option>
                  <option value="active">Activas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No se encontraron facturas</p>
              <p className="text-muted-foreground/60 text-sm">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primera factura para comenzar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Folio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-[#a2774c] dark:text-[#c8956b] flex-shrink-0" />
                          <p className="text-sm font-medium text-foreground">{invoice.folio}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{invoice.fiscalData.businessName}</p>
                            <p className="text-xs text-muted-foreground">{invoice.fiscalData.rfc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(invoice.issueDate).toLocaleDateString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-foreground">${invoice.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">IVA: ${invoice.iva.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                            <XCircle className="w-3 h-3" />
                            Cancelada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDetailModal(true);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDownloadXML(invoice)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Descargar XML"
                          >
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {invoice.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowCancelModal(true);
                              }}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Cancelar factura"
                            >
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modales - FUERA del contenedor con overflow */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateInvoice}
        />
      )}

      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {showCancelModal && selectedInvoice && (
        <CancelInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedInvoice(null);
          }}
          onConfirm={handleCancelInvoice}
        />
      )}
    </div>
  );
}

// Modal de detalles
function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Detalles de Factura</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{invoice.folio}</h3>
              <p className="text-sm text-muted-foreground">UUID: {invoice.uuid}</p>
            </div>
            {invoice.status === 'active' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium">
                <CheckCircle className="w-5 h-5" />
                Activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 font-medium">
                <XCircle className="w-5 h-5" />
                Cancelada
              </span>
            )}
          </div>

          {/* Fiscal Data */}
          <div className="bg-surface rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#a2774c] dark:text-[#c8956b]" />
              Datos Fiscales del Receptor
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">RFC</p>
                <p className="font-medium text-foreground">{invoice.fiscalData.rfc}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Razón Social</p>
                <p className="font-medium text-foreground">{invoice.fiscalData.businessName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Régimen Fiscal</p>
                <p className="font-medium text-foreground">{invoice.fiscalData.fiscalRegime}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uso CFDI</p>
                <p className="font-medium text-foreground">{invoice.fiscalData.cfdiUse}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Conceptos</h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-muted-foreground">Descripción</th>
                    <th className="px-4 py-2 text-right text-muted-foreground">Cant.</th>
                    <th className="px-4 py-2 text-right text-muted-foreground">P.U.</th>
                    <th className="px-4 py-2 text-right text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.ticket.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-foreground">{item.description}</td>
                      <td className="px-4 py-2 text-right text-foreground">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-foreground">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-medium text-foreground">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium text-foreground">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">IVA (16%):</span>
              <span className="font-medium text-foreground">${invoice.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span className="text-foreground">Total:</span>
              <span className="text-foreground">${invoice.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cancellation Info */}
          {invoice.status === 'cancelled' && invoice.cancellationReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Factura cancelada</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Motivo: {invoice.cancellationReason}
              </p>
              {invoice.cancellationDate && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Fecha: {new Date(invoice.cancellationDate).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal de cancelación
function CancelInvoiceModal({ 
  invoice, 
  onClose, 
  onConfirm 
}: { 
  invoice: Invoice; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Por favor ingresa un motivo de cancelación');
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-md w-full border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Cancelar Factura</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              ¿Estás seguro de que deseas cancelar la factura <strong>{invoice.folio}</strong>?
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Motivo de cancelación *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe el motivo de la cancelación..."
              rows={4}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-foreground"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-muted text-foreground py-2.5 rounded-lg hover:bg-muted-foreground/20 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 dark:bg-red-700 text-white py-2.5 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium"
            >
              Confirmar Cancelación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}