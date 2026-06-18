'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Pencil, Image as ImageIcon, Loader2, Info, Users } from 'lucide-react';
import { printSettings as defaultSettings } from '@/lib/settings';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { PrintSettings } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { usePrintSettings } from '@/hooks/use-print-settings';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { settings, isLoading } = usePrintSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<PrintSettings>({
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    if (!isLoading && settings && !isInitialized) {
      form.reset(settings);
      setIsInitialized(true);
    }
  }, [isLoading, settings, isInitialized, form]);

  const onSubmit = async (data: PrintSettings) => {
    if (!firestore) return;
    setIsSaving(true);
    
    const settingsRef = doc(firestore, 'settings', 'print');
    
    setDoc(settingsRef, data, { merge: true })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({
      title: 'Settings Saved',
      description: 'Your print settings have been updated.',
    });
    
    setIsSaving(false);
  };

  const watchedValues = form.watch();

  if (isLoading && !isInitialized) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Settings"
          description="Configure application and print settings (Cloud Synced)."
        >
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </PageHeader>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Cloud Persistence</AlertTitle>
          <AlertDescription>
            Settings are saved to Firestore. Changes reflect instantly across the application.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Company Identity
            </CardTitle>
            <CardDescription>
              Your company logo and seal for use in printed documents.
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
                  <FormDescription>Used in print headers and sidebar.</FormDescription>
                  {watchedValues.companyLogoUrl && (
                    <div className="mt-4 relative w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                      <Image src={watchedValues.companyLogoUrl} alt="Logo Preview" fill style={{ objectFit: 'contain' }} unoptimized />
                    </div>
                  )}
                </FormItem>
              )}
            />
            <div className="space-y-4">
               <FormField
                control={form.control}
                name="companySealEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Company Seal</FormLabel>
                        <FormDescription>Display the company seal on printed documents.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                  </FormItem>
                )}
              />
              {watchedValues.companySealEnabled && (
                <FormField
                  control={form.control}
                  name="companySealUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Seal URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/seal.png" {...field} />
                      </FormControl>
                      {watchedValues.companySealUrl && (
                        <div className="mt-4 relative w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                          <Image src={watchedValues.companySealUrl} alt="Seal Preview" fill style={{ objectFit: 'contain' }} unoptimized />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Print Header Settings
            </CardTitle>
            <CardDescription>
              The text that appears on the top of the printed advice.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
             <FormField control={form.control} name="headerLine1" render={({ field }) => (<FormItem><FormLabel>Header Line 1 (Bengali)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
             <FormField control={form.control} name="headerLine2" render={({ field }) => (<FormItem><FormLabel>Header Line 2 (English)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
             <FormField control={form.control} name="headerLine3" render={({ field }) => (<FormItem><FormLabel>Header Line 3 (Address)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
             <FormField control={form.control} name="headerLine4" render={({ field }) => (<FormItem><FormLabel>Header Line 4 (Contact)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Document Signatories
            </CardTitle>
            <CardDescription>
              Configure names and designations for the authorized signers.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Signatory 1 (Left)</h3>
              <FormField
                control={form.control}
                name="signatory1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Md. Ashraful Alam" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="signatory1Designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl><Input placeholder="e.g. AGM Finance" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Signatory 2 (Right)</h3>
              <FormField
                control={form.control}
                name="signatory2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Md. Sohel Rana" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="signatory2Designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl><Input placeholder="e.g. Senior General Manager" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Layout & Extras
            </CardTitle>
            <CardDescription>
              Additional layout controls for the document.
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
                        <FormDescription>Display a subtle background logo.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
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
                      <FormDescription>Defaults to company logo if empty.</FormDescription>
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
