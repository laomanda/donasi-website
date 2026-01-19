import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import { LandingPage } from '../pages/LandingPage'
import Error400 from '../pages/errors/400'
import Error401 from '../pages/errors/401'
import Error402 from '../pages/errors/402'
import Error403 from '../pages/errors/403'
import Error404 from '../pages/errors/404'
import Error405 from '../pages/errors/405'
import Error408 from '../pages/errors/408'
import Error409 from '../pages/errors/409'
import Error429 from '../pages/errors/429'
import Error500 from '../pages/errors/500'
import Error503 from '../pages/errors/503'
import { LayananPage } from '../pages/LayananPage'
import { ProgramPage } from '../pages/ProgramPage'
import { LiterasiPage } from '../pages/LiterasiPage'
import { TentangKamiPage } from '../pages/TentangKamiPage'
import { DonatePage } from '../pages/DonatePage'
import { LoginPage } from '../pages/LoginPage'
import { ArticleDetailPage } from '../pages/ArticleDetailPage'
import { ProgramDetailPage } from '../pages/ProgramDetailPage'
import { KonsultasiPage } from '../pages/KonsultasiPage'
import { JemputWakafPage } from '../pages/JemputWakafPage'
import { KonfirmasiDonasiPage } from '../pages/KonfirmasiDonasiPage'
import { CaraDonasiPage } from '../pages/CaraDonasiPage'
import { EditorShell, AdminShell, SuperAdminShell } from '../layouts/dashboard/RoleShells'
import { PreviewPage } from '../pages/PreviewPage'
import { EditorDashboardPage } from '../pages/management/editor/EditorDashboardPage'
import { EditorArticlesPage } from '../pages/management/editor/EditorArticlesPage'
import { EditorArticleCreatePage } from '../pages/management/editor/EditorArticleCreatePage'
import { EditorArticleEditPage } from '../pages/management/editor/EditorArticleEditPage'
import { EditorProgramsPage } from '../pages/management/editor/EditorProgramsPage'
import { EditorProgramCreatePage } from '../pages/management/editor/EditorProgramCreatePage'
import { EditorProgramEditPage } from '../pages/management/editor/EditorProgramEditPage'
import { BannersPage } from '../pages/management/shared/BannersPage'
import { BannerFormPage } from '../pages/management/shared/BannerFormPage'
import { PartnersPage } from '../pages/management/shared/PartnersPage'
import { PartnerFormPage } from '../pages/management/shared/PartnerFormPage'
import { EditorOrganizationMembersPage } from '../pages/management/editor/EditorOrganizationMembersPage'
import { EditorOrganizationMemberCreatePage } from '../pages/management/editor/EditorOrganizationMemberCreatePage'
import { EditorOrganizationMemberShowPage } from '../pages/management/editor/EditorOrganizationMemberShowPage'
import { EditorOrganizationMemberEditPage } from '../pages/management/editor/EditorOrganizationMemberEditPage'
import { EditorSearchPage } from '../pages/management/editor/EditorSearchPage'
import { EditorSettingsPage } from '../pages/management/editor/EditorSettingsPage'
import { EditorTasksPage } from '../pages/management/editor/EditorTasksPage'
import { AdminSettingsPage } from '../pages/management/admin/AdminSettingsPage'
import { AdminDashboardPage } from '../pages/management/admin/AdminDashboardPage'
import { AdminProgramsPage } from '../pages/management/admin/AdminProgramsPage'
import { AdminProgramCreatePage } from '../pages/management/admin/AdminProgramCreatePage'
import { AdminProgramEditPage } from '../pages/management/admin/AdminProgramEditPage'
import { AdminArticlesPage } from '../pages/management/admin/AdminArticlesPage'
import { AdminArticleCreatePage } from '../pages/management/admin/AdminArticleCreatePage'
import { AdminArticleEditPage } from '../pages/management/admin/AdminArticleEditPage'
import { AdminDonationsPage } from '../pages/management/admin/AdminDonationsPage'
import { AdminDonationReportPage } from '../pages/management/admin/AdminDonationReportPage'
import { AdminDonationManualCreatePage } from '../pages/management/admin/AdminDonationManualCreatePage'
import { AdminDonationShowPage } from '../pages/management/admin/AdminDonationShowPage'
import { AdminDonationConfirmationsPage } from '../pages/management/admin/AdminDonationConfirmationsPage'
import { AdminConsultationsPage } from '../pages/management/admin/AdminConsultationsPage'
import { AdminConsultationShowPage } from '../pages/management/admin/AdminConsultationShowPage'
import { AdminPickupRequestsPage } from '../pages/management/admin/AdminPickupRequestsPage'
import { AdminPickupRequestShowPage } from '../pages/management/admin/AdminPickupRequestShowPage'
import { AdminBankAccountsPage } from '../pages/management/admin/AdminBankAccountsPage'
import { AdminBankAccountCreatePage } from '../pages/management/admin/AdminBankAccountCreatePage'
import { AdminBankAccountEditPage } from '../pages/management/admin/AdminBankAccountEditPage'
import { AdminEditorTasksPage } from '../pages/management/admin/AdminEditorTasksPage'
import { AdminEditorTaskCreatePage } from '../pages/management/admin/AdminEditorTaskCreatePage'
import { SuperAdminSettingsPage } from '../pages/management/superadmin/SuperAdminSettingsPage'
import { SuperAdminUsersPage } from '../pages/management/superadmin/SuperAdminUsersPage'
import { SuperAdminUserCreatePage } from '../pages/management/superadmin/SuperAdminUserCreatePage'
import { SuperAdminUserEditPage } from '../pages/management/superadmin/SuperAdminUserEditPage'
import { AdminSearchPage } from '../pages/management/admin/AdminSearchPage'
import { SuperAdminDashboardPage } from '../pages/management/superadmin/SuperAdminDashboardPage'
import { SuperAdminSearchPage } from '../pages/management/superadmin/SuperAdminSearchPage'
import { SuperAdminDonationReportPage } from '../pages/management/superadmin/SuperAdminDonationReportPage'
import { SuperAdminEditorTasksPage } from '../pages/management/superadmin/SuperAdminEditorTasksPage'
import { SuperAdminEditorTaskCreatePage } from '../pages/management/superadmin/SuperAdminEditorTaskCreatePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'layanan', element: <LayananPage /> },
      { path: 'program', element: <ProgramPage /> },
      { path: 'program/:slug', element: <ProgramDetailPage /> },
      { path: 'literasi', element: <LiterasiPage /> },
      { path: 'articles/:slug', element: <ArticleDetailPage /> },
      { path: 'tentang-kami', element: <TentangKamiPage /> },
      { path: 'konsultasi', element: <KonsultasiPage /> },
      { path: 'jemput-wakaf', element: <JemputWakafPage /> },
      { path: 'konfirmasi-donasi', element: <KonfirmasiDonasiPage /> },
      { path: 'cara-donasi', element: <CaraDonasiPage /> },
      { path: 'donate', element: <DonatePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'preview', element: <PreviewPage /> },
      {
        path: 'editor',
        element: <EditorShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <EditorDashboardPage /> },
          { path: 'articles', element: <EditorArticlesPage /> },
          { path: 'articles/create', element: <EditorArticleCreatePage /> },
          { path: 'articles/:id/edit', element: <EditorArticleEditPage /> },
          { path: 'programs', element: <EditorProgramsPage /> },
          { path: 'programs/create', element: <EditorProgramCreatePage /> },
          { path: 'programs/:id/edit', element: <EditorProgramEditPage /> },
          { path: 'partners', element: <PartnersPage /> },
          { path: 'partners/create', element: <PartnerFormPage mode="create" /> },
          { path: 'partners/:id/edit', element: <PartnerFormPage mode="edit" /> },
          { path: 'banners', element: <BannersPage /> },
          { path: 'banners/create', element: <BannerFormPage mode="create" /> },
          { path: 'banners/:id/edit', element: <BannerFormPage mode="edit" /> },
          { path: 'organization-members', element: <EditorOrganizationMembersPage /> },
          { path: 'organization-members/create', element: <EditorOrganizationMemberCreatePage /> },
          { path: 'organization-members/:id', element: <EditorOrganizationMemberShowPage /> },
          { path: 'organization-members/:id/edit', element: <EditorOrganizationMemberEditPage /> },
          { path: 'tasks', element: <EditorTasksPage /> },
          { path: 'search', element: <EditorSearchPage /> },
          { path: 'settings', element: <EditorSettingsPage /> },
        ],
      },
      {
        path: 'admin',
        element: <AdminShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          {
            path: 'donations',
            element: <AdminDonationsPage />,
          },
          { path: 'reports/donations', element: <AdminDonationReportPage /> },
          {
            path: 'donation-confirmations',
            element: <AdminDonationConfirmationsPage />,
          },
          { path: 'donations/manual', element: <AdminDonationManualCreatePage /> },
          { path: 'donations/:id', element: <AdminDonationShowPage /> },
          { path: 'consultations', element: <AdminConsultationsPage /> },
          { path: 'consultations/:id', element: <AdminConsultationShowPage /> },
          { path: 'pickup-requests', element: <AdminPickupRequestsPage /> },
          { path: 'pickup-requests/:id', element: <AdminPickupRequestShowPage /> },
          { path: 'bank-accounts', element: <AdminBankAccountsPage /> },
          { path: 'bank-accounts/create', element: <AdminBankAccountCreatePage /> },
          { path: 'bank-accounts/:id/edit', element: <AdminBankAccountEditPage /> },
          { path: 'editor-tasks', element: <AdminEditorTasksPage /> },
          { path: 'editor-tasks/create', element: <AdminEditorTaskCreatePage /> },
          {
            path: 'programs',
            element: <AdminProgramsPage />,
          },
          { path: 'programs/create', element: <AdminProgramCreatePage /> },
          { path: 'programs/:id/edit', element: <AdminProgramEditPage /> },
          {
            path: 'articles',
            element: <AdminArticlesPage />,
          },
          { path: 'articles/create', element: <AdminArticleCreatePage /> },
          { path: 'articles/:id/edit', element: <AdminArticleEditPage /> },
          {
            path: 'partners',
            element: <PartnersPage />,
          },
          { path: 'partners/create', element: <PartnerFormPage mode="create" /> },
          { path: 'partners/:id/edit', element: <PartnerFormPage mode="edit" /> },
          {
            path: 'banners',
            element: <BannersPage />,
          },
          { path: 'banners/create', element: <BannerFormPage mode="create" /> },
          { path: 'banners/:id/edit', element: <BannerFormPage mode="edit" /> },
          {
            path: 'search',
            element: <AdminSearchPage />,
          },
          { path: 'settings', element: <AdminSettingsPage /> },
        ],
      },
      {
        path: 'superadmin',
        element: <SuperAdminShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: 'dashboard',
            element: <SuperAdminDashboardPage />,
          },
          {
            path: 'users',
            element: <SuperAdminUsersPage />,
          },
          { path: 'users/create', element: <SuperAdminUserCreatePage /> },
          { path: 'users/:id/edit', element: <SuperAdminUserEditPage /> },
          { path: 'reports/donations', element: <SuperAdminDonationReportPage /> },
          { path: 'editor-tasks', element: <SuperAdminEditorTasksPage /> },
          { path: 'editor-tasks/create', element: <SuperAdminEditorTaskCreatePage /> },
          {
            path: 'search',
            element: <SuperAdminSearchPage />,
          },
          { path: 'settings', element: <SuperAdminSettingsPage /> },
        ],
      },
      { path: 'error/400', element: <Error400 /> },
      { path: 'error/401', element: <Error401 /> },
      { path: 'error/402', element: <Error402 /> },
      { path: 'error/403', element: <Error403 /> },
      { path: 'error/404', element: <Error404 /> },
      { path: 'error/405', element: <Error405 /> },
      { path: 'error/408', element: <Error408 /> },
      { path: 'error/409', element: <Error409 /> },
      { path: 'error/429', element: <Error429 /> },
      { path: 'error/500', element: <Error500 /> },
      { path: 'error/503', element: <Error503 /> },
      { path: '*', element: <Error404 /> },
    ],
  },
])
