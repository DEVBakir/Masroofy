import { TransactionType } from "@/lib/types"
import { ReactNode, useContext, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import supabaseClient from "@/config/supabaseClient"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { Category, Transaction } from "@/schema"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./ui/command"
import { CommandInput } from "./ui/command"
import { useAuth } from "../auth/AuthContext"
import CreateCategoryDialog from "./CreateCategoryDialog"
import { CalendarIcon, Check, Loader2, PlusSquare } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"
import { UserTransactions } from "@/pages/Dashboard"

type Props = {
    trigger: ReactNode,
    type: TransactionType,
    successCallBack?: () => void
}

const createTransactionSchema = z.object({
    user_id: z.string(),
    created_at : z.date(),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    description: z.string().min(1, "Description is required"),
    date: z.date(),
    category: z.string().optional(),
    type: z.enum(["income", "expense"]),
  });
  
type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

function CreateTransactionDialog({ trigger, type, successCallBack }: Props) {

    const [open , setOpen] = useState(false);
    const [category_id , setCategory_id] = useState(null);
    const {user} = useAuth();
    const {refetch,refetchAll} = useContext(UserTransactions)
    const form = useForm<CreateTransactionSchema>({
        resolver: zodResolver(createTransactionSchema),
        defaultValues: {
          type, 
          date: new Date(),
          created_at: new Date(),
          user_id : user?.id,
        },
      });
      
    
      const { mutate, isPending } = useMutation({
        mutationFn: async (data: CreateTransactionSchema) => {
          // Format the date to `YYYY-MM-DD`
          const formattedDate = data.date ? format(data.date, 'yyyy-MM-dd') : null;
      
          delete data.category; // Remove the category field as required
      
          const { data: result, error } = await supabaseClient
            .from("Transaction")
            .insert({
              ...data,
              date: formattedDate, // Use the formatted date
              category_id,
            })
            .select(); // Ensure the upsert operation returns the inserted/updated rows.
      
          if (error) {
            throw new Error(error.message);
          }
      
          // Return the first row if result is an array
          return result[0];
        },
        onSuccess: (data: Transaction) => {
          setOpen((prev) => !prev); // Close the dialog after success
          form.reset(); // Reset the form
          refetch();
          refetchAll();
          successCallBack();
      
          toast.success(`Transaction ${data?.description} created successfully 🎉`, {
            id: "create-transaction",
          });
        },
        onError: (error) => {
          toast.error(`Something went wrong`, { id: "create-transaction" });
        },
      });
      

    const OnSubmit = (data: CreateTransactionSchema) => {
        
        toast.loading("Creating Transaction....", {
            id: "create-transaction",
        });
        mutate(data);
        };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Form {...form} >
                <form className="space-y-4" 
               onSubmit={form.handleSubmit(OnSubmit)}>
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

                <div className="flex  justify-between gap-2">
                    <FormField 
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <CategoryPicker type={type} onChange={field.onChange} changeCategory_id={setCategory_id} value={field.value}/>
                            </FormControl>
                            <FormDescription>
                                Select a category for this transaction 
                            </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Transaction Date</FormLabel>
                            <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("w-[220px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}>
                                                {field.value ? (
                                                    format(field.value,"PPP") 
                                                ) : 
                                                    <span>
                                                        Pick a date
                                                    </span>
                                            }
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange}/>
                                    </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Select a date for this transaction 
                            </FormDescription>
                            <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin"/> : "Save"}
                </Button>
              </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  )
}

export default CreateTransactionDialog

function CategoryPicker({
    type,
    value,
    onChange,
    changeCategory_id
  }: {
    type: TransactionType;
    value: string;
    onChange: (value: string) => void;
    changeCategory_id: (value:string) => void;
  }) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
  
    const categories = useQuery({
      queryKey: ["categories", type],
      queryFn: async () => {
        const { data, error } = await supabaseClient
          .from("Category")
          .select("*")
          .eq("user_id", user?.id)
          .eq("type", type);
  
        if (error) throw new Error("Failed to get categories");
        return data || [];
      },
    });
  
    const selectedCategory = categories.data?.find(
      (category: Category) => category.name === value
    );
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedCategory ? (
              <CategoryRow category={selectedCategory} />
            ) : (
              "Select category"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <CommandInput placeholder="Search category..." />
            <CreateCategoryDialog
              type={type}
              successCallBack={(data: Category) => categories.refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Create Category
                </Button>
              }
            />
            <CommandEmpty>
              <p>Category not found</p>
              <p className="text-xs text-muted-foreground">
                Tip: Create a new Category
              </p>
            </CommandEmpty>
            <CommandGroup>
              <CommandList>
                {categories.data &&
                  categories.data.map((category: Category) => (
                    <CommandItem
                      key={category.name}
                      onSelect={() => {
                        onChange(category.name);
                        changeCategory_id(category.id)
                        setOpen(false); // Close the popover
                      }}
                    >
                      <CategoryRow category={category} />
                      <Check
                        className={cn(
                          "mr-2 w-4 opacity-0",
                          value === category.name && "opacity-100"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
  

function CategoryRow({category}:{category: Category}) {
    return (
        <div className="flex items-center gap-2">
            <span role="img">{category.icon}</span>
            <span>{category.name}</span>
        </div>  
    )
}