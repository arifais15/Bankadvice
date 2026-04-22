'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Payee } from '@/types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Upload, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const payeeSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  bankName: z.string().min(1, 'Bank name is required.'),
  accountNumber: z.string().min(1, 'Account number is required.'),
  branchCode: z.string().min(1, 'Branch code is required.'),
});

type PayeeFormValues = z.infer<typeof payeeSchema>;

type PayeesClientProps = {
  data: Payee[];
};

export function PayeesClient({ data }: PayeesClientProps) {
  const [payees, setPayees] = React.useState(data);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingPayee, setEditingPayee] = React.useState<Payee | null>(null);

  const { toast } = useToast();

  const form = useForm<PayeeFormValues>({
    resolver: zodResolver(payeeSchema),
    defaultValues: {
      name: '',
      email: '',
      bankName: '',
      accountNumber: '',
      branchCode: '',
    },
  });

  const handleOpenForm = (payee: Payee | null) => {
    setEditingPayee(payee);
    if (payee) {
      form.reset(payee);
    } else {
      form.reset({
        name: '',
        email: '',
        bankName: '',
        accountNumber: '',
        branchCode: '',
      });
    }
    setIsFormOpen(true);
  };
  
  const handleBulkUpload = () => {
    // In a real app, this would trigger a file picker and upload process.
    // For this demo, we'll just show a toast.
    toast({
        title: "Feature not implemented",
        description: "Bulk payee uploading is planned for a future release.",
    });
  };

  const onSubmit = async (formData: PayeeFormValues) => {
    setIsSubmitting(true);
    // Simulate server action
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (editingPayee) {
      // Update existing payee
      setPayees(payees.map(p => p.id === editingPayee.id ? { ...p, ...formData } : p));
      toast({ title: "Payee Updated", description: `${formData.name}'s details have been saved.` });
    } else {
      // Add new payee
      const newPayee: Payee = { id: `payee-${Date.now()}`, ...formData };
      setPayees([...payees, newPayee]);
      toast({ title: "Payee Added", description: `${formData.name} has been added to the registry.` });
    }

    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="mr-2" /> Bulk Upload
        </Button>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle className="mr-2" /> Add Payee
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payees.length > 0 ? (
                payees.map((payee) => (
                  <TableRow key={payee.id}>
                    <TableCell className="font-medium">{payee.name}</TableCell>
                    <TableCell>{payee.bankName}</TableCell>
                    <TableCell>{payee.accountNumber}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(payee)}>
                            <Edit className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => alert("Delete not implemented")}>
                            <Trash2 className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No payees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayee ? 'Edit Payee' : 'Add New Payee'}</DialogTitle>
            <DialogDescription>
              {editingPayee ? "Update the payee's details below." : "Enter the new payee's details."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="bankName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="branchCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <FormField control={form.control} name="accountNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                  {editingPayee ? 'Save Changes' : 'Add Payee'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
