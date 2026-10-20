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
include docker/quality.mk
else
.DEFAULT_GOAL := help
.PHONY: help check test lint typecheck build verify
help:
	@printf '%s\n' 'Native Node: npm ci --ignore-scripts; make check; make test'
check:
	npm run check
test:
	npm test
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
