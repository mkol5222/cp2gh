terraform {
  required_providers {
    checkpoint = {
      source = "CheckPointSW/checkpoint"
      version = "2.7.0"
    }
  }
}

provider "checkpoint" {
  # Configuration options
    server = var.CPSERVER
    api_key = var.CPAPIKEY
    context  = "web_api"
  session_name = "Terraform Session"
}

variable "CPSERVER" {
  
}

variable "CPAPIKEY" {
  
}