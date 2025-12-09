import React from 'react';
import { Order, PaymentStatus, DeliveryStatus } from '../types';
import { Edit2, Trash2, Phone, Clock } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onTogglePayment: (order: Order) => void;
  onToggleDelivery: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  onEdit, 
  onDelete,
  onTogglePayment,
  onToggleDelivery
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Clock className="w-full h-full" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new order.</p>
      </div>
    );
  }

  const PaymentBadge = ({ status, onClick }: { status: PaymentStatus, onClick: () => void }) => (
    <button 
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
        status === PaymentStatus.Paid 
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      }`}
      title="Click to toggle status"
    >
      {status}
    </button>
  );

  const DeliveryBadge = ({ status, onClick }: { status: DeliveryStatus, onClick: () => void }) => (
    <button 
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
        status === DeliveryStatus.Delivered
          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
      }`}
      title="Click to toggle status"
    >
      {status === DeliveryStatus.Delivered ? 'Delivered' : 'Pending'}
    </button>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-gray-500 font-mono">{order.orderNumber}</span>
                <h3 className="text-lg font-medium text-gray-900">{order.customerName}</h3>
              </div>
              <p className="text-lg font-bold text-gray-900">${order.totalPrice.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <Phone className="w-4 h-4" />
              <a href={`tel:${order.phoneNumber}`} className="hover:text-indigo-600">{order.phoneNumber}</a>
            </div>

            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
              {order.items}
            </div>

            {order.notes && (
              <div className="text-xs text-gray-500 italic flex items-center gap-1">
                <span className="font-semibold">Note:</span> {order.notes}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
              <div className="flex gap-2">
                <PaymentBadge status={order.paymentStatus} onClick={() => onTogglePayment(order)} />
                <DeliveryBadge status={order.deliveryStatus} onClick={() => onToggleDelivery(order)} />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(order);
                  }}
                  className="p-2 text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                  aria-label="Edit order"
                >
                  <Edit2 className="w-4 h-4 pointer-events-none" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(order.id);
                  }}
                  className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                  aria-label="Delete order"
                >
                  <Trash2 className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-hidden border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{order.customerName}</div>
                  <div className="text-sm text-gray-500">{order.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={order.items}>
                  {order.items}
                  {order.notes && <div className="text-xs text-gray-400 italic mt-1 truncate">{order.notes}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  ${order.totalPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col gap-2 items-start">
                    <PaymentBadge status={order.paymentStatus} onClick={() => onTogglePayment(order)} />
                    <DeliveryBadge status={order.deliveryStatus} onClick={() => onToggleDelivery(order)} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3 items-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(order);
                      }} 
                      className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 pointer-events-none" />
                    </button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(order.id);
                      }} 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 pointer-events-none" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};