import type { Metadata } from 'next'
import { renderCityPage } from '@/lib/pseo/renderCityPage'
import { buildCityPageMetadata } from '@/lib/pseo/cityMetadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  return buildCityPageMetadata('lab-equipment', city)
}

export default async function LabEquipmentCityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return renderCityPage('lab-equipment', city)
}
