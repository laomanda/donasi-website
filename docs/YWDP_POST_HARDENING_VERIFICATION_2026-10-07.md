# YWDP POST-HARDENING VERIFICATION REPORT

Date: 2026-10-07  
Scope: verification of the existing hardening changes only. No new optimization wave was applied.

## Git Scope

The intentional change set covers public frontend caching/request deduplication, HTTP cache headers and ETags, security headers, SEO/robots/sitemap behavior, public employee image handling, Axios timeout/CSRF deduplication, and finance hook lint-only refactors.

Tracked source files changed: 13. The tracked diff is 99 insertions and 35 deletions; untracked intentional files are the two middleware classes, the public request cache helper, and this documentation.

Finance-only files are `useFinancialNotes.ts`, `useGeneralLedger.ts`, and `useJournalMasterData.ts`. Their changes move ref assignments/freshness evaluation into effects; request parameters, cache keys, formulas, values, posting, and reconciliation behavior are unchanged.

`storage/framework/lsp-9ced99a593fc3656.php` is an unrelated pre-existing generated artifact and was preserved. Build output changes were restored/removed after verification; no generated `dist` changes remain in the final scope.

## Regression

Independent database connectivity check passed:

```text
php artisan tinker --execute='DB::connection()->getPdo(); echo 1;'
1
```

The exact focused employee test was run clean earlier in this verification pass with `--stop-on-failure`: 12 tests, 50 assertions passed.

The required exact command was then rerun after the aggregate employee run had populated the shared test database:

```text
php artisan test tests/Feature/Employee/EmployeeBusinessRulesTest.php
6 failed, 6 passed, 30 assertions
```

The failures are fixture/database-isolation contamination, not evidence of a hardening regression: duplicate `0108026`, existing `jakkob`/`jakkob-panjaitan` slugs, and related uniqueness collisions were present before the affected assertions. The aggregate command likewise produced 9 failures and 17 passes, including SQLSTATE 23000 / MySQL 1062 duplicate employee code, slug, and display-order values. Employee business logic and tests were not changed.

## HTTP Cache

Public cache middleware is limited to unauthenticated `GET`/`HEAD` responses with status 200 and is attached only to the public frontend and public employee API route groups. Authenticated/private routes are outside this cache group and are not public-shared cached by this middleware.

Observed local response for `GET /api/v1/public/employees/filters`:

```text
200
Cache-Control: max-age=60, public, s-maxage=60, stale-while-revalidate=300
ETag: "34f5c2b26dfbb452ab6832200206a3afaa249fa5"
```

The matching `If-None-Match` request returned `304` with the same ETag. ETags are derived from the actual response body. A changed-resource/new-ETag mutation test was not performed. There is no server-side response-body cache or explicit invalidation layer introduced by this pass; HTTP freshness is bounded by the 60-second shared TTL plus stale-while-revalidate behavior.

No `Vary` header was added. Because CORS permits multiple origins, a CDN/reverse proxy serving these responses should confirm that its cache key and `Vary: Origin` policy cannot cross-contaminate origin-sensitive responses. This is a residual infrastructure review item, not a claim of verified production behavior.

HTML responses are `no-cache,must-revalidate`; hashed assets are immutable for one year; sitemap responses are publicly cached for five minutes. Public API POST routes are excluded by the middleware method check.

## Frontend Cache

The public request helper uses an in-memory, caller-keyed, TTL-bounded cache and in-flight promise deduplication. It has no persistence and no cross-user storage. Landing home, banners, and programs use a 120-second TTL. Axios has a 15-second timeout, and concurrent CSRF-cookie initialization is deduplicated until success.

Freshness is TTL-based only; explicit mutation invalidation is not implemented. This is acceptable for the public read-only consumers verified here but remains a follow-up consideration for any future write-after-read flow.

## Security Headers

Verified local values include:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: SAMEORIGIN`

CSP is not implemented. HSTS is not implemented; it should be applied deliberately at the HTTPS production edge after confirming domain and subdomain policy. No claim is made that the current headers constitute a complete production security policy.

## SEO

Robots rules allow public paths and disallow management/private paths. Server-rendered robots metadata marks private segments noindex, while public employee pages are intentionally noindex. Canonicals and dynamic metadata use `FRONTEND_URL`; local smoke tests therefore showed localhost, while production must provide `FRONTEND_URL=https://ywdp.org`.

The static sitemap contains 11 public production URLs and no query, API, admin, or filter URLs. The dynamic Laravel sitemap adds database-backed public article/program URLs and is cached for 300 seconds. Structured data (`application/ld+json` / schema.org) was not found in the source and is not verified/implemented by this pass.

## Asset Audit

The imported audio asset is `frontend-dpf/src/assets/brand/audio/audio.mpeg`, exactly 8,016,708 bytes (about 8.02 MB). It is imported by `BackgroundMusic.tsx`, rendered only outside dashboard/public-employee contexts, and uses `preload="none"` with no autoplay. `ffprobe` was unavailable, so duration and bitrate are NOT VERIFIED. Browser network impact is also NOT VERIFIED because no browser runtime was available.

The public employee card has fallback handling, explicit 400x300 dimensions, lazy loading, and async decoding.

## Bundle

The production build passed. Largest observed output chunks were:

- initial entry: 561.05 kB raw / 171.21 kB gzip
- Mitra dashboard: 367.27 / 108.43 kB
- PhoneInput: 200.97 / 49.62 kB
- shared public chunk: 182.92 / 63.85 kB
- Font Awesome vendor: 164.17 / 51.28 kB

The hardening pass did not materially reduce bundle size. Management, finance, employee-management, and editor pages remain route-level lazy imports; no evidence was found that those page modules are bundled into the initial public route entry. Browser waterfall confirmation is pending.

## Performance Verification

`npm run lint -- --quiet` passed. `npm run build` passed, with only the existing Browserslist freshness warning. PHP syntax checks passed for changed PHP files. Laravel `optimize:clear`, `config:cache`, `route:cache`, and `view:cache` all passed, confirming production-cache command compatibility.

No browser was available for Lighthouse, Core Web Vitals, waterfall, responsive checks, runtime console inspection, or production-like conditional-resource mutation checks. Those items remain NOT VERIFIED. No high-traffic or production performance claim is made.

## Infrastructure

Laravel cache/config/route/view compilation succeeded. Static `public/robots.txt` and `public/sitemap.xml` are present. Production canonical and sitemap host behavior depends on deployment configuration, especially `FRONTEND_URL` and whether the web server serves static files before Laravel. Compression, CDN behavior, HSTS, CSP, and cache `Vary` behavior remain deployment-level verification items.

## Final

CODE HARDENING COMPLETE — PERFORMANCE LAB VERIFICATION PENDING

The implementation is syntactically/build-valid and the public HTTP cache behavior was directly smoke-tested. Full performance sign-off is withheld until a browser-capable performance lab can verify waterfall, Lighthouse/Core Web Vitals, responsive behavior, and production cache-boundary behavior.
