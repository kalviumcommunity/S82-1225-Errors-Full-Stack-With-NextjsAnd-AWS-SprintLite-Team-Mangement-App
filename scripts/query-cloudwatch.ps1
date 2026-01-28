# ============================================================================
# CloudWatch Logs Query Script (PowerShell)
# ============================================================================
# Query and visualize logs from CloudWatch Logs using AWS CLI and PowerShell
# ============================================================================

param(
    [string]$LogGroup = "/ecs/sprintlite-app",
    [string]$QueryType = "recent-errors",
    [int]$HoursBack = 1,
    [string]$Region = "us-east-1"
)

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Header {
    param([string]$Text)
    Write-Host "==========================================" -ForegroundColor $Cyan
    Write-Host $Text -ForegroundColor $Cyan
    Write-Host "==========================================" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor $Cyan
}

Write-Header "CloudWatch Logs Query Tool"
Write-Info "Log Group: $LogGroup"
Write-Info "Query Type: $QueryType"
Write-Info "Time Range: Last $HoursBack hour(s)"
Write-Host ""

# Calculate start time
$startTime = [int](([DateTime]::UtcNow).AddHours(-$HoursBack).GetUnixEpochSeconds()) * 1000

# Get log streams
Write-Host "[Step 1] Fetching log streams..." -ForegroundColor $Yellow

try {
    $logStreams = aws logs describe-log-streams `
        --log-group-name $LogGroup `
        --region $Region `
        --query "logStreams[*].logStreamName" `
        --output text
    
    if (-not $logStreams) {
        Write-Error "No log streams found in $LogGroup"
        exit 1
    }
    
    $streamCount = @($logStreams.Split()).Count
    Write-Success "Found $streamCount log streams"
    
} catch {
    Write-Error "Failed to fetch log streams: $_"
    exit 1
}

Write-Host ""

# ============================================================================
# Query based on type
# ============================================================================

switch ($QueryType) {
    "recent-errors" {
        Write-Host "[Query] Recent Errors (Last $HoursBack hour(s))" -ForegroundColor $Yellow
        Write-Host "Pattern: level = 'error'" -ForegroundColor $Yellow
        Write-Host ""
        
        $pattern = '{ $.level = "error" }'
        
        foreach ($stream in $logStreams.Split()) {
            Write-Host "Stream: $stream" -ForegroundColor $Cyan
            
            try {
                $logs = aws logs filter-log-events `
                    --log-group-name $LogGroup `
                    --log-stream-name $stream `
                    --start-time $startTime `
                    --filter-pattern $pattern `
                    --region $Region `
                    --query "events[*].message" `
                    --output text
                
                if ($logs) {
                    $logs.Split("`n") | ForEach-Object {
                        if ($_) {
                            $json = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
                            if ($json) {
                                Write-Host "  ⚠️  [$($json.timestamp)] $($json.message)" -ForegroundColor $Red
                                Write-Host "      Error: $($json.error)" -ForegroundColor $Red
                            } else {
                                Write-Host "  $_" -ForegroundColor $Yellow
                            }
                        }
                    }
                } else {
                    Write-Host "  (No errors)" -ForegroundColor $Green
                }
            } catch {
                Write-Host "  Error querying: $_" -ForegroundColor $Red
            }
        }
    }
    
    "slow-requests" {
        Write-Host "[Query] Slow API Requests (>1000ms)" -ForegroundColor $Yellow
        Write-Host "Pattern: duration > 1000" -ForegroundColor $Yellow
        Write-Host ""
        
        $pattern = '{ $.duration > 1000 }'
        
        foreach ($stream in $logStreams.Split()) {
            Write-Host "Stream: $stream" -ForegroundColor $Cyan
            
            try {
                $logs = aws logs filter-log-events `
                    --log-group-name $LogGroup `
                    --log-stream-name $stream `
                    --start-time $startTime `
                    --filter-pattern $pattern `
                    --region $Region `
                    --query "events[*].message" `
                    --output text
                
                if ($logs) {
                    $logs.Split("`n") | ForEach-Object {
                        if ($_) {
                            $json = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
                            if ($json) {
                                Write-Host "  🐢 [$($json.timestamp)] $($json.method) $($json.endpoint)" -ForegroundColor $Yellow
                                Write-Host "      Duration: $($json.duration)ms | Status: $($json.statusCode)" -ForegroundColor $Yellow
                            }
                        }
                    }
                } else {
                    Write-Host "  (No slow requests)" -ForegroundColor $Green
                }
            } catch {
                Write-Host "  Error querying: $_" -ForegroundColor $Red
            }
        }
    }
    
    "recent-logs" {
        Write-Host "[Query] Recent Logs (Last 100 entries)" -ForegroundColor $Yellow
        Write-Host ""
        
        foreach ($stream in $logStreams.Split() | Select-Object -First 1) {
            Write-Host "Stream: $stream" -ForegroundColor $Cyan
            
            try {
                $logs = aws logs get-log-events `
                    --log-group-name $LogGroup `
                    --log-stream-name $stream `
                    --start-from-head $false `
                    --limit 100 `
                    --region $Region `
                    --query "events[*].message" `
                    --output text
                
                if ($logs) {
                    $count = 0
                    $logs.Split("`n") | ForEach-Object {
                        if ($_) {
                            $json = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
                            if ($json) {
                                $icon = switch ($json.level) {
                                    "error" { "❌" }
                                    "warn" { "⚠️ " }
                                    "info" { "ℹ️ " }
                                    "debug" { "🔍" }
                                    default { "📝" }
                                }
                                
                                Write-Host "$icon [$($json.timestamp)] [$($json.level.ToUpper())] $($json.message)"
                                $count++
                                
                                if ($count -ge 20) { return }
                            }
                        }
                    }
                }
            } catch {
                Write-Host "  Error querying: $_" -ForegroundColor $Red
            }
        }
    }
    
    "metrics" {
        Write-Host "[Query] Metrics Summary (Last $HoursBack hour(s))" -ForegroundColor $Yellow
        Write-Host ""
        
        try {
            # Count errors
            $errorCount = aws logs filter-log-events `
                --log-group-name $LogGroup `
                --start-time $startTime `
                --filter-pattern '{ $.level = "error" }' `
                --region $Region `
                --query "events | length(@)" `
                --output text
            
            # Count warnings
            $warningCount = aws logs filter-log-events `
                --log-group-name $LogGroup `
                --start-time $startTime `
                --filter-pattern '{ $.level = "warn" }' `
                --region $Region `
                --query "events | length(@)" `
                --output text
            
            Write-Success "Total Errors: $errorCount"
            Write-Success "Total Warnings: $warningCount"
            
        } catch {
            Write-Error "Failed to retrieve metrics: $_"
        }
    }
    
    default {
        Write-Error "Unknown query type: $QueryType"
        Write-Info "Available query types:"
        Write-Info "  - recent-errors (show errors from last hour)"
        Write-Info "  - slow-requests (show requests >1000ms)"
        Write-Info "  - recent-logs (show latest 100 logs)"
        Write-Info "  - metrics (show summary metrics)"
        exit 1
    }
}

Write-Host ""
Write-Success "Query completed!"
