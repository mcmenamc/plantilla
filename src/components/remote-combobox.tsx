import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
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

interface RemoteComboboxProps {
    value?: string
    onValueChange?: (value: string, label: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    fetchFn: (search: string, page: number) => Promise<{ data: { id: string, name: string }[], total_pages: number }>
    className?: string
    disabled?: boolean
    initialLabel?: string
}

export function RemoteCombobox({
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    emptyText = "No se encontraron resultados.",
    fetchFn,
    className,
    disabled,
    initialLabel,
}: RemoteComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(1)
    const debouncedSearch = useDebounce(search, 500)

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["remote-combobox", debouncedSearch, page],
        queryFn: () => fetchFn(debouncedSearch, page),
        enabled: open,
    })

    const items = data?.data || []
    const totalPages = data?.total_pages || 1

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal min-w-0", className)}
                    disabled={disabled}
                >
                    <span className="truncate flex-1 text-left">
                        {value
                            ? items.find((item) => item.id === value)?.name || initialLabel || value
                            : placeholder}
                    </span>
                    {isFetching ? (
                        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={(val) => {
                            setSearch(val)
                            setPage(1)
                        }}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        ) : items.length === 0 ? (
                            <CommandEmpty>{emptyText}</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.id}
                                        onSelect={() => {
                                            onValueChange?.(item.id, item.name)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-xs text-muted-foreground">{item.id}</span>
                                            <span>{item.name}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Anterior
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    Pág. {page} de {totalPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
