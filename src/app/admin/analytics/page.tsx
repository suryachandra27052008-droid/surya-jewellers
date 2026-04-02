'use client';

import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your store performance and sales trends
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Detailed sales analytics, revenue charts, and customer insights will
          be available here once the store is live.
        </p>
      </div>
    </div>
  );
}
