import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, OrderItem, Order, PaymentMethod } from '../types';
import { MenuGrid } from '../components/MenuGrid';
import { CurrentOrder } from '../components/CurrentOrder';
import { TableGrid } from '../components/TableGrid';
import { ExtrasModal } from '../components/ExtrasModal';
import { PaymentModal } from '../components/PaymentModal';
import { TicketModal } from '../components/TicketModal';
import { PageHeader } from '../components/PageHeader';
import { Search, ChevronLeft, Send, Receipt, Eye, Clock, Edit, CheckCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/format';

export function WaiterView() {
  const { menuItems, addOrder, updateOrder, tables, updateTable, currentUser, orders, categories: allCategories, updateInventory, getAvailableExtrasForProduct } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showMobileOrder, setShowMobileOrder] = useState(false);

  // Obtener órdenes del mesero actual
  const myOrders = orders.filter(order =>
    order.waiterName === currentUser?.name &&
    (order.status === 'ready' || order.status === 'delivered')
  );

  // Obtener categorías únicas (solo activas)
  const categories = ['All', ...allCategories.filter(cat => cat.active).map(cat => cat.name)];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isAvailable = item.active && item.stock > 0;
    return matchesCategory && matchesSearch && isAvailable;
  });

  const handleSelectTable = (tableNumber: number) => {
    const table = tables.find(t => t.number === tableNumber);
    
    if (table?.status !== 'free') {
      toast.error('Esta mesa no está disponible');
      return;
    }

    setSelectedTable(tableNumber);
    // NO cambiar el estado a 'occupied' aquí - solo cuando se envíe la orden
    setShowMenu(true);
    toast.success(`Mesa ${tableNumber} seleccionada`);
  };

  const handleAddToOrder = (item: MenuItem) => {
    // SIEMPRE verificar si hay extras disponibles
    checkExtrasAndAddToOrder(item);
  };

  const checkExtrasAndAddToOrder = async (item: MenuItem) => {
    try {
      // Llamar a la API para obtener extras disponibles para este producto
      const availableExtras = await getAvailableExtrasForProduct(item.id);

      // Si no hay extras disponibles, agregar directamente sin mostrar modal
      if (availableExtras.length === 0) {
        const existingItemIndex = orderItems.findIndex(
          (orderItem) => orderItem.id === item.id && !orderItem.extras?.length && !orderItem.notes
        );
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...orderItems];
          updatedItems[existingItemIndex].quantity += 1;
          setOrderItems(updatedItems);
        } else {
          setOrderItems([...orderItems, { ...item, quantity: 1, extras: [], notes: '' }]);
        }
        
        toast.success('Producto agregado');
        return;
      }

      // Si hay extras disponibles, mostrar modal
      setPendingItem(item);
      setShowExtrasModal(true);
    } catch (error) {
      console.error('[Error checking extras]', error);
      // En caso de error, agregar el producto sin extras
      setOrderItems([...orderItems, { ...item, quantity: 1, extras: [], notes: '' }]);
      toast.success('Producto agregado');
    }
  };

  const handleConfirmExtras = (extras: Array<{ id: string; name: string; price: number }>, notes: string) => {
    if (!pendingItem) return;

    const existingItemIndex = orderItems.findIndex(
      (orderItem) => 
        orderItem.id === pendingItem.id &&
        JSON.stringify(orderItem.extras) === JSON.stringify(extras) &&
        orderItem.notes === notes
    );
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, { 
        ...pendingItem, 
        quantity: 1,
        extras: extras.length > 0 ? extras : [],
        notes: notes || ''
      }]);
    }

    setShowExtrasModal(false);
    setPendingItem(null);
    toast.success('Producto agregado');
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setOrderItems(
      orderItems.map((item, idx) =>
        idx === index ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleClearOrder = () => {
    setOrderItems([]);
  };

  const handleCreateOrder = async () => {
    if (!selectedTable) {
      toast.error('Selecciona una mesa');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Agrega productos a la orden');
      return;
    }

    // Calcular subtotal incluyendo extras
    const subtotal = orderItems.reduce((sum, item) => {
      const itemPrice = item.priceClient;
      const extrasPrice = item.extras?.reduce((extraSum, extra) => extraSum + extra.price, 0) || 0;
      return sum + ((itemPrice + extrasPrice) * item.quantity);
    }, 0);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const newOrder: Order = {
      id: Date.now().toString(),
      tableNumber: selectedTable,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'ready',
      createdAt: new Date(),
      waiterName: currentUser?.name,
    };

    addOrder(newOrder);

    // Marcar la mesa como ocupada cuando se crea la orden
    const table = tables.find(t => t.number === selectedTable);
    if (table) {
      await updateTable(table.id, {
        status: 'occupied',
        waiterId: currentUser?.id,
        currentOrderId: newOrder.id,
        occupiedAt: new Date()
      });
    }

    toast.success('Orden registrada y lista para entregar');

    setOrderItems([]);
    setSelectedTable(null);
    setShowMenu(false);
    setShowMobileOrder(false);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setSelectedTable(order.tableNumber);
    setOrderItems([...order.items]);
    setShowMyOrders(false);
    setShowMenu(true);
    toast.info(`Editando orden de Mesa ${order.tableNumber}`);
  };

  const handleUpdateExistingOrder = () => {
    if (!editingOrder) {
      handleCreateOrder();
      return;
    }

    if (orderItems.length === 0) {
      toast.error('No hay productos en la orden');
      return;
    }

    // Calcular subtotal incluyendo extras
    const subtotal = orderItems.reduce((sum, item) => {
      const itemPrice = item.priceClient;
      const extrasPrice = item.extras?.reduce((extraSum, extra) => extraSum + extra.price, 0) || 0;
      return sum + ((itemPrice + extrasPrice) * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    updateOrder(editingOrder.id, {
      items: orderItems,
      subtotal,
      tax,
      total,
    });

    toast.success('Orden actualizada');
    
    setOrderItems([]);
    setSelectedTable(null);
    setShowMenu(false);
    setEditingOrder(null);
  };

  const handleMarkAsDelivered = (order: Order) => {
    updateOrder(order.id, { 
      status: 'delivered',
      deliveredAt: new Date()
    });
    toast.success(`Orden de Mesa ${order.tableNumber} marcada como entregada`);
  };

  const handleShowMyOrders = () => {
    setShowMyOrders(true);
  };

  const handleSelectOrderForPayment = (order: Order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentModal(true);
  };

  const handlePayOrder = async (order: Order, method: PaymentMethod) => {
    // Actualizar inventario: descontar stock de cada producto vendido
    order.items.forEach(item => {
      updateInventory(item.id, -item.quantity);
    });

    // Actualizar estado de la orden
    updateOrder(order.id, {
      status: 'paid',
      paymentMethod: method,
      paidAt: new Date()
    });

    // Liberar la mesa
    const table = tables.find(t => t.number === order.tableNumber);
    if (table) {
      await updateTable(table.id, {
        status: 'free',
        waiterId: null,
        currentOrderId: null,
        occupiedAt: null
      });
    }

    toast.success(`Orden cobrada - Mesa ${order.tableNumber} liberada`);
    setShowPaymentModal(false);
    setSelectedOrderForPayment(null);
  };

  const handleShowTicket = (order: Order) => {
    setSelectedOrderForPayment(order);
    setShowTicketModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      <PageHeader
        breadcrumb="POS / MESERO"
        title={showMenu ? `Mesa ${selectedTable}` : 'Seleccionar Mesa'}
        subtitle={showMenu ? 'Toma de orden' : 'Elige una mesa disponible'}
        actions={
          currentUser ? (
            <div className="text-right">
              <p className="text-xs text-[#a2774c] uppercase tracking-wide">Mesero</p>
              <p className="font-semibold text-foreground">{currentUser.name}</p>
            </div>
          ) : null
        }
      />

      <div className="flex-1 overflow-hidden">
        {!showMenu ? (
          <div className="h-full overflow-auto p-6">
            <div className="bg-card rounded-lg shadow-sm p-6 mb-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Selecciona una Mesa</h2>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 dark:bg-green-900 border-2 border-green-500 rounded"></div>
                  <span className="text-muted-foreground">Libre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 dark:bg-red-900 border-2 border-red-500 rounded"></div>
                  <span className="text-muted-foreground">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 border-2 border-yellow-500 rounded"></div>
                  <span className="text-muted-foreground">En cuenta</span>
                </div>
              </div>
            </div>
            <TableGrid tables={tables} onSelectTable={handleSelectTable} />
          </div>
        ) : (
          <>
            {/* Desktop Layout - SOLO VISIBLE EN PANTALLAS GRANDES (≥1024px) */}
            <div className="hidden lg:grid h-full lg:grid-cols-3 gap-6 p-6">
              <div className="lg:col-span-2 space-y-4 overflow-auto">
                <div className="flex items-center gap-4">
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      setShowMobileOrder(false);
                      if (selectedTable && orderItems.length === 0) {
                        const table = tables.find(t => t.number === selectedTable);
                        if (table) {
                          await updateTable(table.id, { status: 'free', waiterId: null });
                        }
                      }
                    }}
                    className="bg-card p-2 rounded-lg shadow-sm hover:bg-muted border border-border"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>
                  <div className="bg-card rounded-lg shadow-sm px-4 py-3 flex-1 border border-border">
                    <p className="text-sm text-muted-foreground">Mesa seleccionada</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Mesa {selectedTable}</p>
                  </div>
                </div>

                <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    />
                  </div>
                </div>

                {/* Botones de categorías - SOLO DESKTOP */}
                <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 dark:bg-blue-700 text-white'
                            : 'bg-muted text-foreground hover:bg-muted-foreground/10'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <MenuGrid items={filteredItems} onAddToOrder={handleAddToOrder} />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-0 h-[calc(100vh-12rem)]">
                  <CurrentOrder
                    items={orderItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={editingOrder ? handleUpdateExistingOrder : handleCreateOrder}
                    onClear={handleClearOrder}
                    checkoutLabel={editingOrder ? 'Actualizar Orden' : 'Crear Orden'}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden h-full flex flex-col">
              <div className="flex bg-card border-b border-border shadow-sm">
                <button
                  onClick={() => setShowMobileOrder(false)}
                  className={`flex-1 py-3 px-4 font-medium transition-colors border-b-2 ${
                    !showMobileOrder
                      ? 'border-[#2e636e] text-[#2e636e] dark:text-blue-400 dark:border-blue-400 bg-surface'
                      : 'border-transparent text-muted-foreground'
                  }`}
                >
                  📋 Menú
                </button>
                <button
                  onClick={() => setShowMobileOrder(true)}
                  className={`flex-1 py-3 px-4 font-medium transition-colors border-b-2 relative ${
                    showMobileOrder
                      ? 'border-[#2e636e] text-[#2e636e] dark:text-blue-400 dark:border-blue-400 bg-surface'
                      : 'border-transparent text-muted-foreground'
                  }`}
                >
                  🛒 Orden
                  {orderItems.length > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-[#e74c3c] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-card">
                      {orderItems.length}
                    </span>
                  ) : null}
                </button>
              </div>

              {!showMobileOrder ? (
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={async () => {
                        setShowMenu(false);
                        setShowMobileOrder(false);
                        if (selectedTable && orderItems.length === 0) {
                          const table = tables.find(t => t.number === selectedTable);
                          if (table) {
                            await updateTable(table.id, { status: 'free', waiterId: null });
                          }
                        }
                      }}
                      className="bg-card p-2 rounded-lg shadow-sm hover:bg-muted border border-border"
                    >
                      <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <div className="bg-card rounded-lg shadow-sm px-4 py-3 flex-1 border border-border">
                      <p className="text-sm text-muted-foreground">Mesa seleccionada</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Mesa {selectedTable}</p>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      />
                    </div>
                  </div>

                  {/* Dropdown para categorías en móvil */}
                  <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Categoría
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground font-medium"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'All' ? '🍽️ Todas las categorías' : `📂 ${category}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <MenuGrid items={filteredItems} onAddToOrder={handleAddToOrder} />
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-4">
                  <CurrentOrder
                    items={orderItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={editingOrder ? handleUpdateExistingOrder : handleCreateOrder}
                    onClear={handleClearOrder}
                    checkoutLabel={editingOrder ? 'Actualizar Orden' : 'Crear Orden'}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showExtrasModal && pendingItem ? (
        <ExtrasModal
          item={pendingItem}
          onConfirm={handleConfirmExtras}
          onClose={() => {
            setShowExtrasModal(false);
            setPendingItem(null);
          }}
        />
      ) : null}

      {showMyOrders ? (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 modal-overlay">
          <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-auto border border-border modal-content">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#a2774c] dark:text-[#c8956b] font-semibold mb-1">MIS ÓRDENES</p>
                <h2 className="text-2xl font-bold text-foreground">Órdenes Activas</h2>
              </div>
              <button
                onClick={() => setShowMyOrders(false)}
                className="bg-surface p-3 rounded-xl shadow-sm hover:bg-muted text-foreground border border-border"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            {myOrders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto text-[#a2774c] dark:text-[#c8956b] mb-4 opacity-50" />
                <p className="text-muted-foreground">No tienes órdenes activas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => {
                  const statusInfo = {
                    pending: { label: 'Pendiente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
                    preparing: { label: 'Preparando', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
                    ready: { label: 'Listo', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
                    delivered: { label: 'Entregado', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
                  };
                  const status = statusInfo[order.status as keyof typeof statusInfo] || statusInfo.pending;

                  return (
                    <div key={order.id} className="bg-surface border-2 border-border rounded-2xl p-5 hover:border-[#a2774c] dark:hover:border-[#c8956b] transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-bold text-foreground">Mesa {order.tableNumber}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Orden #{order.id}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.createdAt.toLocaleString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: 'short'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                        </div>
                      </div>

                      <div className="bg-background rounded-xl p-4 mb-4 border border-border">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={`order-${order.id}-item-${idx}`} className="flex items-center justify-between text-sm">
                              <div className="flex-1">
                                <span className="font-medium text-foreground">{item.quantity}x {item.name}</span>
                                {item.extras && item.extras.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.extras.map((extra, i) => (
                                      <span key={`extra-${idx}-${i}`} className="text-xs bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                                        + {extra.name} {extra.price > 0 ? `(${formatCurrency(extra.price)})` : ''}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                              <span className="text-foreground font-semibold ml-2">
                                {formatCurrency((item.priceClient + (item.extras?.reduce((sum, e) => sum + e.price, 0) || 0)) * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="flex-1 min-w-[120px] px-4 py-3 bg-[#a2774c] dark:bg-[#c8956b] text-white rounded-xl font-medium hover:bg-[#6c5033] dark:hover:bg-[#a2774c] transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>

                        <button
                          onClick={() => handleShowTicket(order)}
                          className="px-4 py-3 bg-card border-2 border-border text-foreground rounded-xl font-medium hover:bg-surface transition-colors flex items-center justify-center"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {order.status === 'ready' ? (
                          <button
                            onClick={() => handleMarkAsDelivered(order)}
                            className="flex-1 min-w-[120px] px-4 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Entregar
                          </button>
                        ) : null}

                        <button
                          onClick={() => handleSelectOrderForPayment(order)}
                          className="flex-1 min-w-[120px] px-4 py-3 bg-[#2e636e] dark:bg-[#3d7a89] text-white rounded-xl font-medium hover:bg-[#a2774c] dark:hover:bg-[#c8956b] transition-colors shadow-md flex items-center justify-center gap-2"
                        >
                          <Receipt className="w-4 h-4" />
                          Cobrar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {showPaymentModal && selectedOrderForPayment ? (
        <PaymentModal
          order={selectedOrderForPayment}
          onPay={handlePayOrder}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
        />
      ) : null}

      {showTicketModal && selectedOrderForPayment ? (
        <TicketModal
          order={selectedOrderForPayment}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedOrderForPayment(null);
          }}
        />
      ) : null}

      {!showMyOrders ? (
        <button
          onClick={handleShowMyOrders}
          className="fixed bottom-20 right-6 bg-[#2e636e] dark:bg-[#3d7a89] p-4 rounded-full shadow-2xl hover:bg-[#a2774c] dark:hover:bg-[#c8956b] transition-all hover:scale-110 z-40"
        >
          <Clock className="w-6 h-6 text-white" />
          {myOrders.length > 0 ? (
            <span className="absolute -top-2 -right-2 bg-[#e74c3c] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-card">
              {myOrders.length}
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  );
}