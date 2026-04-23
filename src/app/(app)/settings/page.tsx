'use client';

import React, { useEffect, useState } from 'react';![CDATA['use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Pencil, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { printSettings as defaultSettings } from '@/lib/settings';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { PrintSettings } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PrintSettings>({
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('printSettings');
      if (savedSettings) {
        form.reset(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Could not load settings from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  const onSubmit = (data: PrintSettings) => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...data,
        watermarkUrl: data.watermarkEnabled ? data.watermarkUrl : '',
      };
      localStorage.setItem('printSettings', JSON.stringify(dataToSave));
      toast({
        title: 'Settings Saved',
        description: 'Your print settings have been updated.',
      });
      // A full reload ensures all components pick up the new settings
      // This is a simple way to propagate changes without a complex state management solution.
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      let description = 'An unexpected error occurred.';
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          description = 'Storage limit exceeded. Please use smaller image URLs.';
      }
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: description,
      });
    } finally {
       setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const watchedValues = form.watch();

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <PageHeader
          title="Settings"
          description="Configure application and print settings."
        >
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </PageHeader>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Image Handling</AlertTitle>
          <AlertDescription>
            Please provide public URLs for images (e.g., from a storage service or image hosting site). Direct image uploads are not supported to prevent browser storage issues.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Company Identity
            </CardTitle>
            <CardDescription>
              Your company logo and seal for use in printed documents and the app header.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="companyLogoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>Used in the sidebar and print headers.</FormDescription>
                  {watchedValues.companyLogoUrl && (
                    <div className="mt-4 relative w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                      <Image src={watchedValues.companyLogoUrl} alt="Logo Preview" fill style={{ objectFit: 'contain' }} unoptimized />
                    </div>
                  )}
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="companySealUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Seal URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/seal.png" {...field} />
                  </FormControl>
                  <FormDescription>Used on printed documents.</FormDescription>
                  {watchedValues.companySealUrl && (
                    <div className="mt-4 relative w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                      <Image src={watchedValues.companySealUrl} alt="Seal Preview" fill style={{ objectFit: 'contain' }} unoptimized />
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Print Header Settings
            </CardTitle>
            <CardDescription>
              The text that appears on the printed advice header.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
             <FormField control={form.control} name="headerLine1" render={({ field }) => (<FormItem><FormLabel>Header Line 1</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
             <FormField control={form.control} name="headerLine2" render={({ field }) => (<FormItem><FormLabel>Header Line 2</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
             <FormField control={form.control} name="headerLine3" render={({ field }) => (<FormItem><FormLabel>Header Line 3</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
             <FormField control={form.control} name="headerLine4" render={({ field }) => (<FormItem><FormLabel>Header Line 4</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Print Layout Settings
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
                        <FormLabel className="text-base">Enable Watermark</FormLabel>
                        <FormDescription>Display a watermark logo in the background of printed advices.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                  </FormItem>
                )}
              />
            {watchedValues.watermarkEnabled && (
                <FormField
                  control={form.control}
                  name="watermarkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Watermark Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/watermark.png" {...field} />
                      </FormControl>
                      <FormDescription>If empty, the company logo will be used as the watermark.</FormDescription>
                       {watchedValues.watermarkUrl && (
                        <div className="mt-4 relative w-40 h-40 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                            <Image src={watchedValues.watermarkUrl} alt="Watermark Preview" fill style={{ objectFit: 'contain' }} unoptimized />
                        </div>
                        )}
                    </FormItem>
                  )}
                />
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
