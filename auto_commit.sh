#!/bin/bash

# Auto-commit script with conventional commit standards
# Usage: ./auto_commit.sh

set -e

echo "🚀 Auto-committing all changes..."

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Stage all changes
git add -A

# Generate commit message based on changes
COMMIT_MSG="feat: integrate WhatsApp and Geneline-X, enhance upload features

- Add WhatsApp integration with QR code scanning via Socket.IO
- Add automatic Geneline-X file ingestion after upload  
- Add drag and drop support for file uploads
- Add real-time upload progress tracking with throttling
- Remove confidence score feature (breaking change)
- Simplify document platform to basic upload/storage
- Add socket.io-client dependency
- Update environment variables for integrations

BREAKING CHANGE: Confidence score feature removed. Documents now use simple 
verified/pending status based on Geneline-X ingestion success."

# Commit
git commit -m "$COMMIT_MSG"

echo ""
echo "✅ Successfully committed all changes!"
echo ""
echo "📊 Latest commit:"
git log -1 --oneline

echo ""
echo "🚀 To push: git push origin main"
