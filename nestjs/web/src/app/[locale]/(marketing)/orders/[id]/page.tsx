// web/src/app/[locale]/(marketing)/orders/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';
import { Page } from '@/types';
import Image from 'next/image';

const statusLabels = {
  PENDING: 'En attente',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrder, cancelOrder, loading, error } = useOrders();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      getOrder(params.id as string)
        .then(response => setOrder(response.data))
        .catch(console.error);
    }
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await cancelOrder(params.id as string);
        router.push('/account/orders');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-64 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-4">Commande non trouvée</h1>
          <Link
            href={Page.AccountOrders}
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            href={Page.AccountOrders}
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux commandes
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#1b2d3d]">Commande #{order.id.slice(-8).toUpperCase()}</h1>
              <p className="text-slate-600 mt-2">
                Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {statusLabels[order.status as keyof typeof statusLabels]}
              </span>
            </div>
          </div>
        </div>

        {/* Informations de commande */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="md:col-span-2">
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Articles</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-slate-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-slate-800">{item.productName}</h4>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-600">
                        <span>Quantité: {item.quantity}</span>
                        <span>Prix unitaire: {item.price.toFixed(2)} €</span>
                        <span className="font-medium">Sous-total: {item.subtotal.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Récapitulatif</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sous-total</span>
                  <span>{(order.total / 1.2).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">TVA (20%)</span>
                  <span>{(order.total * 0.2).toFixed(2)} €</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Adresse de livraison</p>
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Statut</p>
                  <p className="font-medium">{statusLabels[order.status as keyof typeof statusLabels]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Numéro de commande</p>
                  <p className="font-medium">{order.id}</p>
                </div>
              </div>
            </div>

            {order.status === 'PENDING' && (
              <button
                onClick={handleCancelOrder}
                className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Annuler la commande
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}