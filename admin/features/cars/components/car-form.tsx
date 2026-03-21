'use client';

import { ChangeEvent, useEffect, useState } from 'react';
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

const optionalNumberSchema = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, z.number().optional());

const formSchema = z.object({
  agencyId: z.string().optional(),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  year: z.coerce.number().int().min(1990, 'L\'année est invalide').max(2100),
  category: z.nativeEnum(CarCategory),
  transmission: z.nativeEnum(Transmission),
  fuelType: z.nativeEnum(FuelType),
  seats: z.coerce.number().int().min(1, 'Le nombre de places doit être au moins de 1'),
  luggage: optionalNumberSchema,
  dailyPrice: z.coerce.number().min(1, 'Le prix journalier doit être supérieur à 0'),
  minRentalDays: optionalNumberSchema,
  depositAmount: optionalNumberSchema,
  deliveryFee: optionalNumberSchema,
  city: z.string().min(1, 'La ville est requise'),
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  imagesText: z.string().optional(),
});

interface CarFormProps {
  car?: Car | null;
  agencies: Agency[];
  onSubmit: (values: CarFormValues) => void;
  isLoading: boolean;
}

type CarFormInput = z.infer<typeof formSchema>;

const splitImages = (imagesText?: string): string[] => {
  if (!imagesText) {
    return [];
  }

  return imagesText
    .split('\n')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

export const CarForm = ({ car, agencies, onSubmit, isLoading }: CarFormProps) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const form = useForm<CarFormInput>({
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
      imagesText: car?.images?.join('\n') || '',
    },
  });

  useEffect(() => {
    setUploadError(null);
    form.reset({
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
      imagesText: car?.images?.join('\n') || '',
    });
  }, [car, form]);

  const handleImagesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setUploadError(null);
    setIsUploadingImages(true);

    try {
      const uploaded = await uploadImages(selectedFiles);
      const existing = form.getValues('imagesText') || '';
      const newUrls = uploaded.map((file) => file.url).join('\n');
      const separator = existing.trim().length > 0 ? '\n' : '';
      form.setValue('imagesText', `${existing}${separator}${newUrls}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'L\'importation de l\'image a échoué.';

      setUploadError(message);
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSubmit = (values: CarFormInput) => {
    onSubmit({
      agencyId:
        values.agencyId && values.agencyId.trim().length > 0
          ? values.agencyId
          : undefined,
      brand: values.brand,
      model: values.model,
      year: values.year,
      category: values.category,
      transmission: values.transmission,
      fuelType: values.fuelType,
      seats: values.seats,
      luggage: values.luggage,
      dailyPrice: values.dailyPrice,
      minRentalDays: values.minRentalDays,
      depositAmount: values.depositAmount,
      deliveryFee: values.deliveryFee,
      city: values.city,
      availabilityStatus: values.availabilityStatus,
      images: splitImages(values.imagesText),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="agencyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agence</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                value={field.value && field.value.length > 0 ? field.value : '__none__'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune agence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Aucune agence</SelectItem>
                  {agencies.map((agency) => {
                    const agencyValue = agency.id || agency._id;
                    if (!agencyValue) {
                      return null;
                    }

                    return (
                      <SelectItem key={agencyValue} value={agencyValue}>
                        {agency.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isLoading} />
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
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(CarCategory).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="availabilityStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disponibilité</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(AvailabilityStatus).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Boîte de vitesses</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une boîte de vitesses" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Transmission).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carburant</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un carburant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(FuelType).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="seats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Places</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="luggage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bagages (optionnel)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="dailyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix journalier</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minRentalDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jours de loc. min (optionnel)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caution (optionnelle)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frais de livraison (optionnels)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imagesText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URLs des images (une par ligne)</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-24 px-3 py-2 border rounded"
                  {...field}
                  disabled={isLoading || isUploadingImages}
                />
              </FormControl>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  disabled={isLoading || isUploadingImages}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Importez une ou plusieurs photos. Les URLs sont ajoutées automatiquement.
                </p>
              </div>
              {uploadError ? <p className="text-sm text-rose-600">{uploadError}</p> : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading || isUploadingImages}>
          {isLoading || isUploadingImages ? 'Enregistrement...' : 'Enregistrer le véhicule'}
        </Button>
      </form>
    </Form>
  );
};
