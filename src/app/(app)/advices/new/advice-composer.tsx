'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronsUpDown,
  Check,
  PlusCircle,
  Trash2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn, formatCurrency, generateAdviceNumber } from '@/lib/utils';
import { generateAdviceNarrative } from '@/ai/flows/generate-advice-narrative-flow';
import type { Payee, AdvicePayeeItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const adviceFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  debitAccount: z.string().min(1, 'Debit account is required.'),
  purpose: z.string().optional(),
  context: z.string().optional(),
  narrative: z.string().min(1, 'Narrative is required.'),
  payees: z.array(
    z.object({
      payee: z.object({ id: z.string(), name: z.string() }),
      netPayment: z.number().min(0.01, 'Payment must be greater than 0.'),
    })
  ).min(1, 'At least one payee is required.'),
});

type AdviceFormValues = z.infer<typeof adviceFormSchema>;

type AdviceComposerProps = {
  allPayees: Payee[];
};

export function AdviceComposer({ allPayees }: AdviceComposerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // State for the payee selection combobox
  const [open, setOpen] = React.useState(false);
  const [selectedPayee, setSelectedPayee] = React.useState<Payee | null>(null);
  const [netPayment, setNetPayment] = React.useState('');

  const form = useForm<AdviceFormValues>({
    resolver: zodResolver(adviceFormSchema),
    defaultValues: {
      subject: '',
      debitAccount: '',
      narrative: '',
      payees: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payees',
  });

  const watchPayees = form.watch('payees');
  const totalAmount = watchPayees.reduce(
    (acc, curr) => acc + (Number(curr.netPayment) || 0),
    0
  );

  const handleAddPayee = () => {
    if (selectedPayee && netPayment) {
      const paymentAmount = parseFloat(netPayment);
      if (paymentAmount > 0) {
        append({
          payee: { id: selectedPayee.id, name: selectedPayee.name },
          netPayment: paymentAmount,
        });
        setSelectedPayee(null);
        setNetPayment('');
      }
    }
  };
  
  const handleGenerateNarrative = async () => {
    const purpose = form.getValues('purpose');
    const context = form.getValues('context');
    if (!purpose) {
      toast({
        variant: 'destructive',
        title: 'Purpose is required',
        description: 'Please provide a purpose to generate the narrative.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateAdviceNarrative({ purpose, context: context || '' });
      form.setValue('narrative', result.narrative, { shouldValidate: true });
      toast({
        title: 'Narrative Generated',
        description: 'AI-powered narrative has been added.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate narrative. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const onSubmit = async (data: AdviceFormValues) => {
    setIsSubmitting(true);
    // In a real app, this would be a server action call
    console.log('Form Submitted', data);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is where you would save to a database
      const newAdvice = {
        id: `adv-${Date.now()}`,
        adviceNumber: generateAdviceNumber(),
        date: new Date().toISOString(),
        status: 'Draft' as const,
        totalAmount: totalAmount,
        ...data
      };
      console.log("Creating new advice:", newAdvice);
      
      toast({
        title: 'Advice Created',
        description: `Advice ${newAdvice.adviceNumber} has been created as a draft.`,
      });
      router.push('/advices');
      // Force a refresh of the page to reflect new data from mock file
      router.refresh(); 

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error creating the advice.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Advice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Monthly Payroll - May 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debitAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debit Account</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the account number to debit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Narrative Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Payroll" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Context (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., for May salaries" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <Button type="button" variant="outline" size="sm" onClick={handleGenerateNarrative} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                 </Button>

                <FormField
                  control={form.control}
                  name="narrative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advice Narrative</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A descriptive text for the bank advice..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Add Payee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Payee</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between font-normal"
                        >
                          {selectedPayee
                            ? allPayees.find((p) => p.id === selectedPayee.id)?.name
                            : 'Select payee...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search payee by name..." />
                          <CommandEmpty>No payee found.</CommandEmpty>
                          <CommandGroup>
                            {allPayees.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={p.name}
                                onSelect={() => {
                                  setSelectedPayee(p);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedPayee?.id === p.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {p.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Net Payment</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={netPayment}
                    onChange={(e) => setNetPayment(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                  <Button type="button" className="w-full" onClick={handleAddPayee} disabled={!selectedPayee || !netPayment}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add to Advice
                  </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Payee Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payee Name</TableHead>
                            <TableHead className="text-right">Net Payment</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No payees added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{field.payee.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(field.netPayment)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 items-center bg-muted/50 py-4 px-6">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-bold text-xl">{formatCurrency(totalAmount)}</span>
            </CardFooter>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Create Advice
          </Button>
        </div>
      </form>
    </Form>
  );
}
