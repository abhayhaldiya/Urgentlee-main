# Requirements Document

## Introduction

A comprehensive tailor booking platform that connects users with professional tailors for custom clothing services. The system consists of three client applications (User Mobile App, Tailor Mobile App, and Admin Web Panel) sharing a unified backend infrastructure. The platform handles the complete service lifecycle from booking to completion, including OTP-based authentication, location-based service matching, real-time slot management, payment processing, and order tracking.

## Glossary

- **User**: End customer who books tailoring services through the mobile application
- **Tailor**: Service provider who performs tailoring services and uses the tailor mobile application
- **Admin**: Platform administrator who manages the system through the web panel
- **Service**: A specific tailoring category (e.g., Blouse, Kurti, Suit)
- **Sub_Service**: Specific variant within a service category (e.g., Classic Blouse, Designer Blouse)
- **Slot**: Time-based booking window for tailor availability
- **Order**: Complete service booking including customizations, measurements, and payment
- **OTP_System**: One-time password authentication and verification system
- **Location_Zone**: Geographic area used for service availability and inventory mapping
- **Inventory**: Available fabric colors and materials in specific location zones
- **KYC**: Know Your Customer verification process for tailor onboarding

## Requirements

### Requirement 1: User Authentication and Profile Management

**User Story:** As a user, I want to authenticate using my phone number and manage my profile, so that I can securely access the platform and maintain my personal information.

#### Acceptance Criteria

1. WHEN a user opens the application for the first time, THE Authentication_System SHALL display a login screen requiring phone number input
2. WHEN a user enters a valid phone number, THE OTP_System SHALL send a verification code within 30 seconds
3. WHEN a user enters the correct OTP, THE Authentication_System SHALL grant access to the application
4. WHEN a first-time user completes OTP verification, THE Profile_System SHALL require completion of profile creation with name, optional email, gender, and optional redeem code
5. WHEN a returning user completes OTP verification, THE Authentication_System SHALL redirect to the dashboard without additional profile steps

### Requirement 2: Location Services and Permissions

**User Story:** As a user, I want to set my location for service availability, so that I can access tailors and services in my area.

#### Acceptance Criteria

1. WHEN a user completes authentication, THE Permission_System SHALL request location access permission
2. WHEN a user grants location permission and selects "Current Location", THE Location_System SHALL detect and save the user's coordinates within 10 seconds
3. WHEN a user selects manual location entry, THE Location_System SHALL allow address input and coordinate mapping
4. WHEN a location is saved, THE Service_System SHALL use it for tailor availability and inventory mapping
5. THE Location_System SHALL display the selected location prominently on the home screen

### Requirement 3: Service Discovery and Selection

**User Story:** As a user, I want to browse and select tailoring services, so that I can find the specific service I need.

#### Acceptance Criteria

1. THE Dashboard SHALL display available services categorized as "Services for women" and "Most booked services"
2. WHEN a user selects a service, THE Service_System SHALL display available sub-services with pricing information
3. WHEN a user selects a sub-service, THE Service_System SHALL show detailed information including base price, estimated time, and description
4. THE Service_System SHALL enforce single service selection per order
5. WHEN service details are displayed, THE Service_System SHALL provide a "Book Now" button for proceeding to customization

### Requirement 4: Service Customization and Pricing

**User Story:** As a user, I want to customize my selected service with specific options, so that I can get exactly what I need.

#### Acceptance Criteria

1. WHEN a user proceeds from service selection, THE Customization_System SHALL display service-specific customization forms
2. WHEN a user selects customization options, THE Pricing_System SHALL update the total price dynamically
3. THE Customization_System SHALL display price impact for each option selection
4. WHERE applicable, THE Customization_System SHALL show preview icons for design options
5. THE Customization_System SHALL save all selected customizations for order processing

### Requirement 5: Measurements and Reference Management

**User Story:** As a user, I want to provide measurements and reference images, so that the tailor can deliver accurate fitting and design.

#### Acceptance Criteria

1. THE Measurement_System SHALL allow users to enter new measurements or select from previously saved measurements
2. THE Reference_System SHALL allow users to upload multiple reference images for design guidance
3. WHEN measurements are provided, THE Measurement_System SHALL validate and save them for future use
4. THE Reference_System SHALL support common image formats (JPEG, PNG) up to 10MB per image
5. THE Measurement_System SHALL make measurements optional based on service type requirements

### Requirement 6: Fabric Color Detection and Inventory Matching

**User Story:** As a user, I want the system to help me match fabric colors with available inventory, so that I can ensure color consistency for my garment.

#### Acceptance Criteria

1. WHEN a user uploads fabric images, THE Color_Detection_System SHALL attempt to identify the base fabric color using image processing
2. WHEN a color is detected, THE Inventory_System SHALL match it against available inventory in the user's location zone
3. WHEN exact color matches are found, THE Inventory_System SHALL display them as primary options
4. WHEN exact matches are unavailable, THE Inventory_System SHALL recommend closest available colors
5. THE Inventory_System SHALL always display all available colors for manual selection

### Requirement 7: Slot Selection and Tailor Assignment

**User Story:** As a user, I want to select a convenient time slot for my service, so that I can schedule the appointment according to my availability.

#### Acceptance Criteria

