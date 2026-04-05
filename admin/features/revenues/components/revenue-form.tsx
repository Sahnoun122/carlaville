'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Form } from '@/components/ui/form';
import { FormInputField, FormSelectField } from '@/components/ui/form-fields';
import { FormContent, FormSection } from '@/components/ui/form-section';
import { FormFooter } from '@/components/ui/form-footer';
import { formStyles } from '@/components/ui/form-styles';
import { Revenue, RevenueFormValues } from '../services/revenue-service';
import { getAgencies } from '@/features/agencies/services/agency-service';
import { getCars } from '@/features/cars/services/car-service';
import { DollarSign, Calendar, FileText, Loader2, Check } from 'lucide-react';

const formSchema = z.object({
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  date: z.string().min(1, 'La date est requise'),
  agencyId: z.string().min(1, 'L\'agence est requise'),
  carId: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  description: z.string().optional(),
});

type FormInput = z.infer<typeof formSchema>;

export interface RevenueFormProps {
  revenue?: Revenue | null;
  onSubmit: (values: RevenueFormValues) => void;
  isLoading: boolean;
}

export const RevenueForm = ({ revenue, onSubmit, isLoading }: RevenueFormProps) => {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: revenue?.amount || 0,
      date: (revenue?.date || revenue?.recognizedDate) ? new Date(revenue.date || (revenue.recognizedDate as any)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      agencyId: revenue?.agencyId?._id || revenue?.agencyId?.id || revenue?.agencyId || '',
      carId: revenue?.carId?._id || revenue?.carId?.id || revenue?.carId || '',
      category: revenue?.category || 'RENTAL',
      description: revenue?.description || '',
    },
  });

  const selectedAgencyId = form.watch('agencyId');

  useEffect(() => {
    form.reset({
      amount: revenue?.amount || 0,
      date: (revenue?.date || revenue?.recognizedDate) ? new Date(revenue.date || revenue.recognizedDate!).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      agencyId: revenue?.agencyId?._id || revenue?.agencyId?.id || revenue?.agencyId || '',
      carId: revenue?.carId?._id || revenue?.carId?.id || revenue?.carId || '',
      category: revenue?.category || 'RENTAL',
      description: revenue?.description || '',
    });
  }, [revenue, form]);

  const { data: agenciesData, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['agencies-dropdown'],
    queryFn: () => getAgencies({ page: 1, limit: 100 }),
  });

  const { data: carsData, isLoading: isLoadingCars } = useQuery({
    queryKey: ['cars-dropdown', selectedAgencyId],
    queryFn: () => getCars({ page: 1, limit: 100, agencyId: selectedAgencyId || undefined }),
    enabled: !!selectedAgencyId,
  });

  const agencyOptions = agenciesData?.agencies?.map((agency: any) => ({
    label: agency.name,
    value: agency.id || agency._id,
  })) || [];

  const carOptions = carsData?.cars?.map((car: any) => ({
    label: `${car.brand} ${car.model} (${car.registrationNumber || 'Sans matricule'})`,
    value: car.id || car._id,
  })) || [];

  const handleSubmit = (values: FormInput) => {
    onSubmit({
      amount: values.amount,
      date: new Date(values.date).toISOString(),
      agencyId: values.agencyId,
      carId: values.carId || undefined,
      category: values.category,
      description: values.description || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={formStyles.formContainer}>
        <FormContent
          title={revenue ? 'Modifier le revenu' : 'Nouveau revenu manuel'}
          description="Saisissez les informations du revenu ci-dessous."
        >
          <FormSection title="Détails du revenu" layout="double">
            <FormInputField
              form={form}
              name="amount"
              label="Montant (MAD)"
              type="number"
              placeholder="Ex: 500"
              icon={<DollarSign />}
              required
            />
             <FormInputField
              form={form}
              name="date"
              label="Date"
              type="date"
              icon={<Calendar />}
              required
            />
          </FormSection>

          <FormSection title="Catégorie et Description" layout="double" separator>
            <FormSelectField
              form={form}
              name="category"
              label="Catégorie"
              options={[
                { label: 'Location', value: 'RENTAL' },
                { label: 'Pénalité', value: 'PENALTY' },
                { label: 'Assurance', value: 'INSURANCE' },
                { label: 'Autre', value: 'OTHER' },
              ]}
              required
            />
            <FormInputField
              form={form}
              name="description"
              label="Description (Optionnel)"
              placeholder="Ex: Frais de retard..."
              icon={<FileText />}
            />
          </FormSection>

          <FormSection title="Attribution" layout="double" separator>
            <FormSelectField
              form={form}
              name="agencyId"
              label="Agence"
              placeholder={isLoadingAgencies ? "Chargement..." : "Sélectionnez une agence"}
              options={agencyOptions}
              required
            />
            <FormSelectField
              form={form}
              name="carId"
              label="Voiture (Optionnel)"
              placeholder={!selectedAgencyId ? "Sélectionnez d'abord une agence" : isLoadingCars ? "Chargement..." : "Sélectionnez une voiture"}
              options={carOptions}
            />
          </FormSection>

        </FormContent>

        <FormFooter
          leftAction={{
            label: 'Annuler',
            onClick: () => form.reset(),
            variant: 'ghost',
          }}
          actions={[
            {
              label: 'Enregistrer le revenu',
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
