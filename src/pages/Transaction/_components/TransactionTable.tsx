import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import supabaseClient from '@/config/supabaseClient';
import { ArrowDownNarrowWide, ArrowUpWideNarrow, EllipsisVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/auth/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DateInput } from '@/components/ui/date-input';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
    from: Date;
    to: Date;
    sortConfig: { column: string; direction: 'asc' | 'desc' };
    onSort: (column: string) => void;
}

interface Transaction {
    id: string;
    created_at: string;
    date: string;
    amount: number;
    description: string;
    user_id: string;
    category_id: string;
    Category: { name: string; type: string; icon: string }[];
}

function TransactionTable({ from, to, sortConfig, onSort }: Props) {
    const { user } = useAuth();
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [transactionToUpdate, setTransactionToUpdate] = useState<Transaction | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    const { data: history, isLoading, error, refetch } = useQuery({
        queryKey: ['transactions', 'history', from, to],
        queryFn: async () => {
            const { data, error } = await supabaseClient
                .from('Transaction')
                .select(`
                    id,
                    created_at,
                    date,
                    amount,
                    description,
                    user_id,
                    category_id,
                    Category (name, type, icon)
                `)
                .eq('user_id', user.id)
                .gte('date', from.toISOString()) 
                .lte('date', to.toISOString());

            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
    });

    if (isLoading) return <p>Loading transactions...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const sortedData = [...history].sort((a, b) => {
        const aValue = a[sortConfig.column] ?? '';
        const bValue = b[sortConfig.column] ?? '';
        return aValue < bValue ? (sortConfig.direction === 'asc' ? -1 : 1) : aValue > bValue ? (sortConfig.direction === 'asc' ? 1 : -1) : 0;
    });

    const handleUpdateTransaction = async (data: any) => {
        if (!transactionToUpdate) return;

        try {
            const { error } = await supabaseClient
                .from('Transaction')
                .update({
                    amount: data.amount,
                    description: data.description,
                    date: data.date,
                })
                .eq('id', transactionToUpdate.id);

            if (error) {
                throw new Error(error.message);
            }

            setIsUpdateDialogOpen(false);
            refetch();
            toast.success('Transaction updated successfully!');
        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error('Failed to update transaction');
        }
    };

    const handleDeleteTransaction = async () => {
        if (!transactionToDelete) return;

        try {
            const { error } = await supabaseClient
                .from('Transaction')
                .delete()
                .eq('id', transactionToDelete.id);

            if (error) {
                throw new Error(error.message);
            }

            setIsDeleteDialogOpen(false);
            refetch();
            toast.success('Transaction deleted successfully!');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete transaction');
        }
    };

    return (
        <>
            <Table className="w-full border-collapse border border-gray-300 text-center">
                <TableHeader>
                    <TableRow>
                        {['id', 'category', 'date', 'amount', 'type', 'action'].map((column) => (
                            <TableHead
                                key={column}
                                onClick={() => onSort(column)}
                                className="cursor-pointer text-center"
                            >
                                {column.charAt(0).toUpperCase() + column.slice(1)}{' '}
                                <span className="text-bold size-6">
                                    {sortConfig.column === column
                                        ? sortConfig.direction === 'asc'
                                            ? <ArrowUpWideNarrow className="inline size-4" />
                                            : <ArrowDownNarrowWide className="inline size-4" />
                                        : ''}
                                </span>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData?.map((transaction, i) => {
                        const category = Array.isArray(transaction.Category) ? transaction.Category[0] : transaction.Category;
                        const typeClass = category.type === 'expense' ? 'bg-rose-950 border-rose-500 text-white' : 'bg-emerald-950 border-emerald-500 text-white';

                        return (
                            <TableRow key={transaction.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{category.icon} <span className="font-bold ms-2 ">{category.name}</span></TableCell>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.amount}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full ${typeClass}`}>
                                        {category.type}
                                    </span>
                                </TableCell>
                                <TableCell className="flex justify-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">
                                                <EllipsisVertical className="cursor-pointer text-gray-500 hover:text-gray-700 text-left" size={20} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="text-center">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setTransactionToUpdate(transaction);
                                                    setIsUpdateDialogOpen(true);
                                                }}
                                                className="hover:bg-gray-100 p-2 cursor-pointer flex justify-center"
                                            >
                                                Update
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setTransactionToDelete(transaction);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="hover:bg-gray-100 p-2 cursor-pointer flex justify-center text-red-500"
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Update Dialog */}
            {transactionToUpdate && (
                <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Transaction</DialogTitle>
                            <DialogDescription>
                                Edit the transaction details below.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUpdateTransaction}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <Input
                                        type="number"
                                        defaultValue={transactionToUpdate.amount}
                                        placeholder="Amount"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <Input
                                        defaultValue={transactionToUpdate.description}
                                        placeholder="Description"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <Input
                                        type="date"
                                        defaultValue={new Date(transactionToUpdate.date).toLocaleDateString()}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className='mt-7'>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Update</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {transactionToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Transaction</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this transaction?
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="mt-7">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleDeleteTransaction} >
                                Confirme
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

export default TransactionTable;
