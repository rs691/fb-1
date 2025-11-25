
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Hammer, Brush, Ruler } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import tools2 from '@/images/tools2.png';
import heroImage4 from '@/images/heroImage4.png';


export default function Home() {
  const firestore = useFirestore();
  const productsCollection = collection(firestore, 'products');

  const featuredProductsQuery = useMemoFirebase(() => {
    return query(productsCollection, limit(3));
  }, [productsCollection]);

  const { data: featuredProducts, isLoading } = useCollection<Product>(featuredProductsQuery);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[80vh] text-primary-foreground">
             <Image
              src={heroImage4}
              alt="Hero image of custom wood designs"
              fill
              className="object-cover"
              priority
              data-ai-hint="woodworking hero"
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-black/40 p-8 rounded-lg backdrop-blur-sm">
              <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg animate-fade-in">
                Woodify: Bespoke Wood Creations
              </h1>
              <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow animate-fade-in-delay">
                Handcrafted furniture, signs, and decor, built with passion and precision.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-delay">
                <Button asChild size="lg" className="font-bold">
                  <Link href="/products">
                    Explore Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/projects">Our Portfolio</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Hammer className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-semibold">Quality Craftsmanship</h3>
                <p className="mt-2 text-muted-foreground">
                  Every piece is built to last, using traditional techniques and the finest materials.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Ruler className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-semibold">Custom Designs</h3>
                <p className="mt-2 text-muted-foreground">
                  Your vision, our expertise. We work with you to create one-of-a-kind items.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Brush className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-semibold">Artisanal Finishes</h3>
                <p className="mt-2 text-muted-foreground">
                  Beautiful, durable finishes that protect and enhance the natural beauty of the wood.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center">Featured Products</h2>
            <p className="mt-4 max-w-xl mx-auto text-center text-muted-foreground">
              Discover a selection of our most popular handcrafted items.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="h-64 w-full" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="mt-4 flex justify-between items-center">
                          <Skeleton className="h-8 w-1/3" />
                          <Skeleton className="h-10 w-1/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                featuredProducts && featuredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <CardContent className="p-0">
                      {product.imageUrl ? (
                          <div className="relative h-64 w-full">
                              <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                              />
                          </div>
                      ): (
                        <div className="relative h-64 w-full bg-muted flex items-center justify-center">
                          <Hammer className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-headline font-semibold">{product.name}</h3>
                        <p className="mt-2 text-muted-foreground text-sm h-10 overflow-hidden">{product.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          {product.price && <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>}
                          <Button asChild variant="outline">
                            <Link href={`/products`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/products">Shop All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
