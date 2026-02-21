// web/src/app/[locale]/(marketing)/orders/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';
import { Page } from '@/types';
import Image from 'next/image';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PENDING: 'En attente',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export default function OrdersPage() {
  const { orders, loading, error, fetchUserOrders, pagination, cancelOrder } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUserOrders({ status: statusFilter || undefined });
  }, [statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-48"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1b2d3d] mb-2">Mes Commandes</h1>
          <p className="text-slate-600">Retrouvez l'historique de toutes vos commandes</p>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex items-center gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-1">
              Filtrer par statut
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="mb-4">
              <svg className="w-16 h-16 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Aucune commande</h3>
            <p className="text-slate-500 mb-6">Vous n'avez pas encore passé de commande.</p>
            <Link
              href={Page.Catalog}
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white">
                {/* En-tête de la commande modernisé */}
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-[#1b2d3d]">
                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /></svg>
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold ${statusColors[order.status as keyof typeof statusColors]} flex items-center gap-1`}>
                        {order.status === 'DELIVERED' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        {order.status === 'CANCELLED' && <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      Passée le {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-[#1b2d3d]">
                      {order.total.toFixed(2)} €
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.items.length} {order.items.length > 1 ? 'articles' : 'article'}
                    </p>
                  </div>
                </div>

                {/* Articles de la commande modernisés */}
                <div className="p-8">
                  <div className="space-y-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              width={96}
                              height={96}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <div className="text-slate-300">
                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-slate-800 text-lg">{item.productName}</h4>
                          <div className="flex items-center gap-6 mt-2 text-sm text-slate-600">
                            <span>Quantité: <span className="font-bold">{item.quantity}</span></span>
                            <span>Prix unitaire: <span className="font-bold">{item.price.toFixed(2)} €</span></span>
                            <span>Sous-total: <span className="font-bold">{item.subtotal.toFixed(2)} €</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions modernisées */}
                  <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Adresse de livraison:</span> {order.shippingAddress}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm"
                      >
                        Voir le détail
                      </Link>
                      {order.status === 'PENDING' && (
                        <button
                          disabled={!!cancelLoading}
                          onClick={async () => {
                            if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
                              setCancelLoading(order.id);
                              try {
                                await cancelOrder(order.id);
                              } catch (e) {}
                              setCancelLoading(null);
                            }
                          }}
                          className={`px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold shadow-sm ${cancelLoading === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {cancelLoading === order.id ? 'Annulation...' : 'Annuler'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => fetchUserOrders({ 
                page: pagination.page - 1,
                limit: pagination.limit,
                status: statusFilter || undefined
              })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Précédent
            </button>
            <span className="text-sm text-slate-600">
              Page {pagination.page} sur {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => fetchUserOrders({ 
                page: pagination.page + 1,
                limit: pagination.limit,
                status: statusFilter || undefined
              })}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}