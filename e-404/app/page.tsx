'use client';

import React, { useState } from 'react';
import Layout, { NavigationTab } from './components/Layout';
import SystemHealth from './components/SystemHealth';
import PaymentContainer from './components/PaymentContainer';
import QRGenerator from './components/QRGenerator';
import PaymentStatus from './components/PaymentStatus';
import PendingPayments from './components/PendingPayments';
import ErrorBoundary from './components/ErrorBoundary';

// Payment tab with integrated PaymentContainer component
function PaymentTab() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Create Payment</h2>
          <p className="text-gray-600">Create a new stablecoin payment request</p>
        </div>

        {/* Payment Container with Form and Success States */}
        <PaymentContainer className="max-w-lg mx-auto" />
      </div>
    </ErrorBoundary>
  );
}

function QRTab() {
  return (
    <ErrorBoundary>
      <QRGenerator />
    </ErrorBoundary>
  );
}

function StatusTab({ paymentId }: { paymentId?: string }) {
  return (
    <ErrorBoundary>
      <PaymentStatus initialPaymentId={paymentId} />
    </ErrorBoundary>
  );
}

function HealthTab() {
  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-black">System Health</h2>
        <SystemHealth />
      </div>
    </ErrorBoundary>
  );
}

function PendingTab({ onPaymentClick }: { onPaymentClick: (paymentId: string) => void }) {
  return (
    <ErrorBoundary>
      <PendingPayments onPaymentClick={onPaymentClick} />
    </ErrorBoundary>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('payment');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

  // Handle navigation from pending payments to payment status
  const handlePaymentNavigation = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setActiveTab('status');
  };

  // Clear selected payment ID when switching tabs (except to status tab)
  const handleTabChange = (tab: NavigationTab) => {
    if (tab !== 'status') {
      setSelectedPaymentId('');
    }
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment':
        return <PaymentTab />;
      case 'qr':
        return <QRTab />;
      case 'status':
        return <StatusTab paymentId={selectedPaymentId} />;
      case 'health':
        return <HealthTab />;
      case 'pending':
        return <PendingTab onPaymentClick={handlePaymentNavigation} />;
      default:
        return <PaymentTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </Layout>
  );
}
