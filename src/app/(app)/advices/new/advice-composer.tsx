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
  FileText,
  ListChecks,
  Users,
  Landmark,
  Edit,
} from 'lucide-react';
import { cn, formatCurrency, generateAdviceNumber } from '@/lib/utils';
import { generateAdviceNarrative } from '@/ai/flows/generate-advice-narrative-flow';
import type { Employee, BankAdvice } from '@/types';
import { advices, employees as allEmployeesData } from '@/lib/data';

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
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const adviceFormSchema = z.object({
  refNo: z.string().min(1, 'Reference No. is required.'),
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
  allEmployees: Employee[];
};

export function AdviceComposer({ adviceToEdit = null, allEmployees }: AdviceComposerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const isEditMode = !!adviceToEdit;

  // State for the employee selection combobox
  const [open, setOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [netPayment, setNetPayment] = React.useState('');
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const form = useForm<AdviceFormValues>({
    resolver: zodResolver(adviceFormSchema),
    defaultValues: adviceToEdit ? {
        ...adviceToEdit,
        purpose: adviceToEdit.purpose || '',
        context: adviceToEdit.context || '',
    } : {
      refNo: '27.12.3330.537.03.043.26',
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

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (isEditMode && adviceToEdit) {
        const adviceIndex = advices.findIndex(a => a.id === adviceToEdit.id);
        if (adviceIndex !== -1) {
          advices[adviceIndex] = { ...advices[adviceIndex], ...data, totalAmount };
        }
        toast({
          title: 'Advice Updated',
          description: `Advice ${advices[adviceIndex].adviceNumber} has been saved.`,
        });
      } else {
        const newAdvice: BankAdvice = {
          ...data,
          id: (advices.length + 1).toString(),
          adviceNumber: generateAdviceNumber(),
          date: new Date().toISOString(),
          status: 'Draft' as const,
          totalAmount: totalAmount,
        };
        advices.push(newAdvice);
        toast({
          title: 'Advice Created',
          description: `Advice ${newAdvice.adviceNumber} has been created as a draft.`,
        });
      }
      router.push('/advices');
      router.refresh(); // To reflect changes in the advice list
    } catch (error) {
      console.error("Failed to save advice:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not save the advice.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    Set the core details for this advice document. These can be
                    changed later.
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
                            placeholder="Enter the account number to debit"
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
                            <FormLabel>Recipient Bank Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Agrani Bank PLC" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bankBranch"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipient Branch Name</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="e.g., Rajabari Bazar Branch"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
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
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{editingIndex !== null ? 'Edit Employee' : 'Add Employee'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Employee</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between font-normal"
                        >
                          {selectedEmployee
                            ? allEmployees?.find((p) => p.id === selectedEmployee.id)?.name
                            : 'Select employee...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search employee by name..." />
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {allEmployees?.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={p.name}
                                onSelect={() => {
                                  setSelectedEmployee(p);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedEmployee?.id === p.id ? 'opacity-100' : 'opacity-0'
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
              <CardFooter className="flex flex-col gap-2">
                  <Button type="button" className="w-full" onClick={handleAddOrUpdateEmployee} disabled={!selectedEmployee || !netPayment}>
                    {editingIndex !== null ? (
                        <><Edit className="mr-2 h-4 w-4" /> Update Item</>
                    ) : (
                        <><PlusCircle className="mr-2 h-4 w-4" /> Add to Advice</>
                    )}
                  </Button>
                  {editingIndex !== null && (
                    <Button type="button" variant="ghost" className="w-full" onClick={() => {
                        setEditingIndex(null);
                        setSelectedEmployee(null);
                        setNetPayment('');
                    }}>
                        Cancel Edit
                    </Button>
                  )}
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <span>Employee Breakdown</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Employee Name</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead className="text-right">Net Payment</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No employees added yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="font-mono">{field.employee.id}</TableCell>
                                        <TableCell>{field.employee.name}</TableCell>
                                        <TableCell>{field.employee.designation}</TableCell>
                                        <TableCell className="w-[180px]">
                                            <FormField
                                                control={form.control}
                                                name={`employees.${index}.netPayment`}
                                                render={({ field: { onChange, ...restField } }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="text-right h-9"
                                                                step="0.01"
                                                                {...restField}
                                                                onChange={e => onChange(parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" type="button" onClick={() => handleStartEditing(index)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 items-center bg-muted/50 py-4 px-6">
                <span className="text-sm text-muted-foreground">Total Amount</span>
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
