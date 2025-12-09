import React, { useState, useEffect } from 'react';
import { Order, PaymentStatus, DeliveryStatus } from '../types';
import { Sparkles, Save, X, Loader2 } from 'lucide-react';
import { parseOrderFromText } from '../services/geminiService';

interface OrderFormProps {
  initialData?: Order | null;
  onSave: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData, onSave, onCancel, isEditing }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [items, setItems] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.Unpaid);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(DeliveryStatus.Pending);
  const [notes, setNotes] = useState('');
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customerName);
      setPhoneNumber(initialData.phoneNumber);
      setItems(initialData.items);
      setTotalPrice(initialData.totalPrice);
      setPaymentStatus(initialData.paymentStatus);
      setDeliveryStatus(initialData.deliveryStatus);
      setNotes(initialData.notes);
      // Clear AI fields when editing
      setAiPrompt('');
      setAiError(null);
    } else {
      // Complete reset when switching to New Order
      setCustomerName('');
      setPhoneNumber('');
      setItems('');
      setTotalPrice('');
      setPaymentStatus(PaymentStatus.Unpaid);
      setDeliveryStatus(DeliveryStatus.Pending);
      setNotes('');
      setAiPrompt('');
      setAiError(null);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customerName,
      phoneNumber,
      items,
      totalPrice: Number(totalPrice),
      paymentStatus,
      deliveryStatus,
      notes
    });
  };

  const handleAiParse = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiError(null);
    try {
      const result = await parseOrderFromText(aiPrompt);
      if (result) {
        setCustomerName(result.customerName);
        setPhoneNumber(result.phoneNumber);
        setItems(result.items);
        setTotalPrice(result.totalPrice);
        setNotes(result.notes);
      }
    } catch (err) {
      setAiError("Failed to parse. Please try again or enter manually.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-white font-semibold text-lg">{isEditing ? 'Edit Order' : 'New Order'}</h2>
        <button onClick={onCancel} className="text-indigo-100 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {/* AI Magic Section */}
        {!isEditing && (
          <div className="mb-8 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Quick Add with AI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., 'John needs 2 cookies and a brownie, 555-1234, $15 total'"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
              />
              <button
                type="button"
                onClick={handleAiParse}
                disabled={isAiLoading || !aiPrompt}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Auto-Fill'}
              </button>
            </div>
            {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Items Ordered</label>
              <input
                type="text"
                required
                placeholder="e.g., 2x Cookies, 1x Cupcake"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Price ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                 <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                >
                  <option value={PaymentStatus.Unpaid}>Unpaid</option>
                  <option value={PaymentStatus.Paid}>Paid</option>
                </select>
                 <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                >
                  <option value={DeliveryStatus.Pending}>Pending</option>
                  <option value={DeliveryStatus.Delivered}>Delivered</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                placeholder="Delivery instructions, special requests..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};