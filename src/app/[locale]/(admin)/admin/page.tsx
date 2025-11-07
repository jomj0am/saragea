// app/(admin)/admin/page.tsx
import { getDashboardAnalytics } from '@/lib/dashboard-analytics'

// Icons
import {
  Building,
  DoorOpen,
  Users,
  Percent,
  BellRing,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

// UI & Components
import RecentLeases from '@/components/admin/RecentLeases'
import CreateLeaseDialog from '@/components/admin/CreateLeaseDialog'
import OccupancyRadialChart from '@/components/admin/charts/OccupancyRadialChart'
import PropertyPerformance3DChart from '@/components/admin/charts/PropertyPerformance3DChart'
import FinancialChart from '@/components/admin/charts/FinancialChart'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import StatCard from '@/components/admin/shared/StatCard'

function StatItem({
  icon,
  label,
  value,
  badgeColor,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  badgeColor: string
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-muted/40 text-muted-foreground">
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeColor}`}
      >
        {value}
      </span>
    </div>
  )
}

const BuildingIcon = () => <Building className="h-5 w-5" />
const UsersIcon = () => <Users className="h-5 w-5" />
const PaidIcon = () => <CheckCircle2 className="h-5 w-5" />
const OverdueIcon = () => <AlertTriangle className="h-5 w-5" />

export default async function AdminDashboardPage() {
  const analytics = await getDashboardAnalytics()

  return (
    <div className="space-y-10">
      {/* ===== Header ===== */}
      <div className="flex  flex-col gap-1">
        <h1 className="md:text-4xl text-[27px] font-extrabold tracking-tight">
          Command Center Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time analytics & property management overview.
        </p>
      </div>

      {/* ===== Top Stat Cards ===== */}
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard
    title="Total Properties"
    value={String(analytics.propertyCount)}
    icon={<Building className="h-5 w-5" />}
    description="All registered buildings & units"
    bgColor="from-green-400 to-teal-500"
    progress={100}
    progressColor="#10b981"
  />
  <StatCard
    title="Total Tenants"
    value={String(analytics.tenantCount)}
    icon={<Users className="h-5 w-5" />}
    description="Current active tenants"
    bgColor="from-indigo-400 to-purple-500"
    progress={100}
    progressColor="#6366f1"
  />
         <StatCard
          title="Occupied Rooms"
          value={`${analytics.occupiedRooms} / ${analytics.totalRooms}`}
          icon={<DoorOpen className="h-5 w-5" />}
          description="Rooms currently occupied"
          bgColor="from-yellow-400 to-orange-500"
          progress={Number(analytics.occupancyRate.toFixed(1))} 
          progressColor="#f59e0b"
        />
        <StatCard
          title="Overall Occupancy Rate"
          value={`${analytics.occupancyRate.toFixed(1)}%`}
          icon={<Percent className="h-5 w-5" />}
          description="Average across all properties"
          bgColor="from-pink-400 to-rose-500"
          progress={Number(analytics.occupancyRate.toFixed(1))} 
          progressColor="#ec4899"
        />
</div>





      {/* ===== Mega Grid ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ----- Left Column: Financial & Property Performance ----- */}
        <div className="xl:col-span-2 space-y-8">
       {analytics.openTickets > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required!</AlertTitle>
            <AlertDescription className="flex justify-between items-center gap-2">
              You have {analytics.openTickets} new/open maintenance tickets.
              <Button asChild variant="link">
                <Link href="/admin/maintenance">View Tickets</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
{analytics.pendingReservations.length > 0 && (
  <Card className=" shadow-none hover:shadow-lg transition-shadow  p-0 overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/30 py-4 mb-0 text-shadow-md rounded-t-lg">
      <div className="flex items-center gap-2">
        <BellRing className="h-5 w-5 text-yellow-500 fill-amber-200 drop-shadow-md drop-shadow-black" />
        <CardTitle className="text-lg font-bold">New Reservations Waiting for Lease</CardTitle>
      </div>
      <CardDescription className="text-sm text-foreground/60 mt-1">
        These tenants have reserved rooms and need a lease created.
      </CardDescription>
    </CardHeader>

    <CardContent className="pb-2 pt-0 -mt-6">
      <div className="divide-y divide-border/30">
        {analytics.pendingReservations.map((res) => (
          <div
            key={res.id}
            className="flex flex-col items-start sm:flex-row sm:justify-between py-4 hover:bg-muted/10 transition-colors rounded-lg"
          >
            {/* Tenant Info */}
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <div className="p-2 bg-primary/20 rounded-full text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-primary">{res.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  Room {res.room.roomNumber} – {res.room.property.name}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-center">
              <CreateLeaseDialog reservation={res} />
              <button
                className="px-3 py-1 bg-secondary text-muted-foreground rounded-md hover:bg-secondary/20 transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>

    {/* Subtle hover glow */}
    <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-10 transition-opacity" />
  </Card>
)}
   <div className="flex flex-col lg:flex-row lg:gap-8">
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Financial Performance</CardTitle>
        <CardDescription>
          Revenue, Expenses & Profit – last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FinancialChart data={analytics.chartData} />
      </CardContent>
    </Card>

    <Card className="flex-1 mt-8 lg:mt-0">
      <CardHeader>
        <CardTitle>Property Occupancy Performance</CardTitle>
        <CardDescription>
          3D breakdown across all properties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PropertyPerformance3DChart
          data={analytics.propertyPerformanceData}
        />
      </CardContent>
    </Card>
  </div>

{/* 
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Last 6 months of revenue.</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={analytics.chartData} />
            </CardContent>
          </Card> */}
        </div>

        {/* ----- Right Column: KPIs, Payment Rate, Recent Leases ----- */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall Payment Rate</CardTitle>
              <CardDescription>
                Percentage of all invoices paid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OccupancyRadialChart paymentRate={analytics.paymentRate} />
            </CardContent>
          </Card>

<Card className="overflow-hidden shadow-none border p-0 dark:border-border/30 hover:shadow-lg transition-shadow">
  <CardHeader className="bg-gradient-to-r from-primary/15 to-primary/40 mb-0 py-2 pt-4 text-shadow-md rounded-t-lg">
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-white/90"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3z" />
      </svg>
      <CardTitle className="text-lg font-bold tracking-wide">Key Statistics</CardTitle>
    </div>
  </CardHeader>

  <CardContent className="divide-y divide-border/40 p-0 -mt-6">
    <StatItem
      icon={<BuildingIcon />}
      label="Total Properties"
      value={analytics.propertyCount}
      badgeColor="bg-blue-500/10 text-blue-600"
    />
    <StatItem
      icon={<UsersIcon />}
      label="Total Tenants"
      value={analytics.tenantCount}
      badgeColor="bg-indigo-500/10 text-indigo-600"
    />
    <StatItem
      icon={<PaidIcon />}
      label="Paid Invoices"
      value={analytics.invoiceStatusData.paid}
      badgeColor="bg-green-500/10 text-green-600"
    />
    <StatItem
      icon={<OverdueIcon />}
      label="Overdue Invoices"
      value={analytics.invoiceStatusData.overdue}
      badgeColor="bg-red-500/10 text-red-600"
    />
  </CardContent>
</Card>


          <Card>
            <CardHeader>
              <CardTitle>Recent Leases</CardTitle>
              <CardDescription>Most recently signed leases.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentLeases leases={analytics.recentLeases} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


