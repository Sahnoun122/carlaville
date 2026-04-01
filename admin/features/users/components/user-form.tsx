'use client';

import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Role } from '@/types';
import type { UserFormValues } from '@/features/users/services/user-service';
import { User as UserIcon, Mail, Phone, Lock, Shield } from 'lucide-react';

const optionalPhoneSchema = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value : undefined))
  .refine((value) => !value || value.length >= 6, {
    message: 'Le téléphone doit contenir au moins 6 caractères',
  });

const optionalPasswordSchema = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value : undefined))
  .refine((value) => !value || value.length >= 6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  });

const baseFormSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: optionalPhoneSchema,
  password: optionalPasswordSchema,
  role: z.nativeEnum(Role),
});

const createFormSchema = baseFormSchema.extend({
  phone: z.string().min(6, 'Le téléphone doit contenir au moins 6 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

interface UserFormProps {
  user?: User | null;
  onSubmit: (values: UserFormValues) => void;
  isLoading: boolean;
}

export const UserForm = ({ user, onSubmit, isLoading }: UserFormProps) => {
  const formSchema = user ? baseFormSchema : createFormSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      role: user?.role || Role.CLIENT,
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      role: user?.role || Role.CLIENT,
    });
  }, [form, user]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700">
                  <UserIcon size={14} className="text-slate-400" />
                  Nom complet
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Jean Dupont" 
                    {...field} 
                    disabled={isLoading} 
                    className="focus:ring-red-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700">
                  <Mail size={14} className="text-slate-400" />
                  E-mail
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="jean@example.com" 
                    {...field} 
                    disabled={isLoading} 
                    className="focus:ring-red-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700">
                  <Phone size={14} className="text-slate-400" />
                  Téléphone
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="06 12 34 56 78" 
                    {...field} 
                    disabled={isLoading} 
                    className="focus:ring-red-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700">
                  <Shield size={14} className="text-slate-400" />
                  Rôle
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-red-100">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Role).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(!user || form.watch('password')) && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700">
                  <Lock size={14} className="text-slate-400" />
                  {user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    disabled={isLoading} 
                    className="focus:ring-red-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-11 bg-gradient-to-r from-red-700 to-red-600 font-bold shadow-lg shadow-red-200 transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:opacity-70"
          >
            {isLoading ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
