#!/bin/bash

# Safe backup creation script for Nishen's AI Workspace
# This script creates backups OUTSIDE the project directory to prevent build issues

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory outside project root
BACKUP_DIR="../workspace-backups/${TIMESTAMP}_$(basename "$1" | sed 's/ /_/g')"
mkdir -p "$BACKUP_DIR"

echo "Creating backup: $BACKUP_DIR"

# Copy source files to backup
if [ -d "src/components/workspace" ]; then
    cp -r src/components/workspace/*.tsx "$BACKUP_DIR/"
    echo "✅ Copied workspace components"
fi

if [ -f "CLAUDE.md" ]; then
    cp CLAUDE.md "$BACKUP_DIR/"
    echo "✅ Copied CLAUDE.md"
fi

if [ -f "package.json" ]; then
    cp package.json "$BACKUP_DIR/"
    echo "✅ Copied package.json"
fi

if [ -f "next.config.js" ]; then
    cp next.config.js "$BACKUP_DIR/"
    echo "✅ Copied next.config.js"
fi

echo "✅ Backup created successfully at: $BACKUP_DIR"
echo "⚠️  Backup is stored OUTSIDE project directory to prevent build issues"

# Create restore instructions
cat > "$BACKUP_DIR/RESTORE.md" << EOF
# Restore Instructions

This backup was created on: $(date)

## To restore files:
\`\`\`bash
# Copy files back to project (run from project root)
cp ../workspace-backups/${TIMESTAMP}_*/\*.tsx src/components/workspace/
cp ../workspace-backups/${TIMESTAMP}_*/CLAUDE.md .
cp ../workspace-backups/${TIMESTAMP}_*/package.json .
cp ../workspace-backups/${TIMESTAMP}_*/next.config.js .
\`\`\`

## Backup contains:
$(ls -la "$BACKUP_DIR")
EOF

echo "📄 Restore instructions created at: $BACKUP_DIR/RESTORE.md"