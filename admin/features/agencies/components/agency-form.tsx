'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Agency } from '@/types';
import type { AgencyFormValues } from '@/features/agencies/services/agency-service';
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

const formSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
});

type FormInput = z.infer<typeof formSchema>;

export interface AgencyFormProps {
  agency?: Agency | null;
  onSubmit: (values: AgencyFormValues) => void;
  isLoading: boolean;
}

export const AgencyForm = ({ agency, onSubmit, isLoading }: AgencyFormProps) => {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agency?.name || '',
      city: agency?.city || '',
      address: agency?.address || '',
      phone: agency?.phone || '',
      email: agency?.email || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: agency?.name || '',
      city: agency?.city || '',
      address: agency?.address || '',
      phone: agency?.phone || '',
      email: agency?.email || '',
    });
  }, [agency, form]);

  const handleSubmit = (values: FormInput) => {
    onSubmit({
      name: values.name,
      city: values.city,
      address: values.address || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'agence</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="Ex: ADA Rabat Agdal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} placeholder="Ex: Rabat" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse (Optionnel)</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone (Optionnel)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
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
                <FormLabel>Email (Optionnel)</FormLabel>
                <FormControl>
                  <Input {...field} type="email" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </form>
    </Form>
  );
};
