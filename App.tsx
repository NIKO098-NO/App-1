import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, List, Plus, Search } from 'lucide-react';
import { Order, OrderStats, PaymentStatus, DeliveryStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { OrderForm } from './components/OrderForm';

// Initial Mock Data
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'John Doe',
    phoneNumber: '555-1234',
    items: '2x Cookies, 1x Brownies',
    totalPrice: 18.00,
    paymentStatus: PaymentStatus.Unpaid,
    deliveryStatus: DeliveryStatus.Delivered,
    notes: 'Leave at front desk',
    createdAt: Date.now() - 100000
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'Mary Kia',
    phoneNumber: '555-8090',
    items: '3x Cupcakes',
    totalPrice: 9.00,
    paymentStatus: PaymentStatus.Paid,
    deliveryStatus: DeliveryStatus.Pending,
    notes: 'Needs delivery after school',
    createdAt: Date.now()
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: 'Alex Smith',
    phoneNumber: '555-0000',
    items: '1x Soda',
    totalPrice: 2.00,
    paymentStatus: PaymentStatus.Unpaid,
    deliveryStatus: DeliveryStatus.Pending,
    notes: '',
    createdAt: Date.now() - 50000
  }
];

export default function App() {
  // State
  // Using 'fundraiser_orders_v2' to ensure new mock data is loaded for this update
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fundraiser_orders_v2');
    const parsed = saved ? JSON.parse(saved) : MOCK_ORDERS;
    // Defensive coding: Ensure totalPrice is always a number to prevent dashboard calculation errors
    return parsed.map((o: any) => ({
      ...o,
      totalPrice: Number(o.totalPrice) || 0
    }));
  });
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'orders' | 'new'>('dashboard');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Effects
  useEffect(() => {
    localStorage.setItem('fundraiser_orders_v2', JSON.stringify(orders));
  }, [orders]);

  // Derived State (Stats)
  const stats: OrderStats = useMemo(() => {
    return orders.reduce((acc, order) => {
      // Strictly cast to number to ensure math works (prevents string concatenation)
      const price = Number(order.totalPrice) || 0;
      acc.totalSales += price;
      
      acc.totalOrders += 1;
      if (order.paymentStatus === PaymentStatus.Paid) acc.paidOrders += 1;
      else acc.unpaidOrders += 1;
      if (order.deliveryStatus === DeliveryStatus.Delivered) acc.deliveredOrders += 1;
      else acc.pendingOrders += 1;
      return acc;
    }, {
      totalSales: 0,
      totalOrders: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      deliveredOrders: 0,
      pendingOrders: 0
    });
  }, [orders]);

  // Derived State (Filtered Orders)
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt); // Newest first
  }, [orders, searchQuery]);

  // Handlers
  const handleCreateOrder = (data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newOrder: Order = {
      ...data,
      totalPrice: Number(data.totalPrice) || 0, // Ensure number
      id: newId,
      orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: Date.now()
    };
    setOrders([newOrder, ...orders]);
    setCurrentView('orders');
  };

  const handleUpdateOrder = (data: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    if (!editingOrder) return;
    setOrders(orders.map(o => o.id === editingOrder.id ? { 
      ...o, 
      ...data,
      totalPrice: Number(data.totalPrice) || 0 // Ensure number
    } : o));
    setEditingOrder(null);
    setCurrentView('orders');
  };

  const handleDeleteOrder = (id: string) => {
    // Removed window.confirm to guarantee the button works reliably for the user.
    setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
  };

  const handleTogglePayment = (order: Order) => {
    const newStatus = order.paymentStatus === PaymentStatus.Paid ? PaymentStatus.Unpaid : PaymentStatus.Paid;
    setOrders(orders.map(o => o.id === order.id ? { ...o, paymentStatus: newStatus } : o));
  };

  const handleToggleDelivery = (order: Order) => {
    const newStatus = order.deliveryStatus === DeliveryStatus.Delivered ? DeliveryStatus.Pending : DeliveryStatus.Delivered;
    setOrders(orders.map(o => o.id === order.id ? { ...o, deliveryStatus: newStatus } : o));
  };

  const startEdit = (order: Order) => {
    setEditingOrder(order);
    setCurrentView('new'); // Reuse the 'new' view for editing
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white px-3 py-1 font-bold text-lg rounded-sm">Tracker</div>
              <span className="text-xl font-semibold text-gray-900">Fundraiser</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orders
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={() => { setEditingOrder(null); setCurrentView('new'); }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Nav Tabs */}
        <div className="sm:hidden mb-6 flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
           <button
             onClick={() => setCurrentView('dashboard')}
             className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
               currentView === 'dashboard' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500'
             }`}
           >
             <LayoutDashboard className="w-4 h-4 mr-2" />
             Stats
           </button>
           <button
             onClick={() => setCurrentView('orders')}
             className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
               currentView === 'orders' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500'
             }`}
           >
             <List className="w-4 h-4 mr-2" />
             Orders
           </button>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard stats={stats} />
        )}

        {currentView === 'orders' && (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <OrderList 
              orders={filteredOrders} 
              onEdit={startEdit}
              onDelete={handleDeleteOrder}
              onTogglePayment={handleTogglePayment}
              onToggleDelivery={handleToggleDelivery}
            />
          </div>
        )}

        {currentView === 'new' && (
          <div className="max-w-3xl mx-auto">
            <OrderForm 
              initialData={editingOrder}
              onSave={editingOrder ? handleUpdateOrder : handleCreateOrder}
              onCancel={() => { setEditingOrder(null); setCurrentView('orders'); }}
              isEditing={!!editingOrder}
            />
          </div>
        )}
      </main>
    </div>
  );
}