1. WHEN a user proceeds to booking, THE Slot_System SHALL display available date and time slots
2. WHEN a user selects a slot, THE Assignment_System SHALL automatically assign an available tailor in the location zone
3. WHEN a slot is selected, THE Lock_System SHALL reserve it for 5 minutes to prevent double booking
4. THE Assignment_System SHALL ensure one tailor handles only one order at a time
5. THE Slot_System SHALL hide tailor identity from users during the booking process

### Requirement 8: Payment Processing and Order Creation

**User Story:** As a user, I want to complete payment for my booking, so that I can confirm my tailoring service appointment.

#### Acceptance Criteria

1. WHEN a user proceeds to payment, THE Payment_System SHALL display complete price breakdown including service cost, customizations, and taxes
2. WHEN payment is initiated, THE Payment_System SHALL support UPI and card payment methods through Razorpay
3. WHEN payment succeeds, THE Order_System SHALL create the order, confirm slot assignment, and reduce inventory quantities
4. WHEN payment fails or times out, THE Lock_System SHALL release the reserved slot and make the tailor available
5. THE Payment_System SHALL process payments within 30 seconds of initiation

### Requirement 9: Order Tracking and Management

**User Story:** As a user, I want to track my orders and manage them as needed, so that I can stay informed about my service status.

#### Acceptance Criteria

1. THE Order_System SHALL categorize orders as Active, Completed, or Cancelled in the Orders section
2. WHEN an order is created, THE Order_System SHALL display complete order details including service information, timing, location, and price breakdown
3. THE Order_System SHALL allow order cancellation according to the platform's cancellation policy
4. THE Tracking_System SHALL provide real-time status updates for active orders
5. THE Order_System SHALL maintain order history for user reference

### Requirement 10: Service Execution and OTP Verification

**User Story:** As a user, I want secure verification when the tailor arrives and completes service, so that I can ensure service authenticity and completion.

#### Acceptance Criteria

1. WHEN a tailor arrives at the service location, THE OTP_System SHALL send a start-service OTP to the user
2. WHEN the tailor enters the correct start OTP, THE Service_System SHALL mark the service as in-progress
3. WHEN service is completed, THE OTP_System SHALL send a completion OTP to the user
4. WHEN the tailor enters the correct completion OTP, THE Service_System SHALL mark the order as completed
5. IF OTP verification fails, THE Admin_System SHALL provide manual order completion capability

### Requirement 11: Tailor Authentication and KYC

**User Story:** As a tailor, I want to register and complete verification, so that I can provide services through the platform.

#### Acceptance Criteria

1. WHEN a tailor opens the application, THE Registration_System SHALL require phone number registration and OTP verification
2. WHEN registration is complete, THE KYC_System SHALL require submission of personal details, Aadhaar, and PAN documentation
3. THE KYC_System SHALL collect tailor photo, full name, age, email, Aadhaar number with images, and PAN number with images
4. WHEN KYC is submitted, THE Approval_System SHALL set tailor status to "Waiting for Admin Approval"
5. WHILE approval is pending, THE Access_System SHALL restrict tailor access to dashboard only without order visibility

### Requirement 12: Tailor Order Management and Service Execution

**User Story:** As a tailor, I want to manage assigned orders and execute services, so that I can provide quality service and earn income.

#### Acceptance Criteria

1. WHEN a tailor is approved, THE Dashboard SHALL display all assigned orders with user details, service information, and scheduling
2. THE Order_System SHALL allow tailors to cancel assigned orders or mark themselves unavailable
3. WHEN a tailor reaches the service location, THE Service_System SHALL provide "Arrived for Order" functionality
4. THE Service_System SHALL require OTP entry for both service start and completion
5. THE Order_System SHALL update order status to completed when final OTP is verified

### Requirement 13: Admin Panel Management

**User Story:** As an admin, I want comprehensive platform management capabilities, so that I can oversee operations, resolve issues, and maintain service quality.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide tailor KYC approval and rejection capabilities with reason tracking
2. THE Admin_Panel SHALL allow order reassignment between tailors when necessary
3. THE Admin_Panel SHALL provide inventory management for all location zones
4. THE Admin_Panel SHALL offer payment hold and refund processing capabilities
5. THE Admin_Panel SHALL display comprehensive analytics including order volumes, revenue, and performance metrics

### Requirement 14: Payment Release and Commission Management

**User Story:** As a platform operator, I want automated payment processing with commission deduction, so that tailors are paid fairly while the platform earns revenue.

#### Acceptance Criteria

1. WHEN an order is completed, THE Payment_System SHALL hold payment for up to 2 hours for issue resolution
2. IF no complaints are raised within the hold period, THE Payment_System SHALL release payment to the tailor
3. WHEN payment is released, THE Commission_System SHALL deduct platform commission before transfer
4. IF a complaint is raised, THE Admin_System SHALL have authority to hold payment indefinitely
5. THE Refund_System SHALL process refunds only through admin panel authorization

### Requirement 15: Real-time Communication and Notifications

**User Story:** As a user or tailor, I want timely notifications about order updates, so that I can stay informed about important events.

#### Acceptance Criteria

1. THE Notification_System SHALL send push notifications for order confirmations, tailor assignments, and status updates
2. THE Notification_System SHALL send SMS notifications for OTP delivery and critical order updates
3. THE Communication_System SHALL provide support contact functionality for both users and tailors
4. THE Notification_System SHALL allow users to configure notification preferences
5. THE Real_Time_System SHALL update order status across all client applications simultaneously