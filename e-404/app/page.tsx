'use client';

import React, { useState } from 'react';
import Layout, { NavigationTab } from './components/Layout';
import SystemHealth from './components/SystemHealth';

// Placeholder components for different tabs
function PaymentTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-black">Create Payment</h2>
      <p className="text-gray-600">Payment creation form will be implemented here.</p>
    </div>
  );
}

function QRTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-black">Generate QR Code</h2>
      <p className="text-gray-600">QR code generation form will be implemented here.</p>
    </div>
  );
}

function StatusTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-black">Payment Status</h2>
      <p className="text-gray-600">Payment status checker will be implemented here.</p>
    </div>
  );
}

function HealthTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-black">System Health</h2>
      <SystemHealth />
    </div>
  );
}

function PendingTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-black">Pending Payments</h2>
      <p className="text-gray-600">Pending payments list will be implemented here.</p>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('payment');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment':
        return <PaymentTab />;
      case 'qr':
        return <QRTab />;
      case 'status':
        return <StatusTab />;
      case 'health':
        return <HealthTab />;
      case 'pending':
        return <PendingTab />;
      default:
        return <PaymentTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </Layout>
  );
}
