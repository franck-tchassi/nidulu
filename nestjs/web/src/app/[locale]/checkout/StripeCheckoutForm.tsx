"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentService } from "@/lib/services/payment.service";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  paymentId: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ paymentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) {
      setError("Stripe n'est pas prêt");
      setLoading(false);
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Aucun champ de carte trouvé");
      setLoading(false);
      return;
    }
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      (elements as any)._clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );
    if (stripeError) {
      setError(stripeError.message || "Erreur de paiement");
      setLoading(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Confirmer côté backend
      try {
        await paymentService.confirmPayment({
          paymentIntentId: paymentIntent.id,
          orderId: paymentId,
        });
        setSuccess(true);
        setTimeout(() => router.push("/account/orders"), 2000);
      } catch (e: any) {
        setError(e.message || "Erreur lors de la confirmation backend");
      }
    }
    setLoading(false);
  };

  if (success) {
    return <div className="text-green-600 text-center font-bold py-8">Paiement réussi ! Redirection...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardElement options={{ hidePostalCode: true }} className="p-4 border rounded-lg bg-white" />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors"
      >
        {loading ? "Paiement en cours..." : "Payer"}
      </button>
    </form>
  );
};

export default CheckoutForm;
