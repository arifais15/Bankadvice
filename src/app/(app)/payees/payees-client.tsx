'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as XLSX from 'xlsx';
import type { Employee } from '@/types';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Upload, Edit, Trash2, Loader2, Download } from 'lucide-react';
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

export function PayeesClient() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const employeesQuery = React.useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'employees'), orderBy('id', 'asc'));
  }, [firestore]);

  const { data: employees, isLoading } = useCollection<Employee>(employeesQuery as any);

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
      const allIds = employees ? employees.map(e => parseInt(e.id, 10)).filter(id => !isNaN(id)) : [];
      const nextId = (allIds.length > 0 ? Math.max(...allIds) : 0) + 1;
      form.reset({
        id: nextId.toString().padStart(4, '0'),
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

  const handleDeleteEmployee = (employeeId: string) => {
    if (!firestore) return;
    const employeeRef = doc(firestore, 'employees', employeeId);
    
    // Non-blocking delete
    deleteDoc(employeeRef).catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: employeeRef.path,
        operation: 'delete',
      }));
    });
    
    toast({ title: "Employee Deleted", description: "The employee record removal has been initiated." });
  };

  const onSubmit = async (formData: EmployeeFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const employeeRef = doc(firestore, 'employees', formData.id);
    
    // Non-blocking write for instant UI feedback
    setDoc(employeeRef, formData, { merge: true })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: employeeRef.path,
          operation: 'write',
          requestResourceData: formData,
        }));
      });

    toast({
      title: editingEmployee ? 'Employee Updated' : 'Employee Added',
      description: `${formData.name}'s details have been saved.`,
    });
    
    setIsFormOpen(false);
    setIsSubmitting(false);
  };
  
  const handleDownloadTemplate = () => {
    const headers = [['id', 'name', 'designation', 'bankName', 'branch', 'accountNumber', 'routing']];
    const exampleData = [['0004', 'John Doe', 'Software Engineer', 'Example Bank', 'Main Branch', '1234567890123', '123123123']];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...exampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employee_template.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!firestore) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length === 0) {
            toast({ variant: 'destructive', title: 'Empty File', description: 'No data found in the uploaded file.' });
            return;
        }

        const expectedHeaders = ['id', 'name', 'designation', 'bankName', 'branch', 'accountNumber', 'routing'];
        const firstRowKeys = Object.keys(json[0] as object).map(k => k.trim());
        const missingHeaders = expectedHeaders.filter(h => !firstRowKeys.includes(h));

        if (missingHeaders.length > 0) {
            toast({ 
                variant: 'destructive', 
                title: 'Invalid Headers', 
                description: `Missing columns: ${missingHeaders.join(', ')}. Please use the template.` 
            });
            return;
        }

        let processedCount = 0;

        json.forEach((row: any) => {
            const cleanedData: any = {};
            expectedHeaders.forEach(header => {
                cleanedData[header] = row[header] !== undefined ? String(row[header]).trim() : '';
            });

            const validation = employeeSchema.safeParse(cleanedData);
            if (validation.success) {
                const employeeRef = doc(firestore, 'employees', validation.data.id);
                setDoc(employeeRef, validation.data, { merge: true })
                    .catch(async (error) => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: employeeRef.path,
                            operation: 'write',
                            requestResourceData: validation.data,
                        }));
                    });
                processedCount++;
            }
        });
        
        toast({
            title: 'Import Started',
            description: `Processing ${processedCount} records. Changes will appear instantly in the list.`,
        });
        setIsBulkUploadOpen(false);

      } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not parse the file. Ensure it is a valid .xlsx or .xls file.',
        });
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
         <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
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
              {employees && employees.length > 0 ? (
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
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No employees found in Firestore.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Upload Employees</DialogTitle>
            <DialogDescription>
              Add multiple employees at once by uploading an XLSX file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="download-template" className="text-base font-semibold">Step 1: Download Template</Label>
                <p className="text-sm text-muted-foreground">
                    Download the template file to ensure your data is in the correct format.
                </p>
                 <Button variant="outline" className="w-full" onClick={handleDownloadTemplate} id="download-template">
                    <Download className="mr-2 h-4 w-4" />
                    Download .xlsx Template
                </Button>
            </div>
            <div className="space-y-2">
                <Label htmlFor="upload-file" className="text-base font-semibold">Step 2: Upload File</Label>
                <p className="text-sm text-muted-foreground">
                   Once you've filled out the template, upload the saved XLSX file here.
                </p>
                <Input 
                    id="upload-file"
                    type="file" 
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="cursor-pointer file:font-semibold"
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsBulkUploadOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
