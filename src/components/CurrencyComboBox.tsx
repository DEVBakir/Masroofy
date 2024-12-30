import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Currencies, Currency } from "@/lib/currencies"
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query"
import supabaseClient from "@/config/supabaseClient"
import { UserSettings } from "@/schema"
import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext";


export function CurrencyComboBox() {

  const { user, loading } = useAuth(); 
  // Test
  const user_id = user?.id
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = useState<Currency | null>(
    Currencies[0]
  )

  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("UserSettings")
        .select("*")
        .eq("user_id", user_id);
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data?.[0];
    },
  });

  async function updateUserSettings() {
    if (!selectedOption) return;

    try {
      const { error } = await supabaseClient
        .from("UserSettings")
        .upsert({ user_id, currency: selectedOption.value });

      if (error) {
        console.error("Error updating user settings:", error.message);
      } else {
        console.log("User settings updated successfully.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }

  useEffect(()=> {
    updateUserSettings();
  },[selectedOption])

  if (isDesktop) {
    return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start font-semibold">
              {selectedOption ? <>{selectedOption.label}</> : <>+ Set currency</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionsList setOpen={setOpen} setSelectedOption={setSelectedOption} />
          </PopoverContent>
        </Popover>    
    )
  }

  return (
      <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-semibold">
          {selectedOption ? <>{selectedOption.label}</> : <>+ Set currency</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionsList setOpen={setOpen} setSelectedOption={setSelectedOption} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function OptionsList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void
  setSelectedOption: (status: Currency | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter currency..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Currencies.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={(value) => {
                setSelectedOption(
                  Currencies.find((priority) => priority.value === value) || null
                )
                setOpen(false)
              }}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
