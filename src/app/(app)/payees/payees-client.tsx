'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Employee } from '@/types';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const employeeSchema = z.object({
  id: z.string().min(1, 'Employee ID is required.'),
  name: z.string().min(1, 'Name is required.'),
  designation: z.string().min(1, 'Designation is required.'),
  bankName: z.string().min(1, 'Bank name is required.'),
  branch: z.string().min(1, 'Branch is required.'),
  accountNumber: z.string().min(1, 'Account number is required.'),
  routing: z.string().min(1, 'Routing number is required.'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

type PayeesClientProps = {
  data: Employee[];
};

export function PayeesClient({ data }: PayeesClientProps) {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);

  const { toast } = useToast();

  React.useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees(data);
      localStorage.setItem('employees', JSON.stringify(data));
    }
    setIsLoading(false);
  }, [data]);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      id: '',
      name: '',
      designation: '',
      bankName: '',
      branch: '',
      accountNumber: '',
      routing: '',
    },
  });

  const handleOpenForm = (employee: Employee | null) => {
    setEditingEmployee(employee);
    if (employee) {
      form.reset(employee);
    } else {
      const nextId = (employees.reduce((maxId, emp) => Math.max(parseInt(emp.id, 10), maxId), 0) + 1).toString().padStart(4, '0');
      form.reset({
        id: nextId,
        name: '',
        designation: '',
        bankName: '',
        branch: '',
        accountNumber: '',
        routing: '',
      });
    }
    setIsFormOpen(true);
  };
  
  const handleBulkUpload = () => {
    toast({
        title: "Feature not implemented",
        description: "Bulk employee uploading is planned for a future release.",
    });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const updatedEmployees = employees.filter(p => p.id !== employeeId);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    toast({ title: "Employee Deleted", description: "The employee has been removed from the registry." });
  };

  const onSubmit = async (formData: EmployeeFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let updatedEmployees;
    if (editingEmployee) {
      updatedEmployees = employees.map(p => p.id === editingEmployee.id ? { ...p, ...formData } : p);
      toast({ title: "Employee Updated", description: `${formData.name}'s details have been saved.` });
    } else {
      const newEmployee: Employee = { ...formData };
      updatedEmployees = [newEmployee, ...employees];
      toast({ title: "Employee Added", description: `${formData.name} has been added to the registry.` });
    }
    
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));

    setIsSubmitting(false);
    setIsFormOpen(false);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Upload
        </Button>
        <Button onClick={() => handleOpenForm(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Account No.</TableHead>
                <TableHead>Routing</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium font-mono">{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.bankName}</TableCell>
                    <TableCell>{employee.branch}</TableCell>
                    <TableCell className="font-mono">{employee.accountNumber}</TableCell>
                    <TableCell className="font-mono">{employee.routing}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(employee)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              employee record for "{employee.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? "Update the employee's details below." : "Enter the new employee's details."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl><Input {...field} disabled={!!editingEmployee} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
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
                <FormField control={form.control} name="branch" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
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
               <FormField control={form.control} name="routing" render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
