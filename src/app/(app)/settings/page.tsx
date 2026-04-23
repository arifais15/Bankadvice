'use client';

import React from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Pencil, Image as ImageIcon, Info } from 'lucide-react';
import { printSettings } from '@/lib/settings';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


export default function SettingsPage() {
  const settings = printSettings;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Configure application settings."
      />

       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Read-Only Settings</AlertTitle>
          <AlertDescription>
            These settings are now managed directly in the application code. To make changes, please request edits from the AI assistant.
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
               <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="mt-4 space-y-4">
                    {settings.companyLogoUrl ? (
                        <>
                            <p className="text-sm font-medium text-muted-foreground">Logo Preview:</p>
                            <div className="relative w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                                <Image src={settings.companyLogoUrl} alt="Logo Preview" fill style={{ objectFit: 'contain' }} />
                            </div>
                        </>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">No custom logo configured. The default icon is being used.</div>
                    )}
                </div>
              </div>
               <div className="space-y-2">
                <Label>Company Seal</Label>
                 <div className="mt-4 space-y-4">
                    {settings.companySealUrl ? (
                        <>
                            <p className="text-sm font-medium text-muted-foreground">Seal Preview:</p>
                            <div className="relative w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                                <Image src={settings.companySealUrl} alt="Seal Preview" fill style={{ objectFit: 'contain' }} />
                            </div>
                        </>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">No custom seal configured.</div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                Header Settings
              </CardTitle>
              <CardDescription>
                The text for the printed advice header.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Header Line 1</Label>
                  <Input value={settings.headerLine1} readOnly />
               </div>
               <div className="space-y-2">
                  <Label>Header Line 2</Label>
                  <Input value={settings.headerLine2} readOnly />
               </div>
                <div className="space-y-2">
                  <Label>Header Line 3</Label>
                  <Input value={settings.headerLine3} readOnly />
               </div>
                <div className="space-y-2">
                  <Label>Header Line 4</Label>
                  <Input value={settings.headerLine4} readOnly />
               </div>
            </CardContent>
          </Card>
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
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        Enable Watermark
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Display a watermark logo in the background of printed advices.
                      </p>
                    </div>
                    <Switch
                        checked={settings.watermarkEnabled}
                        disabled
                      />
                  </div>
              {settings.watermarkEnabled && (
                 <div className="space-y-2">
                    <Label>Watermark Image</Label>
                     <div className="mt-4 space-y-4">
                        {settings.watermarkUrl ? (
                        <div className="relative w-40 h-40 border rounded-lg p-2 flex items-center justify-center bg-muted/50">
                            <Image src={settings.watermarkUrl} alt="Watermark Preview" fill style={{ objectFit: 'contain' }} />
                        </div>
                        ) : (
                          <div className="mt-2 text-sm text-muted-foreground">No custom watermark uploaded. The default company logo will be used if available.</div>
                        )}
                    </div>
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );
}
