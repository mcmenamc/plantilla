import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    items?: { label: string; value: string }[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    isLoading?: boolean
    className?: string
    disabled?: boolean
}

export function Combobox({
    items = [],
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    emptyText = "No se encontraron resultados.",
    isLoading,
    className,
    disabled,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", className)}
                    disabled={disabled || isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando...
                        </div>
                    ) : value
                        ? items.find((item) => item.value === value)?.label || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label} // Filter by label
                                    onSelect={(currentValue) => {
                                        // Match by label back to value
                                        const selectedItem = items.find((i) => i.label.toLowerCase() === currentValue.toLowerCase() || i.value === item.value)
                                        if (selectedItem) {
                                            onValueChange?.(selectedItem.value)
                                        }
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
