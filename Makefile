.DEFAULT_GOAL := help

BUN := bun

.PHONY: help check-env setup setup-env setup-linting install pods start ios android web \
	build-ios build-android prebuild clean clean-cache reset update doctor \
	dev-ios dev-android lint type-check typecheck check test \
	simulator-list emulator-list create-emulator start-emulator \
	tunnel local-network cache-clear info reset-project status

NODE_VERSION := 22.17.0
XCODE_VERSION := 16.4
ANDROID_SDK_VERSION := 35

help:
	@echo "📱 zeller-assignment — Expo / React Native"
	@echo ""
	@echo "🚀 Setup"
	@echo "  make setup           - check-env + install + pods (if ios/ exists)"
	@echo "  make setup-env       - copy .env.example → .env when .env is missing"
	@echo "  make setup-linting   - Husky + Expo lint (already configured in repo)"
	@echo "  make install         - bun install"
	@echo "  make check-env       - verify Node, Bun, Xcode tools, Android SDK, CocoaPods"
	@echo "  make doctor          - expo doctor"
	@echo ""
	@echo "🛠️  Development"
	@echo "  make start           - Expo dev server"
	@echo "  make ios / android / web"
	@echo "  make dev-ios         - expo run:ios (local native binary + Metro)"
	@echo "  make dev-android     - expo run:android"
	@echo ""
	@echo "📦 Native / local builds"
	@echo "  make prebuild        - generate ios/ and android/ from app config"
	@echo "  make build-ios       - local native iOS build (expo run:ios, no URL)"
	@echo "  make build-android   - local native Android build (expo run:android)"
	@echo "  make pods            - pod install when ios/Podfile exists"
	@echo ""
	@echo "✅ Quality"
	@echo "  make lint            - expo lint"
	@echo "  make type-check      - tsc --noEmit"
	@echo "  make check           - lint + type-check"
	@echo "  make test            - Jest (bun run test)"
	@echo ""
	@echo "🧹 Maintenance"
	@echo "  make clean           - remove node_modules, native build dirs, .expo"
	@echo "  make clean-cache     - expo start --clear"
	@echo "  make reset           - clean, reinstall deps, pods"
	@echo "  make update          - bun update (+ pods if ios exists)"
	@echo "  make reset-project   - Expo starter reset script"
	@echo ""
	@echo "🌐 Network / misc"
	@echo "  make tunnel | local-network | cache-clear | info | status"
	@echo "  make simulator-list | emulator-list | create-emulator | start-emulator"

check-env:
	@echo "🔍 Checking environment…"
	@echo "Checking Node.js ($(NODE_VERSION))…"
	@if ! node --version 2>/dev/null | grep -q "v$(NODE_VERSION)"; then \
		echo "⚠️  Expected Node v$(NODE_VERSION). Current: $$(node --version 2>/dev/null || echo missing)"; \
		echo "💡 nvm install $(NODE_VERSION) && nvm use $(NODE_VERSION)"; \
		exit 1; \
	fi
	@echo "✅ Node $$(node --version)"

	@echo "Checking Bun…"
	@if ! command -v bun >/dev/null 2>&1; then \
		echo "📦 Installing Bun…"; \
		curl -fsSL https://bun.sh/install | bash; \
		echo "✅ Bun installed — restart the terminal or: source ~/.zshrc"; \
		exit 1; \
	else \
		echo "✅ Bun $$(bun --version)"; \
	fi

	@echo "Checking Xcode CLT…"
	@if ! xcode-select -p >/dev/null 2>&1; then \
		echo "⚠️  Xcode command line tools missing"; \
		xcode-select --install || true; \
		echo "💡 Finish the installer, then re-run make check-env"; \
		exit 1; \
	fi
	@echo "✅ Xcode CLT ($(XCODE_VERSION)+ recommended)"

	@echo "Checking ANDROID_HOME…"
	@if [ -z "$$ANDROID_HOME" ] || [ ! -d "$$ANDROID_HOME" ]; then \
		echo "⚠️  ANDROID_HOME unset or not a directory"; \
		echo "💡 Install Android Studio and export ANDROID_HOME (e.g. ~/Library/Android/sdk)"; \
		exit 1; \
	fi
	@echo "✅ ANDROID_HOME=$$ANDROID_HOME"

	@echo "Checking local Expo (after install)…"
	@if [ -d node_modules/expo ]; then \
		echo "✅ Expo CLI (local): $$($(BUN)x expo --version)"; \
	else \
		echo "ℹ️  Run make install to vendor expo"; \
	fi

	@echo "Checking CocoaPods…"
	@if ! command -v pod >/dev/null 2>&1; then \
		echo "⚠️  pod not found — e.g. brew install cocoapods"; \
		exit 1; \
	fi
	@echo "✅ CocoaPods $$(pod --version)"
	@echo "✅ Environment check passed"

