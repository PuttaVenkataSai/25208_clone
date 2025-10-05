import { FC } from 'react';
import KpiCard from '../components/KpiCard';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Truck, Clock, Percent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const DashboardPage: FC = () => {
  const { orders, inventories } = useData();
  const { user } = useAuth();

  const filteredOrders = orders.filter(order => {
    if (!user) return false;
    if (user.role === Role.ADMIN) return true;
    if (user.role === Role.BASE_MANAGER) {
      return order.assignedManagerId === user.id;
    }
    return false;
  });

  const totalStock = inventories
    .flatMap(inv => inv.products)
    .reduce((acc, product) => acc + product.quantity, 0);

  const pendingOrders = filteredOrders.filter(o => o.status === 'Pending').length;

  const upcomingDeadlines = filteredOrders.filter(order => {
    const dueDate = new Date(order.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0 && order.status === 'Pending';
  }).length;

  const highPriorityOrders = filteredOrders.filter(order => order.priority === 'High' && order.status === 'Pending').length;

  const chartData = inventories.map(inv => ({
    name: inv.baseName.replace(' Steel Plant', ''),
    ...inv.products.reduce((acc, p) => ({ ...acc, [p.name]: p.quantity }), {})
  }));
  const productNames = [...new Set(inventories.flatMap(inv => inv.products.map(p => p.name)))];
  const colors = ['#003366', '#FF6600', '#0077B6', '#FDB813'];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's a summary of the logistics operations.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Available Stock (Tons)" value={totalStock.toLocaleString()} icon={Package} color="#003366" />
        <KpiCard title="Pending Orders" value={pendingOrders.toString()} icon={Truck} color="#FF6600" />
        <KpiCard title="Upcoming Deadlines (7 days)" value={upcomingDeadlines.toString()} icon={Clock} color="#0077B6" />
        <KpiCard title="High Priority Orders" value={highPriorityOrders.toString()} icon={Percent} color="#FDB813" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Important Events</h2>
        <div className="space-y-3">
          {filteredOrders
            .filter(order => {
              const dueDate = new Date(order.dueDate);
              const today = new Date();
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return (diffDays <= 7 && order.status === 'Pending') || order.priority === 'High';
            })
            .slice(0, 5)
            .map(order => {
              const dueDate = new Date(order.dueDate);
              const today = new Date();
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays <= 7 && order.status === 'Pending';
              const isHighPriority = order.priority === 'High' && order.status === 'Pending';

              return (
                <div key={order.id} className={`p-4 rounded-lg border-l-4 ${
                  isUrgent ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  isHighPriority ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{order.id} - {order.customerName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Destination: {order.destination}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: {order.dueDate} ({diffDays > 0 ? `${diffDays} days` : 'Overdue'})</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>{order.priority}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          {filteredOrders.filter(order => {
            const dueDate = new Date(order.dueDate);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return (diffDays <= 7 && order.status === 'Pending') || order.priority === 'High';
          }).length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No urgent events at this time.</p>
          )}
        </div>
      </div>
      
      {user?.role !== Role.BASE_MANAGER && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Inventory Levels Across Bases</h2>
            <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                <YAxis tickFormatter={(value) => `${(value as number / 1000)}k`} tick={{ fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: 'black', border: '1px solid #555' }} />
                <Legend wrapperStyle={{ color: 'currentColor' }} />
                {productNames.map((name, index) => (
                    <Bar key={name} dataKey={name} stackId="a" fill={colors[index % colors.length]} />
                ))}
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;