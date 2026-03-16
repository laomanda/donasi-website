import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
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
import { LoginPage } from '../pages/auth/LoginPage'
import { LiterasiDetailPage } from '../pages/LiterasiDetailPage'
import { ProgramDetailPage } from '../pages/ProgramDetailPage'
import { KonsultasiPage } from '../pages/KonsultasiPage'
import { JemputWakafPage } from '../pages/JemputWakafPage'
import { KonfirmasiDonasiPage } from '../pages/KonfirmasiDonasiPage'

import { EditorShell, AdminShell, SuperAdminShell, MitraShell, ManagementShell } from '../layouts/dashboard/RoleShells'
import { CustomDashboardPage } from '../pages/management/custom/CustomDashboardPage'
import { MitraRegisterPage } from '../pages/auth/MitraRegisterPage'
import { MitraDashboardPage } from '../pages/management/mitra/MitraDashboardPage'
import { MitraAllocationsPage } from "../pages/management/mitra/MitraAllocationsPage";
import { MitraDonationsPage } from '../pages/management/mitra/MitraDonationsPage'
import { SavedItemsPage } from '../pages/management/mitra/SavedItemsPage'
import { PreviewPage } from '../pages/management/editor/PreviewPage'
import { EditorDashboardPage } from '../pages/management/editor/EditorDashboardPage'
import { EditorArticlesPage } from '../pages/management/editor/article/EditorArticlesPage'
import { EditorArticleCreatePage } from '../pages/management/editor/article/EditorArticleCreatePage'
import { EditorArticleEditPage } from '../pages/management/editor/article/EditorArticleEditPage'
import { EditorProgramsPage } from '../pages/management/editor/program/EditorProgramsPage'
import { EditorProgramCreatePage } from '../pages/management/editor/program/EditorProgramCreatePage'
import { EditorProgramEditPage } from '../pages/management/editor/program/EditorProgramEditPage'
import EditorBannersPage from '../pages/management/editor/banner/EditorBannersPage'
import EditorBannerCreatePage from '../pages/management/editor/banner/EditorBannerCreatePage'
import EditorBannerEditPage from '../pages/management/editor/banner/EditorBannerEditPage'
import EditorPartnersPage from '../pages/management/editor/partner/EditorPartnersPage'
import EditorPartnerCreatePage from '../pages/management/editor/partner/EditorPartnerCreatePage'
import EditorPartnerEditPage from '../pages/management/editor/partner/EditorPartnerEditPage'
import EditorTagsPage from '../pages/management/editor/tag/EditorTagsPage'
import EditorTagCreatePage from '../pages/management/editor/tag/EditorTagCreatePage'
import EditorTagEditPage from '../pages/management/editor/tag/EditorTagEditPage'
import { EditorOrganizationMembersPage } from '../pages/management/editor/organization/EditorOrganizationMembersPage'
import { EditorOrganizationMemberCreatePage } from '../pages/management/editor/organization/EditorOrganizationMemberCreatePage'

