// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
    suggestedAction?: string;
  };
  timestamp: string;
  requestId?: string;
}

// User Types
export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  profileImage?: string;
  redeemCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tailor {
  id: string;
  phoneNumber: string;
  name: string;
  email: string;
  age: number;
  profileImage: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isAvailable: boolean;
  rating: number;
  totalOrders: number;
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface LoginRequest {
  phoneNumber: string;
  userType: 'USER' | 'TAILOR';
}

export interface OTPVerificationRequest {
  otpId: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  isNewUser?: boolean;
  user?: User | Tailor;
}

// Location Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  zoneId: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedTime: number;
  isActive: boolean;
}

export interface SubService {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedTime: number;
  customizationOptions: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  choices: CustomizationChoice[];
}

export interface CustomizationChoice {
  id: string;
  name: string;
  priceModifier: number;
  previewImage?: string;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  tailorId?: string;
  subServiceId: string;
  addressId: string;
  scheduledDate: string;
  scheduledTime: string;
  fabricColor: string;
  status: OrderStatus;
  customizations: SelectedCustomization[];
  measurements?: Measurement[];
  referenceImages: string[];
  pricing?: OrderPricing;
  payment?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'TAILOR_ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface SelectedCustomization {
  choiceId: string;
  choice: CustomizationChoice;
}

export interface Measurement {
  name: string;
  value: number;
  unit: string;
}

export interface SavedMeasurement {
  id: string;
  userId: string;
  name: string;
  measurements: Measurement[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementValidationRule {
  name: string;
  required: boolean;
  minValue?: number;
  maxValue?: number;
  unit: string;
}

export interface ServiceMeasurementRequirement {
  subServiceId: string;
  isRequired: boolean;
  measurements: MeasurementValidationRule[];
}

export interface MeasurementValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface OrderPricing {
  basePrice: number;
  customizationCost: number;
  taxes: number;
  totalAmount: number;
  platformCommission: number;
  tailorEarnings: number;
}

// Payment Types
export interface PaymentDetails {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method?: string;
  holdUntil?: string;
  releasedAt?: string;
  refundId?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
}

// Booking Types
export interface BookingRequest {
  subServiceId: string;
  addressId: string;
  scheduledDate: string;
  scheduledTime: string;
  customizations: string[]; // Array of choice IDs
  measurements?: Measurement[];
  referenceImages?: string[];
  fabricColor: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

// Color Detection Types
export interface ColorMatch {
  color: ColorInventoryItem;
  confidence: number;
  isExactMatch: boolean;
}

export interface ColorInventoryItem {
  id: string;
  colorName: string;
  colorCode: string;
  hexValue: string;
  availableQuantity: number;
  isActive: boolean;
}

export interface ColorDetectionResponse {
  detectedColor: {
    hex: string;
    name: string;
    confidence: number;
  };
  matches: ColorMatch[];
  recommendations: ColorMatch[];
  allAvailableColors: ColorInventoryItem[];
}

export interface ColorPalette {
  dominantColor: string;
  palette: string[];
  confidence: number;
}

// Inventory Types
export interface ColorInventory {
  id: string;
  colorName: string;
  colorCode: string;
  hexValue: string;
  availableQuantity: number;
  isActive: boolean;
}

export interface ColorMatch {
  color: ColorInventory;
  confidence: number;
  isExactMatch: boolean;
}

// KYC Types
export interface KYCData {
  aadhaarNumber: string;
  aadhaarFrontImage: string;
  aadhaarBackImage: string;
  panNumber: string;
  panFrontImage: string;
  panBackImage: string;
}

// Notification Types
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

// Reference Image Types
export interface ReferenceImageData {
  id: string;
  orderId: string;
  imageUrl: string;
  createdAt: string;
}

export interface ImageUploadResult {
  id: string;
  imageUrl: string;
  originalName?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ImageLimits {
  maxImages: number;
  currentCount: number;
  remainingSlots: number;
  maxFileSize: number;
  supportedFormats: string[];
}

// Utility Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}