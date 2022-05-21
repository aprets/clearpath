variable "project" {}

variable "instance_name" {}
variable "region" {}
variable "machine_type" {}
variable "image" {}

provider "google" {
  project = var.project
  region  = "europe-west2"
}


resource "google_compute_instance" "default" {
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.region


  boot_disk {
    initialize_params {
      image = var.image
    }
  }

  network_interface {
    network = "default"

    access_config {
      // Ephemeral public IP
    }
  }

}

output "ip_address" {
  value = google_compute_instance.default.network_interface.0.access_config.0.nat_ip
}

output "url" {
  value = "https://console.cloud.google.com/compute/instancesDetail/zones/${var.region}/instances/${var.instance_name}?project=clearpathcloud"
}

output "shell_url" {
  value = "https://ssh.cloud.google.com/v2/ssh/projects/clearpathcloud/zones/${var.region}/instances/${var.instance_name}?useAdminProxy=true"
}