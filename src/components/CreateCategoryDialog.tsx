import { TransactionType } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { CircleOff, PlusSquare } from "lucide-react";
import { DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useMutation } from "@tanstack/react-query";
import supabaseClient from "@/config/supabaseClient";
import { useAuth } from "../auth/AuthContext"


type Props = { type: TransactionType }

const createCategorySchema = z.object({
    user_id: z.string(),
    name: z.string().min(3).max(30),
    icon: z.string().max(20),
    type: z.enum(["income", "expense"]),
  });

type CreateCategorySchema = z.infer<typeof createCategorySchema>;


function CreateCategoryDialog({ type }: Props) {
    const [ open, setOpen ] = useState(false);
    const { user } = useAuth();

    const form = useForm<CreateCategorySchema>({
      resolver: zodResolver(createCategorySchema),
      defaultValues: {
        user_id : user?.id,
        type
      },
    });
  
    const { mutate, isPending } = useMutation({
      mutationFn: async (data: CreateCategorySchema) => {
        const { error } = await supabaseClient
          .from("Category")
          .upsert(data);
        if (error) {
          throw new Error(error.message);
        }
      },
      onSuccess: () => {
        setOpen(false); // Close the dialog after success
        form.reset(); // Reset the form
      },
      onError: (error) => {
        console.error("Error saving category:", error);
      },
    });
  
    const handleSubmit = (data: CreateCategorySchema) => {
      mutate(data);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-start border-b border-separate rounded-none px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Create new
          </Button>
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
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
}


export default CreateCategoryDialog