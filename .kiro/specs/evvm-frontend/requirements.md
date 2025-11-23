# Requirements Document

## Introduction

A simple, minimalist black and white frontend interface for the EVVM Fisher/Relayer payment system. The frontend will provide users with an intuitive way to create payments, generate QR codes, check payment status, and view system statistics through a clean, monochromatic design.

## Glossary

- **EVVM_API**: The backend Fisher/Relayer payment system running on port 3001
- **Payment_Interface**: The main user interface for creating and managing payments
- **QR_Generator**: Component for generating and displaying payment QR codes
- **Status_Monitor**: Interface for checking payment status and system health
- **MATE_Token**: The stablecoin token used for payments in the system

## Requirements

### Requirement 1

**User Story:** As a user, I want to create a new payment request, so that I can initiate a stablecoin transfer

#### Acceptance Criteria

1. WHEN the user accesses the payment creation form, THE Payment_Interface SHALL display input fields for recipient address, amount, token type, and optional description
2. WHEN the user submits a valid payment request, THE Payment_Interface SHALL send the request to EVVM_API and display the payment ID
3. IF the payment creation fails, THEN THE Payment_Interface SHALL display the error message to the user
4. THE Payment_Interface SHALL validate that the recipient address follows Ethereum address format
5. THE Payment_Interface SHALL validate that the amount is a positive number

### Requirement 2

**User Story:** As a user, I want to generate QR codes for payments, so that others can easily scan and process payments

#### Acceptance Criteria

1. WHEN the user requests QR generation with payment details, THE QR_Generator SHALL create a QR code using EVVM_API
2. THE QR_Generator SHALL display the generated QR code image in black and white format
3. WHEN QR generation is successful, THE QR_Generator SHALL show the QR data string below the image
4. IF QR generation fails, THEN THE QR_Generator SHALL display an error message
5. THE QR_Generator SHALL allow users to copy the QR data string to clipboard

### Requirement 3

**User Story:** As a user, I want to check the status of my payments, so that I can track transaction progress

#### Acceptance Criteria

1. WHEN the user enters a payment ID, THE Status_Monitor SHALL query EVVM_API for payment status
2. THE Status_Monitor SHALL display payment details including status, amount, addresses, and timestamp
3. WHILE a payment is pending, THE Status_Monitor SHALL show "pending" status with appropriate styling
4. WHEN a payment is completed, THE Status_Monitor SHALL show "completed" status with transaction hash if available
5. IF the payment ID is not found, THEN THE Status_Monitor SHALL display "Payment not found" message

### Requirement 4

**User Story:** As a user, I want to view system statistics and health, so that I can verify the system is operational

#### Acceptance Criteria

1. THE Status_Monitor SHALL display EVVM_API health status on the main dashboard
2. THE Status_Monitor SHALL show relayer address and current timestamp from health endpoint
3. THE Status_Monitor SHALL display system statistics including pending payments count
4. WHEN the API is unreachable, THE Status_Monitor SHALL display connection error status
5. THE Status_Monitor SHALL refresh health status automatically every 30 seconds

### Requirement 5

**User Story:** As a user, I want to view all pending payments, so that I can see what transactions are being processed

#### Acceptance Criteria

1. THE Payment_Interface SHALL display a list of all pending payments from EVVM_API
2. THE Payment_Interface SHALL show payment ID, amount, token, and timestamp for each pending payment
3. WHEN there are no pending payments, THE Payment_Interface SHALL display "No pending payments" message
4. THE Payment_Interface SHALL allow users to click on a payment ID to view detailed status
5. THE Payment_Interface SHALL refresh the pending payments list every 10 seconds

### Requirement 6

**User Story:** As a user, I want a clean black and white interface, so that I can focus on functionality without visual distractions

#### Acceptance Criteria

1. THE Payment_Interface SHALL use only black, white, and grayscale colors throughout the design
2. THE Payment_Interface SHALL use clear typography with high contrast for readability
3. THE Payment_Interface SHALL have a minimalist layout with ample white space
4. THE Payment_Interface SHALL use simple geometric shapes and clean lines for UI elements
5. THE Payment_Interface SHALL maintain consistent spacing and alignment across all components