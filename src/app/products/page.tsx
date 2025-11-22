
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const { toast } = useToast();
  const productImage = PlaceHolderImages.find(p => p.id === product.imageId);

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col">
      <CardContent className="p-0 flex flex-col flex-grow">
        {productImage ? (
          <div className="relative h-64 w-full">
            <Image
              src={productImage.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={productImage.imageHint}
            />
          </div>
        ) : (
          <div className="relative h-64 w-full bg-muted" />
        )}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-headline font-semibold">{product.name}</h3>
          <p className="mt-2 text-muted-foreground text-sm flex-grow">{product.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage() {
    const firestore = useFirestore();
    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Products</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Browse our collection of handcrafted wooden goods. Each piece is made with care and built to last.
        </p>
      </div>
       {isLoading && <p>Loading products...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products && products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
