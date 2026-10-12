---
paths:
  - ".github/workflows/**"
---
# Pipeline rules (GitHub Actions)

- One CI and one CD workflow **per app**, named `taskflow-app-<app>-ci` and `taskflow-app-<app>-cd`; both are thin callers of the shared reusable workflows `_ci.yml` and `_cd.yml` (`workflow_call`). Never combine apps in one workflow.
- Triggers are path-filtered: `on.push.paths` (and `on.pull_request.paths` with `pr_checks=path-filtered`) list exactly the app's inputs from `.slipway/config.yaml` (its path, declared `paths`, `shared_paths`, the four workflow files, `infra/apps/<app>`). The same list is the `pathFilters` of the app's `version.json`; `/slipway:verify` refutes a deployment when they disagree. Change the list in the config and re-scaffold, never in the workflow.
- With `pr_checks=path-filtered` a pull request that does not touch an app never starts that app's CI; do **not** require per-app checks on `main` (a skipped workflow stays Pending and blocks the merge). Switch to `pr_checks=always-run-gate` first.
- CI builds and tests on pull requests without pushing anything; only pushes to `main` push `acrtaskflowdev.azurecr.io/<repo>:<semver>`, create the git tag `<app>/v<semver>` and publish `release-manifest-<app>-<semver>`.
- CD is started only by `/slipway:deploy <app> <tag> <env>` (`workflow_dispatch` with `tag` and `environment` inputs).
- CD applies `infra/apps/<app>` behind the GitHub Environment approval; no other job runs `terraform apply`, and one app's CD never touches another app's state.
- Cloud authentication is OIDC federated credentials (`azure/login` with `id-token: write`); no client secrets in repository secrets.
- Every pushed image tag is immutable and traceable to a commit (`sha-<short>` alias allowed alongside the semver).
- Cloud identity in workflows comes only from the repository secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` (exported to Terraform as `ARM_CLIENT_ID`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID` with `ARM_USE_OIDC=true`, `ARM_USE_AZUREAD=true`). Hardened base images are pulled after `docker/login-action` with `registry: dhi.io`, `username: ${{ vars.DOCKERHUB_USERNAME }}`, `password: ${{ secrets.DOCKERHUB_TOKEN }}`. No other credentials exist; see `.slipway/SETUP.md`.
