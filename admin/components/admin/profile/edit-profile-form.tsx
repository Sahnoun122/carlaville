'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { authService } from '@/features/auth/services/auth-service';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().min(6, 'Le téléphone est requis'),
  password: z.string().optional(),
});

export const EditProfileForm = () => {
  const { user, refreshUser } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
    },
  });

  useEffect(() => {
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
    });
  }, [form, user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);

    try {
      await authService.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password?.trim() ? values.password : undefined,
      });

      await refreshUser();
      form.setValue('password', '');
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec de la mise à jour du profil.';

      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  const labelClass = "text-sm font-semibold text-[#1E293B] mb-2";
  const inputClass = "h-12 bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 font-medium transition-all focus:bg-white focus:border-blue-500 focus:ring-0 outline-none text-slate-800 placeholder:text-slate-400 text-base";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-white max-h-[85vh] overflow-hidden rounded-[16px] text-left">
        {/* Main Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-10 scrollbar-hide">
          
          <div className="space-y-1">
             <h1 className="text-2xl font-bold text-[#1E293B]">Modifier mon profil</h1>
             <p className="text-slate-400 text-sm italic">Mettez à jour vos informations personnelles et de connexion.</p>
          </div>

          <div className="space-y-8">
            {/* Row 1: Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Prénom</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input {...field} className={cn(inputClass, "pl-12")} disabled={isPending} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Nom</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input {...field} className={cn(inputClass, "pl-12")} disabled={isPending} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Row 2: Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input {...field} type="email" className={cn(inputClass, "pl-12")} disabled={isPending} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Téléphone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input {...field} className={cn(inputClass, "pl-12")} disabled={isPending} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Row 3: Security */}
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="pt-6 border-t border-slate-50">
                <FormLabel className={labelClass}>Nouveau mot de passe (optionnel)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input type="password" {...field} className={cn(inputClass, "pl-12")} disabled={isPending} placeholder="••••••••" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* Triple Action Footer (Expense Claim Style) */}
        <div className="px-10 py-8 border-t border-slate-100 bg-white flex items-center justify-between">
           <button type="button" onClick={() => form.reset()} className="text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors">Réinitialiser</button>
           <div className="flex gap-4">
              <Button type="button" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 h-12 px-8 rounded-lg font-bold">Annuler</Button>
              <Button type="submit" disabled={isPending} className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-12 rounded-lg font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <>Enregistrer <Check size={18} className="ml-2" /></>}
              </Button>
           </div>
        </div>
      </form>
    </Form>
  );
};

