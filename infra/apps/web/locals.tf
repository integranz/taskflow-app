# Values rendered from .slipway/config.yaml for app `web`. Change them with /slipway:bootstrap, then re-scaffold.
locals {
  project     = "taskflow-app"
  environment = "dev"
  app         = "web"

  resource_group_name = "rg-taskflow-dev"
  acr_name            = "acrtaskflowdev"
  key_vault_name      = "kv-taskflow-app-dev"
  identity_name       = "id-taskflow-app-dev"
  cae_name            = "cae-taskflow-app-dev"

  tags = {
    project     = local.project
    environment = local.environment
    managed_by  = "terraform"
    layer       = "app"
    generator   = "slipway"
  }
}

# Shared registry (options.registry_scope: existing): looked up in its own resource group.
locals {
  acr_resource_group_name = "rg-taskflow-dev"
}
