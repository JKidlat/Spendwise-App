// Dashboard page with statistics and charts
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { dashboardApi, userApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [currency, setCurrency] = useState(user?.currency || 'USD');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.getStats(period),
  });

  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
    }
  }, [user]);

  // Prepare chart data
  const dailyChartData = data?.dailyData
    ? {
        labels: Object.keys(data.dailyData).map((date) =>
          new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            label: 'Daily Expenses',
            data: Object.values(data.dailyData),
            backgroundColor: 'rgba(14, 165, 233, 0.5)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  const categoryChartData = data?.categoryBreakdown
    ? {
        labels: data.categoryBreakdown.map((item) => item.category?.name || 'Unknown'),
        datasets: [
          {
            data: data.categoryBreakdown.map((item) => item.amount),
            backgroundColor: data.categoryBreakdown.map(
              (item) => item.category?.color || '#6B7280'
            ),
          },
        ],
      }
    : null;

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await userApi.updateCurrency(newCurrency);
      setCurrency(newCurrency);
      updateUser({ currency: newCurrency });
      // Refetch dashboard data with new currency
      await refetch();
    } catch (error) {
      console.error('Failed to update currency:', error);
      alert('Failed to update currency. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with period selector and currency */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="GHS">GHS (₵)</option>
              </select>
              <div className="flex space-x-2">
                <Button
                  variant={period === 'week' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('week')}
                >
                  Week
                </Button>
                <Button
                  variant={period === 'month' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('month')}
                >
                  Month
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Total Expenses Card */}
              <div className="mb-6">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-lg mb-2">Total Expenses ({period})</p>
                    <p className="text-4xl font-bold text-primary-600">
                      {data ? formatCurrency(data.totalExpenses, currency) : '$0.00'}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Daily Expenses Line Chart */}
                {dailyChartData && (
                  <Card title="Daily Spending Trend">
                    <Line
                      data={dailyChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value) {
                                return formatCurrency(Number(value), currency);
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Card>
                )}

                {/* Category Breakdown Pie Chart */}
                {categoryChartData && (
                  <Card title="Expenses by Category">
                    <Pie
                      data={categoryChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.parsed, currency);
                                return `${label}: ${value}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Card>
                )}
              </div>

              {/* Category Breakdown Table */}
              {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
                <Card title="Category Breakdown">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.categoryBreakdown.map((item, index) => {
                          const percentage =
                            data.totalExpenses > 0
                              ? ((item.amount / data.totalExpenses) * 100).toFixed(1)
                              : '0';
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {item.category?.color && (
                                    <div
                                      className="w-4 h-4 rounded-full mr-2"
                                      style={{ backgroundColor: item.category.color }}
                                    />
                                  )}
                                  <span className="text-sm font-medium text-gray-900">
                                    {item.category?.name || 'Unknown'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.amount, currency)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {percentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
