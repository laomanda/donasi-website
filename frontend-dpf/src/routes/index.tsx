import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import App from '../App'
import { LandingPage } from '../pages/LandingPage'
import { PageLoader } from '../components/ui/PageLoader'

// Helper to wrap lazy-loaded components with dynamic PageLoader suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

// Public Pages (Lazy Loaded except LandingPage for LCP optimization)
const LayananPage = lazy(() => import('../pages/LayananPage').then(m => ({ default: m.LayananPage })))
const AktivitasDpfPage = lazy(() => import('../pages/AktivitasDpfPage').then(m => ({ default: m.AktivitasDpfPage })))
const AktivitasMitraPage = lazy(() => import('../pages/AktivitasMitraPage').then(m => ({ default: m.AktivitasMitraPage })))
const ProdukMitraPage = lazy(() => import('../pages/ProdukMitraPage'))
const ProdukMitraDetailPage = lazy(() => import('../pages/ProdukMitraDetailPage'))
const ProgramPage = lazy(() => import('../pages/ProgramPage').then(m => ({ default: m.ProgramPage })))
const ProgramDetailPage = lazy(() => import('../pages/ProgramDetailPage').then(m => ({ default: m.ProgramDetailPage })))
const LiterasiPage = lazy(() => import('../pages/LiterasiPage').then(m => ({ default: m.LiterasiPage })))
const LiterasiDetailPage = lazy(() => import('../pages/LiterasiDetailPage').then(m => ({ default: m.LiterasiDetailPage })))
const TentangKamiPage = lazy(() => import('../pages/TentangKamiPage').then(m => ({ default: m.TentangKamiPage })))
const KonsultasiPage = lazy(() => import('../pages/KonsultasiPage').then(m => ({ default: m.KonsultasiPage })))
const JemputWakafPage = lazy(() => import('../pages/JemputWakafPage').then(m => ({ default: m.JemputWakafPage })))
const KonfirmasiDonasiPage = lazy(() => import('../pages/KonfirmasiDonasiPage').then(m => ({ default: m.KonfirmasiDonasiPage })))
const DonatePage = lazy(() => import('../pages/DonatePage').then(m => ({ default: m.DonatePage })))
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const MitraRegisterPage = lazy(() => import('../pages/auth/MitraRegisterPage').then(m => ({ default: m.MitraRegisterPage })))

// Dashboard Shells
const EditorShell = lazy(() => import('../layouts/dashboard/RoleShells').then(m => ({ default: m.EditorShell })))
const AdminShell = lazy(() => import('../layouts/dashboard/RoleShells').then(m => ({ default: m.AdminShell })))
const KeuanganShell = lazy(() => import('../layouts/dashboard/RoleShells').then(m => ({ default: m.KeuanganShell })))
const SuperAdminShell = lazy(() => import('../layouts/dashboard/RoleShells').then(m => ({ default: m.SuperAdminShell })))
const MitraShell = lazy(() => import('../layouts/dashboard/RoleShells').then(m => ({ default: m.MitraShell })))
const ManagementShell = lazy(() => import('../layouts/dashboard/RoleShells').then(m => ({ default: m.ManagementShell })))

// Shared & Management Pages
const CustomDashboardPage = lazy(() => import('../pages/management/custom/CustomDashboardPage').then(m => ({ default: m.CustomDashboardPage })))
const KeuanganDashboardPage = lazy(() => import('../pages/management/keuangan/KeuanganDashboardPage').then(m => ({ default: m.KeuanganDashboardPage })))
const PreviewPage = lazy(() => import('../pages/management/editor/PreviewPage').then(m => ({ default: m.PreviewPage })))
const SettingsPage = lazy(() => import('../pages/management/SettingsPage').then(m => ({ default: m.SettingsPage })))
const SearchPage = lazy(() => import('../pages/management/shared/SearchPage').then(m => ({ default: m.SearchPage })))

// Mitra Pages
const MitraDashboardPage = lazy(() => import('../pages/management/mitra/MitraDashboardPage').then(m => ({ default: m.MitraDashboardPage })))
const MitraAllocationsPage = lazy(() => import('../pages/management/mitra/MitraAllocationsPage').then(m => ({ default: m.MitraAllocationsPage })))
const MitraDonationsPage = lazy(() => import('../pages/management/mitra/MitraDonationsPage').then(m => ({ default: m.MitraDonationsPage })))
const SavedItemsPage = lazy(() => import('../pages/management/mitra/SavedItemsPage').then(m => ({ default: m.SavedItemsPage })))

