# Values rendered from .slipway/config.yaml. Change them with /slipway:bootstrap, then re-scaffold.
locals {
  project     = "taskflow-app"
  environment = "dev"
  location    = "westeurope"

  resource_group_name = "rg-taskflow-dev"
  acr_name            = "acrtaskflowdev"
  key_vault_name      = "kv-taskflow-app-dev"
  identity_name       = "id-taskflow-app-dev"
  log_analytics_name  = "log-taskflow-app-dev"
  cicd_principal_name = "sp-taskflow-app-github" # created by .slipway/setup-azure.sh

  tags = {
    project     = local.project
    environment = local.environment
    managed_by  = "terraform"
    generator   = "slipway"
  }
}

# Shared registry (options.registry_scope: existing): referenced by name, never created or destroyed here.
locals {
  acr_resource_group_name = "rg-taskflow-dev"
}
