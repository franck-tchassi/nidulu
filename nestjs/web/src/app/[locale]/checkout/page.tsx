"use client";

import React, { useEffect, useState } from "react";
import { paymentService } from "@/lib/services/payment.service";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./StripeCheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const createIntent = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Créer la commande côté backend avant de créer le paiement
        // Ici, on suppose que la commande est déjà créée et accessible via cart.orderId
        const orderId = localStorage.getItem('currentOrderId');
        if (!orderId) throw new Error('Aucune commande à payer.');
        const intent = await paymentService.createPaymentIntent({
          orderId,
          amount: cartTotal,
          currency: 'eur',
        });
        setClientSecret(intent.clientSecret);
        setPaymentId(intent.paymentId);
      } catch (e: any) {
        setError(e.message || 'Erreur lors de la préparation du paiement');
      } finally {
        setLoading(false);
      }
    };
    createIntent();
  }, [cartTotal]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement du paiement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg bg-[#fcfbf9] rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-[#1b2d3d] text-center">Paiement sécurisé</h1>
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm paymentId={paymentId!} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;