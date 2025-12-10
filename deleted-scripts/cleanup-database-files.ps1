# Database Cleanup Script for Windows PowerShell
# This script removes deprecated SQL files and consolidates database structure

Write-Host "=== DATABASE CLEANUP SCRIPT ===" -ForegroundColor Green
Write-Host "This script will clean up deprecated database files"

# List files to be removed
Write-Host "Files to be removed:" -ForegroundColor Yellow
Write-Host "- database-tugas-besar.sql (outdated, merged into clean-database-schema.sql)"
Write-Host "- create-kelompok-tables.sql (merged into clean-database-schema.sql)"

# Create backup directory
Write-Host "Creating backup directory..." -ForegroundColor Blue
$backupDir = "backup-sql-files"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Backup existing files
Write-Host "Backing up existing files..." -ForegroundColor Blue
$filesToBackup = @("database-tugas-besar.sql", "create-kelompok-tables.sql")

foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        Copy-Item $file $backupDir
        Write-Host "Backed up: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

# Remove deprecated files
Write-Host "Removing deprecated SQL files..." -ForegroundColor Red
foreach ($file in $filesToBackup) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Red
    }
}

Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "New clean database schema: clean-database-schema.sql" -ForegroundColor Cyan
Write-Host "Backups stored in: backup-sql-files/" -ForegroundColor Cyan
Write-Host ""
Write-Host "To apply the clean schema:" -ForegroundColor Yellow
Write-Host "1. Backup your current database"
Write-Host "2. Run: psql -d unpar_task_management -f clean-database-schema.sql"
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")