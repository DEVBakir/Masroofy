import { TransactionType } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import { DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import supabaseClient from "@/config/supabaseClient";
import { useAuth } from "../auth/AuthContext"
import { Category } from "@/schema";
import { toast } from "sonner";
import { useTheme } from "./provider/theme-provider";


type Props = { 
  type: TransactionType ,
  successCallBack : (categry : Category) => void
  trigger? : ReactNode
}

const createCategorySchema = z.object({
    user_id: z.string(),
    name: z.string().min(3).max(30),
    icon: z.string().max(20),
    type: z.enum(["income", "expense"]),
  });

type CreateCategorySchema = z.infer<typeof createCategorySchema>;


function CreateCategoryDialog({ type , successCallBack , trigger }: Props , ) {
    const [ open, setOpen ] = useState(false);
    const { user } = useAuth();

    const form = useForm<CreateCategorySchema>({
      resolver: zodResolver(createCategorySchema),
      defaultValues: {
        user_id : user?.id,
        type
      },
    });

    const QueryClient = useQueryClient;
    const themeProvider = useTheme();
     
  
    const { mutate, isPending } = useMutation({
      mutationFn: async (data: CreateCategorySchema) => {
        const { data: result, error } = await supabaseClient
          .from("Category")
          .upsert(data)
          .select(); // Ensure the upsert operation returns the inserted/updated rows.
      
        if (error) {
          throw new Error(error.message);
        }
      
        // Return the first row if result is an array
        return result[0]
      },
      onSuccess: (data : Category) => {
        setOpen(false); // Close the dialog after success
        form.reset(); // Reset the form
        successCallBack(data) /// here
        toast.success(`Category ${data?.name} created successfully 🎉`, {
          id: "create-category",
        });
      },
      onError: (error) => {
        toast.error(`Something went wrong`, { id: "create-category" });
      },
    });
  
    const handleSubmit = (data: CreateCategorySchema) => {
      toast.loading("Creating category....", {
        id: "create-category",
      });
      mutate(data);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ? trigger : 
          <Button
          variant="ghost"
          className="flex items-center justify-start border-b border-separate rounded-none px-3 py-3 text-muted-foreground"
        >
          <PlusSquare className="mr-2 h-4 w-4" />
          Create new
        </Button>
        }
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create{" "}
              <span
                className={cn(
                  "m-1",
                  type === "income" ? "text-emerald-500" : "text-red-500"
                )}
              >
                {type}
              </span>{" "}
              category
            </DialogTitle>
            <DialogDescription>
              Categories are used to group your transactions.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-8"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Category name (required)
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-[100px] w-full">
                            {field.value ? (
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-5xl" role="img">
                                  {field.value}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  Change
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <CircleOff className="!h-[39px] !w-[39px]" />
                                <p className="text-xs text-muted-foreground">
                                  Click to select
                                </p>
                              </div>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full">
                          <Picker
                            theme={themeProvider.theme}
                            data={data}
                            onEmojiSelect={(emoji: { native: string }) => {
                              field.onChange(emoji.native);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>
                      This is how your category will appear in the app (required)
                    </FormDescription>
                  </FormItem>
                )}
              />
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
    );
}


export default CreateCategoryDialog