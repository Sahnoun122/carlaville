'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { FormInputField } from '@/components/ui/form-fields';
import { FormContent, FormSection } from '@/components/ui/form-section';
import { FormFooter } from '@/components/ui/form-footer';
import { formStyles } from '@/components/ui/form-styles';
import { Agency } from '@/types';
import type { AgencyFormValues } from '@/features/agencies/services/agency-service';
import { Building2, MapPin, Phone, Mail, Loader2, Check } from 'lucide-react';

const baseSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  commissionRate: z.number().min(0).max(100).optional(),
});

type FormInput = z.infer<typeof baseSchema>;

const formSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  commissionRate: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().min(0).max(100).optional()),
}) as unknown as z.ZodType<FormInput, any, any>;

export interface AgencyFormProps {
  agency?: Agency | null;
  onSubmit: (values: AgencyFormValues) => void;
  isLoading: boolean;
}

export const AgencyForm = ({ agency, onSubmit, isLoading }: AgencyFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agency?.name || '',
      city: agency?.city || '',
      address: agency?.address || '',
      phone: agency?.phone || '',
      email: agency?.email || '',
      commissionRate: agency?.commissionRate ?? 15,
    },
  });

  useEffect(() => {
    form.reset({
      name: agency?.name || '',
      city: agency?.city || '',
      address: agency?.address || '',
      phone: agency?.phone || '',
      email: agency?.email || '',
      commissionRate: agency?.commissionRate ?? 15,
    });
  }, [agency, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      name: values.name,
      city: values.city,
      address: values.address || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      commissionRate: values.commissionRate,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={formStyles.formContainer}>
        <FormContent
          title={agency ? "Modifier l'agence" : "Nouvelle agence"}
          description="Saisissez les informations de l'agence ci-dessous."
        >
          {/* Identity Section */}
          <FormSection title="Identité" layout="double">
            <FormInputField
              form={form}
              name="name"
              label="Nom de l'agence"
              placeholder="Ex: ADA Rabat Agdal"
              icon={<Building2 />}
              required
            />
            <FormInputField
              form={form}
              name="city"
              label="Ville"
              placeholder="Ex: Rabat"
              icon={<MapPin />}
              required
            />
          </FormSection>

          {/* Address Section */}
          <FormSection title="Localisation" separator>
            <FormInputField
              form={form}
              name="address"
              label="Adresse complète (Optionnel)"
              placeholder="N°, Rue, Quartier..."
            />
          </FormSection>

          {/* Contact Section */}
          <FormSection title="Contact" layout="double" separator>
            <FormInputField
              form={form}
              name="phone"
              label="Téléphone"
              placeholder="05..."
              icon={<Phone />}
            />
            <FormInputField
              form={form}
              name="email"
              label="Email de contact"
              placeholder="contact@agence.ma"
              icon={<Mail />}
              type="email"
            />
          </FormSection>

          {/* Settings Section */}
          <FormSection title="Configuration Financière" separator>
            <FormInputField
              form={form}
              name="commissionRate"
              label="Commission Plateforme (%)"
              placeholder="Ex: 15"
              type="number"
            />
          </FormSection>
        </FormContent>

        {/* Form Footer */}
        <FormFooter
          leftAction={{
            label: 'Annuler',
            onClick: () => form.reset(),
            variant: 'ghost',
          }}
          actions={[
            {
              label: "Enregistrer l'agence",
              onClick: form.handleSubmit(handleSubmit),
              variant: 'primary',
              loading: isLoading,
              icon: isLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />,
            },
          ]}
        />
      </form>
    </Form>
  );
};