// Editor Pages
const EditorDashboardPage = lazy(() => import('../pages/management/editor/EditorDashboardPage').then(m => ({ default: m.EditorDashboardPage })))
const EditorArticlesPage = lazy(() => import('../pages/management/editor/article/EditorArticlesPage').then(m => ({ default: m.EditorArticlesPage })))
const EditorArticleCreatePage = lazy(() => import('../pages/management/editor/article/EditorArticleCreatePage').then(m => ({ default: m.EditorArticleCreatePage })))
const EditorArticleEditPage = lazy(() => import('../pages/management/editor/article/EditorArticleEditPage').then(m => ({ default: m.EditorArticleEditPage })))
const EditorProgramsPage = lazy(() => import('../pages/management/editor/program/EditorProgramsPage').then(m => ({ default: m.EditorProgramsPage })))
const EditorProgramCreatePage = lazy(() => import('../pages/management/editor/program/EditorProgramCreatePage').then(m => ({ default: m.EditorProgramCreatePage })))
const EditorProgramEditPage = lazy(() => import('../pages/management/editor/program/EditorProgramEditPage').then(m => ({ default: m.EditorProgramEditPage })))
const EditorBannersPage = lazy(() => import('../pages/management/editor/banner/EditorBannersPage'))
const EditorBannerCreatePage = lazy(() => import('../pages/management/editor/banner/EditorBannerCreatePage'))
const EditorBannerEditPage = lazy(() => import('../pages/management/editor/banner/EditorBannerEditPage'))
const EditorGalleryDpfPage = lazy(() => import('../pages/management/editor/gallery-dpf/EditorGalleryDpfPage'))
const EditorGalleryDpfCreatePage = lazy(() => import('../pages/management/editor/gallery-dpf/EditorGalleryDpfCreatePage'))
const EditorGalleryDpfEditPage = lazy(() => import('../pages/management/editor/gallery-dpf/EditorGalleryDpfEditPage'))
const EditorGalleryMitraPage = lazy(() => import('../pages/management/editor/gallery-mitra/EditorGalleryMitraPage'))
const EditorGalleryMitraCreatePage = lazy(() => import('../pages/management/editor/gallery-mitra/EditorGalleryMitraCreatePage'))
const EditorGalleryMitraEditPage = lazy(() => import('../pages/management/editor/gallery-mitra/EditorGalleryMitraEditPage'))
const EditorMitraProductsPage = lazy(() => import('../pages/management/editor/mitra-products/EditorMitraProductsPage'))
const EditorMitraProductCreatePage = lazy(() => import('../pages/management/editor/mitra-products/EditorMitraProductCreatePage'))
const EditorMitraProductEditPage = lazy(() => import('../pages/management/editor/mitra-products/EditorMitraProductEditPage'))
const EditorPartnersPage = lazy(() => import('../pages/management/editor/partner/EditorPartnersPage'))
const EditorPartnerCreatePage = lazy(() => import('../pages/management/editor/partner/EditorPartnerCreatePage'))
const EditorPartnerEditPage = lazy(() => import('../pages/management/editor/partner/EditorPartnerEditPage'))
const EditorTagsPage = lazy(() => import('../pages/management/editor/tag/EditorTagsPage'))
const EditorTagCreatePage = lazy(() => import('../pages/management/editor/tag/EditorTagCreatePage'))
const EditorTagEditPage = lazy(() => import('../pages/management/editor/tag/EditorTagEditPage'))
const EditorOrganizationMembersPage = lazy(() => import('../pages/management/editor/organization/EditorOrganizationMembersPage').then(m => ({ default: m.EditorOrganizationMembersPage })))
const EditorOrganizationMemberCreatePage = lazy(() => import('../pages/management/editor/organization/EditorOrganizationMemberCreatePage').then(m => ({ default: m.EditorOrganizationMemberCreatePage })))
const EditorOrganizationMemberEditPage = lazy(() => import('../pages/management/editor/organization/EditorOrganizationMemberEditPage').then(m => ({ default: m.EditorOrganizationMemberEditPage })))
const EditorBanksPage = lazy(() => import('../pages/management/editor/bank/EditorBanksPage').then(m => ({ default: m.EditorBanksPage })))
const EditorBankCreatePage = lazy(() => import('../pages/management/editor/bank/EditorBankCreatePage').then(m => ({ default: m.EditorBankCreatePage })))
const EditorBankEditPage = lazy(() => import('../pages/management/editor/bank/EditorBankEditPage').then(m => ({ default: m.EditorBankEditPage })))

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/management/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminDonationsPage = lazy(() => import('../pages/management/admin/donation/AdminDonationsPage').then(m => ({ default: m.AdminDonationsPage })))
const DonationReportPage = lazy(() => import('../pages/management/shared/DonationReportPage').then(m => ({ default: m.DonationReportPage })))
const CashFlowReportPage = lazy(() => import('../pages/management/keuangan/CashFlowReportPage').then(m => ({ default: m.CashFlowReportPage })))
const AdminDonationManualCreatePage = lazy(() => import('../pages/management/admin/donation/AdminDonationManualCreatePage').then(m => ({ default: m.AdminDonationManualCreatePage })))
const AdminDonationShowPage = lazy(() => import('../pages/management/admin/donation/AdminDonationShowPage').then(m => ({ default: m.AdminDonationShowPage })))
const AdminDonationConfirmationsPage = lazy(() => import('../pages/management/admin/donation/AdminDonationConfirmationsPage').then(m => ({ default: m.AdminDonationConfirmationsPage })))
const AdminConsultationsPage = lazy(() => import('../pages/management/admin/consultations/AdminConsultationsPage').then(m => ({ default: m.AdminConsultationsPage })))
const AdminConsultationShowPage = lazy(() => import('../pages/management/admin/consultations/AdminConsultationShowPage').then(m => ({ default: m.AdminConsultationShowPage })))
const AdminPickupRequestsPage = lazy(() => import('../pages/management/admin/pickup/AdminPickupRequestsPage').then(m => ({ default: m.AdminPickupRequestsPage })))
const AdminPickupRequestShowPage = lazy(() => import('../pages/management/admin/pickup/AdminPickupRequestShowPage').then(m => ({ default: m.AdminPickupRequestShowPage })))
const AdminAllocationsPage = lazy(() => import('../pages/management/admin/allocations/AdminAllocationsPage').then(m => ({ default: m.AdminAllocationsPage })))
const AdminAllocationCreatePage = lazy(() => import('../pages/management/admin/allocations/AdminAllocationCreatePage').then(m => ({ default: m.AdminAllocationCreatePage })))
const AdminSuggestionsPage = lazy(() => import('../pages/management/admin/suggestion/AdminSuggestionsPage').then(m => ({ default: m.AdminSuggestionsPage })))
const AdminSuggestionShowPage = lazy(() => import('../pages/management/admin/suggestion/AdminSuggestionShowPage').then(m => ({ default: m.AdminSuggestionShowPage })))

