'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { seedDatabase as seedProductsStore } from '@/lib/seed-products';
import { useEffect } from 'react';

export default function ProductsPage() {
  const firestore = useFirestore();

  useEffect(() => {
    if(firestore) {
      seedProductsStore(firestore);
    }
  }, [firestore]);

  const productsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'products'), orderBy('name')) : null
  , [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Product Catalog
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and manage your product inventory.
        </p>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && products?.length === 0 && (
        <Card className="flex items-center justify-center h-64">
          <CardContent className="text-center pt-6">
            <p className="text-muted-foreground">No products found.</p>
             <p className="text-sm text-muted-foreground mt-2">
                It looks like your database might be empty. The app attempts to seed data automatically.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader className="p-0 relative">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={400}
                data-ai-hint={product.imageHint}
                className="object-cover rounded-t-lg aspect-square"
              />
              {product.stock === 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-2 right-2"
                >
                  OUT OF STOCK
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <CardTitle className="text-lg font-headline mb-1">
                {product.name}
              </CardTitle>
              <CardDescription>{product.size}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <p className="text-lg font-semibold">
                ${product.price.toFixed(2)}
              </p>
              <Button size="sm" disabled={product.stock === 0}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
