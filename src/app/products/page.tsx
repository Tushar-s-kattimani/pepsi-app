import Image from 'next/image';
import { products } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductsPage() {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
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
               {product.stock === 0 && <Badge variant="destructive" className="absolute top-2 right-2">OUT OF STOCK</Badge>}
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <CardTitle className="text-lg font-headline mb-1">{product.name}</CardTitle>
              <CardDescription>{product.size}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
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
