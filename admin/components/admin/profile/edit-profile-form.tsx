'use client';

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
import { User } from '@/types';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateUser } from '@/actions/user';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

interface EditProfileFormProps {
  user: User;
}

export const EditProfileForm = ({ user }: EditProfileFormProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      updateUser(user.id, values)
        .then(() => {
          toast.success('Profile updated successfully');
        })
        .catch((error) => {
          toast.error(error.message);
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
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
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Save Changes
        </Button>
      </form>
    </Form>
  );
};
