import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CreditCard,
  DollarSign,
  ShieldCheck,
  Users,
  Workflow
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from '@/components/themeSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const modules = [
  {
    title: 'Point of Sale',
    description: 'Fast checkout, split payments, barcode scan, receipt printing, and register controls.',
    icon: CreditCard
  },
  {
    title: 'Inventory Intelligence',
    description: 'Low-stock risk, reorder planning, batch/expiry controls, and warehouse movement visibility.',
    icon: Boxes
  },
  {
    title: 'Order Management',
    description: 'Track every order lifecycle, update statuses, and resolve refunds from a central control board.',
    icon: Workflow
  },
  {
    title: 'Staff & HR Control',
    description: 'Attendance, shifts, salaries, loans, and staff performance in one management workflow.',
    icon: Users
  },
  {
    title: 'Audit & Security',
    description: 'Role permissions, action logs, and operational safeguards for store-critical actions.',
    icon: ShieldCheck
  }
];

const industryCoverage = [
  { title: 'Retail', description: 'Storefront checkout, stock, loyalty, and replenishment.' },
  { title: 'Restaurant', description: 'Table service, kitchen workflow, pickup, and delivery.' },
  { title: 'Salon', description: 'Appointments, staff assignment, client notes, and service checkout.' },
  { title: 'Field Service', description: 'Dispatch, job tracking, estimates, and invoice follow-up.' },
  { title: 'Grocery + Dairy', description: 'Recurring delivery, route planning, and perishable inventory.' }
];

const salesSeries: Record<'7D' | '30D' | '90D', number[]> = {
  '7D': [42, 58, 51, 63, 68, 71, 86],
  '30D': [28, 33, 38, 46, 50, 55, 59, 63, 72, 78],
  '90D': [12, 18, 24, 26, 31, 36, 40, 45, 53, 61]
};

const inventoryHealth = [
  { label: 'Fresh Produce', value: 78, color: 'bg-emerald-500' },
  { label: 'Dairy', value: 62, color: 'bg-sky-500' },
  { label: 'Snacks', value: 85, color: 'bg-orange-500' },
  { label: 'Frozen', value: 54, color: 'bg-indigo-500' }
];

const hrDetailRows = [
  { department: 'Sales', staff: 9, onTime: '97%', shiftsOpen: 1, overtimeHours: 6.5 },
  { department: 'Inventory', staff: 6, onTime: '95%', shiftsOpen: 2, overtimeHours: 4.25 },
  { department: 'Operations', staff: 5, onTime: '98%', shiftsOpen: 0, overtimeHours: 2.5 },
  { department: 'Admin', staff: 4, onTime: '100%', shiftsOpen: 0, overtimeHours: 1.25 }
];

const payrollDetailRows = [
  { employee: 'Mia Carter', salary: '$3,200', loans: '$1,800', net: '$2,950', status: 'Approved' },
  { employee: 'Aiden Brooks', salary: '$4,800', loans: '$0', net: '$4,800', status: 'Approved' },
  { employee: 'Noah Reed', salary: '$3,500', loans: '$2,500', net: '$3,250', status: 'Pending' }
];

const auditSecurityRows = [
  { event: 'Price override', actor: 'Mia Carter', impact: 'Order #54891', time: '11:32 AM', risk: 'Low' },
  { event: 'Refund approval', actor: 'Aiden Brooks', impact: 'Order #54867', time: '10:41 AM', risk: 'Medium' },
  { event: 'Role permission edit', actor: 'Super Admin', impact: 'Cashier Role', time: '09:18 AM', risk: 'High' }
];

const securityControlRows = [
  { label: '2FA protected accounts', value: '28 / 28', status: 'Healthy' },
  { label: 'Open privileged sessions', value: '2', status: 'Monitored' },
  { label: 'Failed login attempts (24h)', value: '7', status: 'Review' },
  { label: 'Audit log retention', value: '365 days', status: 'Compliant' }
];

