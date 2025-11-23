# Design Document - EVVM Frontend

## Overview

A minimalist black and white frontend interface for the EVVM Fisher/Relayer payment system built with Next.js 16, React 19, and Tailwind CSS. The design emphasizes simplicity, functionality, and high contrast for optimal usability while providing all essential payment management features.

## Architecture

### Technology Stack
- **Framework**: Next.js 16.0.3 with App Router
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4 (monochromatic theme)
- **Language**: TypeScript 5
- **API Communication**: Native fetch API with EVVM_API on port 3001
- **QR Code Display**: HTML5 Canvas or SVG rendering
- **Auto-refresh**: React hooks with setInterval for real-time updates

### Project Structure
```
e-404/
├── app/
│   ├── components/
│   │   ├── PaymentForm.tsx
│   │   ├── QRGenerator.tsx
│   │   ├── PaymentStatus.tsx
│   │   ├── SystemHealth.tsx
│   │   ├── PendingPayments.tsx
│   │   └── Layout.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
└── public/
    └── icons/ (minimal black icons)
```

## Components and Interfaces

### 1. Main Layout Component
**Purpose**: Provides consistent navigation and layout structure with system health monitoring

**Features**:
- Header with system title and EVVM_API health indicator
- Navigation tabs for different sections (Payment, QR, Status, Health, Pending)
- System health status display in header
- Responsive grid layout for components
- Connection status monitoring

**Design Elements**:
- Black header with white text and health indicator
- White background with black borders throughout
- Simple tab navigation with underline indicators
- Minimalist layout with ample white space
- Consistent spacing and alignment across components

**API Integration**:
- Displays real-time EVVM_API connection status
- Integrates with SystemHealth component for header status

### 2. PaymentForm Component
**Purpose**: Create new payment requests for stablecoin transfers

**Features**:
- Input fields for recipient address, amount, token type, and optional description
- Ethereum address format validation for recipient field
- Positive number validation for amount field
- Submit to EVVM_API POST /api/payments endpoint
- Display payment ID on successful creation
- Error message display for failed requests
- Loading states during submission

**Design Elements**:
- Clean form layout with clearly labeled inputs
- Black borders on white backgrounds
- Inline validation error messages in dark gray
- Success state showing generated payment ID
- Minimal button styling with hover and loading states

**API Integration**:
- Sends payment requests to EVVM_API
- Handles success response with payment ID display
- Manages error responses with user-friendly messages

### 3. QRGenerator Component
**Purpose**: Generate and display payment QR codes using EVVM_API

**Features**:
- Form for QR generation with payment details (to, amount, token, description)
- QR code generation via EVVM_API
- Black and white QR code image display
- QR data string display below the image
- Copy-to-clipboard functionality for QR data
- Error message display for failed QR generation

**Design Elements**:
- Centered QR code display area
- Monospace font for QR data string
- Simple copy button with visual feedback
- Pure black QR code on white background
- Error state styling for generation failures

**API Integration**:
- Calls EVVM_API QR generation endpoint
- Handles successful QR response with image and data display
- Manages QR generation errors with appropriate messaging

### 4. PaymentStatus Component
**Purpose**: Check individual payment status by payment ID

**Features**:
- Payment ID input field with validation
- Payment details display (status, amount, addresses, timestamp)
- Status indicators (pending/completed/failed) with appropriate styling
- Transaction hash display when available for completed payments
- "Payment not found" message for invalid IDs

**Design Elements**:
- Status badges with different border styles for visual distinction
- Monospace font for addresses, hashes, and payment IDs
- Clean data presentation in labeled rows
- Grayscale status indicators without color coding
- Error state styling for not found payments

**API Integration**:
- Queries EVVM_API payment status endpoint with payment ID
- Handles API errors gracefully with user-friendly messages

### 5. SystemHealth Component
**Purpose**: Display EVVM_API system status and health monitoring

**Features**:
- EVVM_API connection status indicator
- Relayer address display from health endpoint
- Current timestamp from health endpoint
- System statistics including pending payments count
- Auto-refresh every 30 seconds
- Connection error handling when API is unreachable

**Design Elements**:
- Status indicators using geometric shapes (circles, squares)
- Grid layout for health metrics and statistics
- Monospace font for relayer address display
- Clear visual hierarchy with typography
- Error state styling for connection failures

**API Integration**:
- Calls EVVM_API health endpoint for status information
- Implements 30-second auto-refresh cycle
- Graceful degradation when API is unavailable

### 6. PendingPayments Component
**Purpose**: Display list of all pending payments from EVVM_API

**Features**:
- Complete list of pending payments (no pagination required)
- Display payment ID, amount, token, and timestamp for each payment
- Clickable payment IDs to view detailed status
- Auto-refresh every 10 seconds
- Empty state with "No pending payments" message
- Real-time updates of payment list

**Design Elements**:
- Table layout with clean rows and columns
- Clickable payment IDs with hover effects
- Monospace font for payment IDs and timestamps
- Empty state styling with centered message
- Consistent spacing and alignment

**API Integration**:
- Fetches pending payments from EVVM_API
- Implements 10-second auto-refresh cycle
- Handles empty response with appropriate messaging

## API Integration

### EVVM_API Endpoints
The frontend integrates with the EVVM Fisher/Relayer system running on port 3001:

- **Health Check**: `GET /health` - System status and relayer information
- **Payment Creation**: `POST /api/payments` - Create new payment requests
- **Payment Status**: `GET /api/payments/{id}` - Check individual payment status
- **QR Generation**: `POST /api/qr` - Generate QR codes for payments
- **Pending Payments**: `GET /api/payments/pending` - List all pending payments
- **System Statistics**: `GET /api/stats` - System metrics and statistics

