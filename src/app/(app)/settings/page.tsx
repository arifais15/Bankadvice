'use client';

import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings as SettingsIcon, Trash2 } from 'lucide-react';

const settingsSchema = z.object({
  watermarkEnabled: z.boolean(),
  watermarkUrl: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      watermarkEnabled: false,
      watermarkUrl: '',
    },
  });

  React.useEffect(() => {
    try {
        const storedSettings = localStorage.getItem('printSettings');
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          form.reset(settings);
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
    } finally {
        setIsLoading(false);
    }
  }, [form]);

  const onSubmit = (data: SettingsFormValues) => {
    setIsSaving(true);
    const dataToSave = {
        ...data,
        watermarkUrl: data.watermarkEnabled ? data.watermarkUrl : '',
    };
    localStorage.setItem('printSettings', JSON.stringify(dataToSave));
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Your print settings have been updated.',
      });
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const watchWatermarkEnabled = form.watch('watermarkEnabled');

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Configure application settings."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                Print Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance of printed documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="watermarkEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Watermark
                      </FormLabel>
                      <FormDescription>
                        Display a watermark logo in the background of printed advices.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {watchWatermarkEnabled && (
                <FormField
                    control={form.control}
                    name="watermarkUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Watermark Image</FormLabel>
                        <FormControl>
                            <Input 
                                type="file"
                                accept="image/png, image/jpeg, image/gif, image/svg+xml"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            form.setValue('watermarkUrl', reader.result as string, { shouldValidate: true });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} 
                            />
                        </FormControl>
                        <FormDescription>
                            Upload an image from your PC. This will be stored locally in your browser.
                        </FormDescription>
                        
                        {field.value ? (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm font-medium text-muted-foreground">Current Watermark Preview:</p>
                            <div className="relative w-40 h-40 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                                <Image src={field.value} alt="Watermark Preview" fill style={{ objectFit: 'contain' }} />
                            </div>
                            <Button variant="outline" size="sm" type="button" onClick={() => {
                                form.setValue('watermarkUrl', '', { shouldValidate: true });
                                // Reset the file input element for better UX
                                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                            }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Watermark
                            </Button>
                        </div>
                        ) : (
                          <div className="mt-2 text-sm text-muted-foreground">No custom watermark uploaded. The default company logo will be used if available.</div>
                        )}
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
