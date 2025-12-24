import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAgentRequest, type AgentRequestInput } from '@/features/agent';
import { useLanguage } from '@/contexts/LanguageContext';

const formSchema = z.object({
  full_name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(100),
  phone: z.string().min(8, 'Le téléphone doit contenir au moins 8 chiffres').max(20),
  organization: z.string().min(1, 'Veuillez sélectionner une organisation'),
  preferred_zone: z.string().max(100).optional(),
  motivation: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AgentRegistrationFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<FormValues>;
}

const ORGANIZATIONS = [
  { value: 'DGE', label: 'Direction Générale des Entreprises (DGE)' },
  { value: 'ANSUT', label: 'ANSUT' },
  { value: 'ARTCI', label: 'ARTCI' },
  { value: 'Autre', label: 'Autre organisation' },
];

export function AgentRegistrationForm({ onSuccess, defaultValues }: AgentRegistrationFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { submitRequest, isLoading } = useAgentRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: defaultValues?.full_name || '',
      phone: defaultValues?.phone || '',
      organization: defaultValues?.organization || 'DGE',
      preferred_zone: defaultValues?.preferred_zone || '',
      motivation: defaultValues?.motivation || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const input: AgentRequestInput = {
      full_name: values.full_name.trim(),
      phone: values.phone.trim(),
      organization: values.organization,
      preferred_zone: values.preferred_zone?.trim(),
      motivation: values.motivation?.trim(),
    };

    const result = await submitRequest(input);
    
    if (result) {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'inscription agent a été soumise avec succès.',
      });
      onSuccess?.();
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Demande d'inscription Agent</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour devenir agent de terrain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre nom et prénom" {...field} />
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
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="07 XX XX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une organisation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORGANIZATIONS.map((org) => (
                        <SelectItem key={org.value} value={org.value}>
                          {org.label}
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
              name="preferred_zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone souhaitée</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Abidjan, Plateau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Expliquez pourquoi vous souhaitez devenir agent (optionnel)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Soumettre ma demande
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
