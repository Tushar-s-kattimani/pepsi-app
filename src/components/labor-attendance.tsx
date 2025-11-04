'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

export function LaborAttendance() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: laborers, loading: laborersLoading } = useCollection('laborers');
  const { toast } = useToast();

  const attendanceQuery = useMemo(() => {
    if (!selectedDate) return null;
    return query(collection(db, 'attendance'), where('date', '==', selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!attendanceQuery) return;
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(attendanceQuery);
        const attendanceData: any = {};
        querySnapshot.forEach(doc => {
          const data = doc.data();
          attendanceData[data.laborerId] = { ...data, docId: doc.id };
        });
        
        // Initialize state for all laborers
        const initialAttendanceState: any = {};
        laborers.forEach(laborer => {
            initialAttendanceState[laborer.id] = attendanceData[laborer.id] || {
                laborerId: laborer.id,
                date: selectedDate,
                status: 'Absent',
                checkIn: '',
                checkOut: ''
            }
        });

        setAttendance(initialAttendanceState);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch attendance data.' });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!laborersLoading){
        fetchAttendance();
    }
  }, [attendanceQuery, laborers, laborersLoading, toast, selectedDate]);


  const handleAttendanceChange = (laborerId: string, field: string, value: string) => {
    setAttendance((prev: any) => ({
      ...prev,
      [laborerId]: {
        ...prev[laborerId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const laborerId in attendance) {
        const record = attendance[laborerId];
        if (record.docId) { // Existing record
          const docRef = doc(db, 'attendance', record.docId);
          await updateDoc(docRef, record);
        } else { // New record
          await addDoc(collection(db, 'attendance'), record);
        }
      }
      toast({ title: 'Success', description: 'Attendance saved successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save attendance.' });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const loading = laborersLoading || isLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Labor Attendance</CardTitle>
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-500"/>
            <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
            />
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Attendance
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Laborer Name</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Check-out Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laborers.map((laborer) => {
                 const currentRecord = attendance[laborer.id];
                 const isPresent = currentRecord?.status === 'Present' || currentRecord?.status === 'Half-day';
                 return (
                    <TableRow key={laborer.id}>
                        <TableCell>{laborer.name}</TableCell>
                        <TableCell>{laborer.trade}</TableCell>
                        <TableCell>
                        <Select
                            value={currentRecord?.status || 'Absent'}
                            onValueChange={(value) => handleAttendanceChange(laborer.id, 'status', value)}
                        >
                            <SelectTrigger className="w-[120px]">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Half-day">Half-day</SelectItem>
                            </SelectContent>
                        </Select>
                        </TableCell>
                        <TableCell>
                        <Input
                            type="time"
                            value={currentRecord?.checkIn || ''}
                            onChange={(e) => handleAttendanceChange(laborer.id, 'checkIn', e.target.value)}
                            disabled={!isPresent}
                            className="w-[120px]"
                        />
                        </TableCell>
                        <TableCell>
                        <Input
                            type="time"
                            value={currentRecord?.checkOut || ''}
                            onChange={(e) => handleAttendanceChange(laborer.id, 'checkOut', e.target.value)}
                            disabled={!isPresent}
                            className="w-[120px]"
                        />
                        </TableCell>
                    </TableRow>
                 );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
