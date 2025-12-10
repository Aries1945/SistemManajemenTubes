#!/bin/bash
# Database Cleanup Script
# This script removes deprecated SQL files and consolidates database structure

echo "=== DATABASE CLEANUP SCRIPT ==="
echo "This script will clean up deprecated database files"

# List files to be removed
echo "Files to be removed:"
echo "- database-tugas-besar.sql (outdated, merged into clean-database-schema.sql)"
echo "- create-kelompok-tables.sql (merged into clean-database-schema.sql)"

# Backup existing files
echo "Creating backup directory..."
mkdir -p backup-sql-files
cp database-tugas-besar.sql backup-sql-files/ 2>/dev/null || echo "database-tugas-besar.sql not found"
cp create-kelompok-tables.sql backup-sql-files/ 2>/dev/null || echo "create-kelompok-tables.sql not found"

# Remove deprecated files
echo "Removing deprecated SQL files..."
rm -f database-tugas-besar.sql
rm -f create-kelompok-tables.sql

echo "=== CLEANUP COMPLETE ==="
echo "New clean database schema: clean-database-schema.sql"
echo "Backups stored in: backup-sql-files/"
echo ""
echo "To apply the clean schema:"
echo "1. Backup your current database"
echo "2. Run: psql -d unpar_task_management -f clean-database-schema.sql"