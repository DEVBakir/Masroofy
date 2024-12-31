import { useQuery } from '@tanstack/react-query';
import React from 'react';
import supabaseClient from '@/config/supabaseClient'; 
import { useAuth } from "@/auth/AuthContext"
import { Transaction } from '@/schema';

interface Props {
    from: Date;
    to: Date;
}

function TransactionTable({ from, to }: Props) {
    const { user } = useAuth();
    const { data: history, isLoading, error } = useQuery({
        queryKey: ['transactions', 'history', from, to],
        queryFn: async () => {
            console.log("start fetching");
            
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
                .gte('date', from.toISOString()) // Filter transactions with date >= from
                .lte('date', to.toISOString());  // Filter transactions with date <= to
            
            if (error) {
                throw new Error(error.message);
            }
            console.log(data);
            
            return data;
        },
    });

    if (isLoading) return <p>Loading transactions...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Transactions</h2>
            <table className="w-full border-collapse border border-gray-300 text">
                <thead>
                    <tr>
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Amount</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Type</th>
                        <th className="border p-2">Icon</th>
                    </tr>
                </thead>
                <tbody>
                    {history?.map((transaction) => {
                        // Ensure category exists and is not an empty array
                        const category = Array.isArray(transaction.Category) && transaction.Category.length > 0
                            ? transaction.Category[0]
                            : null;

                        const name = category?.name || 'N/A';  // Default value if name is undefined
                        const icon = category?.icon || 'N/A';  // Default value if icon is undefined
                        const type = category?.type || 'N/A';  // Default value if type is undefined

                        return (
                            <tr key={transaction.id}>
                                <td className="border p-2">{transaction.id}</td>
                                <td className="border p-2">{new Date(transaction.date).toLocaleDateString()}</td> {/* Proper date formatting */}
                                <td className="border p-2">{transaction.amount}</td>
                                <td className="border p-2">{name}</td>
                                <td className="border p-2">{type}</td>
                                <td className="border p-2">{icon}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionTable;
