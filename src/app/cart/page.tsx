
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const { items } = state;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };
  
  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id } });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-8 text-4xl font-headline font-bold">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-8">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
       <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Your Shopping Cart</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
             const productImage = PlaceHolderImages.find(p => p.id === item.imageId);
             return (
            <Card key={item.id} className="flex items-start gap-4 p-4">
              {productImage && (
                <div className="relative h-24 w-24 rounded-md overflow-hidden">
                  <Image
                    src={productImage.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    data-ai-hint={productImage.imageHint}
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                   <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                   </Button>
                   <span className="w-8 text-center text-lg font-medium">{item.quantity}</span>
                   <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                   </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="mt-2 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          )})}
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h2 className="text-2xl font-headline font-semibold">Order Summary</h2>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>TBD</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Taxes</span>
                        <span>TBD</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <Button asChild className="w-full" size="lg">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
