import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { ModelsPage } from '@/features/models/ModelsPage'
import { DatasetsPage } from '@/features/datasets/DatasetsPage'
import { DatasetDetailPage } from '@/features/datasets/DatasetDetailPage'
import { ROUTES } from '@/shared/config/constants'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.MODELS} element={<ModelsPage />} />
      <Route path={ROUTES.DATASETS} element={<DatasetsPage />} />
      <Route path="/datasets/:id" element={<DatasetDetailPage />} />
    </Routes>
  )
}
