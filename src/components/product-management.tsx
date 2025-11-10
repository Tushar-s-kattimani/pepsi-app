'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { addDoc, collection, doc, updateDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useCollection } from '@/firebase';
import { Loader2, PackagePlus, GripVertical } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  size: z.string().min(1, 'Product size is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  position: z.coerce.number(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const SortableItem = ({ product, handleOpenDialog }: { product: any, handleOpenDialog: (p: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center bg-white p-3 my-2 rounded-lg shadow-sm border"
    >
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow grid grid-cols-3 gap-4 items-center">
        <div className="font-medium">{product.name}</div>
        <div>{product.size}</div>
        <div>{product.stock}</div>
      </div>
      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product)}>Edit</Button>
    </div>
  );
};


export function ProductManagement() {
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('position')), []);
  const { data: initialProducts, loading } = useCollection(productsQuery);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if(initialProducts) {
        setProducts(initialProducts);
    }
  }, [initialProducts]);
  
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const handleOpenDialog = (product: any | null = null) => {
    setEditingProduct(product);
    if (product) {
      reset({ name: product.name, size: product.size, stock: product.stock, position: product.position });
    } else {
      reset({ name: '', size: '', stock: 0, position: products.length });
    }
    setOpen(true);
  };
  
  const handleCloseDialog = () => {
    setOpen(false);
    setEditingProduct(null);
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, data);
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        await addDoc(collection(db, 'products'), {...data, position: products.length});
        toast({ title: 'Success', description: 'Product added successfully.' });
      }
      handleCloseDialog();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteDoc(doc(db, 'products', productId));
            toast({ title: 'Success', description: 'Product deleted successfully.' });
            handleCloseDialog(); // Close dialog if open
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to delete product: ${error.message}` });
        }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(products, oldIndex, newIndex);
      setProducts(newOrder);

      // Update positions in Firestore
      const batch = writeBatch(db);
      newOrder.forEach((product, index) => {
        const productRef = doc(db, 'products', product.id);
        batch.update(productRef, { position: index });
      });
      await batch.commit();
      toast({ title: 'Success', description: 'Product order updated.' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Inventory</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PackagePlus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Input id="size" {...register('size')} />
                {errors.size && <p className="text-sm text-red-500 mt-1">{errors.size.message}</p>}
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...register('stock')} />
                {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>}
              </div>
              <DialogFooter className="sm:justify-end pt-4">
                <div className="flex w-full justify-between">
                    {editingProduct && (
                        <Button type="button" variant="destructive" onClick={() => handleDelete(editingProduct.id)} disabled={isSubmitting}>
                            Delete
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button type="button" variant="ghost" onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingProduct ? 'Update Product' : 'Save Product'}
                        </Button>
                    </div>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div>
            <div className="flex items-center bg-gray-50 p-3 my-2 rounded-lg font-semibold text-sm text-muted-foreground">
                <div className="p-2"><GripVertical className="h-5 w-5 invisible" /></div>
                <div className="flex-grow grid grid-cols-3 gap-4 items-center">
                    <div>Product</div>
                    <div>Size</div>
                    <div>Stock</div>
                </div>
                <div className="w-[68px]"></div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={products} strategy={verticalListSortingStrategy}>
                {products.map(product => <SortableItem key={product.id} product={product} handleOpenDialog={handleOpenDialog} />)}
                </SortableContext>
            </DndContext>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
