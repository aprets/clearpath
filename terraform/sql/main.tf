variable "project" {}

variable "instance_name" {}
variable "region" {}
variable "database_version" {}
variable "tier" {}
variable "database_name" {}
variable "username" {}

provider "google" {
  project = var.project
  region  = "europe-west2"
}

resource "google_sql_database" "database" {
  name     = var.database_name
  instance = google_sql_database_instance.instance.name
}

resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "instance" {
  name             = "${var.instance_name}-${random_id.db_name_suffix.hex}"
  region           = var.region
  database_version = var.database_version
  settings {
    tier = var.tier
  }

  deletion_protection  = "false"
}

resource "random_password" "password" {
  length           = 16
  special          = false
}

resource "google_sql_user" "users" {
  name     = var.username
  instance = google_sql_database_instance.instance.name
  password = random_password.password.result
}

output "ip_address" {
  value = google_sql_database_instance.instance.public_ip_address
}

output "username" {
  value = google_sql_user.users.name
}

output "password" {
  sensitive = true
  value = google_sql_user.users.password
}

# output "adios" {
#   value = "Bye, ${var.name}"
# }