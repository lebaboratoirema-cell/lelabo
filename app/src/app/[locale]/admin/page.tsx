import { getDashboardData } from './_lib/dashboardData'
import DashboardClient from './_components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
