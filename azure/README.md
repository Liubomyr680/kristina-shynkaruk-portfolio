# Owner workspace on Azure

The implementation runs as Azure Static Web Apps plus its **managed** Azure Functions API. Do not deploy `api/azure.js` as a directly accessible standalone Function App: it trusts identity headers injected by the Static Web Apps edge. The API additionally requires the exact `owner` role. Signing in alone does not grant editing rights.

## Deploy (not performed automatically)

1. Choose a resource group, region, unique Static Web App name and unique storage name. Review usage charges before creating resources. Deploy `azure/main.bicep` to that group. It creates a Free Static Web App and a private Standard LRS storage account. Storage, retention/versioning and bandwidth can incur charges.
2. The template configures `PHOTO_STORAGE_CONNECTION_STRING` and `PHOTO_STORAGE_CONTAINER` as server-side app settings. Never put these values in HTML, JavaScript, Git, logs or screenshots. Storage keys can be rotated in Azure and the app setting updated.
3. Add the Static Web App deployment token to the GitHub repository's Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. Run the manual **Deploy owner workspace to Azure** workflow. Website source is `dist`; managed API source is `api`. Deployments use Node 22. The existing `docs` GitHub Pages site is independent and cannot host the admin backend.
4. In Azure Static Web App **Role management**, invite only the intended owner's Microsoft account (provider `aad`) with custom role **owner**. The owner accepts the invitation and signs in at `/admin/login.html`. Other signed-in accounts are denied. There is no public admin link.
5. Confirm `/api/admin/stories` denies anonymous and non-owner requests. Confirm a draft photo cannot be read from `/api/media/<id>`, then publish a test series and confirm it appears. Test uploading, editing, ordering, unpublishing and deletion. Cloud storage and real identity sign-in must be verified on the deployed Azure environment before treating it as production-ready.

## Where data lands

Private Blob container `wedding-content`:
- `stories.json`: series IDs, localized titles, dates, selected cover, ordered photo IDs, drafts and separate published snapshots. This small portfolio uses one versioned metadata document rather than a separate database. ETag conditions prevent concurrent overwrites.
- `photos/<unique-id>.webp`: web-optimized photo uploads. The original local filenames are not used as storage paths. Folder hierarchy is flattened into the selected series. Titles can change without moving images.

Photos are resized in the browser to at most 2400px on their longest side, WebP quality 87%, and uploaded individually. Limits: 50 MB source file, 8 MB optimized upload, 100 photos per series. Supported inputs are JPG, PNG, WebP; multi-file selection is the fallback where folder selection is unsupported. HEIC/RAW are not supported. Originals stay on the owner's device; keep a separate backup.

All access goes through the same-origin API; storage has no anonymous access and needs no browser CORS configuration. Published media is available to visitors; drafts require the owner role. The current conservative implementation streams photos through the managed API and disables caching so an unpublished image is no longer served. For a much larger portfolio, add a carefully scoped published-image CDN layer.

Draft saves never replace the published snapshot. Uploads are saved immediately to the draft, and cover/order/title edits are committed with Save draft or Publish. Removing a previously published image keeps its file while the published snapshot still refers to it. Publishing, unpublishing, or deleting cleans up no-longer-referenced uploads. Azure retains soft-deleted blobs for seven days; versioning also retains previous metadata snapshots. Cleanup failures are logged and may leave inaccessible unreferenced files for later maintenance. Failed browser transfers may be retried individually.

## Local development

`npm start` serves the site and API at port 4173 (or `PORT`). `/admin` redirects to a local sign-in page. Only requests with a loopback connection **and** localhost/loopback host can create or use an owner session; LAN visitors cannot become editors. This local shortcut is not included in the Azure API. Local uploads and metadata persist in ignored `.data/` (or `CONTENT_DIR`), not in Git, GitHub Pages or Azure. Do not expose this development server through a tunnel or reverse proxy.

Run `npm run check` and `npm test`. Service tests use temporary isolated storage; HTTP security tests do not change existing stories. The browser editor can also be reviewed against local storage before cloud deployment.

## Portfolio
The same private metadata document also holds an independent `portfolio` record, with draft/published photo lists and its own version. `/api/portfolio` exposes only published photographs; `/api/admin/portfolio` and its `/photos` and `/publish` actions require the owner role. Existing documents without this record are initialized from the original homepage photos without changing any stories. Uploads use the same private photo storage and cleanup rules.
