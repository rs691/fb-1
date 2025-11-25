
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useUser } from "@/firebase";
import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/checkout-form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isUserLoading: authLoading } = useUser();
  const { state: cartState } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to proceed to checkout.",
        variant: "destructive"
      });
      router.push("/login");
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const total = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Checkout</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Complete your order by providing your payment information.
        </p>
      </div>
      <div className="max-w-xl mx-auto">
        <Elements stripe={stripePromise}>
          <CheckoutForm totalAmount={total} />
        </Elements>
      </div>
    </div>
  );
}
