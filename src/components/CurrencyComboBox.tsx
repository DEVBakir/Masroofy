import * as React from "react"

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
import SkeletonWrapper from "./SkeleonWrapper"
import { useQuery } from "@tanstack/react-query"
import supabaseClient from "@/config/supabaseClient"
import { UserSettings } from "@/schema"


export function CurrencyComboBox() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<Currency | null>(
    Currencies[0]
  )

  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("UserSettings")
        .select("*")
        .eq("user_id", "39e34f1f-6d09-4eca-9cdd-3e01e52a3c55");
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data?.[0];
    },
  });

  if (isDesktop) {
    return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
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
        <Button variant="outline" className="w-full justify-start">
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
