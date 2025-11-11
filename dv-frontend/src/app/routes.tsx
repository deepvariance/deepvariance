import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/features/home/HomePage'
import { ModelsPage } from '@/features/models/ModelsPage'
import { ModelDetailPage } from '@/features/models/ModelDetailPage'
import { TrainingRunnerPage } from '@/features/training/TrainingRunnerPage'
import { DatasetsPage } from '@/features/datasets/DatasetsPage'
import { DatasetDetailPage } from '@/features/datasets/DatasetDetailPage'
import { DataSourcesPage } from '@/features/data-sources/DataSourcesPage'
import { DeploymentsPage } from '@/features/deployments/DeploymentsPage'
import { ModelPerformancePage } from '@/features/analytics/ModelPerformancePage'
import { UsageMetricsPage } from '@/features/analytics/UsageMetricsPage'
import { ROUTES } from '@/shared/config/constants'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.MODELS} element={<ModelsPage />} />
      <Route path="/models/:id" element={<ModelDetailPage />} />
      <Route path="/models/:id/training" element={<TrainingRunnerPage />} />
      <Route path={ROUTES.DATASETS} element={<DatasetsPage />} />
      <Route path="/datasets/:id" element={<DatasetDetailPage />} />
      <Route path="/data-sources" element={<DataSourcesPage />} />
      <Route path="/deployments" element={<DeploymentsPage />} />
      <Route path="/model-performance" element={<ModelPerformancePage />} />
      <Route path="/usage-metrics" element={<UsageMetricsPage />} />
    </Routes>
  )
}