setup: check-env install
	@echo "🚀 Finishing setup…"
	@$(MAKE) pods
	@echo "✅ Setup complete"

setup-env:
	@echo "🔧 Environment variables…"
	@./scripts/setup-env.sh
	@echo "✅ setup-env done"

setup-linting:
	@echo "🔧 Linting is ESLint via Expo (expo lint) + Husky pre-commit (bun run lint)."
	@$(BUN) run prepare
	@echo "✅ Husky hooks ready — run make lint to verify"

install:
	@echo "📦 Installing dependencies…"
	@$(BUN) install
	@echo "✅ install done"

pods:
	@echo "🍎 CocoaPods…"
	@if [ -f ios/Podfile ]; then \
		cd ios && pod install --repo-update; \
	else \
		echo "ℹ️  No ios/Podfile — run make prebuild first"; \
	fi

start:
	@echo "🚀 Expo dev server…"
	@$(BUN) run start

ios:
	@echo "📱 Expo → iOS…"
	@$(BUN) run ios

android:
	@echo "🤖 Expo → Android…"
	@$(BUN) run android

web:
	@echo "🌐 Expo → web…"
	@$(BUN) run web

# Local native compile (requires ios/android projects — use prebuild if missing).
build-ios:
	@echo "🔨 expo run:ios…"
	@$(BUN)x expo run:ios

build-android:
	@echo "🔨 expo run:android…"
	@$(BUN)x expo run:android

prebuild:
	@echo "⚙️  expo prebuild…"
	@$(BUN)x expo prebuild

clean:
	@echo "🧹 Cleaning…"
	@rm -rf node_modules ios/build android/build android/app/build .expo dist web-build
	@echo "✅ clean done"

reset: clean
	@echo "🔄 Reset…"
	@rm -f bun.lock package-lock.json
	@$(MAKE) install
	@$(MAKE) pods
	@echo "✅ reset done"

update:
	@echo "📈 bun update…"
	@$(BUN) update
	@if [ -f ios/Podfile ]; then $(MAKE) pods; fi
	@echo "✅ update done"

doctor:
	@echo "🩺 expo doctor…"
	@$(BUN)x expo doctor

dev-ios:
	@$(BUN)x expo run:ios

dev-android:
	@$(BUN)x expo run:android

lint:
	@$(BUN) run lint

type-check:
	@$(BUN)x tsc --noEmit

typecheck: type-check

check: lint type-check

test:
	@$(BUN) run test

simulator-list:
	@xcrun simctl list devices

emulator-list:
	@emulator -list-avds

create-emulator:
	@avdmanager create avd -n Pixel_API_$(ANDROID_SDK_VERSION) -k "system-images;android-$(ANDROID_SDK_VERSION);google_apis;x86_64"

start-emulator:
	@emulator -avd Pixel_API_$(ANDROID_SDK_VERSION) -no-snapshot-save

tunnel:
	@$(BUN)x expo start --tunnel

local-network:
	@$(BUN)x expo start --lan

cache-clear:
	@$(BUN)x expo start --clear

info:
	@$(BUN)x expo config --type public

status:
	@echo "Node:    $$(node --version 2>/dev/null || echo n/a)"
	@echo "Bun:     $$($(BUN) --version 2>/dev/null || echo n/a)"
	@echo "Expo:    $$($(BUN)x expo --version 2>/dev/null || echo run make install)"
	@grep '"react-native"' package.json | head -1 || true

reset-project:
	@$(BUN) run reset-project

clean-cache: cache-clear
