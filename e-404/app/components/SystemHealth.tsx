'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../lib/api';
import { HealthResponse, REFRESH_INTERVALS } from '../lib/types';
import { formatTimestamp, cn } from '../lib/utils';

interface SystemHealthProps {
  className?: string;
  compact?: boolean; // For header display vs full display
}

interface HealthState {
  isConnected: boolean;
  relayerAddress?: string;
  timestamp?: number;
  error?: string;
  isLoading: boolean;
  lastUpdated?: number;
}

export default function SystemHealth({ className, compact = false }: SystemHealthProps) {
  const [healthState, setHealthState] = useState<HealthState>({
    isConnected: false,
    isLoading: true,
  });

  const fetchHealth = useCallback(async () => {
    try {
      setHealthState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const response = await getHealth();
      
      if (response.success && response.data) {
        setHealthState({
          isConnected: true,
          relayerAddress: response.data.relayerAddress,
          timestamp: response.data.timestamp,
          isLoading: false,
          lastUpdated: Date.now(),
        });
      } else {
        setHealthState({
          isConnected: false,
          error: response.error?.message || 'Failed to fetch health status',
          isLoading: false,
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      setHealthState({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        isLoading: false,
        lastUpdated: Date.now(),
      });
    }
  }, []);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchHealth();
    
    const interval = setInterval(fetchHealth, REFRESH_INTERVALS.HEALTH_CHECK);
    
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Compact header display
  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2 text-sm', className)}>
        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-1">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              healthState.isConnected
                ? 'bg-white'
                : healthState.isLoading
                ? 'bg-gray-400 animate-pulse'
                : 'bg-gray-600'
            )}
          />
          <span className="text-xs">
            {healthState.isConnected
              ? 'Connected'
              : healthState.isLoading
              ? 'Checking...'
              : 'Disconnected'}
          </span>
        </div>

        {/* Relayer Address (truncated) */}
        {healthState.isConnected && healthState.relayerAddress && (
          <div className="text-xs font-mono">
            {`${healthState.relayerAddress.slice(0, 6)}...${healthState.relayerAddress.slice(-4)}`}
          </div>
        )}

        {/* Last Updated */}
        {healthState.lastUpdated && (
          <div className="text-xs text-gray-300">
            {formatTimestamp(Math.floor(healthState.lastUpdated / 1000))}
          </div>
        )}
      </div>
    );
  }

  // Full display for health tab
  return (
    <div className={cn('space-y-6', className)}>
      {/* Connection Status Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-black">EVVM API Status</h2>
          <button
            onClick={fetchHealth}
            disabled={healthState.isLoading}
            className={cn(
              'px-3 py-1 text-sm border rounded',
              'hover:bg-gray-50 transition-colors',
              healthState.isLoading
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700'
            )}
          >
            {healthState.isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Connection Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Connection Status</div>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  healthState.isConnected
                    ? 'bg-black'
                    : healthState.isLoading
                    ? 'bg-gray-400 animate-pulse'
                    : 'bg-gray-600'
                )}
              />
              <span className={cn(
                'text-sm font-medium',
                healthState.isConnected ? 'text-black' : 'text-gray-600'
              )}>
                {healthState.isConnected
                  ? 'Connected'
                  : healthState.isLoading
                  ? 'Checking connection...'
                  : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Last Updated</div>
            <div className="text-sm text-gray-600">
              {healthState.lastUpdated
                ? formatTimestamp(Math.floor(healthState.lastUpdated / 1000))
                : 'Never'}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {healthState.error && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
            <div className="text-sm font-medium text-gray-900 mb-1">Connection Error</div>
            <div className="text-sm text-gray-600">{healthState.error}</div>
          </div>
        )}
      </div>

      {/* Relayer Information Card */}
      {healthState.isConnected && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-black mb-4">Relayer Information</h3>
          
          <div className="space-y-4">
            {/* Relayer Address */}
            {healthState.relayerAddress && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Relayer Address</div>
                <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                  {healthState.relayerAddress}
                </div>
              </div>
            )}

            {/* Server Timestamp */}
            {healthState.timestamp && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Server Timestamp</div>
                <div className="text-sm text-gray-600">
                  {formatTimestamp(healthState.timestamp)}
                </div>
              </div>
            )}

            {/* Auto-refresh Info */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Auto-refresh</div>
              <div className="text-sm text-gray-600">
                Updates every {REFRESH_INTERVALS.HEALTH_CHECK / 1000} seconds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Endpoints Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-black mb-4">API Endpoints</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-mono">/health</span>
            <span className={cn(
              'px-2 py-1 text-xs rounded',
              healthState.isConnected
                ? 'bg-gray-100 text-black'
                : 'bg-gray-50 text-gray-500'
            )}>
              {healthState.isConnected ? 'Available' : 'Unavailable'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-mono">/api/payments</span>
            <span className={cn(
              'px-2 py-1 text-xs rounded',
              healthState.isConnected
                ? 'bg-gray-100 text-black'
                : 'bg-gray-50 text-gray-500'
            )}>
              {healthState.isConnected ? 'Available' : 'Unavailable'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-mono">/api/qr</span>
            <span className={cn(
              'px-2 py-1 text-xs rounded',
              healthState.isConnected
                ? 'bg-gray-100 text-black'
                : 'bg-gray-50 text-gray-500'
            )}>
              {healthState.isConnected ? 'Available' : 'Unavailable'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-mono">/api/stats</span>
            <span className={cn(
              'px-2 py-1 text-xs rounded',
              healthState.isConnected
                ? 'bg-gray-100 text-black'
                : 'bg-gray-50 text-gray-500'
            )}>
              {healthState.isConnected ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export health state type for use in other components
export type { HealthState };