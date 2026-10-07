# YWDP Performance + SEO + Quality Audit

Date: 2026-10-07 (Asia/Bangkok)

## Executive summary

The application already has route-level lazy loading, Laravel-side metadata injection for article/program URLs, public API throttling, and several finance-specific cache/deduplication helpers. The highest-confidence improvements in this pass were request deduplication, public response cache policy, correct canonical/indexability metadata, static asset cache policy, security headers, and resolving four React Compiler lint errors.

The main remaining performance bottleneck is the public JavaScript graph: the production build still emits a roughly 561 kB initial JS chunk, a 164 kB Font Awesome vendor chunk, and an 8.0 MB audio asset. The initial bundle is not claimed as improved by this pass; the safe changes target duplicate requests and HTTP delivery behavior.

Lighthouse, field Core Web Vitals, load testing, and database query timing were not verified because no browser runtime was available and the local MySQL-backed employee endpoint did not complete. No improvement numbers are fabricated.

## Baseline and verification

### Build baseline captured before edits

- TypeScript/build: PASS.
- ESLint: command completed but reported 4 errors and approximately 350 warnings.
- Initial JS chunk: 560.59 kB raw / 170.98 kB gzip.
- Initial CSS: 179.79 kB raw / 25.47 kB gzip.
- Font Awesome vendor: 164.17 kB raw / 51.28 kB gzip.
- Phone input chunk: 200.97 kB raw / 49.62 kB gzip.
- Mitra dashboard chunk: 367.27 kB raw / 108.44 kB gzip.
- Audio asset: 8,016.71 kB.

### Post-change checks

- `npm run build`: PASS.
- `npm run lint -- --quiet`: PASS.
- PHP syntax checks for changed PHP files: PASS.
- `/`, `/program`, `/karyawan`, `/admin`: HTTP 200 smoke checks PASS locally.
- HTML robots/canonical smoke checks: PASS locally.
- Security headers on the HTTP response: PASS locally.
- Lighthouse: NOT VERIFIED (browser runtime unavailable).
- LCP, CLS, INP/TBT: NOT VERIFIED.
- Load test: NOT RUN.
- Full feature suite: FAIL / NOT GREEN. The run stopped in `EmployeeBusinessRulesTest` with 12 failures; an isolated rerun did not complete promptly against the configured MySQL test connection. No test was changed to hide this condition.

### Post-change bundle snapshot

The safe request/cache changes add a small public request helper and do not materially change bundle size. The measured post-change initial JS was approximately 561.05 kB raw / 171.21 kB gzip. This is reported as a measurement, not an improvement claim.

## Code quality

### Implemented

- Added a small in-memory, TTL-based public read cache with in-flight request deduplication for home data, banners, and footer programs. It does not persist sensitive or transactional data.
- Added a 15-second Axios timeout and deduplicated concurrent Sanctum CSRF-cookie requests.
- Fixed four React Compiler lint errors in finance hooks by moving ref mutation and time reads out of render. Finance accounting semantics and API parameters were not changed.
- Added image fallback, intrinsic dimensions, lazy loading, and async decoding to public employee cards.

### Remaining findings

- The lint baseline contained many warnings, especially `any` usage, effect dependency gaps, and set-state-in-effect advisories. These are a larger refactoring track and were not mass-edited.
- Several management/finance modules remain large. They are already route-split, so further decomposition should be profiling-led.
- The project has multiple public data clients and cache modules; a future consolidation could reduce maintenance cost, but broad replacement was not justified in this pass.

## Frontend performance

- Major routes are already lazy-loaded, including management, finance, employee, and public secondary pages.
- The landing page keeps the hero eager and below-fold landing sections lazy, which is appropriate for LCP intent.
- Public home, banners, and footer programs now share a 120-second in-memory cache and in-flight dedupe. StrictMode/remounts no longer need to create duplicate requests for those keys.
- The 8 MB audio file is declared with `preload="none"`, so it should not block the initial media download. It remains a large deployable asset and should be moved to an independently hosted/optimized media path if background music is retained.
- Font Awesome is a 164 kB vendor chunk. Imports are targeted, but the vendor remains a notable shared cost.
- No new frontend dependency was added.

## Backend, HTTP, and caching

