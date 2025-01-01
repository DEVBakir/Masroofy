import { CurrencyComboBox } from '@/components/CurrencyComboBox';
import SkeletonWrapper from '@/components/SkeleonWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp, House } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../components/ui/dialog';
import React, { useState } from 'react';
import CreateCategoryDialog from '@/components/CreateCategoryDialog';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { Category } from '@/schema';
import { Button } from "@/components/ui/button";
import supabaseClient from '@/config/supabaseClient';
import { useAuth } from "../auth/AuthContext"
type Props = {};

function Manage({}: Props) {
  return (
    <>
      {/* header  */}
      <div className="border-b bg-card ">
        <div className="container flex flex-wrap items-center md:justify-between justify-center  gap-6 py-8 mx-auto px-4 lg:px-0">
          <div className="">
            <p className="text-3xl font-bold md:text-start text-center">Manage</p>
            <p className="text-muted-foreground ">
              Manage Your Account Settings And Categories
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 container py-8 mx-auto px-4 lg:px-0">
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Set Your Default Currency Transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox></CurrencyComboBox>
          </CardContent>
        </Card>

        <CategoryList type="income"></CategoryList>
        <CategoryList type="expense"></CategoryList>
      </div>
    </>
  );
}

export default Manage;

function CategoryList({ type }: { type: TransactionType }) {
  const { user } = useAuth();
  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('Category')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type);
         // Fetch categories filtered by type

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const dataAvilable = categoriesQuery.data?.length > 0;

  return (
    <SkeletonWrapper isLoading={categoriesQuery.isFetching}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === 'expense' ? (
                <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
              ) : (
                <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
              )}
              <div>
                {type === 'income' ? 'Income ' : 'Expense '} Categories
                <div className="text-sm text-muted-foreground">sorted by name</div>
              </div>
            </div>

            <CreateCategoryDialog
              type={type}
              successCallBack={() => categoriesQuery.refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4"></PlusSquare>
                  Create Category
                </Button>
              }
            ></CreateCategoryDialog>
          </CardTitle>
        </CardHeader>
        <Separator></Separator>
        {!dataAvilable ? (
          <div className="flex h-40 w-full flex-col items-center justify-center ">
            <p className="">
              No{' '}
              <span
                className={cn('m-1', type === 'expense' ? 'text-red-500' : 'text-emerald-500')}
              >
                {type}
              </span>
              categories yet
            </p>
            <p className="text-sm text-muted-foreground">Create one to get started</p>
          </div>
        ) : (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
            {categoriesQuery.data.map((category: Category) => (
              <CategoryCard
                key={category.id} // Use `id` instead of `name` as a unique key
                category={category}
                categoriesQuery={categoriesQuery}
              />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function CategoryCard({
  category,
  categoriesQuery,
}: {
  category: Category;
  categoriesQuery: any;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Function to handle category deletion
  const handleDeleteCategory = async () => {
    try {
      const { error } = await supabaseClient
        .from('Category')
        .delete()
        .eq('id', category.id); // Use the correct column name for the ID

      if (error) {
        throw new Error(error.message);
      }

      // If successful, refetch the categories
      categoriesQuery.refetch();
      setIsDialogOpen(false); // Close dialog on success
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center p-4 gap-2">
        <span className="text-3xl " role="img">
          {category.icon}
        </span>
        <span>{category.name}</span>
      </div>
      <Button
        className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-400/10"
        variant={'secondary'}
        onClick={() => setIsDialogOpen(true)} // Open dialog when clicked
      >
        <TrashIcon className="h-4 w-4"></TrashIcon> Remove
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className='font-bold'>" {category.name} "</span> category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleDeleteCategory}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