import { EditorOrganizationMemberEditPage } from '../pages/management/editor/organization/EditorOrganizationMemberEditPage'
import { SettingsPage } from '../pages/management/SettingsPage'
import { EditorTasksPage } from '../pages/management/editor/EditorTasksPage'
import { SearchPage } from '../pages/management/shared/SearchPage'
import { AdminDashboardPage } from '../pages/management/admin/AdminDashboardPage'
import { AdminDonationsPage } from '../pages/management/admin/donation/AdminDonationsPage'
import { DonationReportPage } from '../pages/management/shared/DonationReportPage'
import { AdminDonationManualCreatePage } from '../pages/management/admin/donation/AdminDonationManualCreatePage'
import { AdminDonationShowPage } from '../pages/management/admin/donation/AdminDonationShowPage'
import { AdminDonationConfirmationsPage } from '../pages/management/admin/donation/AdminDonationConfirmationsPage'
import { AdminConsultationsPage } from '../pages/management/admin/consultations/AdminConsultationsPage'
import { AdminConsultationShowPage } from '../pages/management/admin/consultations/AdminConsultationShowPage'
import { AdminPickupRequestsPage } from '../pages/management/admin/pickup/AdminPickupRequestsPage'
import { AdminPickupRequestShowPage } from '../pages/management/admin/pickup/AdminPickupRequestShowPage'
import { AdminAllocationsPage } from '../pages/management/admin/allocations/AdminAllocationsPage'
import { AdminAllocationCreatePage } from '../pages/management/admin/allocations/AdminAllocationCreatePage'
import { EditorBanksPage } from '../pages/management/editor/bank/EditorBanksPage'
import { EditorBankCreatePage } from '../pages/management/editor/bank/EditorBankCreatePage'
import { EditorBankEditPage } from '../pages/management/editor/bank/EditorBankEditPage'
import { AdminEditorTasksPage } from '../pages/management/admin/task/AdminEditorTasksPage'
import { AdminEditorTaskCreatePage } from '../pages/management/admin/task/AdminEditorTaskCreatePage'
import { SuperAdminUsersPage } from '../pages/management/superadmin/users/SuperAdminUsersPage'
import { SuperAdminUserCreatePage } from '../pages/management/superadmin/users/SuperAdminUserCreatePage'
import { SuperAdminUserEditPage } from '../pages/management/superadmin/users/SuperAdminUserEditPage'
import { SuperAdminDashboardPage } from '../pages/management/superadmin/dashboard/SuperAdminDashboardPage'
import { AdminSuggestionsPage } from '../pages/management/admin/suggestion/AdminSuggestionsPage'
import { AdminSuggestionShowPage } from '../pages/management/admin/suggestion/AdminSuggestionShowPage'
import { GuidancePage } from '../pages/management/shared/GuidancePage'
import { RolesPage } from '../pages/management/superadmin/access/RolesPage'
import { RoleCreatePage } from '../pages/management/superadmin/access/RoleCreatePage'
import { RoleEditPage } from '../pages/management/superadmin/access/RoleEditPage'

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
      { path: 'literasi/:slug', element: <LiterasiDetailPage /> },
      {
        path: 'articles/:slug',
        element: <ArticleRedirect />
      },
      { path: 'tentang-kami', element: <TentangKamiPage /> },
      { path: 'konsultasi', element: <KonsultasiPage /> },
      { path: 'jemput-wakaf', element: <JemputWakafPage /> },
      { path: 'konfirmasi-donasi', element: <KonfirmasiDonasiPage /> },

      { path: 'donate', element: <DonatePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register-mitra', element: <MitraRegisterPage /> },
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
          { path: 'partners', element: <EditorPartnersPage /> },
          { path: 'partners/create', element: <EditorPartnerCreatePage /> },
          { path: 'partners/:id/edit', element: <EditorPartnerEditPage /> },
          { path: 'banners', element: <EditorBannersPage /> },
          { path: 'banners/create', element: <EditorBannerCreatePage /> },
          { path: 'banners/:id/edit', element: <EditorBannerEditPage /> },
          { path: 'tags', element: <EditorTagsPage /> },
          { path: 'tags/create', element: <EditorTagCreatePage /> },
          { path: 'tags/:id/edit', element: <EditorTagEditPage /> },
          { path: 'organization-members', element: <EditorOrganizationMembersPage /> },
          { path: 'organization-members/create', element: <EditorOrganizationMemberCreatePage /> },

          { path: 'organization-members/:id/edit', element: <EditorOrganizationMemberEditPage /> },
          { path: 'tasks', element: <EditorTasksPage /> },
          { path: 'search', element: <SearchPage role="editor" /> },
          { path: 'bank-accounts', element: <EditorBanksPage /> },
          { path: 'bank-accounts/create', element: <EditorBankCreatePage /> },
          { path: 'bank-accounts/:id/edit', element: <EditorBankEditPage /> },
          { path: 'guidance', element: <GuidancePage /> },
          { path: 'settings', element: <SettingsPage role="editor" /> },
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
          { path: 'reports/donations', element: <DonationReportPage /> },
          {
            path: 'donation-confirmations',
            element: <AdminDonationConfirmationsPage />,
          },
          { path: 'donations/manual', element: <AdminDonationManualCreatePage /> },
          { path: 'donations/:id', element: <AdminDonationShowPage /> },
          { path: 'consultations', element: <AdminConsultationsPage /> },
          { path: 'consultations/:id', element: <AdminConsultationShowPage /> },
          { path: 'suggestions', element: <AdminSuggestionsPage /> },
          { path: 'suggestions/:id', element: <AdminSuggestionShowPage /> },
          { path: 'pickup-requests', element: <AdminPickupRequestsPage /> },
          { path: 'pickup-requests/:id', element: <AdminPickupRequestShowPage /> },
          { path: 'pickup-requests/:id', element: <AdminPickupRequestShowPage /> },
          { path: 'allocations', element: <AdminAllocationsPage /> },
          { path: 'allocations/create', element: <AdminAllocationCreatePage /> },
          { path: 'editor-tasks', element: <AdminEditorTasksPage /> },
          { path: 'editor-tasks/create', element: <AdminEditorTaskCreatePage /> },
          { path: 'search', element: <SearchPage role="admin" /> },
          { path: 'guidance', element: <GuidancePage /> },
          { path: 'settings', element: <SettingsPage role="admin" /> },
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
          { path: 'roles', element: <RolesPage /> },
          { path: 'roles/create', element: <RoleCreatePage /> },
          { path: 'roles/:id/edit', element: <RoleEditPage /> },
          { path: 'reports/donations', element: <DonationReportPage /> },
          {
            path: 'search',
            element: <SearchPage role="superadmin" />,
          },
          { path: 'guidance', element: <GuidancePage /> },
          { path: 'settings', element: <SettingsPage role="superadmin" /> },
        ],
      },
      {
        path: 'mitra',
        element: <MitraShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <MitraDashboardPage /> },
          { path: 'allocations', element: <MitraAllocationsPage /> },
          { path: 'donations', element: <MitraDonationsPage /> },
          { path: 'saved-items', element: <SavedItemsPage /> },
          { path: 'guidance', element: <GuidancePage /> },
          { path: 'settings', element: <SettingsPage role="mitra" /> },
        ],
      },
      {
        path: 'management',
        element: <ManagementShell />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <CustomDashboardPage /> },
          { path: 'settings', element: <SettingsPage role="custom" /> },
          { path: 'guidance', element: <GuidancePage /> },
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

function ArticleRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/literasi/${slug}`} replace />;
}
