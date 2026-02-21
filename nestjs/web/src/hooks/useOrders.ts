// web/src/hooks/useOrders.ts
// web/src/hooks/useOrders.ts
import { useState, useCallback } from 'react';
import { ordersService, Order, PaginatedOrdersResponse, OrdersResponse, CreateOrderDto } from '@/lib/services/orders.service';
import { useAuth } from '@/context/auth-context';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const { isAuthenticated } = useAuth();

  // Récupérer les commandes de l'utilisateur
  const fetchUserOrders = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour voir vos commandes');
      return { data: [], total: 0, page: 1, limit: 10 };
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersService.getUserOrders(params);
      setOrders(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
      });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération des commandes';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Créer une commande
  const createOrder = useCallback(async (orderData: CreateOrderDto) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour créer une commande');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersService.createOrder(orderData);
      // Ajouter la nouvelle commande à la liste
      setOrders(prev => [response.data, ...prev]);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la commande';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Annuler une commande
  const cancelOrder = useCallback(async (orderId: string) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour annuler une commande');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersService.cancelOrder(orderId);
      // Mettre à jour la commande dans la liste
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'annulation de la commande';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Récupérer une commande spécifique
  const getOrder = useCallback(async (orderId: string) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour voir cette commande');
    }

    setLoading(true);
    setError(null);
    
    try {
      return await ordersService.getOrder(orderId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération de la commande';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchUserOrders,
    createOrder,
    cancelOrder,
    getOrder,
    setOrders,
  };
};