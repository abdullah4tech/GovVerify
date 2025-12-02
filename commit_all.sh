#!/bin/bash

# Script to commit all changes with conventional commit standards
# Usage: ./commit_all.sh

set -e  # Exit on error

echo "🔍 Checking for changes..."

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "✅ No changes to commit"
    exit 0
fi

echo ""
echo "📦 Changes to be committed:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Show modified files
if [ -n "$(git diff --name-only)" ]; then
    echo "Modified files:"
    git diff --name-only | sed 's/^/  📝 /'
    echo ""
fi

# Show untracked files
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "Untracked files:"
    git ls-files --others --exclude-standard | sed 's/^/  ✨ /'
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Categorize changes based on file types and content
FEATURES=""
FIXES=""
DOCS=""
REFACTOR=""
CHORE=""

# Check for new features
if git diff --name-only | grep -qE "src/app/whatsapp|WhatsApp"; then
    FEATURES="$FEATURES\n- Add WhatsApp integration with QR code scanning"
fi

if git ls-files --others --exclude-standard | grep -q "src/app/whatsapp"; then
    FEATURES="$FEATURES\n- Add WhatsApp integration page with Socket.IO"
fi

# Check for Geneline-X integration
if git diff src/app/actions.ts 2>/dev/null | grep -q "ingestToGenelineX\|GENELINE_X"; then
    FEATURES="$FEATURES\n- Add automatic Geneline-X file ingestion after upload"
fi

# Check for simplification (removing confidence scores)
if git diff src/models/Document.ts 2>/dev/null | grep -q "\-.*confidenceScore"; then
    REFACTOR="$REFACTOR\n- Remove confidence score feature"
fi

if git diff src/components/DocumentDetails.tsx 2>/dev/null | grep -q "\-.*confidenceScore\|\-.*Truth Engine"; then
    REFACTOR="$REFACTOR\n- Simplify document details UI"
fi

# Check for upload improvements
if git diff src/components/UploadForm.tsx 2>/dev/null | grep -q "drag\|progress\|throttle"; then
    FEATURES="$FEATURES\n- Add drag and drop support"
    FEATURES="$FEATURES\n- Add upload progress tracking with throttling"
fi

# Check for documentation
if git ls-files --others --exclude-standard | grep -qE "\.md$"; then
    DOCS="$DOCS\n- Add integration documentation"
fi

# Check for configuration
if git diff .env.local 2>/dev/null | grep -q "GENELINE_X\|WHATSAPP"; then
    CHORE="$CHORE\n- Update environment variables"
fi

if git diff package.json 2>/dev/null | grep -q "socket.io"; then
    CHORE="$CHORE\n- Add socket.io-client dependency"
fi

# Build commit message
COMMIT_MSG=""

if [ -n "$FEATURES" ]; then
    COMMIT_MSG="${COMMIT_MSG}feat: integrate WhatsApp and Geneline-X, enhance upload features

Features:$(echo -e "$FEATURES")
"
fi

if [ -n "$REFACTOR" ]; then
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="refactor: simplify document platform"
    fi
    COMMIT_MSG="${COMMIT_MSG}
Refactor:$(echo -e "$REFACTOR")
"
fi

if [ -n "$DOCS" ]; then
    COMMIT_MSG="${COMMIT_MSG}
Docs:$(echo -e "$DOCS")
"
fi

if [ -n "$CHORE" ]; then
    COMMIT_MSG="${COMMIT_MSG}
Chore:$(echo -e "$CHORE")
"
fi

# If no specific categories, use generic message
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="chore: update project files"
fi

# Add breaking changes note if major refactor
if [ -n "$REFACTOR" ]; then
    COMMIT_MSG="${COMMIT_MSG}
BREAKING CHANGE: Confidence score feature removed. Documents now use simple verified/pending status based on Geneline-X ingestion.
"
fi

echo "📝 Commit message:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$COMMIT_MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask for confirmation
read -p "❓ Proceed with commit? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Commit cancelled"
    exit 1
fi

echo ""
echo "📦 Staging all changes..."

# Stage all changes including untracked files
git add -A

echo "✅ All files staged"
echo ""
echo "💾 Committing..."

# Commit with the generated message
git commit -m "$COMMIT_MSG"

echo ""
echo "✅ Successfully committed all changes!"
echo ""
echo "📊 Commit details:"
git log -1 --stat

echo ""
echo "🚀 Next steps:"
echo "  1. Review the commit: git show"
echo "  2. Push to remote: git push origin main"
echo "  3. Or force push (if history rewritten): git push origin main --force-with-lease"