const calendarRows = [
  {
    user: 'Mia (Cashier)',
    mon: 'AM Shift',
    tue: 'Inventory Count',
    wed: 'AM Shift',
    thu: 'Team Meeting',
    fri: 'AM Shift'
  },
  {
    user: 'Aiden (Manager)',
    mon: 'Vendor Call',
    tue: 'Store Audit',
    wed: 'Payroll Review',
    thu: 'Team Meeting',
    fri: 'PO Approval'
  },
  {
    user: 'Noah (Inventory)',
    mon: 'Warehouse',
    tue: 'Warehouse',
    wed: 'Supplier Receive',
    thu: 'Cycle Count',
    fri: 'Reorder Plan'
  }
];

const workflows = [
  'Open register, assign staff shifts, and start the trading day with attendance checks.',
  'Run checkout operations while inventory and cash movement update in real-time.',
  'Track staff productivity, salary accruals, and loan repayments throughout the week.',
  'Plan meetings and team tasks in the integrated calendar board.',
  'Close day with dashboard analytics, exception alerts, and management actions.'
];

function buildSparklinePoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');
}

export function HomePage(): JSX.Element {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');

  const chartValues = salesSeries[range];
  const sparklinePoints = useMemo(() => buildSparklinePoints(chartValues), [chartValues]);
  const maxChartValue = useMemo(() => Math.max(...chartValues), [chartValues]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute -left-28 top-6 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-2xl backdrop-blur lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex rounded-full border border-cyan-400/45 bg-cyan-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-900">
              All-in-One Business Platform
            </p>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button asChild className="h-9 rounded-lg bg-sky-600 px-4 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-sky-700">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
            One operating system for retail, restaurants, salons, field teams, and route delivery.
          </h1>
          <p className="mt-4 max-w-4xl text-base text-slate-600 lg:text-lg">
            Manage sales, inventory, appointments, kitchen flow, dispatch, payroll, invoices, deliveries, and daily
            execution from one desktop application built for multi-industry operations.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="h-11 rounded-xl px-6 text-base">
              <Link to="#feature-workflows">View Workflows</Link>
            </Button>
            <Button asChild className="h-11 rounded-xl bg-sky-600 px-6 text-base hover:bg-sky-700">
              <Link to="/login">
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {industryCoverage.map((industry) => (
            <Card key={industry.title} className="border-white/70 bg-white/85 shadow-lg">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Industry Coverage</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{industry.title}</p>
                <p className="mt-2 text-sm text-slate-600">{industry.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="inline-flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-700" />
                  Store Momentum
                </span>
                <span className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-700">
                  {(['7D', '30D', '90D'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRange(item)}
                      className={
                        range === item
                          ? 'rounded-full bg-slate-900 px-3 py-1 text-white'
                          : 'rounded-full px-3 py-1 text-slate-600 hover:bg-slate-200'
                      }
                    >
                      {item}
                    </button>
                  ))}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-4 text-slate-100">
                <div className="grid gap-4 lg:grid-cols-[1fr_0.36fr]">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <svg viewBox="0 0 100 100" className="h-40 w-full">
                      <defs>
                        <linearGradient id="momentumFill" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0, 25, 50, 75, 100].map((line) => (
                        <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="rgb(51 65 85)" strokeWidth="0.5" />
                      ))}
                      <polygon points={`0,100 ${sparklinePoints} 100,100`} fill="url(#momentumFill)" />
                      <polyline
                        fill="none"
                        stroke="rgb(34 211 238)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={sparklinePoints}
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    {chartValues.map((value, index) => (
                      <div key={`${value}-${index}`} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                        <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">T{index + 1}</p>
                        <div className="mt-1 h-2 rounded-full bg-slate-700">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                            style={{ width: `${Math.max(10, Math.round((value / maxChartValue) * 100))}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-200">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-300">Sales trajectory with period bars and growth intensity mapping.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Daily Sales</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">$12,840</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Orders</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">486</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Gross Margin</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">31.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <Boxes className="h-5 w-5 text-cyan-700" />
                Inventory Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventoryHealth.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
              <p className="pt-2 text-xs text-slate-500">Low-stock alerts and reorder priorities update continuously from live sales movement.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-cyan-700" />
                HR Operations Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Attendance & Shift Detail
                </p>
                <div className="grid gap-2 text-xs">
                  {hrDetailRows.map((row) => (
                    <div key={row.department} className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.5fr_0.7fr] items-center rounded-lg bg-white px-2 py-2">
                      <p className="font-semibold text-slate-900">{row.department}</p>
                      <p className="text-slate-600">{row.staff} staff</p>
                      <p className="text-slate-600">{row.onTime} on-time</p>
                      <p className="text-slate-600">{row.shiftsOpen} open</p>
                      <p className="text-right text-slate-600">{row.overtimeHours}h OT</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  <DollarSign className="h-4 w-4 text-cyan-700" /> Payroll & Loan Detail
                </p>
                <div className="grid gap-2 text-xs">
                  {payrollDetailRows.map((row) => (
                    <div key={row.employee} className="grid grid-cols-[1.2fr_0.7fr_0.6fr_0.7fr_0.65fr] items-center rounded-lg bg-slate-50 px-2 py-2">
                      <p className="font-semibold text-slate-900">{row.employee}</p>
                      <p className="text-slate-600">{row.salary}</p>
                      <p className="text-slate-600">{row.loans}</p>
                      <p className="text-slate-800">{row.net}</p>
                      <p className="text-right text-slate-600">{row.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-cyan-700" />
                Staff Calendar & Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.1em] text-slate-500">
                      <th className="px-3 py-1">User</th>
                      <th className="px-3 py-1">Mon</th>
                      <th className="px-3 py-1">Tue</th>
                      <th className="px-3 py-1">Wed</th>
                      <th className="px-3 py-1">Thu</th>
                      <th className="px-3 py-1">Fri</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendarRows.map((row) => (
                      <tr key={row.user} className="rounded-xl bg-slate-50 text-slate-700">
                        <td className="rounded-l-xl px-3 py-2 font-medium text-slate-900">{row.user}</td>
                        <td className="px-3 py-2">{row.mon}</td>
                        <td className="px-3 py-2">{row.tue}</td>
                        <td className="px-3 py-2">{row.wed}</td>
                        <td className="px-3 py-2">{row.thu}</td>
                        <td className="rounded-r-xl px-3 py-2">{row.fri}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">Meetings, shift plans, attendance follow-ups, and payroll deadlines are coordinated per user.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-cyan-700" />
                Audit Trail Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {auditSecurityRows.map((row) => (
                <div key={`${row.event}-${row.time}`} className="grid grid-cols-[1fr_0.8fr_0.9fr_0.7fr_0.5fr] items-center rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                  <p className="font-semibold text-slate-900">{row.event}</p>
                  <p className="text-slate-600">{row.actor}</p>
                  <p className="text-slate-600">{row.impact}</p>
                  <p className="text-slate-600">{row.time}</p>
                  <p className="text-right font-semibold text-slate-700">{row.risk}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-cyan-700" />
                Security Controls Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {securityControlRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.status}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{row.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2 text-slate-700">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Core Modules</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <Card key={module.title} className="border-white/70 bg-white/85 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <module.icon className="h-5 w-5 text-cyan-700" />
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="feature-workflows" className="rounded-3xl border border-slate-800/90 bg-slate-950 p-7 text-slate-100 shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-cyan-300" />
            <h2 className="text-xl font-semibold">Operational Workflow</h2>
          </div>
          <ol className="grid gap-3 md:grid-cols-2">
            {workflows.map((step, index) => (
              <li key={step} className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 text-sm text-slate-200">
                <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-xs font-semibold text-cyan-100">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex justify-end">
            <Button asChild className="rounded-xl bg-cyan-500 px-5 text-slate-950 hover:bg-cyan-400">
              <Link to="/login">Continue to Sign In</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
