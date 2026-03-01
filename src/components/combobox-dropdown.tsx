import * as React from 'react'
import { Check, ChevronsUpDown, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { FormControl } from '@/components/ui/form'

type ComboboxDropdownProps = {
    onValueChange?: (value: string) => void
    defaultValue: string | undefined
    placeholder?: string
    isPending?: boolean
    items: { label: string; value: string }[] | undefined
    disabled?: boolean
    className?: string
    emptyMessage?: string
}

export function ComboboxDropdown({
    defaultValue,
    onValueChange,
    isPending,
    items = [],
    placeholder = 'Seleccionar...',
    disabled,
    className = '',
    emptyMessage = 'No se encontraron resultados.',
}: ComboboxDropdownProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue || '')

    React.useEffect(() => {
        setValue(defaultValue || '')
    }, [defaultValue])

    const selectedItem = items?.find((item) => item.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant='outline'
                        role='combobox'
                        aria-expanded={open}
                        className={cn(
                            'w-full justify-between bg-white dark:bg-zinc-950 font-normal',
                            !value && 'text-muted-foreground',
                            className
                        )}
                        disabled={disabled || isPending}
                    >
                        {isPending ? (
                            <div className='flex items-center gap-2'>
                                <Loader className='h-3 w-3 animate-spin' />
                                Cargando...
                            </div>
                        ) : (
                            <span className='truncate'>
                                {selectedItem ? selectedItem.label : placeholder}
                            </span>
                        )}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                <Command>
                    <CommandInput placeholder={`Buscar...`} className='h-9' />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label} // Use label for searching
                                    onSelect={() => {
                                        const newValue = item.value === value ? '' : item.value
                                        setValue(newValue)
                                        onValueChange?.(newValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === item.value ? 'opacity-100' : 'opacity-0'
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
