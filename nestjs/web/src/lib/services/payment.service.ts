// web/src/lib/services/payment.service.ts
import { API_BASE_URL } from '../api';

export interface CreatePaymentIntentDto {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface ConfirmPaymentDto {
  paymentIntentId: string;
  orderId: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  private baseUrl = API_BASE_URL;

  async createPaymentIntent(data: CreatePaymentIntentDto): Promise<PaymentIntentResponse> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${this.baseUrl}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la création du paiement');
    const json = await res.json();
    return json.data;
  }

  async confirmPayment(data: ConfirmPaymentDto): Promise<PaymentResponse> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${this.baseUrl}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur lors de la confirmation du paiement');
    const json = await res.json();
    return json.data;
  }
}

export const paymentService = new PaymentService();
