import { type ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  dataExchangeFormats,
  downloadDataExport,
  findMatchingHeader,
  importFileAccept,
  parseImportFile,
  type DataExchangeFormat
} from '@/lib/dataExchange';
import { useStoreOpsStore } from '@/stores/storeOpsStore';
import { useAuthStore } from '@/stores/authStore';

interface MeetingFormState {
  title: string;
  assigneeId: string;
  date: string;
  time: string;
}

interface AppointmentFormState {
  title: string;
  customerName: string;
  assigneeId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface ShiftFormState {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  roleDuringShift: string;
}

interface LeaveFormState {
  staffId: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
}

interface StaffFormState {
  fullName: string;
  role: string;
  department: string;
  assignedLocation: string;
  joinedOn: string;
  monthlySalary: string;
  loanBalance: string;
  commissionRate: string;
}

interface DepartmentChangeFormState {
  staffId: string;
  toDepartment: string;
  reason: string;
  changeMode: 'manualUpdate' | 'transferRequest' | 'promotion';
}

const initialMeetingFormState: MeetingFormState = {
  title: '',
  assigneeId: '',
  date: '',
  time: ''
};

const initialAppointmentFormState: AppointmentFormState = {
  title: '',
  customerName: '',
  assigneeId: '',
  date: '',
  startTime: '',
  endTime: '',
  notes: ''
};

const initialShiftFormState: ShiftFormState = {
  staffId: '',
  date: '',
  startTime: '',
  endTime: '',
  roleDuringShift: ''
};

const initialLeaveFormState: LeaveFormState = {
  staffId: '',
  dateFrom: '',
  dateTo: '',
  reason: ''
};

const initialStaffFormState: StaffFormState = {
  fullName: '',
  role: '',
  department: '',
  assignedLocation: 'Main Store',
  joinedOn: '',
  monthlySalary: '',
  loanBalance: '0',
  commissionRate: '0.02'
};

const initialDepartmentChangeFormState: DepartmentChangeFormState = {
  staffId: '',
  toDepartment: '',
  reason: '',
  changeMode: 'manualUpdate'
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatDateKey(dateValue: Date): string {
  const year = dateValue.getFullYear();
  const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
  const day = `${dateValue.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value.slice(0, 10);
  }

  return formatDateKey(parsedDate);
}

function getMinutesFromTimeLabel(timeLabel: string): number {
  const [hoursPart = '0', minutesPart = '0'] = timeLabel.split(':');
  return Number(hoursPart) * 60 + Number(minutesPart);
}

function getDurationLabel(startTime: string, endTime: string): string {
  const totalMinutes = Math.max(0, getMinutesFromTimeLabel(endTime) - getMinutesFromTimeLabel(startTime));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getWeekDates(anchorDate: string): string[] {
  const parsedDate = new Date(`${anchorDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return [anchorDate];
  }

  const weekDates: string[] = [];
  const weekStart = new Date(parsedDate);
  const weekDay = weekStart.getDay();
  const mondayOffset = (weekDay + 6) % 7;
  weekStart.setDate(weekStart.getDate() - mondayOffset);

  for (let index = 0; index < 7; index += 1) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + index);
    weekDates.push(formatDateKey(currentDate));
  }

  return weekDates;
}

