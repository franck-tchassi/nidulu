// web/src/services/orders.service.ts
// web/src/services/orders.service.ts
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress?: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

class OrdersService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Retourne un objet vide ou message utilisateur pour 404
          return Promise.reject({ userMessage: "Aucune commande trouvée." });
        }
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      // Si l'erreur contient un message utilisateur, la renvoyer
      if (
        error &&
        typeof error === 'object' &&
        'userMessage' in error &&
        typeof (error as any).userMessage === 'string'
      ) {
        throw new Error((error as any).userMessage);
      }
      throw error;
    }
  }

  // Créer une commande
  async createOrder(orderData: CreateOrderDto): Promise<OrdersResponse> {
    return this.request<OrdersResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Récupérer les commandes de l'utilisateur
  async getUserOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedOrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedOrdersResponse>(endpoint);
  }

  // Récupérer une commande spécifique
  async getOrder(orderId: string): Promise<OrdersResponse> {
    return this.request<OrdersResponse>(`/orders/${orderId}`);
  }

  // Annuler une commande
  async cancelOrder(orderId: string): Promise<OrdersResponse> {
    return this.request<OrdersResponse>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Mettre à jour une commande
  async updateOrder(orderId: string, updateData: any): Promise<OrdersResponse> {
    return this.request<OrdersResponse>(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }
}

export const ordersService = new OrdersService();