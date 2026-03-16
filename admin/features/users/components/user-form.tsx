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

const optionalPhoneSchema = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value : undefined))
  .refine((value) => !value || value.length >= 6, {
    message: 'Phone must be at least 6 characters',
  });

const optionalPasswordSchema = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value : undefined))
  .refine((value) => !value || value.length >= 6, {
    message: 'Password must be at least 6 characters',
  });

const baseFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: optionalPhoneSchema,
  password: optionalPasswordSchema,
  role: z.nativeEnum(Role),
});

const createFormSchema = baseFormSchema.extend({
  phone: z.string().min(6, 'Phone must be at least 6 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!user && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
};