function getMonthDates(anchorDate: string): Array<{ date: string; isCurrentMonth: boolean }> {
  const parsedDate = new Date(`${anchorDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return [{ date: anchorDate, isCurrentMonth: true }];
  }

  const monthStart = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
  const monthStartWeekday = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStartWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const currentDate = new Date(gridStart);
    currentDate.setDate(gridStart.getDate() + index);

    return {
      date: formatDateKey(currentDate),
      isCurrentMonth: currentDate.getMonth() === parsedDate.getMonth()
    };
  });
}

function formatCalendarDayLabel(dateValue: string): string {
  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatCalendarMonthLabel(dateValue: string): string {
  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

type HrModule =
  | 'onboarding'
  | 'directory'
  | 'department'
  | 'attendance'
  | 'scheduling'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'calendar';

const hrModules: Array<{ id: HrModule; label: string; summary: string }> = [
  { id: 'onboarding', label: 'Onboarding', summary: 'Create and activate employee records.' },
  { id: 'directory', label: 'Employee Directory', summary: 'View all employee profiles and status.' },
  { id: 'department', label: 'Department', summary: 'Department allotment, transfer history, and exports.' },
  { id: 'attendance', label: 'Attendance', summary: 'Clock in/out, breaks, and session history.' },
  { id: 'scheduling', label: 'Scheduling', summary: 'Shift planner and role assignment.' },
  { id: 'leave', label: 'Leave', summary: 'Leave requests and approval workflow.' },
  { id: 'payroll', label: 'Payroll', summary: 'Payroll generation and payslip download.' },
  { id: 'performance', label: 'Performance', summary: 'Commissions, sales, loans, and tips.' },
  { id: 'calendar', label: 'Calendar', summary: 'Appointments, meetings, day load, and calendar availability.' }
];

const hrModuleActions: Record<HrModule, string[]> = {
  onboarding: ['Fill employee profile fields', 'Set salary, loan, and commission', 'Click Add Employee'],
  directory: ['Review employee profile status', 'Check role and department', 'Validate join date and salary'],
  department: ['Select employee and target department', 'Set transfer reason and method', 'Update and export reports'],
  attendance: ['Clock in or clock out staff', 'Manage break start and end', 'Review attendance session history'],
  scheduling: ['Select assignee and shift date', 'Set shift start and end time', 'Save shift and verify listing'],
  leave: ['Create leave request', 'Review pending requests', 'Approve or reject request'],
  payroll: ['Set payroll period', 'Generate payroll entries', 'Download payslip for each employee'],
  performance: ['Track sales and commission values', 'Update tips pool and distribute', 'Review ticket and hours performance'],
  calendar: ['Select a calendar day', 'Schedule meetings and appointments', 'Review orders and pending deliveries']
};

export function StaffPage() {
  const currentUser = useAuthStore((state) => state.user);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const tipsPoolBalance = useStoreOpsStore((state) => state.tipsPoolBalance);
  const meetings = useStoreOpsStore((state) => state.meetings);
  const appointments = useStoreOpsStore((state) => state.appointments);
  const orders = useStoreOpsStore((state) => state.orders);
  const shiftPlans = useStoreOpsStore((state) => state.shiftPlans);
  const attendanceSessions = useStoreOpsStore((state) => state.attendanceSessions);
  const leaveRequests = useStoreOpsStore((state) => state.leaveRequests);
  const payrollRecords = useStoreOpsStore((state) => state.payrollRecords);
  const getTimesheetSummaries = useStoreOpsStore((state) => state.getTimesheetSummaries);
  const toggleAttendance = useStoreOpsStore((state) => state.toggleAttendance);
  const startStaffBreak = useStoreOpsStore((state) => state.startStaffBreak);
  const endStaffBreak = useStoreOpsStore((state) => state.endStaffBreak);
  const addStaffMember = useStoreOpsStore((state) => state.addStaffMember);
  const deactivateStaffMember = useStoreOpsStore((state) => state.deactivateStaffMember);
  const reassignStaffDepartment = useStoreOpsStore((state) => state.reassignStaffDepartment);
  const addMeeting = useStoreOpsStore((state) => state.addMeeting);
  const importMeetings = useStoreOpsStore((state) => state.importMeetings);
  const addAppointment = useStoreOpsStore((state) => state.addAppointment);
  const importAppointments = useStoreOpsStore((state) => state.importAppointments);
  const setAppointmentStatus = useStoreOpsStore((state) => state.setAppointmentStatus);
  const addShiftPlan = useStoreOpsStore((state) => state.addShiftPlan);
  const importShiftPlans = useStoreOpsStore((state) => state.importShiftPlans);
  const addLeaveRequest = useStoreOpsStore((state) => state.addLeaveRequest);
  const importLeaveRequests = useStoreOpsStore((state) => state.importLeaveRequests);
  const setLeaveStatus = useStoreOpsStore((state) => state.setLeaveStatus);
  const recordStaffSale = useStoreOpsStore((state) => state.recordStaffSale);
  const addTipsPool = useStoreOpsStore((state) => state.addTipsPool);
  const distributeTipsPool = useStoreOpsStore((state) => state.distributeTipsPool);
  const repayLoan = useStoreOpsStore((state) => state.repayLoan);
  const generatePayroll = useStoreOpsStore((state) => state.generatePayroll);
  const getDepartmentChangeReport = useStoreOpsStore((state) => state.getDepartmentChangeReport);
  const exportDepartmentChangeReportCsv = useStoreOpsStore((state) => state.exportDepartmentChangeReportCsv);
  const exportDepartmentChangeReportText = useStoreOpsStore((state) => state.exportDepartmentChangeReportText);
  const exportPayslipText = useStoreOpsStore((state) => state.exportPayslipText);
  const getCalendarDaySummary = useStoreOpsStore((state) => state.getCalendarDaySummary);

  const activeStaffRecords = staffRecords.filter((staffRecord) => staffRecord.isActive);

  const [meetingForm, setMeetingForm] = useState<MeetingFormState>({
    ...initialMeetingFormState,
    assigneeId: activeStaffRecords[0]?.id ?? ''
  });
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>({
    ...initialAppointmentFormState,
    assigneeId: activeStaffRecords[0]?.id ?? ''
  });

  const [shiftForm, setShiftForm] = useState<ShiftFormState>({
    ...initialShiftFormState,
    staffId: activeStaffRecords[0]?.id ?? '',
    roleDuringShift: activeStaffRecords[0]?.role ?? ''
  });

  const [leaveForm, setLeaveForm] = useState<LeaveFormState>({
    ...initialLeaveFormState,
    staffId: activeStaffRecords[0]?.id ?? ''
  });
  const [staffForm, setStaffForm] = useState<StaffFormState>(initialStaffFormState);
  const [departmentChangeForm, setDepartmentChangeForm] = useState<DepartmentChangeFormState>({
    ...initialDepartmentChangeFormState,
    staffId: activeStaffRecords[0]?.id ?? ''
  });
  const [tipsInput, setTipsInput] = useState<string>('0');
  const [activeHrModule, setActiveHrModule] = useState<HrModule>('onboarding');
  const [calendarDate, setCalendarDate] = useState<string>('2026-03-14');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [payrollPeriod, setPayrollPeriod] = useState<string>('2026-03');
  const [selectedExportDataset, setSelectedExportDataset] = useState<
    'directory' | 'attendance' | 'shifts' | 'leave' | 'payroll' | 'meetings' | 'appointments' | 'department' | 'calendarDay'
  >('directory');
  const [selectedImportTarget, setSelectedImportTarget] = useState<'directory' | 'meetings' | 'appointments' | 'shifts' | 'leave'>('directory');
  const [dataExchangeMessage, setDataExchangeMessage] = useState<string>('');

  const timesheetSummaries = getTimesheetSummaries();
  const departmentChangeReport = getDepartmentChangeReport();
  const selectedModule = hrModules.find((moduleItem) => moduleItem.id === activeHrModule) ?? hrModules[0];
  const calendarDaySummary = getCalendarDaySummary(calendarDate);
  const appointmentsForSelectedDate = appointments.filter((appointment) => appointment.date === calendarDate);
  const meetingsForSelectedDate = meetings.filter((meeting) => meeting.date === calendarDate);
  const shiftsForSelectedDate = shiftPlans.filter((shiftPlan) => shiftPlan.date === calendarDate);
  const ordersForSelectedDate = orders.filter((order) => getDateKey(order.createdAt) === calendarDate);
  const deliveriesForSelectedDate = orders.filter((order) => order.deliveryDate === calendarDate);
  const pendingDeliveriesForSelectedDate = deliveriesForSelectedDate.filter(
    (order) => order.deliveryStatus === 'pending' || order.deliveryStatus === 'outForDelivery'
  );
  const weekDates = getWeekDates(calendarDate);
  const weekSummaries = weekDates.map((dateValue) => getCalendarDaySummary(dateValue));
  const monthDates = getMonthDates(calendarDate);
  const scheduledAppointmentsCount = appointmentsForSelectedDate.filter((appointment) => appointment.status === 'scheduled').length;
  const cancelledAppointmentsCount = appointmentsForSelectedDate.filter((appointment) => appointment.status === 'cancelled').length;
  const deliveredOrdersCount = deliveriesForSelectedDate.filter((order) => order.deliveryStatus === 'delivered').length;
  const salesValueForSelectedDate = ordersForSelectedDate.reduce((sum, order) => sum + order.totalAmount, 0);
  const staffOnShiftCount = shiftsForSelectedDate.length;
  const staffAvailability = activeStaffRecords.map((staffRecord) => {
    const shiftForDay = shiftsForSelectedDate.find((shiftPlan) => shiftPlan.staffId === staffRecord.id);
    const staffAppointments = appointmentsForSelectedDate.filter((appointment) => appointment.assigneeId === staffRecord.id);
    const bookedMinutes = staffAppointments.reduce(
      (sum, appointment) => sum + Math.max(0, getMinutesFromTimeLabel(appointment.endTime) - getMinutesFromTimeLabel(appointment.startTime)),
      0
    );
    const conflictingAppointments = staffAppointments.filter((appointment, appointmentIndex) =>
      staffAppointments.some((comparisonAppointment, comparisonIndex) => {
        if (appointmentIndex === comparisonIndex) {
          return false;
        }

        return (
          getMinutesFromTimeLabel(appointment.startTime) < getMinutesFromTimeLabel(comparisonAppointment.endTime) &&
          getMinutesFromTimeLabel(comparisonAppointment.startTime) < getMinutesFromTimeLabel(appointment.endTime)
        );
      })
    );

    return {
      staffId: staffRecord.id,
      staffName: staffRecord.fullName,
      shiftForDay,
      staffAppointments,
      bookedMinutes,
      conflictingAppointments,
      isBooked: staffAppointments.length > 0
    };
  });
  const availableStaffCount = staffAvailability.filter(
    (availabilityItem) => !availabilityItem.isBooked && availabilityItem.conflictingAppointments.length === 0
  ).length;
  const selectedAppointment =
    appointmentsForSelectedDate.find((appointment) => appointment.id === selectedAppointmentId) ??
    appointmentsForSelectedDate[0] ??
    null;
  const selectedDayTimeline = [
    ...shiftsForSelectedDate.map((shiftPlan) => ({
      id: shiftPlan.id,
      type: 'shift',
      startTime: shiftPlan.startTime,
      endTime: shiftPlan.endTime,
      title: shiftPlan.staffName,
      subtitle: shiftPlan.roleDuringShift
    })),
    ...appointmentsForSelectedDate.map((appointment) => ({
      id: appointment.id,
      type: 'appointment',
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      title: appointment.title,
      subtitle: `${appointment.customerName} / ${appointment.assigneeName}`
    })),
    ...meetingsForSelectedDate.map((meeting) => ({
      id: meeting.id,
      type: 'meeting',
      startTime: meeting.time,
      endTime: meeting.time,
      title: meeting.title,
      subtitle: meeting.assigneeName
    }))
  ].sort((leftItem, rightItem) => getMinutesFromTimeLabel(leftItem.startTime) - getMinutesFromTimeLabel(rightItem.startTime));
  const exportRows =
    selectedExportDataset === 'attendance'
      ? attendanceSessions.map((session) => ({
          staffName: session.staffName,
          clockInAt: session.clockInAt,
          clockOutAt: session.clockOutAt ?? '',
          breakMinutes: session.breakMinutes,
          totalHours: session.totalHours,
          overtimeHours: session.overtimeHours,
          complianceFlag: session.complianceFlag
        }))
      : selectedExportDataset === 'shifts'
        ? shiftPlans.map((shiftPlan) => ({
            staffName: shiftPlan.staffName,
            date: shiftPlan.date,
            startTime: shiftPlan.startTime,
            endTime: shiftPlan.endTime,
            roleDuringShift: shiftPlan.roleDuringShift
          }))
        : selectedExportDataset === 'leave'
          ? leaveRequests.map((leaveRequest) => ({
              staffName: leaveRequest.staffName,
              dateFrom: leaveRequest.dateFrom,
              dateTo: leaveRequest.dateTo,
              reason: leaveRequest.reason,
              status: leaveRequest.status
            }))
          : selectedExportDataset === 'payroll'
            ? payrollRecords.map((payrollRecord) => ({
                staffName: payrollRecord.staffName,
                periodLabel: payrollRecord.periodLabel,
                baseSalary: payrollRecord.baseSalary,
                overtimeHours: payrollRecord.overtimeHours,
                overtimePay: payrollRecord.overtimePay,
                loanDeduction: payrollRecord.loanDeduction,
                netSalary: payrollRecord.netSalary,
                generatedAt: payrollRecord.generatedAt
              }))
            : selectedExportDataset === 'meetings'
              ? meetings.map((meeting) => ({
                  title: meeting.title,
                  assigneeName: meeting.assigneeName,
                  date: meeting.date,
                  time: meeting.time
                }))
              : selectedExportDataset === 'appointments'
                ? appointments.map((appointment) => ({
                    title: appointment.title,
                    customerName: appointment.customerName,
                    assigneeName: appointment.assigneeName,
                    date: appointment.date,
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    status: appointment.status,
                    notes: appointment.notes
                  }))
                : selectedExportDataset === 'department'
                  ? departmentChangeReport.map((departmentChange) => ({
                      staffName: departmentChange.staffName,
                      fromDepartment: departmentChange.fromDepartment,
                      toDepartment: departmentChange.toDepartment,
                      changeMode: departmentChange.changeMode,
                      reason: departmentChange.reason,
                      changedBy: departmentChange.changedBy,
                      changedAt: departmentChange.changedAt
                    }))
                  : selectedExportDataset === 'calendarDay'
                    ? [
                        {
                          date: calendarDate,
                          appointmentsCount: calendarDaySummary.appointmentsCount,
                          completedAppointmentsCount: calendarDaySummary.completedAppointmentsCount,
                          meetingsCount: calendarDaySummary.meetingsCount,
                          ordersCount: calendarDaySummary.ordersCount,
                          pendingDeliveriesCount: calendarDaySummary.pendingDeliveriesCount
                        }
                      ]
                    : staffRecords.map((staffRecord) => ({
                        fullName: staffRecord.fullName,
                        role: staffRecord.role,
                        department: staffRecord.department,
                        assignedLocation: staffRecord.assignedLocation,
                        joinedOn: staffRecord.joinedOn,
                        isActive: staffRecord.isActive,
                        monthlySalary: staffRecord.monthlySalary,
                        loanBalance: staffRecord.loanBalance,
                        commissionRate: staffRecord.commissionRate
                      }));

  const handleMeetingFormChange = (field: keyof MeetingFormState, value: string): void => {
    setMeetingForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleAppointmentFormChange = (field: keyof AppointmentFormState, value: string): void => {
    setAppointmentForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleShiftFormChange = (field: keyof ShiftFormState, value: string): void => {
    setShiftForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleLeaveFormChange = (field: keyof LeaveFormState, value: string): void => {
    setLeaveForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleStaffFormChange = (field: keyof StaffFormState, value: string): void => {
    setStaffForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleDepartmentChangeFormChange = (field: keyof DepartmentChangeFormState, value: string): void => {
    setDepartmentChangeForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleAddMeeting = (): void => {
    addMeeting({
      title: meetingForm.title,
      assigneeId: meetingForm.assigneeId,
      date: meetingForm.date,
      time: meetingForm.time
    });
    setMeetingForm({
      ...initialMeetingFormState,
      assigneeId: activeStaffRecords[0]?.id ?? ''
    });
  };

  const handleAddAppointment = (): void => {
    const nextAssigneeId = appointmentForm.assigneeId;
    addAppointment({
      title: appointmentForm.title,
      customerName: appointmentForm.customerName,
      assigneeId: nextAssigneeId,
      date: appointmentForm.date,
      startTime: appointmentForm.startTime,
      endTime: appointmentForm.endTime,
      notes: appointmentForm.notes
    });
    setSelectedAppointmentId('');
    setAppointmentForm({
      ...initialAppointmentFormState,
      assigneeId: activeStaffRecords[0]?.id ?? ''
    });
  };

  const handleAddShift = (): void => {
    addShiftPlan(shiftForm);
    setShiftForm({
      ...initialShiftFormState,
      staffId: activeStaffRecords[0]?.id ?? '',
      roleDuringShift: activeStaffRecords[0]?.role ?? ''
    });
  };

  const handleAddLeaveRequest = (): void => {
    addLeaveRequest(leaveForm);
    setLeaveForm({
      ...initialLeaveFormState,
      staffId: activeStaffRecords[0]?.id ?? ''
    });
  };

  const handleGeneratePayroll = (): void => {
    generatePayroll(payrollPeriod);
  };

  const handleAddStaffMember = (): void => {
    addStaffMember({
      fullName: staffForm.fullName,
      role: staffForm.role,
      department: staffForm.department,
      assignedLocation: staffForm.assignedLocation,
      joinedOn: staffForm.joinedOn,
      monthlySalary: Number(staffForm.monthlySalary),
      loanBalance: Number(staffForm.loanBalance),
      commissionRate: Number(staffForm.commissionRate),
      createdBy: currentUser?.fullName ?? 'systemAdmin'
    });
    setStaffForm(initialStaffFormState);
  };

  const handleDepartmentReassignment = (): void => {
    reassignStaffDepartment({
      staffId: departmentChangeForm.staffId,
      toDepartment: departmentChangeForm.toDepartment,
      reason: departmentChangeForm.reason,
      changedBy: currentUser?.fullName ?? 'systemAdmin',
      changeMode: departmentChangeForm.changeMode
    });

    setDepartmentChangeForm((previous) => ({
      ...previous,
      toDepartment: '',
      reason: ''
    }));
  };

  const handleAddTips = (): void => {
    addTipsPool(Number(tipsInput));
    setTipsInput('0');
  };

  const handleDownloadPayslip = (staffId: string, periodLabel: string, staffName: string): void => {
    const payslipText = exportPayslipText(staffId, periodLabel);

    if (!payslipText || typeof window === 'undefined') {
      return;
    }

    const blob = new Blob([payslipText], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${staffName.replace(/\s+/g, '')}-${periodLabel}-payslip.txt`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleDownloadReportFile = (fileName: string, content: string): void => {
    if (!content || typeof window === 'undefined') {
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleDownloadDepartmentReportCsv = (): void => {
    const reportContent = exportDepartmentChangeReportCsv();
    handleDownloadReportFile('departmentAllotmentReport.csv', reportContent);
  };

  const handleDownloadDepartmentReportText = (): void => {
    const reportContent = exportDepartmentChangeReportText();
    handleDownloadReportFile('departmentAllotmentReport.txt', reportContent);
  };

  const handleExportHrDataset = async (format: DataExchangeFormat): Promise<void> => {
    const fileBaseName =
      selectedExportDataset === 'calendarDay'
        ? 'calendarDaySummary'
        : selectedExportDataset === 'department'
          ? 'departmentHistory'
          : `hr${selectedExportDataset.charAt(0).toUpperCase()}${selectedExportDataset.slice(1)}`;

    await downloadDataExport({
      title: 'HR Export',
      fileBaseName,
      rows: exportRows,
      format
    });
    setDataExchangeMessage(`Exported ${selectedExportDataset} as ${format}.`);
  };

  const handleImportHrFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const parsed = await parseImportFile(file);

      if (selectedImportTarget === 'directory') {
        const fullNameHeader = findMatchingHeader(parsed.headers, ['fullname', 'name']);
        const roleHeader = findMatchingHeader(parsed.headers, ['role', 'position']);
        const departmentHeader = findMatchingHeader(parsed.headers, ['department']);
        const locationHeader = findMatchingHeader(parsed.headers, ['assignedlocation', 'location']);
        const joinedOnHeader = findMatchingHeader(parsed.headers, ['joinedon', 'joindate', 'startdate']);
        const salaryHeader = findMatchingHeader(parsed.headers, ['monthlysalary', 'salary']);
        const loanHeader = findMatchingHeader(parsed.headers, ['loanbalance', 'loan']);
        const commissionHeader = findMatchingHeader(parsed.headers, ['commissionrate', 'commission']);

        parsed.rows.forEach((row) => {
          addStaffMember({
            fullName: row[fullNameHeader] ?? '',
            role: row[roleHeader] ?? '',
            department: row[departmentHeader] ?? '',
            assignedLocation: row[locationHeader] ?? 'Main Store',
            joinedOn: row[joinedOnHeader] ?? '',
            monthlySalary: Number(row[salaryHeader] ?? 0),
            loanBalance: Number(row[loanHeader] ?? 0),
            commissionRate: Number(row[commissionHeader] ?? 0),
            createdBy: currentUser?.fullName ?? 'systemAdmin'
          });
        });
      }

      if (selectedImportTarget === 'meetings') {
        const titleHeader = findMatchingHeader(parsed.headers, ['title', 'meeting']);
        const assigneeHeader = findMatchingHeader(parsed.headers, ['assigneename', 'assignee', 'staffname']);
        const dateHeader = findMatchingHeader(parsed.headers, ['date']);
        const timeHeader = findMatchingHeader(parsed.headers, ['time']);

        importMeetings(
          parsed.rows.map((row) => ({
            title: row[titleHeader] ?? '',
            assigneeName: row[assigneeHeader] ?? '',
            date: row[dateHeader] ?? '',
            time: row[timeHeader] ?? ''
          }))
        );
      }

      if (selectedImportTarget === 'appointments') {
        const titleHeader = findMatchingHeader(parsed.headers, ['title', 'appointment']);
        const customerHeader = findMatchingHeader(parsed.headers, ['customername', 'customer', 'clientname']);
        const assigneeHeader = findMatchingHeader(parsed.headers, ['assigneename', 'assignee', 'staffname']);
        const dateHeader = findMatchingHeader(parsed.headers, ['date']);
        const startHeader = findMatchingHeader(parsed.headers, ['starttime', 'start']);
        const endHeader = findMatchingHeader(parsed.headers, ['endtime', 'end']);
        const statusHeader = findMatchingHeader(parsed.headers, ['status']);
        const notesHeader = findMatchingHeader(parsed.headers, ['notes']);

        importAppointments(
          parsed.rows.map((row) => ({
            title: row[titleHeader] ?? '',
            customerName: row[customerHeader] ?? '',
            assigneeName: row[assigneeHeader] ?? '',
            date: row[dateHeader] ?? '',
            startTime: row[startHeader] ?? '',
            endTime: row[endHeader] ?? '',
            status: (row[statusHeader] ?? 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
            notes: row[notesHeader] ?? ''
          }))
        );
      }

      if (selectedImportTarget === 'shifts') {
        const staffHeader = findMatchingHeader(parsed.headers, ['staffname', 'fullname', 'name']);
        const dateHeader = findMatchingHeader(parsed.headers, ['date']);
        const startHeader = findMatchingHeader(parsed.headers, ['starttime', 'start']);
        const endHeader = findMatchingHeader(parsed.headers, ['endtime', 'end']);
        const roleHeader = findMatchingHeader(parsed.headers, ['roleduringshift', 'role']);

        importShiftPlans(
          parsed.rows.map((row) => ({
            staffName: row[staffHeader] ?? '',
            date: row[dateHeader] ?? '',
            startTime: row[startHeader] ?? '',
            endTime: row[endHeader] ?? '',
            roleDuringShift: row[roleHeader] ?? ''
          }))
        );
      }

      if (selectedImportTarget === 'leave') {
        const staffHeader = findMatchingHeader(parsed.headers, ['staffname', 'fullname', 'name']);
        const fromHeader = findMatchingHeader(parsed.headers, ['datefrom', 'from']);
        const toHeader = findMatchingHeader(parsed.headers, ['dateto', 'to']);
        const reasonHeader = findMatchingHeader(parsed.headers, ['reason']);
        const statusHeader = findMatchingHeader(parsed.headers, ['status']);

        importLeaveRequests(
          parsed.rows.map((row) => ({
            staffName: row[staffHeader] ?? '',
            dateFrom: row[fromHeader] ?? '',
            dateTo: row[toHeader] ?? '',
            reason: row[reasonHeader] ?? '',
            status: (row[statusHeader] ?? 'pending') as 'pending' | 'approved' | 'rejected'
          }))
        );
      }

      setDataExchangeMessage(`Imported ${selectedImportTarget} records from ${file.name}.`);
    } catch (error) {
      setDataExchangeMessage(error instanceof Error ? error.message : 'Unable to import HR file');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Human Resources</p>
        <h1 className="mt-2 text-3xl font-semibold">HR Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Employee records, attendance, breaks, shifts, payroll, commissions, tips, loans, leave, and calendar.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{activeStaffRecords.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Payroll This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">
              {formatCurrency(activeStaffRecords.reduce((sum, staffRecord) => sum + staffRecord.monthlySalary, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700">
              {timesheetSummaries.reduce((sum, summary) => sum + summary.overtimeHours, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Staff Loan Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600">
              {formatCurrency(activeStaffRecords.reduce((sum, staffRecord) => sum + staffRecord.loanBalance, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>HR Workflows</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {hrModules.map((moduleOption) => (
            <button
              key={moduleOption.id}
              type="button"
              aria-label={`HR Module ${moduleOption.label}`}
              className={
                activeHrModule === moduleOption.id
                  ? 'rounded-xl border border-cyan-300 bg-cyan-50 p-3 text-left shadow-sm'
                  : 'rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-300'
              }
              onClick={() => setActiveHrModule(moduleOption.id)}
            >
              <p className="text-sm font-semibold text-slate-900">{moduleOption.label}</p>
              <p className="mt-1 text-xs text-slate-500">{moduleOption.summary}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Current Workflow: {selectedModule.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">{selectedModule.summary}</p>
          <div className="grid gap-2 md:grid-cols-3">
            {hrModuleActions[activeHrModule].map((actionItem) => (
              <p key={actionItem} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {actionItem}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>HR Data Exchange</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
            <select
              aria-label="HR Export Dataset"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedExportDataset}
              onChange={(event) =>
                setSelectedExportDataset(
                  event.target.value as
                    | 'directory'
                    | 'attendance'
                    | 'shifts'
                    | 'leave'
                    | 'payroll'
                    | 'meetings'
                    | 'appointments'
                    | 'department'
                    | 'calendarDay'
                )
              }
            >
              <option value="directory">Employee Directory</option>
              <option value="attendance">Attendance Sessions</option>
              <option value="shifts">Shift Plans</option>
              <option value="leave">Leave Requests</option>
              <option value="payroll">Payroll</option>
              <option value="meetings">Meetings</option>
              <option value="appointments">Appointments</option>
              <option value="department">Department History</option>
              <option value="calendarDay">Selected Day Summary</option>
            </select>
            <div className="flex flex-wrap gap-2">
              {dataExchangeFormats.map((format) => (
                <Button key={format} type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => void handleExportHrDataset(format)}>
                  Export {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
            <select
              aria-label="HR Import Target"
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedImportTarget}
              onChange={(event) =>
                setSelectedImportTarget(event.target.value as 'directory' | 'meetings' | 'appointments' | 'shifts' | 'leave')
              }
            >
              <option value="directory">Import Employee Directory</option>
              <option value="meetings">Import Meetings</option>
              <option value="appointments">Import Appointments</option>
              <option value="shifts">Import Shift Plans</option>
              <option value="leave">Import Leave Requests</option>
            </select>
            <Input type="file" accept={importFileAccept} onChange={(event) => void handleImportHrFile(event)} />
          </div>
          <p className="text-xs text-slate-500">Import supports CSV, TSV, JSON, and TXT. Export supports reporting and archive formats.</p>
          {dataExchangeMessage ? <p className="text-sm text-slate-600">{dataExchangeMessage}</p> : null}
        </CardContent>
      </Card>

      {activeHrModule === 'onboarding' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Employee Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              aria-label="Employee Full Name"
              placeholder="Full name"
              value={staffForm.fullName}
              onChange={(event) => handleStaffFormChange('fullName', event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Employee Role"
                placeholder="Role"
                value={staffForm.role}
                onChange={(event) => handleStaffFormChange('role', event.target.value)}
              />
              <Input
                aria-label="Employee Department"
                placeholder="Department"
                value={staffForm.department}
                onChange={(event) => handleStaffFormChange('department', event.target.value)}
              />
            </div>
            <Input
              aria-label="Employee Location"
              placeholder="Assigned location"
              value={staffForm.assignedLocation}
              onChange={(event) => handleStaffFormChange('assignedLocation', event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Employee Join Date"
                type="date"
                value={staffForm.joinedOn}
                onChange={(event) => handleStaffFormChange('joinedOn', event.target.value)}
              />
              <Input
                aria-label="Employee Monthly Salary"
                type="number"
                placeholder="Monthly salary"
                value={staffForm.monthlySalary}
                onChange={(event) => handleStaffFormChange('monthlySalary', event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Employee Loan Balance"
                type="number"
                placeholder="Loan balance"
                value={staffForm.loanBalance}
                onChange={(event) => handleStaffFormChange('loanBalance', event.target.value)}
              />
              <Input
                aria-label="Employee Commission Rate"
                type="number"
                step="0.001"
                placeholder="Commission rate"
                value={staffForm.commissionRate}
                onChange={(event) => handleStaffFormChange('commissionRate', event.target.value)}
              />
            </div>
            <Button type="button" className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleAddStaffMember}>
              Add Employee
            </Button>
          </CardContent>
        </Card>
      )}

      {activeHrModule === 'directory' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staffRecords.map((staffRecord) => (
              <div key={staffRecord.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{staffRecord.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {staffRecord.role} • {staffRecord.department} • {staffRecord.assignedLocation}
                    </p>
                  </div>
                  <span
                    className={
                      staffRecord.isActive
                        ? 'rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700'
                        : 'rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600'
                    }
                  >
                    {staffRecord.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Joined: {staffRecord.joinedOn} • Salary: {formatCurrency(staffRecord.monthlySalary)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeHrModule === 'department' && (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Department Allotment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                aria-label="Department Employee"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={departmentChangeForm.staffId}
                onChange={(event) => handleDepartmentChangeFormChange('staffId', event.target.value)}
              >
                {activeStaffRecords.map((staffRecord) => (
                  <option key={staffRecord.id} value={staffRecord.id}>
                    {staffRecord.fullName}
                  </option>
                ))}
              </select>
              <Input
                aria-label="Department Name"
                placeholder="Target department"
                value={departmentChangeForm.toDepartment}
                onChange={(event) => handleDepartmentChangeFormChange('toDepartment', event.target.value)}
              />
              <select
                aria-label="Department Change Method"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={departmentChangeForm.changeMode}
                onChange={(event) => handleDepartmentChangeFormChange('changeMode', event.target.value)}
              >
                <option value="manualUpdate">manualUpdate</option>
                <option value="transferRequest">transferRequest</option>
                <option value="promotion">promotion</option>
              </select>
              <Input
                aria-label="Department Change Reason"
                placeholder="Reason for change"
                value={departmentChangeForm.reason}
                onChange={(event) => handleDepartmentChangeFormChange('reason', event.target.value)}
              />
              <Input aria-label="Department Changed By" value={currentUser?.fullName ?? 'systemAdmin'} readOnly />
              <Button
                type="button"
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={handleDepartmentReassignment}
              >
                Update Department
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={handleDownloadDepartmentReportCsv}>
                  Export Department Report CSV
                </Button>
                <Button type="button" variant="outline" onClick={handleDownloadDepartmentReportText}>
                  Export Department Report Text
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Department Change History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!departmentChangeReport.length && (
                <p className="text-sm text-slate-500">No department changes recorded yet.</p>
              )}
              {departmentChangeReport.slice(0, 12).map((departmentChange) => (
                <div key={departmentChange.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{departmentChange.staffName}</p>
                  <p className="text-xs text-slate-600">
                    {departmentChange.fromDepartment || 'none'} to {departmentChange.toDepartment}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(departmentChange.changedAt).toLocaleString()} • by {departmentChange.changedBy} •{' '}
                    {departmentChange.changeMode}
                  </p>
                  <p className="text-xs text-slate-500">Reason: {departmentChange.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeHrModule === 'attendance' && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Attendance Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {staffRecords.map((staffRecord) => (
                <div key={staffRecord.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{staffRecord.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {staffRecord.role} • {staffRecord.department} • {staffRecord.assignedLocation}
                      </p>
                    </div>
                    <span
                      className={
                        staffRecord.isActive && staffRecord.isClockedIn
                          ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700'
                          : !staffRecord.isActive
                            ? 'rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600'
                            : 'rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700'
                      }
                    >
                      {!staffRecord.isActive ? 'Inactive' : staffRecord.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <p>Salary: {formatCurrency(staffRecord.monthlySalary)}</p>
                    <p>Loan: {formatCurrency(staffRecord.loanBalance)}</p>
                    <p>Break: {staffRecord.breakMinutesToday} min</p>
                    <p>
                      Status:{' '}
                      {staffRecord.breakStartedAt ? 'On Break' : staffRecord.isClockedIn ? 'Working' : 'Off Shift'}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-md px-3 text-xs"
                      disabled={!staffRecord.isActive}
                      onClick={() => toggleAttendance(staffRecord.id)}
                    >
                      {staffRecord.isClockedIn ? 'Clock Out' : 'Clock In'}
                    </Button>
                    {staffRecord.isActive && staffRecord.isClockedIn && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() =>
                          staffRecord.breakStartedAt ? endStaffBreak(staffRecord.id) : startStaffBreak(staffRecord.id)
                        }
                      >
                        {staffRecord.breakStartedAt ? 'End Break' : 'Start Break'}
                      </Button>
                    )}
                    {staffRecord.isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => recordStaffSale(staffRecord.id, 120)}
                      >
                        Record Sale $120
                      </Button>
                    )}
                    {staffRecord.loanBalance > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => repayLoan(staffRecord.id, 100)}
                      >
                        Loan Payment $100
                      </Button>
                    )}
                    {staffRecord.isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-md px-3 text-xs"
                        onClick={() => deactivateStaffMember(staffRecord.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attendanceSessions.slice(0, 10).map((session) => (
                <div key={session.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{session.staffName}</p>
                  <p className="text-xs text-slate-600">
                    In: {new Date(session.clockInAt).toLocaleString()}{' '}
                    {session.clockOutAt ? `• Out: ${new Date(session.clockOutAt).toLocaleString()}` : '• Open Session'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Hours: {session.totalHours.toFixed(2)} • Overtime: {session.overtimeHours.toFixed(2)} • Break:{' '}
                    {session.breakMinutes} min {session.complianceFlag ? '• Compliance Alert' : ''}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeHrModule === 'scheduling' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Shift Planner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              aria-label="Shift Assignee"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={shiftForm.staffId}
              onChange={(event) => handleShiftFormChange('staffId', event.target.value)}
            >
              {activeStaffRecords.map((staffRecord) => (
                <option key={staffRecord.id} value={staffRecord.id}>
                  {staffRecord.fullName}
                </option>
              ))}
            </select>
            <Input
              aria-label="Shift Date"
              type="date"
              value={shiftForm.date}
              onChange={(event) => handleShiftFormChange('date', event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Shift Start Time"
                type="time"
                value={shiftForm.startTime}
                onChange={(event) => handleShiftFormChange('startTime', event.target.value)}
              />
              <Input
                aria-label="Shift End Time"
                type="time"
                value={shiftForm.endTime}
                onChange={(event) => handleShiftFormChange('endTime', event.target.value)}
              />
            </div>
            <Input
              aria-label="Shift Role"
              placeholder="Role during shift"
              value={shiftForm.roleDuringShift}
              onChange={(event) => handleShiftFormChange('roleDuringShift', event.target.value)}
            />
            <Button type="button" className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleAddShift}>
              Add Shift
            </Button>

            <div className="space-y-2">
              {shiftPlans.slice(0, 10).map((shiftPlan) => (
                <div key={shiftPlan.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{shiftPlan.staffName}</p>
                  <p className="text-xs text-slate-600">
                    {shiftPlan.date} • {shiftPlan.startTime} - {shiftPlan.endTime}
                  </p>
                  <p className="text-xs text-slate-500">Role: {shiftPlan.roleDuringShift}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeHrModule === 'leave' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Leave Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              aria-label="Leave Assignee"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={leaveForm.staffId}
              onChange={(event) => handleLeaveFormChange('staffId', event.target.value)}
            >
              {activeStaffRecords.map((staffRecord) => (
                <option key={staffRecord.id} value={staffRecord.id}>
                  {staffRecord.fullName}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Leave Date From"
                type="date"
                value={leaveForm.dateFrom}
                onChange={(event) => handleLeaveFormChange('dateFrom', event.target.value)}
              />
              <Input
                aria-label="Leave Date To"
                type="date"
                value={leaveForm.dateTo}
                onChange={(event) => handleLeaveFormChange('dateTo', event.target.value)}
              />
            </div>
            <Input
              aria-label="Leave Reason"
              placeholder="Leave reason"
              value={leaveForm.reason}
              onChange={(event) => handleLeaveFormChange('reason', event.target.value)}
            />
            <Button type="button" className="w-full bg-sky-600 hover:bg-sky-700" onClick={handleAddLeaveRequest}>
              Submit Leave Request
            </Button>

            <div className="space-y-2">
              {leaveRequests.map((leaveRequest) => (
                <div key={leaveRequest.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{leaveRequest.staffName}</p>
                  <p className="text-xs text-slate-600">
                    {leaveRequest.dateFrom} to {leaveRequest.dateTo}
                  </p>
                  <p className="text-xs text-slate-500">Reason: {leaveRequest.reason}</p>
                  <p className="text-xs font-semibold uppercase text-slate-600">{leaveRequest.status}</p>
                  {leaveRequest.status === 'pending' && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 rounded-md px-2 text-xs"
                        onClick={() => setLeaveStatus(leaveRequest.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 rounded-md px-2 text-xs"
                        onClick={() => setLeaveStatus(leaveRequest.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeHrModule === 'payroll' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Payroll & Payslips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              aria-label="Payroll Period"
              placeholder="Payroll period (YYYY-MM)"
              value={payrollPeriod}
              onChange={(event) => setPayrollPeriod(event.target.value)}
            />
            <Button
              type="button"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleGeneratePayroll}
            >
              Generate Payroll
            </Button>

            <div className="space-y-2">
              {payrollRecords.map((payrollRecord) => (
                <div key={payrollRecord.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{payrollRecord.staffName}</p>
                  <p className="text-xs text-slate-600">Period: {payrollRecord.periodLabel}</p>
                  <p className="text-xs text-slate-600">Base: {formatCurrency(payrollRecord.baseSalary)}</p>
                  <p className="text-xs text-slate-600">
                    Overtime: {payrollRecord.overtimeHours.toFixed(2)}h ({formatCurrency(payrollRecord.overtimePay)})
                  </p>
                  <p className="text-xs text-slate-600">
                    Loan Deduction: {formatCurrency(payrollRecord.loanDeduction)}
                  </p>
                  <p className="text-xs font-semibold text-slate-900">
                    Net Salary: {formatCurrency(payrollRecord.netSalary)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 h-7 rounded-md px-2 text-xs"
                    onClick={() =>
                      handleDownloadPayslip(payrollRecord.staffId, payrollRecord.periodLabel, payrollRecord.staffName)
                    }
                  >
                    Download Payslip
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeHrModule === 'performance' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Performance, Commissions, and Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Tips Pool</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(tipsPoolBalance)}</p>
              <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
                <Input
                  aria-label="Tips Pool Amount"
                  type="number"
                  placeholder="Tip amount"
                  value={tipsInput}
                  onChange={(event) => setTipsInput(event.target.value)}
                />
                <Button type="button" variant="outline" className="h-10" onClick={handleAddTips}>
                  Add Tip
                </Button>
                <Button
                  type="button"
                  className="h-10 bg-emerald-600 hover:bg-emerald-700"
                  onClick={distributeTipsPool}
                >
                  Distribute
                </Button>
              </div>
            </div>
            {staffRecords.map((staffRecord) => {
              const summary = timesheetSummaries.find((item) => item.staffId === staffRecord.id);
              const averageTicket =
                staffRecord.totalSalesCount > 0 ? staffRecord.totalSalesAmount / staffRecord.totalSalesCount : 0;

              return (
                <div key={staffRecord.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="text-sm font-semibold text-slate-900">{staffRecord.fullName}</p>
                  <p className="text-slate-600">Weekly Hours: {summary?.weeklyHours.toFixed(2) ?? '0.00'}h</p>
                  <p className="text-slate-600">Monthly Hours: {summary?.monthlyHours.toFixed(2) ?? '0.00'}h</p>
                  <p className="text-slate-600">Sales Count: {staffRecord.totalSalesCount}</p>
                  <p className="text-slate-600">Sales Total: {formatCurrency(staffRecord.totalSalesAmount)}</p>
                  <p className="text-slate-600">Average Ticket: {formatCurrency(averageTicket)}</p>
                  <p className="text-slate-600">
                    Commission ({(staffRecord.commissionRate * 100).toFixed(2)}%):{' '}
                    {formatCurrency(staffRecord.commissionEarned)}
                  </p>
                  <p className="text-slate-600">Tips Earned: {formatCurrency(staffRecord.tipsEarned)}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {activeHrModule === 'calendar' && (
        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Calendar Operations Board</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label htmlFor="calendarDate" className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Calendar Date
                  </label>
                  <Input
                    id="calendarDate"
                    aria-label="Calendar Date"
                    type="date"
                    className="mt-2"
                    value={calendarDate}
                    onChange={(event) => setCalendarDate(event.target.value)}
                  />
                  <p className="mt-3 text-xs text-slate-500">
                    Review appointments, meetings, orders, and delivery load for the selected day.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Appointments</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{calendarDaySummary.appointmentsCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Scheduled</p>
                    <p className="mt-1 text-2xl font-semibold text-sky-700">{scheduledAppointmentsCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Completed</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                      {calendarDaySummary.completedAppointmentsCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Cancelled</p>
                    <p className="mt-1 text-2xl font-semibold text-rose-600">{cancelledAppointmentsCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Meetings</p>
                    <p className="mt-1 text-2xl font-semibold text-cyan-700">{calendarDaySummary.meetingsCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Orders</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{calendarDaySummary.ordersCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Pending Deliveries</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                      {calendarDaySummary.pendingDeliveriesCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Delivered</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-600">{deliveredOrdersCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Sales Value</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(salesValueForSelectedDate)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Staff Coverage</p>
                    <p className="mt-1 text-2xl font-semibold text-violet-700">{staffOnShiftCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Month Planner</CardTitle>
              <p className="text-sm text-slate-500">{formatCalendarMonthLabel(calendarDate)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <p>Mon</p>
                <p>Tue</p>
                <p>Wed</p>
                <p>Thu</p>
                <p>Fri</p>
                <p>Sat</p>
                <p>Sun</p>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDates.map((monthDate) => {
                  const monthSummary = getCalendarDaySummary(monthDate.date);

                  return (
                    <button
                      key={monthDate.date}
                      type="button"
                      className={
                        monthDate.date === calendarDate
                          ? 'min-h-28 rounded-xl border border-cyan-300 bg-cyan-50 p-3 text-left shadow-sm'
                          : monthDate.isCurrentMonth
                            ? 'min-h-28 rounded-xl border border-slate-200 bg-white p-3 text-left'
                            : 'min-h-28 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left opacity-70'
                      }
                      onClick={() => setCalendarDate(monthDate.date)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {Number(monthDate.date.slice(-2))}
                        </p>
                        {monthSummary.pendingDeliveriesCount > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            {monthSummary.pendingDeliveriesCount} due
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                        <p>Appts: {monthSummary.appointmentsCount}</p>
                        <p>Meetings: {monthSummary.meetingsCount}</p>
                        <p>Orders: {monthSummary.ordersCount}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Week Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-7">
              {weekSummaries.map((weekSummary) => (
                <button
                  key={weekSummary.date}
                  type="button"
                  className={
                    weekSummary.date === calendarDate
                      ? 'rounded-xl border border-cyan-300 bg-cyan-50 p-3 text-left shadow-sm'
                      : 'rounded-xl border border-slate-200 bg-slate-50 p-3 text-left'
                  }
                  onClick={() => setCalendarDate(weekSummary.date)}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {formatCalendarDayLabel(weekSummary.date)}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p>Appointments: {weekSummary.appointmentsCount}</p>
                    <p>Meetings: {weekSummary.meetingsCount}</p>
                    <p>Orders: {weekSummary.ordersCount}</p>
                    <p>Deliveries: {weekSummary.pendingDeliveriesCount}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="border-white/70 bg-white/90 shadow-lg">
              <CardHeader>
                <CardTitle>Schedule Meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <Input
                    aria-label="Meeting Title"
                    placeholder="Meeting title"
                    value={meetingForm.title}
                    onChange={(event) => handleMeetingFormChange('title', event.target.value)}
                  />
                  <select
                    aria-label="Meeting Assignee"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={meetingForm.assigneeId}
                    onChange={(event) => handleMeetingFormChange('assigneeId', event.target.value)}
                  >
                    {activeStaffRecords.map((staffRecord) => (
                      <option key={staffRecord.id} value={staffRecord.id}>
                        {staffRecord.fullName}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label="Meeting Date"
                    type="date"
                    value={meetingForm.date}
                    onChange={(event) => handleMeetingFormChange('date', event.target.value)}
                  />
                  <Input
                    aria-label="Meeting Time"
                    type="time"
                    value={meetingForm.time}
                    onChange={(event) => handleMeetingFormChange('time', event.target.value)}
                  />
                  <Button type="button" className="bg-sky-600 hover:bg-sky-700" onClick={handleAddMeeting}>
                    Schedule Meeting
                  </Button>
                </div>

                <div className="space-y-2">
                  {meetingsForSelectedDate.length === 0 && (
                    <p className="text-sm text-slate-500">No meetings on this date.</p>
                  )}
                  {meetingsForSelectedDate.map((meeting) => (
                    <div key={meeting.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">{meeting.title}</p>
                      <p className="text-xs text-slate-600">
                        {meeting.date} at {meeting.time}
                      </p>
                      <p className="text-xs text-slate-500">Owner: {meeting.assigneeName}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/90 shadow-lg">
              <CardHeader>
                <CardTitle>Appointment Planner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    aria-label="Appointment Title"
                    placeholder="Appointment title"
                    value={appointmentForm.title}
                    onChange={(event) => handleAppointmentFormChange('title', event.target.value)}
                  />
                  <Input
                    aria-label="Appointment Customer"
                    placeholder="Customer or vendor"
                    value={appointmentForm.customerName}
                    onChange={(event) => handleAppointmentFormChange('customerName', event.target.value)}
                  />
                  <select
                    aria-label="Appointment Assignee"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={appointmentForm.assigneeId}
                    onChange={(event) => handleAppointmentFormChange('assigneeId', event.target.value)}
                  >
                    {activeStaffRecords.map((staffRecord) => (
                      <option key={staffRecord.id} value={staffRecord.id}>
                        {staffRecord.fullName}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label="Appointment Date"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(event) => handleAppointmentFormChange('date', event.target.value)}
                  />
                  <Input
                    aria-label="Appointment Start Time"
                    type="time"
                    value={appointmentForm.startTime}
                    onChange={(event) => handleAppointmentFormChange('startTime', event.target.value)}
                  />
                  <Input
                    aria-label="Appointment End Time"
                    type="time"
                    value={appointmentForm.endTime}
                    onChange={(event) => handleAppointmentFormChange('endTime', event.target.value)}
                  />
                </div>
                <Input
                  aria-label="Appointment Notes"
                  placeholder="Notes"
                  value={appointmentForm.notes}
                  onChange={(event) => handleAppointmentFormChange('notes', event.target.value)}
                />
                <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddAppointment}>
                  Schedule Appointment
                </Button>

                <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-2">
                    {appointmentsForSelectedDate.length === 0 && (
                      <p className="text-sm text-slate-500">No appointments on this date.</p>
                    )}
                    {appointmentsForSelectedDate.map((appointment) => (
                      <button
                        key={appointment.id}
                        type="button"
                        className={
                          selectedAppointment?.id === appointment.id
                            ? 'w-full rounded-lg border border-cyan-300 bg-cyan-50 p-3 text-left'
                            : 'w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left'
                        }
                        onClick={() => setSelectedAppointmentId(appointment.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{appointment.title}</p>
                            <p className="text-xs text-slate-600">
                              {appointment.customerName} • {appointment.startTime} - {appointment.endTime}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            {appointment.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Assignee: {appointment.assigneeName}</p>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {selectedAppointment ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Appointment Detail
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{selectedAppointment.title}</p>
                          <p className="text-xs text-slate-500">
                            Daily load: {calendarDaySummary.appointmentsCount} appointments, {calendarDaySummary.ordersCount} orders,{' '}
                            {calendarDaySummary.pendingDeliveriesCount} pending deliveries
                          </p>
                        </div>
                        <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                          <p>Customer: {selectedAppointment.customerName}</p>
                          <p>Assignee: {selectedAppointment.assigneeName}</p>
                          <p>Date: {selectedAppointment.date}</p>
                          <p>
                            Slot: {selectedAppointment.startTime} - {selectedAppointment.endTime}
                          </p>
                          <p>Duration: {getDurationLabel(selectedAppointment.startTime, selectedAppointment.endTime)}</p>
                          <p>Status: {selectedAppointment.status}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                          <p className="font-semibold text-slate-900">Operational Context</p>
                          <p className="mt-1">Meetings on day: {calendarDaySummary.meetingsCount}</p>
                          <p>Orders on day: {calendarDaySummary.ordersCount}</p>
                          <p>Pending deliveries: {calendarDaySummary.pendingDeliveriesCount}</p>
                          <p>
                            Shift coverage:{' '}
                            {staffAvailability.find((availabilityItem) => availabilityItem.staffId === selectedAppointment.assigneeId)?.shiftForDay
                              ? 'Assigned'
                              : 'No shift assigned'}
                          </p>
                        </div>
                        {selectedAppointment.notes && (
                          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                            <p className="font-semibold text-slate-900">Notes</p>
                            <p className="mt-1">{selectedAppointment.notes}</p>
                          </div>
                        )}
                        {selectedAppointment.status === 'scheduled' && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 rounded-md px-3 text-xs"
                              onClick={() => setAppointmentStatus(selectedAppointment.id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 rounded-md px-3 text-xs"
                              onClick={() => setAppointmentStatus(selectedAppointment.id, 'cancelled')}
                            >
                              Cancel Appointment
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Select an appointment to view its complete detail.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-white/70 bg-white/90 shadow-lg">
              <CardHeader>
                <CardTitle>Day Timeline & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {selectedDayTimeline.length === 0 && (
                    <p className="text-sm text-slate-500">No shifts, meetings, or appointments on this date.</p>
                  )}
                  {selectedDayTimeline.map((timelineItem) => (
                    <div key={`${timelineItem.type}-${timelineItem.id}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{timelineItem.title}</p>
                          <p className="text-xs text-slate-600">{timelineItem.subtitle}</p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
                          {timelineItem.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {timelineItem.startTime}
                        {timelineItem.endTime !== timelineItem.startTime ? ` - ${timelineItem.endTime}` : ''}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  {staffAvailability.map((availabilityItem) => (
                    <div key={availabilityItem.staffId} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{availabilityItem.staffName}</p>
                        <span
                          className={
                            availabilityItem.conflictingAppointments.length > 0
                              ? 'rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700'
                              : availabilityItem.isBooked
                                ? 'rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700'
                                : 'rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700'
                          }
                        >
                          {availabilityItem.conflictingAppointments.length > 0
                            ? 'Conflict'
                            : availabilityItem.isBooked
                              ? 'Booked'
                              : 'Available'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Shift:{' '}
                        {availabilityItem.shiftForDay
                          ? `${availabilityItem.shiftForDay.startTime} - ${availabilityItem.shiftForDay.endTime}`
                          : 'No shift assigned'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Appointments: {availabilityItem.staffAppointments.length} • Booked time:{' '}
                        {availabilityItem.bookedMinutes} min
                      </p>
                      {availabilityItem.conflictingAppointments.length > 0 && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          Overlap detected in {availabilityItem.conflictingAppointments.length} appointment slots.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">Coverage Summary</p>
                  <p className="mt-1">Available staff: {availableStaffCount}</p>
                  <p>Booked staff: {staffAvailability.filter((availabilityItem) => availabilityItem.isBooked).length}</p>
                  <p>Conflicts: {staffAvailability.filter((availabilityItem) => availabilityItem.conflictingAppointments.length > 0).length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/90 shadow-lg">
              <CardHeader>
                <CardTitle>Orders & Deliveries For Day</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Orders Logged</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{ordersForSelectedDate.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Deliveries Scheduled</p>
                    <p className="mt-1 text-2xl font-semibold text-cyan-700">{deliveriesForSelectedDate.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Pending Delivery Load</p>
                    <p className="mt-1 text-2xl font-semibold text-amber-600">
                      {pendingDeliveriesForSelectedDate.length}
                    </p>
                  </div>
                </div>
                {orders.filter((order) => order.deliveryDate === calendarDate || getDateKey(order.createdAt) === calendarDate).length === 0 && (
                  <p className="text-sm text-slate-500">No orders or deliveries on this date.</p>
                )}
                {orders
                  .filter((order) => order.deliveryDate === calendarDate || getDateKey(order.createdAt) === calendarDate)
                  .map((order) => (
                    <div key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">
                          {order.deliveryStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {order.customerName} • {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Order Date: {getDateKey(order.createdAt)} {order.deliveryDate ? `• Delivery: ${order.deliveryDate}` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        Payment: {order.paymentMethod} • Items: {order.items.length} • Order Status: {order.status}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
