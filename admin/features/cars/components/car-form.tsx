'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Trash2, UploadCloud, Loader2, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { FormInputField, FormTextareaField } from '@/components/ui/form-fields';
import { FormSelectField } from '@/components/ui/form-select-field';
import { FormContent, FormSection } from '@/components/ui/form-section';
import { FormFooter } from '@/components/ui/form-footer';
import { formStyles } from '@/components/ui/form-styles';
import {
  Agency,
  AvailabilityStatus,
  Car,
  CarCategory,
  FuelType,
  Transmission,
} from '@/types';
import type { CarFormValues } from '@/features/cars/services/car-service';
import { uploadImages } from '@/features/uploads/services/upload-service';
import { cn } from '@/lib/utils';

const optionalNumberSchema = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, z.number().optional());

const formSchema = z.object({
  agencyId: z.string().optional(),
  brand: z.string().min(1, 'Requis'),
  model: z.string().min(1, 'Requis'),
  year: z.coerce.number().int().min(1990).max(2100),
  category: z.nativeEnum(CarCategory),
  transmission: z.nativeEnum(Transmission),
  fuelType: z.nativeEnum(FuelType),
  seats: z.coerce.number().int().min(1),
  luggage: optionalNumberSchema,
  dailyPrice: z.coerce.number().min(1),
  minRentalDays: optionalNumberSchema,
  depositAmount: optionalNumberSchema,
  deliveryFee: optionalNumberSchema,
  city: z.string().min(1, 'Requis'),
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
});

interface CarFormProps {
  car?: Car | null;
  agencies: Agency[];
  onSubmit: (values: CarFormValues) => void;
  isLoading: boolean;
}

export const CarForm = ({ car, agencies, onSubmit, isLoading }: CarFormProps) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      agencyId: car?.agencyId || '',
      brand: car?.brand || '',
      model: car?.model || '',
      year: car?.year || new Date().getFullYear(),
      category: car?.category || CarCategory.ECONOMY,
      transmission: car?.transmission || Transmission.AUTOMATIC,
      fuelType: car?.fuelType || FuelType.GASOLINE,
      seats: car?.seats || 5,
      luggage: car?.luggage,
      dailyPrice: car?.dailyPrice || 0,
      minRentalDays: car?.minRentalDays,
      depositAmount: car?.depositAmount,
      deliveryFee: car?.deliveryFee,
      city: car?.city || '',
      availabilityStatus: car?.availabilityStatus || AvailabilityStatus.AVAILABLE,
      description: car?.description || '',
      images: car?.images || [],
    },
  });

  useEffect(() => {
    if (car) form.reset({ ...car, agencyId: car.agencyId || '', description: car.description || '' } as any);
  }, [car, form]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadImages(files);
      const current = form.getValues('images');
      form.setValue('images', [...current, ...uploaded.map(f => f.url)]);
    } catch (err) {
      setUploadError("Erreur upload");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    form.setValue('images', form.getValues('images').filter((_, i) => i !== idx));
  };

  const categoryOptions = Object.values(CarCategory).map((v) => ({
    label: v,
    value: v,
  }));

  const statusOptions = Object.values(AvailabilityStatus).map((v) => ({
    label: v,
    value: v,
  }));

  const transmissionOptions = Object.values(Transmission).map((v) => ({
    label: v,
    value: v,
  }));

  const fuelOptions = Object.values(FuelType).map((v) => ({
    label: v,
    value: v,
  }));

  const agencyOptions = agencies.map((a) => ({
    label: a.name,
    value: a.id || (a as any)._id || '',
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={formStyles.formContainer}>
        <FormContent
          title={car ? "Modifier le véhicule" : "Nouveau véhicule"}
          description="Saisissez les informations détaillées du véhicule."
        >
          {/* Identity Section */}
          <FormSection title="Identité du véhicule" layout="double">
            <FormInputField
              form={form}
              name="brand"
              label="Marque"
              placeholder="ex: HYUNDAI"
              required
            />
            <FormInputField
              form={form}
              name="model"
              label="Modèle"
              placeholder="ex: Tucson"
              required
            />
          </FormSection>

          {/* Specifications Section */}
          <FormSection title="Spécifications" layout="triple" separator>
            <FormInputField
              form={form}
              name="year"
              label="Année"
              type="number"
              required
            />
            <FormSelectField
              form={form}
              name="category"
              label="Catégorie"
              options={categoryOptions}
              required
            />
            <FormSelectField
              form={form}
              name="availabilityStatus"
              label="Statut"
              options={statusOptions}
              required
            />
          </FormSection>

          {/* Location Section */}
          <FormSection title="Localisation" layout="double" separator>
            <FormSelectField
              form={form}
              name="agencyId"
              label="Agence"
              options={agencyOptions}
              placeholder="Choisir une agence..."
            />
            <FormInputField
              form={form}
              name="city"
              label="Ville"
              placeholder="Casablanca, Marrakech..."
              required
            />
          </FormSection>

          {/* Technical Specs Section */}
          <FormSection title="Caractéristiques techniques" layout="quad" separator>
            <FormSelectField
              form={form}
              name="transmission"
              label="Boîte"
              options={transmissionOptions}
              required
            />
            <FormSelectField
              form={form}
              name="fuelType"
              label="Carburant"
              options={fuelOptions}
              required
            />
            <FormInputField
              form={form}
              name="seats"
              label="Places"
              type="number"
              required
            />
            <FormInputField
              form={form}
              name="luggage"
              label="Bagages"
              type="number"
            />
          </FormSection>

          {/* Pricing Section */}
          <FormSection title="Tarification" layout="quad" separator>
            <FormInputField
              form={form}
              name="dailyPrice"
              label="Prix/Jour (DH)"
              type="number"
              required
              className="col-span-2"
            />
            <FormInputField
              form={form}
              name="minRentalDays"
              label="Jours Min."
              type="number"
            />
            <FormInputField
              form={form}
              name="depositAmount"
              label="Caution (DH)"
              type="number"
            />
            <FormInputField
              form={form}
              name="deliveryFee"
              label="Livraison (DH)"
              type="number"
            />
          </FormSection>

          {/* Media Section */}
          <FormSection title="Gestion des photos" separator>
            <div className="space-y-4">
              <p className="text-slate-400 text-xs italic">Format conseillé: 16/9</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                <label className="aspect-square bg-[#F8F9FA] border border-[#EDEFF2] rounded-[12px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isUploading || isLoading}
                    className="hidden"
                  />
                  <UploadCloud
                    size={24}
                    className="text-slate-300 group-hover:text-red-500 transition-colors"
                  />
                  <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
                    Dépôt Media
                  </span>
                </label>
                {form.watch('images').map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square border border-slate-100 rounded-[12px] overflow-hidden group shadow-sm transition-transform hover:scale-105 duration-300"
                  >
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          {/* Description Section */}
          <FormSection separator>
            <FormTextareaField
              form={form}
              name="description"
              label="Notes additionnelles"
              placeholder="Décrivez les points clés du véhicule..."
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
              label: 'Soumettre',
              onClick: form.handleSubmit(onSubmit),
              variant: 'primary',
              loading: isLoading || isUploading,
              icon: isLoading || isUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />,
            },
          ]}
        />
      </form>
    </Form>
  );
};
