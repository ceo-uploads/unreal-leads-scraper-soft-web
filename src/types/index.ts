export type Language = 'en' | 'bn';

export interface Translation {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isAdmin?: boolean;
  freeTrialUsed?: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  packageId: string;
  method: 'bkash' | 'nagad' | 'nsave' | 'gpay' | 'binance';
  accountNumber: string;
  trxId: string;
  amount: number;
  currency: 'BDT' | 'USD';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  deliveryContact: string; // WhatsApp or Email
}

export interface SoftwarePackage {
  id: string;
  name: { en: string; bn: string };
  duration: string;
  priceUSD: number;
  priceBDT: number;
  features: string[];
}

export interface ActiveSubscription {
  id: string;
  userId: string;
  packageId: string;
  softwareUser: string;
  softwarePass: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'expired';
}
