import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Loader2, Building, Phone, FileText, CheckCircle, Info, Building2, CheckCircle2 } from "lucide-react"

import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combobox"

const formSchema = z.object({
    tipo_persona: z.enum(["persona_fisica", "persona_moral"]),
    rfc: z.string().min(12, "El RFC debe tener al menos 12 caracteres").max(13, "El RFC no puede exceder 13 caracteres").toUpperCase(),
    nombre: z.string().min(3, "La razón social debe tener al menos 3 caracteres"),
    phone: z.string().length(10, "El teléfono debe tener 10 dígitos").regex(/^\d+$/, "Solo se permiten números"),
    regimenFiscal: z.string().min(1, "El régimen fiscal es requerido"),
})

type ConfigFormValues = z.infer<typeof formSchema>

const tiposPersona = [
    { label: 'Persona Fisica', value: 'persona_fisica' },
    { label: 'Persona Moral', value: 'persona_moral' },
]

export function ConfigurarCuenta() {
    const navigate = useNavigate()
    const { auth } = useAuthStore()
    const [tipoPersona, setTipoPersona] = useState<"persona_fisica" | "persona_moral" | any>("persona_fisica")

    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo_persona: "persona_fisica",
            rfc: "",
            nombre: "",
            phone: "",
            regimenFiscal: "",
        },
    })

    // Fetch tax regimes based on current persona type
    const { data: regimenes, isLoading: isLoadingRegimenes } = useQuery({
        queryKey: ["regimenes", tipoPersona],
        queryFn: async () => {
            const endpoint = tipoPersona === 'persona_fisica' ? 'persona-fisica' : 'persona-moral'
            const response = await api.get(`/tax-regime/${endpoint}`)
            return response.data
        },
    })

    const regimenItems = (regimenes || []).map((r: any) => ({
        label: r.label,
        value: r.value,
    }))

    const { mutate: registrarBusiness, isPending: isSubmitting } = useMutation({
        mutationFn: async (values: ConfigFormValues) => {
            const payload = {
                ...values,
                tipo_persona: values.tipo_persona === 'persona_fisica' ? 'Persona Física' : 'Persona Moral'
            }
            const response = await api.post("/business/registro-business", payload)
            return response.data
        },
        onSuccess: (data) => {
            if (auth.user) {
                auth.setUser({
                    ...auth.user,
                    business: data.business?._id
                })
            }
            toast.success("¡Configuración completada con éxito!")
            navigate({ to: "/" })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Ocurrió un error al guardar la configuración")
        },
    })

    function onSubmit(values: ConfigFormValues) {
        registrarBusiness(values)
    }

    // Update form value when state changes through buttons (if using custom buttons instead of standard radio)
    const handleTipoPersonaChange = (type: "persona_fisica" | "persona_moral") => {
        setTipoPersona(type)
        form.setValue("tipo_persona", type)
        form.setValue("regimenFiscal", "") // Reset regime when switching type
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Formulario */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <div className="mb-8">
                        <div className="block lg:hidden mb-6">
                            <div className="inline-flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">Haz Factura</span>
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Casi completas tu perfil</h1>
                        <p className="text-gray-600">Configura los datos fiscales de tu empresa para empezar a facturar.</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1 h-2 bg-primary rounded-full"></div>
                            <div className="flex-1 h-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-sm font-medium text-primary text-center">Paso 3 de 3: Datos Fiscales</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Tipo de Persona */}
                            <FormField
                                control={form.control}
                                name="tipo_persona"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de persona</FormLabel>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            {tiposPersona.map((tipo) => (
                                                <button
                                                    key={tipo.value}
                                                    type="button"
                                                    onClick={() => handleTipoPersonaChange(tipo.value as any)}
                                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${tipoPersona === tipo.value
                                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {tipo.label}
                                                </button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* RFC */}
                            <FormField
                                control={form.control}
                                name="rfc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RFC</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    placeholder={tipoPersona === "persona_fisica" ? "GABC800101ABC" : "ABC010101ABC"}
                                                    className="pl-11 h-12 rounded-xl focus-visible:ring-primary uppercase"
                                                />
                                                <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nombre de la Empresa */}
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {tipoPersona === "persona_fisica" ? "Nombre o Razón Social" : "Razón Social"}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    placeholder={tipoPersona === "persona_fisica" ? "Juan García López" : "Empresa SA de CV"}
                                                    className="pl-11 h-12 rounded-xl focus-visible:ring-primary"
                                                />
                                                <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Celular */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono de contacto</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type="tel"
                                                    maxLength={10}
                                                    placeholder="5512345678"
                                                    className="pl-11 h-12 rounded-xl focus-visible:ring-primary"
                                                />
                                                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Régimen Fiscal */}
                            <FormField
                                control={form.control}
                                name="regimenFiscal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Régimen fiscal</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                items={regimenItems}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                isLoading={isLoadingRegimenes}
                                                placeholder="Selecciona tu régimen fiscal"
                                                searchPlaceholder="Buscar régimen..."
                                                className="h-12 rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-semibold py-4 h-auto text-lg rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Completar configuración"
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Esta información es necesaria para emitir facturas válidas ante el SAT.
                            Tu información fiscal está protegida y encriptada bajo estándares de seguridad bancaria.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Contenido visual naranja */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-100 via-orange-50 to-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
                    <div className="max-w-lg w-full">
                        <div className="mb-12 text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
                                <CheckCircle2 className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-900">Validado por el SAT</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                Todas tus facturaciones cumplirán automáticamente con la normativa fiscal vigente.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Cumplimiento 100%", desc: "Esquemas CFDI 4.0 actualizados automáticamente.", icon: FileText },
                                { title: "Seguridad Bancaria", desc: "Tus sellos digitales y archivos están protegidos.", icon: Info },
                                { title: "Fácil de Administrar", desc: "Gestiona múltiples empresas desde un solo lugar.", icon: Building2 },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-orange-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 border border-gray-100">
                                        <item.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-orange-200">
                            <div className="grid grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="text-3xl font-bold text-primary mb-1">2min</div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Configuración</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary mb-1">100%</div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Legalidad</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Soporte</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
