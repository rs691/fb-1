"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0">
        {product.imageUrl && (
          <div className="aspect-video overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={400}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <CardTitle className="font-headline text-xl">{product.name}</CardTitle>
        <p className="mt-2 text-muted-foreground line-clamp-3">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-6 pt-0">
        <p className="text-2xl font-semibold text-primary">
          ${product.price.toFixed(2)}
        </p>
        <Button onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
