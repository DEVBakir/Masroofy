import { z } from "zod";

export interface UserSettings {
    user_id: string;
    currency: string; 
}

export interface Category {
    id: string;
    name: string;
    user_id: string;
    icon: string;
    type: "income" | "expense";
    created_at: string;
}

export interface Transaction {
    id: string;
    created_at: string;
    date: string;
    amount: number;
    description: string;
    user_id: string;
    category_id: string;
    Category?: Pick<Category, 'name' | 'type' | 'icon'> | null; // Reference Category interface
}
