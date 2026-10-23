# Quick dev commands never prepare a product/build image.
ifneq ($(filter lint format format-check check,$(MAKECMDGOALS)),)
override CONTAINERIZED := 1
endif
ifneq ($(CONTAINERIZED),1)
QUALITY_IMAGE := base-rules:quality
OFFLINE_PREFLIGHT_COMMAND = true
QUALITY_EXTRA_TARGETS :=
QUALITY_RUN_ARGS += --env npm_config_cache=/tmp/npm
COVERAGE_COMMAND = node scripts/release.mjs coverage
VERSION_COMMAND = $(QUALITY_RUN) node scripts/release.mjs version
RELEASE_CHECK_COMMAND = $(QUALITY_RUN) node scripts/release.mjs release-check
RECEIPT_COMMAND = $(QUALITY_RUN) node scripts/release.mjs
BUILD_COMMAND = $(QUALITY_RUN) npm run build
VERIFY_COMMAND = $(QUALITY_RUN) npm run verify
IMAGE_COMMAND = printf '%s\n' 'notApplicable: rules have no runtime image'
QUALITY_EXTRA_TARGETS += acceptance
CI_LOCAL_TARGETS ?= acceptance coverage build verify release-check
include docker/quality.mk
else
.DEFAULT_GOAL := help
.PHONY: help check test lint typecheck build verify
help:
	@printf '%s\n' 'Native Node: npm ci --ignore-scripts; make check; make test'
check: lint ## Fast lint-only gate; no tests/build.

acceptance:
	npm run acceptance
test:
	npm test
format:
	npm exec -- markdownlint "**/*.md" --dot --ignore node_modules --ignore coverage --fix

lint:
	npm run check:markdown
	npm run check:links
typecheck:
	@printf '%s\n' 'notApplicable: documentation and JavaScript tools'
build:
	npm run build
verify:
	npm run verify
endif

.PHONY: dev-policy-help
help: dev-policy-help
dev-policy-help:
	@printf '%s\n' 'Daily: make lint; explicit git push origin dev.' \
	  'Manual only: test, typecheck, coverage, build, acceptance, ci-local.' \
	  'Native lint tools must be installed; lint never syncs/builds the application.'
