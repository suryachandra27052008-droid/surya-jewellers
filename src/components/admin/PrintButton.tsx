'use client';
import { Printer } from 'lucide-react';
export default function PrintButton() {
  return <button onClick={() => window.print()} className="mb-6 inline-flex items-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm print:hidden"><Printer size={16} />Print packing slip</button>;
}
