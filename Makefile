.PHONY: env
.DEFAULT_GOAL := help

SHELL := /bin/bash
TMP ?= /tmp
OS ?= $(shell uname -s | tr '[:upper:]' '[:lower:]')
APP_ROOT ?= $(shell 'pwd')
export DEFAULT_HELP_TARGET ?= help

# Environment variables for terraform plans and applys
KUBECTL ?= /usr/local/bin/kubectl
KUBECTL ?= $(APP_ROOT)/vendor/kubectl
KUBECTL_VERSION ?= v1.16.2
KUBECTL_URL ?= https://dl.k8s.io/$(KUBECTL_VERSION)/bin/$(OS)/amd64/kubectl

DOCKER_IMAGE_TAG ?=  $(IMAGE_NAME):$(ENV)
DOCKER_IMAGE ?= $(IMAGE_REPO_BASE_URL)/$(IMAGE_NAME):$(ENV)

IMAGE_HASH ?= $(shell aws ecr describe-images \
				--repository-name $(IMAGE_NAME) \
				--image-ids imageTag=$(ENV) \
					| jq -r '.imageDetails[].imageDigest')

SOURCE_FILES = $(wildcard *.tf)

# ANSI escape codes for green and no color
GREEN = \033[0;32m
NC = \033[0m

# Base image for kubernetes deployment
BASE_IMAGE_NAME ?= 726213127376.dkr.ecr.us-east-1.amazonaws.com/bl-infra-dep-image

# Alias command for docker's `make` executable
DOCKER_RUN_AGGREGATE ?=  \
		docker run \
		--rm \
		-v $(APP_ROOT):/app \
		-w /app \
		--entrypoint make \
		--env AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) \
		--env AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY) \
		--env AWS_DEFAULT_REGION=$(AWS_DEFAULT_REGION) \
		--env IMAGE_REPO_BASE_URL=$(IMAGE_REPO_BASE_URL) \
		--env IMAGE_NAME=$(IMAGE_NAME) \
		--env DOCKER_IMAGE_TAG=$(DOCKER_IMAGE_TAG) \
		--env DOCKER_IMAGE=$(DOCKER_IMAGE) \
		--env ENV=$(ENV) \
		--env CLUSTER_NAME=$(CLUSTER_NAME) \
		--env IMAGE_HASH=$(IMAGE_HASH) \
		$(BASE_IMAGE_NAME) \

DOCKER_RUN ?=  \
		docker run \
		--rm \
		-v $(APP_ROOT):/app \
		-w /app \
		--env AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) \
		--env AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY) \
		--env AWS_DEFAULT_REGION=$(AWS_DEFAULT_REGION) \
		--env IMAGE_REPO_BASE_URL=$(IMAGE_REPO_BASE_URL) \
		--env IMAGE_NAME=$(IMAGE_NAME) \
		--env DOCKER_IMAGE_TAG=$(DOCKER_IMAGE_TAG) \
		--env DOCKER_IMAGE=$(DOCKER_IMAGE) \
		--env ENV=$(ENV) \
		--env CLUSTER_NAME=$(CLUSTER_NAME) \
		--env IMAGE_HASH=$(IMAGE_HASH) \
		$(BASE_IMAGE_NAME) \

docker/%:
	@$(DOCKER_RUN_AGGREGATE) $*

ecr-login: ## login to ecr
	@$(DOCKER_RUN) aws ecr get-login-password --region $(AWS_DEFAULT_REGION) | docker login --username AWS --password-stdin $(IMAGE_REPO_BASE_URL)

ecr-create-repo: #create service repo if not available
	@aws ecr describe-repositories --repository-names $(IMAGE_NAME) || aws ecr create-repository --repository-name $(IMAGE_NAME)

docker-build: ## build docker file
	@docker build -t $(DOCKER_IMAGE_TAG) .

docker-tag: ## docker tag
	@docker tag $(DOCKER_IMAGE_TAG) $(DOCKER_IMAGE)

docker-push: ## docker push
	@docker push $(DOCKER_IMAGE)

docker-list-images:
	@docker images

test-image-hash:
	@if [ "$(IMAGE_HASH)" ]; then \
		echo "HASH FOUND FOR: $(IMAGE_NAME)"; \
	else \
		echo "NO HASH FOUND FOR: $(IMAGE_NAME)"; \
		exit 1; \
	fi

update-image-hash: test-image-hash ## replace the url in the kustomization file for the image url with new hash from the latest image
	@sed -i "s|$(IMAGE_REPO_BASE_URL)/$(IMAGE_NAME)|$(IMAGE_REPO_BASE_URL)/$(IMAGE_NAME)@$(IMAGE_HASH)|" k8s/overlays/$(ENV)/kustomization.yaml

update-kube-config: ## Update default region and cluster name in kubeconfig
	@aws eks --region $(AWS_DEFAULT_REGION) update-kubeconfig --name $(CLUSTER_NAME)

apply-k8s-changes: update-kube-config
	@kubectl apply -k k8s/overlays/$(ENV)