### Auto-Refresh Behavior
- **SystemHealth**: Refreshes every 30 seconds to monitor API connectivity
- **PendingPayments**: Refreshes every 10 seconds for real-time payment tracking
- **Error Handling**: Graceful degradation when EVVM_API is unreachable

### Connection Management
- Centralized API utility functions for consistent error handling
- Timeout management for API requests
- Retry logic for failed requests
- User-friendly error messages for connection issues

## Data Models

### API Response Types
```typescript
// EVVM_API Health Endpoint Response
interface HealthResponse {
  status: string;
  relayerAddress: string;
  timestamp: number;
}

// System Statistics Response
interface StatsResponse {
  fisher: {
    totalPayments: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
  };
  relayer: {
    isRunning: boolean;
    lastProcessedAt: number;
  };
  gasSponsorship: {
    balance: string;
    isActive: boolean;
  };
}

// Payment Object from EVVM_API
interface Payment {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  txHash?: string; // Available when payment is completed
  metadata?: {
    description?: string;
    orderId?: string;
  };
}

// QR Generation Response from EVVM_API
interface QRResponse {
  qrData: string;
  deepLink: string;
  description: string;
}

// Payment Creation Response
interface PaymentCreateResponse {
  paymentId: string;
  status: string;
}

// Pending Payments List Response
interface PendingPaymentsResponse {
  payments: Payment[];
}
```

### Form Data Types
```typescript
// Payment Creation Form Data
interface PaymentFormData {
  from: string;
  to: string; // Must be valid Ethereum address format
  amount: string; // Must be positive number
  token: string; // MATE_Token or other supported tokens
  description?: string; // Optional description field
}

// QR Code Generation Form Data
interface QRFormData {
  to: string; // Recipient address for QR code
  amount: string; // Payment amount
  token: string; // Token type
  description?: string; // Optional payment description
}

// Payment Status Check Form Data
interface PaymentStatusFormData {
  paymentId: string; // Payment ID to check status
}
```

## Error Handling

### API Error Management
- Centralized error handling in API utility functions
- User-friendly error messages for common scenarios
- Network error detection and retry mechanisms
- Graceful degradation when API is unavailable

### Form Validation
- Client-side validation for all input fields
- Ethereum address format validation for recipient addresses
- Positive number validation for payment amounts
- Required field validation with clear inline feedback
- Payment ID format validation for status checks
- Real-time validation with immediate error display

### Error Display Strategy
- Inline error messages for form fields
- Toast notifications for API errors
- Error boundaries for component failures
- Fallback UI states for network issues

## Testing Strategy

### Component Testing
- Unit tests for individual components using Jest and React Testing Library
- Form validation testing
- API integration testing with mocked responses
- Error state testing

### Integration Testing
- End-to-end user flows
- API connectivity testing
- Cross-browser compatibility
- Responsive design testing

### Manual Testing Checklist
- Payment creation flow
- QR code generation and display
- Status checking functionality
- System health monitoring
- Error handling scenarios

## Design System

### Color Palette
```css
:root {
  --color-primary: #000000;      /* Pure black */
  --color-secondary: #ffffff;    /* Pure white */
  --color-gray-light: #f5f5f5;   /* Light gray backgrounds */
  --color-gray-medium: #666666;  /* Medium gray text */
  --color-gray-dark: #333333;    /* Dark gray borders */
  --color-error: #444444;        /* Dark gray for errors */
  --color-success: #222222;      /* Very dark gray for success */
}
```

### Typography
- **Primary Font**: System font stack (Arial, Helvetica, sans-serif)
- **Monospace Font**: For addresses, hashes, and technical data
- **Font Sizes**: Consistent scale (12px, 14px, 16px, 18px, 24px, 32px)
- **Font Weights**: Regular (400) and Bold (700) only

### Spacing System
- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Consistent margins and padding throughout**

### Component Styling Guidelines
- **Buttons**: Black border, white background, black text, hover states
- **Inputs**: Black border, white background, focus states
- **Cards**: White background, subtle gray border
- **Tables**: Alternating row backgrounds, clean borders
- **Status Indicators**: Geometric shapes, border variations

## Performance Considerations

### Optimization Strategies
- Next.js automatic code splitting
- Component lazy loading where appropriate
- Efficient re-rendering with React.memo for auto-refreshing components
- Proper cleanup of intervals for auto-refresh functionality

### Auto-Refresh Management
- SystemHealth component: 30-second refresh interval
- PendingPayments component: 10-second refresh interval
- Proper interval cleanup on component unmount
- Pause refresh when API is unreachable to prevent excessive requests

### Caching Strategy
- API response caching for health checks
- Local storage for user preferences
- Optimistic updates for better UX
- Background refresh for live data without blocking UI

### Bundle Size Management
- Minimal external dependencies
- Tree-shaking optimization
- Image optimization (if any icons needed)
- CSS purging with Tailwind

## Security Considerations

### Input Validation
- Strict Ethereum address validation
- Numeric input sanitization
- XSS prevention measures
- CSRF protection (built into Next.js)

### API Communication
- HTTPS enforcement in production
- Request timeout handling
- Rate limiting awareness
- Sensitive data handling (no private keys in frontend)

## Deployment Strategy

### Build Configuration
- Production build optimization
- Environment variable management
- Static asset optimization
- Error reporting setup

### Hosting Considerations
- Static site generation where possible
- CDN deployment for global access
- Environment-specific configurations
- Monitoring and analytics setup