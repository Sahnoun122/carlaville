'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { FormInputField, FormTextareaField } from '@/components/ui/form-fields';
import { FormSelectField } from '@/components/ui/form-select-field';
import { FormContent, FormSection } from '@/components/ui/form-section';
import { FormFooter } from '@/components/ui/form-footer';
import { formStyles } from '@/components/ui/form-styles';
import { User, Role } from '@/types';
import type { UserFormValues } from '@/features/users/services/user-service';
import { User as UserIcon, Mail, Phone, Lock, Shield, Loader2, Check } from 'lucide-react';

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

  const roleOptions = Object.values(Role).map((role) => ({
    label: role,
    value: role,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={formStyles.formContainer}>
        <FormContent
          title={user ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          description="Gérez les accès et les informations de profil."
        >
          {/* Basic Information Section */}
          <FormSection title="Informations personnelles" layout="double">
            <FormInputField
              form={form}
              name="name"
              label="Nom complet"
              placeholder="Jean Dupont"
              icon={<UserIcon />}
              required
              type="text"
            />
            <FormInputField
              form={form}
              name="email"
              label="Email"
              placeholder="jean@example.com"
              icon={<Mail />}
              required
              type="email"
            />
          </FormSection>

          {/* Contact & Access Section */}
          <FormSection
            title="Contact et accès"
            layout="double"
            separator
          >
            <FormInputField
              form={form}
              name="phone"
              label="Téléphone"
              placeholder="06 12 34 56 78"
              icon={<Phone />}
              required={!user}
            />
            <FormSelectField
              form={form}
              name="role"
              label="Rôle"
              options={roleOptions}
              icon={<Shield />}
              required
            />
          </FormSection>

          {/* Security Section */}
          {(!user || form.watch('password')) && (
            <FormSection title="Sécurité" separator>
              <FormInputField
                form={form}
                name="password"
                label={user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                placeholder="••••••••"
                icon={<Lock />}
                required={!user}
                type="password"
                help="Minimum 6 caractères"
              />
            </FormSection>
          )}
        </FormContent>

        {/* Form Footer */}
        <FormFooter
          leftAction={{
            label: 'Réinitialiser',
            onClick: () => form.reset(),
            variant: 'ghost',
          }}
          actions={[
            {
              label: 'Valider les changements',
              onClick: form.handleSubmit(onSubmit),
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