// Super Admin Pages
const SuperAdminUsersPage = lazy(() => import('../pages/management/superadmin/users/SuperAdminUsersPage').then(m => ({ default: m.SuperAdminUsersPage })))
const SuperAdminUserCreatePage = lazy(() => import('../pages/management/superadmin/users/SuperAdminUserCreatePage').then(m => ({ default: m.SuperAdminUserCreatePage })))
const SuperAdminUserEditPage = lazy(() => import('../pages/management/superadmin/users/SuperAdminUserEditPage').then(m => ({ default: m.SuperAdminUserEditPage })))
const SuperAdminDashboardPage = lazy(() => import('../pages/management/superadmin/dashboard/SuperAdminDashboardPage').then(m => ({ default: m.SuperAdminDashboardPage })))
const RolesPage = lazy(() => import('../pages/management/superadmin/access/RolesPage').then(m => ({ default: m.RolesPage })))
const RoleCreatePage = lazy(() => import('../pages/management/superadmin/access/RoleCreatePage').then(m => ({ default: m.RoleCreatePage })))
const RoleEditPage = lazy(() => import('../pages/management/superadmin/access/RoleEditPage').then(m => ({ default: m.RoleEditPage })))

// Error Pages
const Error400 = lazy(() => import('../pages/errors/400'))
const Error401 = lazy(() => import('../pages/errors/401'))
const Error402 = lazy(() => import('../pages/errors/402'))
const Error403 = lazy(() => import('../pages/errors/403'))
const Error404 = lazy(() => import('../pages/errors/404'))
const Error405 = lazy(() => import('../pages/errors/405'))
const Error408 = lazy(() => import('../pages/errors/408'))
const Error409 = lazy(() => import('../pages/errors/409'))
const Error429 = lazy(() => import('../pages/errors/429'))
const Error500 = lazy(() => import('../pages/errors/500'))
const Error503 = lazy(() => import('../pages/errors/503'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'layanan', element: withSuspense(LayananPage) },
      { path: 'aktivitas-dpf', element: withSuspense(AktivitasDpfPage) },
      { path: 'aktivitas-mitra', element: withSuspense(AktivitasMitraPage) },
      { path: 'produk-mitra', element: withSuspense(ProdukMitraPage) },
      { path: 'produk-mitra/:slug', element: withSuspense(ProdukMitraDetailPage) },
      { path: 'program', element: withSuspense(ProgramPage) },
      { path: 'program/:slug', element: withSuspense(ProgramDetailPage) },
      { path: 'literasi', element: withSuspense(LiterasiPage) },
      { path: 'literasi/:slug', element: withSuspense(LiterasiDetailPage) },
      {
        path: 'articles/:slug',
        element: <ArticleRedirect />
      },
      { path: 'tentang-kami', element: withSuspense(TentangKamiPage) },
      { path: 'konsultasi', element: withSuspense(KonsultasiPage) },
      { path: 'jemput-wakaf', element: withSuspense(JemputWakafPage) },
      { path: 'konfirmasi-donasi', element: withSuspense(KonfirmasiDonasiPage) },

      { path: 'donate', element: withSuspense(DonatePage) },
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'register-mitra', element: withSuspense(MitraRegisterPage) },
      { path: 'preview', element: withSuspense(PreviewPage) },
      {
        path: 'editor',
        element: withSuspense(EditorShell),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(EditorDashboardPage) },
          { path: 'articles', element: withSuspense(EditorArticlesPage) },
          { path: 'articles/create', element: withSuspense(EditorArticleCreatePage) },
          { path: 'articles/:id/edit', element: withSuspense(EditorArticleEditPage) },
          { path: 'programs', element: withSuspense(EditorProgramsPage) },
          { path: 'programs/create', element: withSuspense(EditorProgramCreatePage) },
          { path: 'programs/:id/edit', element: withSuspense(EditorProgramEditPage) },
          { path: 'partners', element: withSuspense(EditorPartnersPage) },
          { path: 'partners/create', element: withSuspense(EditorPartnerCreatePage) },
          { path: 'partners/:id/edit', element: withSuspense(EditorPartnerEditPage) },
          { path: 'banners', element: withSuspense(EditorBannersPage) },
          { path: 'banners/create', element: withSuspense(EditorBannerCreatePage) },
          { path: 'banners/:id/edit', element: withSuspense(EditorBannerEditPage) },
          { path: 'gallery-dpf', element: withSuspense(EditorGalleryDpfPage) },
          { path: 'gallery-dpf/create', element: withSuspense(EditorGalleryDpfCreatePage) },
          { path: 'gallery-dpf/:id/edit', element: withSuspense(EditorGalleryDpfEditPage) },
          { path: 'gallery-mitra', element: withSuspense(EditorGalleryMitraPage) },
          { path: 'gallery-mitra/create', element: withSuspense(EditorGalleryMitraCreatePage) },
          { path: 'gallery-mitra/:id/edit', element: withSuspense(EditorGalleryMitraEditPage) },
          { path: 'mitra-products', element: withSuspense(EditorMitraProductsPage) },
          { path: 'mitra-products/create', element: withSuspense(EditorMitraProductCreatePage) },
          { path: 'mitra-products/:id/edit', element: withSuspense(EditorMitraProductEditPage) },
          { path: 'tags', element: withSuspense(EditorTagsPage) },
          { path: 'tags/create', element: withSuspense(EditorTagCreatePage) },
          { path: 'tags/:id/edit', element: withSuspense(EditorTagEditPage) },
          { path: 'organization-members', element: withSuspense(EditorOrganizationMembersPage) },
          { path: 'organization-members/create', element: withSuspense(EditorOrganizationMemberCreatePage) },

          { path: 'organization-members/:id/edit', element: withSuspense(EditorOrganizationMemberEditPage) },
          { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage role="editor" /></Suspense> },
          { path: 'bank-accounts', element: withSuspense(EditorBanksPage) },
          { path: 'bank-accounts/create', element: withSuspense(EditorBankCreatePage) },
          { path: 'bank-accounts/:id/edit', element: withSuspense(EditorBankEditPage) },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage role="editor" /></Suspense> },
        ],
      },
      {
        path: 'admin',
        element: withSuspense(AdminShell),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(AdminDashboardPage) },
          {
            path: 'donations',
            element: withSuspense(AdminDonationsPage),
          },
          { path: 'reports/donations', element: withSuspense(DonationReportPage) },
          { path: 'reports/cashflow', element: withSuspense(CashFlowReportPage) },
          {
            path: 'donation-confirmations',
            element: withSuspense(AdminDonationConfirmationsPage),
          },
          { path: 'donations/manual', element: withSuspense(AdminDonationManualCreatePage) },
          { path: 'donations/:id', element: withSuspense(AdminDonationShowPage) },
          { path: 'consultations', element: withSuspense(AdminConsultationsPage) },
          { path: 'consultations/:id', element: withSuspense(AdminConsultationShowPage) },
          { path: 'suggestions', element: withSuspense(AdminSuggestionsPage) },
          { path: 'suggestions/:id', element: withSuspense(AdminSuggestionShowPage) },
          { path: 'pickup-requests', element: withSuspense(AdminPickupRequestsPage) },
          { path: 'pickup-requests/:id', element: withSuspense(AdminPickupRequestShowPage) },
          { path: 'allocations', element: withSuspense(AdminAllocationsPage) },
          { path: 'allocations/create', element: withSuspense(AdminAllocationCreatePage) },
          { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage role="admin" /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage role="admin" /></Suspense> },
        ],
      },
      {
        path: 'keuangan',
        element: withSuspense(KeuanganShell),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(KeuanganDashboardPage) },
          { path: 'donations', element: withSuspense(AdminDonationsPage) },
          { path: 'donations/manual', element: withSuspense(AdminDonationManualCreatePage) },
          { path: 'donations/:id', element: withSuspense(AdminDonationShowPage) },
          { path: 'donation-confirmations', element: withSuspense(AdminDonationConfirmationsPage) },
          { path: 'allocations', element: withSuspense(AdminAllocationsPage) },
          { path: 'allocations/create', element: withSuspense(AdminAllocationCreatePage) },
          { path: 'bank-accounts', element: withSuspense(EditorBanksPage) },
          { path: 'bank-accounts/create', element: withSuspense(EditorBankCreatePage) },
          { path: 'bank-accounts/:id/edit', element: withSuspense(EditorBankEditPage) },
          { path: 'reports/donations', element: withSuspense(DonationReportPage) },
          { path: 'reports/cashflow', element: withSuspense(CashFlowReportPage) },
          { path: 'search', element: <Suspense fallback={<PageLoader />}><SearchPage role="keuangan" /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage role="keuangan" /></Suspense> },
        ],
      },
      {
        path: 'superadmin',
        element: withSuspense(SuperAdminShell),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: 'dashboard',
            element: withSuspense(SuperAdminDashboardPage),
          },
          {
            path: 'users',
            element: withSuspense(SuperAdminUsersPage),
          },
          { path: 'users/create', element: withSuspense(SuperAdminUserCreatePage) },
          { path: 'users/:id/edit', element: withSuspense(SuperAdminUserEditPage) },
          { path: 'roles', element: withSuspense(RolesPage) },
          { path: 'roles/create', element: withSuspense(RoleCreatePage) },
          { path: 'roles/:id/edit', element: withSuspense(RoleEditPage) },
          { path: 'reports/donations', element: withSuspense(DonationReportPage) },
          { path: 'reports/cashflow', element: withSuspense(CashFlowReportPage) },
          {
            path: 'search',
            element: <Suspense fallback={<PageLoader />}><SearchPage role="superadmin" /></Suspense>,
          },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage role="superadmin" /></Suspense> },
        ],
      },
      {
        path: 'mitra',
        element: withSuspense(MitraShell),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(MitraDashboardPage) },
          { path: 'allocations', element: withSuspense(MitraAllocationsPage) },
          { path: 'donations', element: withSuspense(MitraDonationsPage) },
          { path: 'saved-items', element: withSuspense(SavedItemsPage) },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage role="mitra" /></Suspense> },
        ],
      },
      {
        path: 'management',
        element: withSuspense(ManagementShell),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(CustomDashboardPage) },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><SettingsPage role="custom" /></Suspense> },
        ],
      },
      { path: 'error/400', element: withSuspense(Error400) },
      { path: 'error/401', element: withSuspense(Error401) },
      { path: 'error/402', element: withSuspense(Error402) },
      { path: 'error/403', element: withSuspense(Error403) },
      { path: 'error/404', element: withSuspense(Error404) },
      { path: 'error/405', element: withSuspense(Error405) },
      { path: 'error/408', element: withSuspense(Error408) },
      { path: 'error/409', element: withSuspense(Error409) },
      { path: 'error/429', element: withSuspense(Error429) },
      { path: 'error/500', element: withSuspense(Error500) },
      { path: 'error/503', element: withSuspense(Error503) },
      { path: '*', element: withSuspense(Error404) },
    ],
  },
])

function ArticleRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/literasi/${slug}`} replace />;
}