- Added `public.cache` to unauthenticated public read routes and public employee reads, with 60-second shared freshness and 300-second stale-while-revalidate guidance plus ETags.
- Added immutable one-year caching for hashed Vite assets served through the Laravel fallback route.
- HTML uses `no-cache, must-revalidate`; it is not treated as immutable, so deploys can reference fresh asset hashes.
- Added global `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options` headers.
- Existing backend application caches were observed for home, programs, articles, social media, and public finance. Mutation invalidation exists in some domains; it should be reviewed whenever new cache keys are introduced.
- The configured local environment uses file cache, cookie sessions, and a database queue. Redis/CDN/reverse-proxy caching are infrastructure recommendations, not assumed code-level capabilities.
- Public employee query/index design has a composite published/status/order index in the migration. Query plans and live latency remain unverified because local MySQL did not complete the endpoint request.

## SEO and indexability

- Fixed sitemap links from `/programs` to the actual router path `/program` and updated dynamic program detail links accordingly.
- Added canonical URLs based on `FRONTEND_URL`, avoiding the API host as canonical when the Laravel app and SPA use separate domains.
- Added server-side `index,follow` or `noindex,nofollow` metadata for management, auth, error, preview, and employee-directory routes. Public employee pages retain the existing intentional noindex behavior.
- Expanded robots exclusions for private/management paths while leaving `/karyawan` crawlable enough for its noindex directive to be observed.
- Updated the checked-in static sitemap with additional existing public routes.
- Article/program titles, descriptions, Open Graph data, and article type continue to be populated when the corresponding database record exists; missing data is not manufactured.

### SSR/prerender assessment

Recommendation: OPTIONAL, not required for this pass.

The server currently delivers reliable route metadata and a JavaScript shell, but meaningful article/program body content is still rendered by React after API fetch. SSR/SSG would improve crawler resilience and LCP for SEO-critical dynamic pages, but it is an architectural migration and was intentionally not introduced without approval.

## Accessibility and best practices

- Public employee cards now have stable image dimensions, fallback images, lazy loading, and async decoding.
- Existing forms and dialogs should receive a separate browser accessibility review; automated Lighthouse results are unavailable.
- Security headers are implemented at the Laravel response layer. Static files served directly by Apache/Nginx still require equivalent server configuration.

## Scalability and production recommendations

### Code-level

- Keep public GET cache TTLs conservative and invalidate application caches explicitly after content mutations.
- Preserve in-flight dedupe and latest-request-wins behavior when adding public hooks.
- Keep financial and authenticated responses private; do not add browser/CDN caching to transactional state.

### Infrastructure

- Production: `APP_ENV=production`, `APP_DEBUG=false`.
- Run `composer install --no-dev --optimize-autoloader`.
- Run `php artisan config:cache`, `php artisan route:cache`, and `php artisan view:cache` during deployment.
- Enable PHP OPcache, Brotli/gzip for HTML/CSS/JS/JSON/SVG, and direct web-server delivery for public storage assets.
- Use Redis for shared cache/session/queue only if deployment already supports it or as a separately approved infrastructure upgrade.
- Consider a CDN/object storage path for high-volume images and the 8 MB audio asset.
- Add monitoring for 5xx responses, slow endpoints, queue failures, DB latency, cache misses, memory, CPU, and field CWV.
- Add a health check for `/up`, scheduled database backups, and a tested restore procedure.

## Files changed

- `bootstrap/app.php`
- `config/app.php`
- `routes/api.php`
- `routes/web.php`
- `app/Http/Middleware/PublicCacheHeaders.php`
- `app/Http/Middleware/SecurityHeaders.php`
- `frontend-dpf/src/lib/publicRequestCache.ts`
- `frontend-dpf/src/lib/http.ts`
- `frontend-dpf/src/pages/LandingPage.tsx`
- `frontend-dpf/src/layouts/LandingLayout.tsx`
- `frontend-dpf/src/components/public/employees/PublicEmployeeCard.tsx`
- `frontend-dpf/src/hooks/finance/useFinancialNotes.ts`
- `frontend-dpf/src/hooks/finance/useGeneralLedger.ts`
- `frontend-dpf/src/hooks/finance/useJournalMasterData.ts`
- `public/robots.txt`
- `public/sitemap.xml`

## Safety

- Finance accounting semantics changed: NO.
- Employee visibility/authorization rules changed: NO.
- Donation/payment behavior changed: NO.
- New unnecessary dependencies: NO.
- Lighthouse/CWV improvement claimed without measurement: NO.

## Final status

READY WITH INFRASTRUCTURE RECOMMENDATIONS. Browser/Lighthouse and live database/load verification remain required before declaring production performance targets achieved.

