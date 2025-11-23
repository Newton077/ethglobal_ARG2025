'use client';

import { useState, memo, useCallback } from 'react';
import { cn } from '../lib/utils';
import SystemHealth from './SystemHealth';
import ErrorBoundary from './ErrorBoundary';

// Navigation tab types
export type NavigationTab = 'payment' | 'qr' | 'status' | 'health' | 'pending';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
}

const navigationTabs: { id: NavigationTab; label: string }[] = [
  { id: 'payment', label: 'Payment' },
  { id: 'qr', label: 'QR Code' },
  { id: 'status', label: 'Status' },
  { id: 'health', label: 'Health' },
  { id: 'pending', label: 'Pending' },
];

const Layout = memo(function Layout({
  children,
  activeTab = 'payment',
  onTabChange,
}: LayoutProps) {
  const [currentTab, setCurrentTab] = useState<NavigationTab>(activeTab);

  const handleTabClick = useCallback((tab: NavigationTab) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* System Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold">ScanGo</h1>
            </div>

            {/* Health Status Display */}
            <div className="flex items-center">
              <ErrorBoundary fallback={
                <div className="text-xs text-gray-300">Health: Unavailable</div>
              }>
                <SystemHealth compact={true} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-0">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                  'hover:text-black hover:border-gray-300',
                  currentTab === tab.id
                    ? 'text-black border-black bg-gray-50'
                    : 'text-gray-500 border-transparent'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <ErrorBoundary fallback={
                  <div className="text-center py-8">
                    <div className="text-gray-600 mb-2">Content temporarily unavailable</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Refresh Page
                    </button>
                  </div>
                }>
                  {children}
                </ErrorBoundary>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4">
              <div className="space-y-6">
                {/* System Information Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    System Information
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>ScanGo Payment System</div>
                    <div>Port: 3001</div>
                    <ErrorBoundary fallback={
                      <div className="text-xs text-gray-500">Health: Error</div>
                    }>
                      <SystemHealth compact={true} className="mt-2" />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleTabClick('payment')}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded border',
                        'hover:bg-white hover:border-gray-300 transition-colors',
                        currentTab === 'payment'
                          ? 'bg-white border-black text-black'
                          : 'bg-transparent border-gray-200 text-gray-600'
                      )}
                    >
                      Create Payment
                    </button>
                    <button
                      onClick={() => handleTabClick('qr')}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded border',
                        'hover:bg-white hover:border-gray-300 transition-colors',
                        currentTab === 'qr'
                          ? 'bg-white border-black text-black'
                          : 'bg-transparent border-gray-200 text-gray-600'
                      )}
                    >
                      Generate QR Code
                    </button>
                    <button
                      onClick={() => handleTabClick('status')}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded border',
                        'hover:bg-white hover:border-gray-300 transition-colors',
                        currentTab === 'status'
                          ? 'bg-white border-black text-black'
                          : 'bg-transparent border-gray-200 text-gray-600'
                      )}
                    >
                      Check Status
                    </button>
                    <button
                      onClick={() => handleTabClick('pending')}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm rounded border',
                        'hover:bg-white hover:border-gray-300 transition-colors',
                        currentTab === 'pending'
                          ? 'bg-white border-black text-black'
                          : 'bg-transparent border-gray-200 text-gray-600'
                      )}
                    >
                      View Pending
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
});

export default Layout;

// Navigation tab type is already exported at the top