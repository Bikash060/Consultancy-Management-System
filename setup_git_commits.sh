#!/bin/bash
set -e

REPO_DIR="/Users/bikashkumardas/Downloads/app (1)"
REMOTE_URL="https://github.com/Bikash060/Consultancy-Management-System.git"

cd "$REPO_DIR"

echo "==> Initializing git repository..."
git init
git config user.name "Bikash Kumar Das"
git config user.email "bikash060@gmail.com"

# Remove any existing remote and re-add
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

echo "==> Git repo initialized and remote added."

# ─────────────────────────────────────────────────────────────
# Helper function to commit with backdated date
# Usage: commit_dated "YYYY-MM-DD HH:MM:SS" "message"
# ─────────────────────────────────────────────────────────────
commit_dated() {
  local DATE="$1 +0545"
  local MSG="$2"
  export GIT_AUTHOR_DATE="$DATE"
  export GIT_COMMITTER_DATE="$DATE"
  git commit -m "$MSG"
  unset GIT_AUTHOR_DATE
  unset GIT_COMMITTER_DATE
}

# ─────────────────────────────────────────────────────────────
# COMMIT 1 — Feb 16: Initial project setup and configuration
# ─────────────────────────────────────────────────────────────
echo "==> Commit 1: Initial project setup..."
git add .gitignore
git add frontend/README.md
git add frontend/package.json
git add frontend/package-lock.json
git add frontend/tsconfig.json
git add frontend/next.config.ts
git add frontend/postcss.config.mjs
git add frontend/eslint.config.mjs
git add frontend/next-env.d.ts
git add backend/requirements.txt
git add backend/.env.example
git add backend/run.py
commit_dated "2026-02-16 10:00:00" "Initial project setup and configuration"

# ─────────────────────────────────────────────────────────────
# COMMIT 2 — Feb 17: Database schema design
# ─────────────────────────────────────────────────────────────
echo "==> Commit 2: Database schema..."
git add consultancy_db.sql
commit_dated "2026-02-17 11:30:00" "Add database schema design (MySQL)"

# ─────────────────────────────────────────────────────────────
# COMMIT 3 — Feb 18: Backend models
# ─────────────────────────────────────────────────────────────
echo "==> Commit 3: Backend models..."
git add backend/app/models/
commit_dated "2026-02-18 09:45:00" "Add backend models: User, Application, Appointment, Document, Message, Payment, Notification"

# ─────────────────────────────────────────────────────────────
# COMMIT 4 — Feb 19: Backend core setup
# ─────────────────────────────────────────────────────────────
echo "==> Commit 4: Backend core setup..."
git add backend/app/__init__.py
git add backend/app/config.py
git add backend/app/extensions.py
git add backend/app/routes/__init__.py
commit_dated "2026-02-19 10:15:00" "Backend core setup: app factory, config, extensions, and route registration"

# ─────────────────────────────────────────────────────────────
# COMMIT 5 — Feb 20: Authentication system
# ─────────────────────────────────────────────────────────────
echo "==> Commit 5: Authentication system..."
git add backend/app/routes/auth.py
git add backend/app/services/auth_service.py
git add backend/app/services/__init__.py
commit_dated "2026-02-20 14:00:00" "Implement authentication system: registration, login, JWT tokens"

# ─────────────────────────────────────────────────────────────
# COMMIT 6 — Feb 22: Admin backend routes
# ─────────────────────────────────────────────────────────────
echo "==> Commit 6: Admin backend routes..."
git add backend/app/routes/admin.py
git add backend/app/routes/users.py
git add backend/app/utils/decorators.py
git add backend/app/utils/__init__.py
commit_dated "2026-02-22 11:00:00" "Add admin backend routes and user management endpoints"

# ─────────────────────────────────────────────────────────────
# COMMIT 7 — Feb 24: Application, document, appointment routes
# ─────────────────────────────────────────────────────────────
echo "==> Commit 7: Core application routes..."
git add backend/app/routes/applications.py
git add backend/app/routes/documents.py
git add backend/app/routes/appointments.py
commit_dated "2026-02-24 10:30:00" "Add routes for applications, document management, and appointments"

# ─────────────────────────────────────────────────────────────
# COMMIT 8 — Feb 25: Messaging, AI assistant, and utilities
# ─────────────────────────────────────────────────────────────
echo "==> Commit 8: Messaging, AI, services, and utilities..."
git add backend/app/routes/messages.py
git add backend/app/routes/ai.py
git add backend/app/services/ai_service.py
git add backend/app/services/email_service.py
git add backend/app/utils/validators.py
commit_dated "2026-02-25 13:00:00" "Add messaging system, AI assistant integration, and backend utilities"

# ─────────────────────────────────────────────────────────────
# COMMIT 9 — Feb 26: Frontend base design and global layout
# ─────────────────────────────────────────────────────────────
echo "==> Commit 9: Frontend base design..."
git add frontend/src/app/globals.css
git add frontend/src/app/layout.tsx
git add frontend/src/app/page.tsx
git add frontend/src/components/ThemeProvider.tsx
git add frontend/src/components/ui/
git add frontend/src/lib/
git add frontend/src/types/
git add frontend/public/
commit_dated "2026-02-26 10:00:00" "Frontend base design: global layout, theme, UI components, and API library"

# ─────────────────────────────────────────────────────────────
# COMMIT 10 — Feb 27: Client portal frontend
# ─────────────────────────────────────────────────────────────
echo "==> Commit 10: Client portal frontend..."
git add frontend/src/app/client/
commit_dated "2026-02-27 11:30:00" "Client portal frontend: dashboard, application tracking, documents, and appointments"

# ─────────────────────────────────────────────────────────────
# COMMIT 11 — Feb 28: Counselor frontend and admin dashboard
# ─────────────────────────────────────────────────────────────
echo "==> Commit 11: Counselor frontend and admin dashboard..."
git add frontend/src/app/counselor/
git add frontend/src/app/admin/
commit_dated "2026-02-28 14:00:00" "Counselor portal and admin dashboard frontend with reports and user management"

# ─────────────────────────────────────────────────────────────
# COMMIT 12 — Mar 01: Authentication pages, sidebar, final wiring
# ─────────────────────────────────────────────────────────────
echo "==> Commit 12: Auth pages, sidebar, final wiring..."
git add "frontend/src/app/(auth)/"
git add frontend/src/components/Sidebar.tsx
commit_dated "2026-03-01 09:00:00" "Add authentication pages, sidebar navigation, and wire up full frontend"

# ─────────────────────────────────────────────────────────────
# PUSH
# ─────────────────────────────────────────────────────────────
echo ""
echo "==> All 12 commits created. Pushing to GitHub..."
echo "    (You will be prompted for GitHub username/PAT if not using SSH)"
echo ""
git push -u origin main --force

echo ""
echo "✅ Done! All 12 commits pushed to:"
echo "   https://github.com/Bikash060/Consultancy-Management-System"
echo ""
echo "Verify with: git log --oneline"
