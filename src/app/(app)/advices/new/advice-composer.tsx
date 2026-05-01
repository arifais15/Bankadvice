'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  ChevronsUpDown,
  Check,
  PlusCircle,
  Trash2,
  Sparkles,
  Loader2,
  FileText,
  Landmark,
  Edit,
  CalendarIcon,
} from 'lucide-react';
import { cn, formatCurrency, generateAdviceNumber } from '@/lib/utils';
import { generateAdviceNarrative } from '@/ai/flows/generate-advice-narrative-flow';
import type { Employee, BankAdvice } from '@/types';
import { defaultSubjects } from '@/lib/data';
import { useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const adviceFormSchema = z.object({
  refNo: z.string().min(1, 'Reference No. is required.'),
  date: z.date({ required_error: 'Advice date is required.' }),
  subject: z.string().min(1, 'Subject is required.'),
  debitAccount: z.string().min(1, 'Debit account is required.'),
  bankName: z.string().min(1, 'Recipient bank name is required.'),
  bankBranch: z.string().min(1, 'Recipient bank branch is required.'),
  purpose: z.string().optional(),
  context: z.string().optional(),
  narrative: z.string().min(1, 'Narrative is required.'),
  employees: z.array(
    z.object({
      employee: z.custom<Employee>(),
      netPayment: z.number().min(0.01, 'Payment must be greater than 0.'),
    })
  ).min(1, 'At least one employee is required.'),
});

type AdviceFormValues = z.infer<typeof adviceFormSchema>;

type AdviceComposerProps = {
  adviceToEdit?: BankAdvice | null;
};

export function AdviceComposer({ adviceToEdit = null }: AdviceComposerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const isEditMode = !!adviceToEdit;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const employeesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'employees'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: allEmployees } = useCollection<Employee>(employeesQuery as any);
  
  const [open, setOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [netPayment, setNetPayment] = React.useState('');
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  
  const [subjects, setSubjects] = React.useState<string[]>(defaultSubjects);
  
  const defaultRefNo = `27.12.3330.537.03.043.${new Date().getFullYear().toString().slice(-2)}`;

  React.useEffect(() => {
    try {
      const customSubjects = localStorage.getItem('customSubjects');
      if (customSubjects) {
        const parsedSubjects = JSON.parse(customSubjects);
        setSubjects(prev => [...new Set([...prev, ...parsedSubjects])]);
      }
    } catch (error) {
      console.error("Failed to load custom subjects", error);
    }
  }, []);

  const form = useForm<AdviceFormValues>({
    resolver: zodResolver(adviceFormSchema),
    defaultValues: adviceToEdit ? {
        ...adviceToEdit,
        date: new Date(adviceToEdit.date),
        purpose: adviceToEdit.purpose || '',
        context: adviceToEdit.context || '',
    } : {
      refNo: defaultRefNo,
      date: new Date(),
      subject: '',
      debitAccount: 'CD-0200017857835',
      bankName: 'Agrani Bank PLC',
      bankBranch: 'Rajabari Bazar Branch',
      purpose: '',
      context: '',
      narrative: '',
      employees: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'employees',
  });

  const watchEmployees = form.watch('employees');
  const totalAmount = watchEmployees.reduce(
    (acc, curr) => acc + (Number(curr.netPayment) || 0),
    0
  );

  const handleAddOrUpdateEmployee = () => {
    if (selectedEmployee && netPayment) {
      const paymentAmount = parseFloat(netPayment);
      if (paymentAmount > 0) {
        const newItem = {
          employee: selectedEmployee,
          netPayment: paymentAmount,
        };
        if (editingIndex !== null) {
          update(editingIndex, newItem);
          setEditingIndex(null);
        } else {
          append(newItem);
        }
        setSelectedEmployee(null);
        setNetPayment('');
      }
    }
  };

  const handleStartEditing = (index: number) => {
    const item = form.getValues(`employees.${index}`);
    setEditingIndex(index);
    setSelectedEmployee(item.employee);
    setNetPayment(item.netPayment.toString());
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
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate narrative.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: AdviceFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const adviceId = isEditMode && adviceToEdit ? adviceToEdit.id : generateAdviceNumber();
    const adviceRef = doc(firestore, 'advices', adviceId);
    
    const payload: BankAdvice = {
      ...data,
      id: adviceId,
      adviceNumber: adviceId,
      date: data.date.toISOString(),
      totalAmount,
      status: adviceToEdit?.status || 'Draft',
    };

    setDoc(adviceRef, payload, { merge: true })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: adviceRef.path,
          operation: 'write',
          requestResourceData: payload,
        }));
      });

    toast({
      title: isEditMode ? 'Advice Updated' : 'Advice Created',
      description: `Advice ${adviceId} has been saved.`,
    });
    
    router.push('/advices');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Bank Advice' : 'New Bank Advice'}</h2>
             <Dialog>
                <DialogTrigger asChild>
                <Button variant="outline">
                    <Landmark className="mr-2 h-4 w-4" />
                    Configure Bank Details
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Advice Configuration</DialogTitle>
                    <DialogDescription>
                    Set the core details for this advice document.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <FormField
                    control={form.control}
                    name="refNo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Reference No.</FormLabel>
                        <FormControl>
                            <Input
                            placeholder="e.g., 27.12.3330.537.03.043.26"
                            {...field}
                            />
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
                            <Input
                            placeholder="Enter account number"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipient Bank</FormLabel>
                            <FormControl>
                            <Input placeholder="Agrani Bank" {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bankBranch"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Branch</FormLabel>
                            <FormControl>
                            <Input placeholder="Main Branch" {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button type="button">Done</Button>
                    </DialogClose>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Advice Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <Input placeholder="Monthly Salary" {...field} list="subject-suggestions" />
                        </FormControl>
                        <datalist id="subject-suggestions">
                            {subjects.map((s) => <option key={s} value={s} />)}
                        </datalist>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                          <FormLabel>Advice Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {mounted && field.value ? format(field.value, "dd-MMM-yyyy") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Narrative Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="purpose" render={({ field }) => (
                      <FormItem><FormLabel>Purpose</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="context" render={({ field }) => (
                      <FormItem><FormLabel>Context</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                </div>
                 <Button type="button" variant="outline" size="sm" onClick={handleGenerateNarrative} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                 </Button>
                <FormField control={form.control} name="narrative" render={({ field }) => (
                    <FormItem><FormLabel>Narrative</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl></FormItem>
                )} />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  <span>{editingIndex !== null ? 'Edit Item' : 'Add Item'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Employee</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                          {selectedEmployee ? selectedEmployee.name : 'Select...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup>
                              {allEmployees?.map((p) => (
                                <CommandItem key={p.id} value={p.name} onSelect={() => { setSelectedEmployee(p); setOpen(false); }}>
                                  <Check className={cn('mr-2 h-4 w-4', selectedEmployee?.id === p.id ? 'opacity-100' : 'opacity-0')} />
                                  {p.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" value={netPayment} onChange={(e) => setNetPayment(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                  <Button type="button" className="w-full" onClick={handleAddOrUpdateEmployee} disabled={!selectedEmployee || !netPayment}>
                    {editingIndex !== null ? 'Update' : 'Add to Advice'}
                  </Button>
                  {editingIndex !== null && <Button type="button" variant="ghost" className="w-full" onClick={() => { setEditingIndex(null); setSelectedEmployee(null); setNetPayment(''); }}>Cancel</Button>}
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card>
            <CardHeader><CardTitle>Employee Breakdown</CardTitle></CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Net Payment</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.length === 0 ? <TableRow><TableCell colSpan={4} className="h-24 text-center">Empty.</TableCell></TableRow> : fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell className="font-mono">{field.employee.id}</TableCell>
                                    <TableCell>{field.employee.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(field.netPayment)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" type="button" onClick={() => handleStartEditing(index)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 bg-muted/50 py-4 px-6">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-xl">{formatCurrency(totalAmount)}</span>
            </CardFooter>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isEditMode ? 'Save Changes' : 'Create Advice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
