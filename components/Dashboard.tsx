import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { OrderStats } from '../types';
import { DollarSign, Package, Truck, AlertCircle } from 'lucide-react';

interface DashboardProps {
  stats: OrderStats;
}

const COLORS = ['#10B981', '#F59E0B']; // Emerald, Amber
const COLORS_DELIVERY = ['#3B82F6', '#EF4444']; // Blue, Red

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  
  const paymentData = [
    { name: 'Paid', value: stats.paidOrders },
    { name: 'Unpaid', value: stats.unpaidOrders },
  ];

  const deliveryData = [
    { name: 'Delivered', value: stats.deliveredOrders },
    { name: 'Pending', value: stats.pendingOrders },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Sales" 
          value={`$${stats.totalSales.toFixed(2)}`} 
          icon={DollarSign} 
          colorClass="bg-indigo-500" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={Package} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Pending Delivery" 
          value={stats.pendingOrders} 
          icon={Truck} 
          colorClass="bg-amber-500" 
        />
        <StatCard 
          title="Unpaid Orders" 
          value={stats.unpaidOrders} 
          icon={AlertCircle} 
          colorClass="bg-rose-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deliveryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_DELIVERY[index % COLORS_DELIVERY.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
