.DEFAULT_GOAL := help
.PHONY: help setup version check lint format format-check typecheck test acceptance coverage source build verify release-check test-integration ci-local
help:
	@printf '%s\n' 'Node 24.22.0: make setup; make check; make ci-local' \
	  'check: Markdown, links, templates, JavaScript syntax and unit/contract tests' \
	  'ci-local: acceptance, coverage, bundle, verification and dependency audits' \
	  'format changes source; Docker is optional; no registry publication or deployment'
version:
	npm run version:show
setup:
	npm ci --ignore-scripts
check: acceptance
lint:
	npm run check
format-check:
	npm run check:markdown
format:
	npm exec -- markdownlint "**/*.md" --dot --ignore node_modules --ignore coverage --fix
typecheck:
	npm run check:syntax
test test-integration:
	npm test
acceptance:
	npm run acceptance
coverage:
	npm run coverage
source:
	bash docker/source_identity.sh
build: source
	npm run build
verify:
	npm run verify
release-check:
	npm run release:check
ci-local:
	node scripts/ci-local.mjs
