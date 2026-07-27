.PHONY: install test build \
        contract-build contract-test contract-deploy-testnet \
        web-dev web-build web-lint web-typecheck \
        scheduler-run scheduler-dry-run \
        ci lint typecheck fmt check

# ============================================
# Stellar Drips — Makefile
# ============================================

help:
	@echo "Stellar Drips — Makefile"
	@echo ""
	@echo "install              Install all dependencies"
	@echo "test                 Run all tests"
	@echo "build                Build everything"
	@echo ""
	@echo "contract-build       Build Soroban contract wasm"
	@echo "contract-test        Run contract Rust tests"
	@echo "contract-deploy-testnet  Deploy contract to Stellar testnet"
	@echo ""
	@echo "web-dev              Start frontend dev server"
	@echo "web-build            Build frontend for production"
	@echo "web-lint             Run ESLint on frontend"
	@echo "web-typecheck        Run TypeScript type checking"
	@echo ""
	@echo "scheduler-run        Run off-chain payment scheduler"
	@echo "scheduler-dry-run    Run scheduler in dry-run mode"
	@echo ""
	@echo "ci                   Run full CI pipeline (lint + typecheck + test + build)"
	@echo "fmt                  Format all code"
	@echo "check                Run clippy + fmt checks on contract"

# --- Install ---

install:
	cd apps/web && bun install

# --- Contract ---

contract-build:
	cd contracts/subscription && cargo build --target wasm32v1-none --release

contract-test:
	cd contracts/subscription && cargo test

contract-deploy-testnet:
	cd contracts/subscription && stellar contract deploy \
		--wasm ../target/wasm32v1-none/release/stellar_drips_subscription.wasm \
		--source testnet-keeper \
		--network testnet

# --- Web ---

web-dev:
	cd apps/web && bun dev

web-build:
	cd apps/web && bun run build

web-lint:
	cd apps/web && bun run lint

web-typecheck:
	cd apps/web && bun run typecheck

# --- Scheduler ---

scheduler-run:
	cd scripts && bun run scheduler.ts

scheduler-dry-run:
	cd scripts && SCHEDULER_DRY_RUN=true bun run scheduler.ts

# --- CI / Checks ---

ci: lint typecheck contract-test web-build

lint: web-lint

typecheck: web-typecheck

fmt:
	cd contracts/subscription && cargo fmt
	cd apps/web && bun run format

check:
	cd contracts/subscription && cargo clippy --all-targets -- -D warnings
	cd contracts/subscription && cargo fmt --check

# --- Test ---

test: contract-test
