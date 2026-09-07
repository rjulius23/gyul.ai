# GitHub Pages launch checklist

**Deployment is not authorized by preparing this repository.** [CI](../.github/workflows/ci.yml) validates pushes, pull requests, and manual runs with read-only repository permissions. [Deploy GitHub Pages (manual)](../.github/workflows/deploy.yml) accepts only `workflow_dispatch` and skips publishing unless its boolean `confirm_deployment` input is explicitly `true`. Obtain separate owner approval for the exact release before pushing release changes, running a deployment, or changing Pages, DNS, or account settings.

## Hosting contract

- Static Astro output at the root domain [https://gyul.ai](https://gyul.ai); no repository-name base path. Publish only the generated `dist/` artifact, not the repository or private working files.
- Use **Node 24 LTS** and the locked **TypeScript 6** toolchain for Astro checker compatibility. Upgrade the checker and TypeScript together after testing; do not substitute a newer major implicitly.
- No server runtime, live AI endpoint, contact backend, analytics, or tracking scripts. No service/API credentials are needed in browser code or the build artifact.
- Keep [assets/logo.jpg](../assets/logo.jpg) unchanged as the original artwork; optimized delivery assets may live under `public/`.

## Before requesting launch approval

- [ ] Review the exact release diff and [public-content rules](public-content.md). Record the candidate commit SHA and the last known-good deployment SHA/run for rollback.
- [ ] Install from the committed lockfile with `npm ci` using the Node version in `.nvmrc` (24.20.0). Install test browsers with `npx --no-install playwright install --with-deps chromium webkit` on Linux; `--with-deps` installs required OS packages.
- [ ] Run `npm run verify` for formatting, types, native unit tests, build, and static-output checks. Then run `npm run test:e2e` for all six projects: Chromium at 320/390/768/1440 and WebKit at 390/1440. E2E rebuilds the site, so finish with `node scripts/check-build.mjs` to validate that final output. Both workflows run this sequence; no successful CI run is assumed here.
- [ ] Inspect the production build locally, not only the development server. Check root-relative assets, canonical URL, social metadata, favicon, navigation anchors, and the not-found page.
- [ ] Confirm CI runs validation only and the deployment workflow has no push, pull-request, schedule, or upstream-workflow deployment trigger. Review workflow permissions: validation should not need deployment rights; deployment uses only required Pages/OIDC permissions and the `github-pages` environment.
- [ ] Record actual test results and any remaining limitations with the release. This checklist is not evidence that checks have passed.

### Privacy and accessibility review

- [ ] Inspect the production page's Network panel on initial load and while exercising every control. Expect same-origin assets only until a visitor explicitly follows an external link; no model requests, form submissions, analytics, remote fonts, or unsolicited embeds.
- [ ] Inspect browser storage for unexpected identifiers, cookies, or retained user input. No tracking does not mean the hosting provider has no request logs.
- [ ] Search authored files and `dist/` for personal email addresses, phone numbers, secrets, private notes, client endorsements, stale metrics, and unsupported role claims. Never upload diagnostic exports containing private data.
- [ ] Use keyboard only: skip link, visible focus, logical tab order, navigation, and all interactive controls. Verify Escape and focus restoration where applicable, with no keyboard traps.
- [ ] Test small screens, 200% zoom, text contrast, reduced motion, a screen reader, and JavaScript disabled. Core identity, work, and outbound contact links must remain usable without JavaScript.
- [ ] Run automated accessibility tests, but also perform the manual checks above; automated passes alone do not establish accessibility conformance.

## Authorized launch only

After the owner explicitly approves the candidate and any required settings changes:

1. Push the reviewed release through the agreed repository workflow and wait for its validation checks. Confirm the deployed ref resolves to the approved SHA; if it changed, stop and review again.
2. In **Repository → Settings → Pages**, select **GitHub Actions** as the build/deployment source. Set **Custom domain** to `gyul.ai` and confirm the domain check. For custom Actions publishing, GitHub ignores an artifact's `CNAME` file: that file alone does not configure the domain.
3. Review domain ownership verification and `github-pages` environment protection, including required reviewers where available. Do not replace correct DNS or alter unrelated account settings as a troubleshooting shortcut.
4. In **Actions → Deploy GitHub Pages (manual)**, choose the approved ref, explicitly check `confirm_deployment`, and click **Run workflow**. The build checks out the dispatch commit SHA and records it in the run log. Review and approve the `github-pages` environment deployment if required. A merge or successful CI run must not itself publish the site. The workflow will not automatically enable Pages and refuses to publish unless the configured origin is `https://gyul.ai` with an empty base path.
5. Confirm the run succeeds and its deployment points to the expected domain. Complete the TLS and live-site checks below before announcing launch.

### Workflow maintenance

Direct action references are pinned to full commit SHAs, verified against official stable release tags on 7 September 2026: checkout v7.0.1, setup-node v7.0.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0, and deploy-pages v5.0.1. When upgrading, resolve the official release tag to its commit, review changes, and update both SHA and readable version comment; never replace pins with moving major-version tags. The pinned upload action also pins its underlying upload-artifact action. Validate workflow edits with `actionlint` and the repository formatter before approval.

Build jobs have only `contents: read`; only the isolated deployment job receives `pages: write` and `id-token: write`, and it does not execute repository code. Deployment runs are serialized without cancelling an active release. Review these boundaries whenever changing the workflows.

## DNS and TLS: release gate

The launch handoff reports correct public DNS and a TLS certificate hostname mismatch; **the cause of the mismatch is unverified**. Correct DNS alone does not prove correct repository-domain association or successful certificate issuance. Recheck at launch rather than treating this note as a live status report.

Read-only diagnostics:

```sh
dig +short gyul.ai A
dig +short gyul.ai AAAA
dig +short www.gyul.ai CNAME
curl --head --fail --show-error https://gyul.ai/
curl --head --location --max-redirs 5 --fail --show-error https://www.gyul.ai/
curl --head --location --max-redirs 5 --fail --show-error http://gyul.ai/
curl --head --location --max-redirs 5 --fail --show-error http://www.gyul.ai/
```

- [ ] Compare DNS with [GitHub's current domain guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). The `www` CNAME should target the account's `github.io` hostname directly, without a repository path. No DNS change is implied or authorized by these diagnostics.
- [ ] Confirm the repository owns the intended Pages custom-domain association and inspect its certificate/provisioning status. Check conflicting records, CAA restrictions, and domain association only as possible causes—not established diagnoses.
- [ ] Allow GitHub's documented provisioning window; **Enforce HTTPS** can take up to 24 hours to become available. Enable it when a valid certificate is ready. If provisioning remains blocked, follow [GitHub's HTTPS guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) or escalate to support; do not repeatedly remove/re-add the domain without approval.
- [ ] Verify trusted, unexpired certificates covering each hostname **before** redirects: `gyul.ai` and `www.gyul.ai`. Test in a normal browser without warning bypasses and with `curl` without `-k`/`--insecure`.
- [ ] Confirm HTTPS apex returns the intended release; HTTPS `www` redirects to `https://gyul.ai/` without a loop or downgrade. HTTP apex and HTTP `www` must also finish on HTTPS apex. Check a known asset/path to ensure redirects preserve paths.
- [ ] Confirm no mixed content, missing assets, browser console errors, broken external links, or unexpected network requests. Repeat privacy and keyboard smoke tests on the live site.

Do not call the site launched while certificate validation fails. A successful workflow cannot repair or prove TLS by itself.

## Rollback

1. Identify the last known-good SHA and deployment run recorded before launch. Do not force-push history, delete the site, or remove the domain to roll back content.
2. Obtain authorization for the rollback. Prefer a reviewed revert commit on the release branch, run the full checks, then manually deploy it. Alternatively, redeploy an approved known-good ref only if the manual workflow supports that ref and its toolchain still passes validation.
3. Verify the rollback run's SHA, live content, assets, HTTPS, and `www` redirects. Record the rollback reason and outcome.
4. Treat TLS/domain failures separately: old content does not fix a certificate mismatch. Preserve the domain association while diagnosing it; any settings or DNS repair requires explicit approval.
