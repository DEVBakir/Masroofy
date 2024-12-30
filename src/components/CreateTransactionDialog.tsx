import { TransactionType } from "@/lib/types"
import { ReactNode, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./ui/form"
import { Input } from "./ui/input"
import { useQuery } from "@tanstack/react-query"
import supabaseClient from "@/config/supabaseClient"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { Category } from "@/schema"
import { Command } from "./ui/command"
import { CommandInput } from "./ui/command"
import { useAuth } from "../auth/AuthContext"
import CreateCategoryDialog from "./CreateCategoryDialog"

type Props = {
    trigger: ReactNode,
    type: TransactionType
}

const createTransactionSchema = z.object({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    description: z.string().min(1, "Description is required"),
    date: z.date(),
    category: z.string(),
    type: z.enum(["income", "expense"]),
  });
  
type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

function CreateTransactionDialog({ trigger, type }: Props) {
    const form = useForm<CreateTransactionSchema>({
        resolver: zodResolver(createTransactionSchema),
        defaultValues: {
          type, 
          date: new Date()
        },
      });
      

  return (
    <Dialog>
        <DialogTrigger>
            {trigger}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a new 
                    <span className={cn("m-1", type === "income" ? "text-emerald-500": "text-red-500")}>{type}</span>
                    transaction
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-4">
                <FormField 
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Input defaultValue={""} {...field} />
                        </FormControl>
                        <FormDescription>
                            Transaction description (required)
                        </FormDescription>
                        </FormItem>
                    )}
                />

                 <FormField 
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                            <Input defaultValue={0}  type="number" {...field}/>
                        </FormControl>
                        <FormDescription>
                        Transaction amount (required)
                        </FormDescription>
                        </FormItem>
                    )}
                />

                <div className="flex items-center justify-between gap-2">
                    <FormField 
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <CategoryPicker type={type}/>
                            </FormControl>
                            <FormDescription>
                                Select a category for this transaction 
                            </FormDescription>
                            </FormItem>
                        )}
                    />
                </div>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  )
}

export default CreateTransactionDialog

function CategoryPicker ({ type }:{type:TransactionType,}) {

    const [open , setOpen] = useState(false);
    const [value, setValue] = useState("");
    const { user } = useAuth(); 

    const categories = useQuery({
        queryKey: ["categories",type],
        queryFn: async () =>{
            const {data,error} = await  supabaseClient.from("Category").select("*").eq("user_id", user?.id);
            console.log(data);
            
            if(error)
                throw new Error("Failed To Get Categoris")
            
            if(data)
                return data
        }
      })

      const selectedCategory = categories.data[0]
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant={"outline"} role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {selectedCategory ? (
                        <CategoryRow category={selectedCategory}/>
                    ) : ("Select category")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command onSubmit={(e) => {
                  e.preventDefault();  
                }}>
                    <CommandInput placeholder="Search category..." />
                    <CreateCategoryDialog type={type}/>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

function CategoryRow({category}:{category: Category}) {
    return (
        <div className="flex items-center gap-2">
            <span role="img">{category.icon}</span>
            <span>{category.name}</span>
        </div>  
    )
}