# ============================================================================
# SprintLite SSL/Domain Verification Script (PowerShell - Windows)
# ============================================================================
# Tests:
# 1. DNS resolution
# 2. HTTPS connection
# 3. HTTP -> HTTPS redirect
# 4. Certificate validity
# 5. Security headers
# 6. SSL Labs rating
# ============================================================================

param(
    [string]$Domain = "sprintlite-app.com",
    [switch]$Verbose = $false
)

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Header {
    param([string]$Text)
    Write-Host "==========================================" -ForegroundColor $Blue
    Write-Host $Text -ForegroundColor $Blue
    Write-Host "==========================================" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor $Blue
}

Write-Header "SprintLite SSL/Domain Verification"
Write-Info "Domain: $Domain"
Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# ============================================================================
# Test 1: DNS Resolution
# ============================================================================
Write-Host "[Test 1] DNS Resolution" -ForegroundColor $Blue
Write-Host "Resolving: $Domain" -ForegroundColor $Yellow

try {
    $dnsResult = Resolve-DnsName -Name $Domain -ErrorAction Stop -Type A
    $ipAddress = $dnsResult.IPAddress
    Write-Success "DNS resolved to: $ipAddress"
    Write-Info "Fully Qualified Domain Name: $($dnsResult.Name)"
} catch {
    Write-Error "DNS resolution failed: $_"
    Write-Info "Verify domain is registered and Route53 nameservers are configured"
}
Write-Host ""

# ============================================================================
# Test 2: HTTPS Connection
# ============================================================================
Write-Host "[Test 2] HTTPS Connection" -ForegroundColor $Blue
Write-Host "Testing: https://$Domain" -ForegroundColor $Yellow

try {
    $response = Invoke-WebRequest -Uri "https://$Domain" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Success "HTTPS connection successful (Status: $($response.StatusCode))"
    
    if ($Verbose) {
        Write-Info "Content Length: $($response.RawContentLength) bytes"
        Write-Info "Content Type: $($response.Headers['Content-Type'])"
    }
} catch {
    Write-Error "HTTPS connection failed: $_"
}
Write-Host ""

# ============================================================================
# Test 3: HTTP -> HTTPS Redirect
# ============================================================================
Write-Host "[Test 3] HTTP → HTTPS Redirect" -ForegroundColor $Blue
Write-Host "Testing redirect: http://$Domain → https://$Domain" -ForegroundColor $Yellow

try {
    $response = Invoke-WebRequest -Uri "http://$Domain" `
        -UseBasicParsing `
        -TimeoutSec 10 `
        -MaximumRedirection 0 `
        -ErrorAction SilentlyContinue
    
    $statusCode = $response.StatusCode
    $location = $response.Headers['Location']
    
    if ($statusCode -eq 301 -or $statusCode -eq 302) {
        if ($location -like "https://*") {
            Write-Success "HTTP redirects to HTTPS (Status: $statusCode)"
            Write-Info "Redirect Location: $location"
        } else {
            Write-Warning "HTTP redirects but not to HTTPS: $location"
        }
    } else {
        Write-Warning "HTTP connection returned status: $statusCode (expected 301/302)"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Success "HTTP redirect detected (Status: $($_.Exception.Response.StatusCode))"
    } else {
        Write-Error "Redirect test inconclusive: $_"
    }
}
Write-Host ""

# ============================================================================
# Test 4: SSL Certificate Validation
# ============================================================================
Write-Host "[Test 4] SSL Certificate Details" -ForegroundColor $Blue
Write-Host "Inspecting certificate for: $Domain" -ForegroundColor $Yellow

try {
    $cert = [System.Net.ServicePointManager]::ServerCertificateCallback = $null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    
    $request = [System.Net.HttpWebRequest]::Create("https://$Domain")
    $request.GetResponse() | Out-Null
    
    $cert = $request.ServicePoint.Certificate
    
    Write-Success "Certificate Retrieved"
    Write-Info "Subject: $($cert.Subject)"
    Write-Info "Issued By: $($cert.Issuer)"
    Write-Info "Valid From: $($cert.GetEffectiveDateString())"
    Write-Info "Valid Until: $($cert.GetExpirationDateString())"
    
    # Check if certificate is valid
    $expiryDate = [DateTime]::ParseExact($cert.GetExpirationDateString(), "M/d/yyyy h:mm:ss tt", $null)
    $daysUntilExpiry = ($expiryDate - (Get-Date)).Days
    
    if ($daysUntilExpiry -gt 30) {
        Write-Success "Certificate expires in $daysUntilExpiry days"
    } elseif ($daysUntilExpiry -gt 0) {
        Write-Warning "Certificate expires in $daysUntilExpiry days - renewal recommended"
    } else {
        Write-Error "Certificate has EXPIRED"
    }
    
} catch {
    Write-Error "Failed to retrieve certificate: $_"
}
Write-Host ""

# ============================================================================
# Test 5: Security Headers
# ============================================================================
Write-Host "[Test 5] Security Headers" -ForegroundColor $Blue
Write-Host "Checking HTTP security headers" -ForegroundColor $Yellow

try {
    $response = Invoke-WebRequest -Uri "https://$Domain" -UseBasicParsing -ErrorAction Stop
    
    $headers = @{
        "Strict-Transport-Security" = $response.Headers['Strict-Transport-Security']
        "X-Content-Type-Options" = $response.Headers['X-Content-Type-Options']
        "X-Frame-Options" = $response.Headers['X-Frame-Options']
        "X-XSS-Protection" = $response.Headers['X-XSS-Protection']
        "Content-Security-Policy" = $response.Headers['Content-Security-Policy']
    }
    
    $headerCount = 0
    foreach ($headerName in $headers.Keys) {
        $value = $headers[$headerName]
        if ($value) {
            Write-Success "$headerName: $value"
            $headerCount++
        } else {
            Write-Warning "$headerName: NOT SET"
        }
    }
    
    Write-Info "Security Headers Configured: $headerCount/5"
    
} catch {
    Write-Error "Failed to check security headers: $_"
}
Write-Host ""

# ============================================================================
# Test 6: API Status Check
# ============================================================================
Write-Host "[Test 6] SSL Status API Endpoint" -ForegroundColor $Blue
Write-Host "Testing: /api/ssl-status" -ForegroundColor $Yellow

try {
    $response = Invoke-WebRequest -Uri "https://$Domain/api/ssl-status" `
        -UseBasicParsing `
        -ErrorAction Stop `
        -TimeoutSec 10
    
    $json = $response.Content | ConvertFrom-Json
    
    Write-Success "API responded successfully"
    Write-Info "Status: $($json.status)"
    Write-Info "SSL Configured: $($json.ssl_configured)"
    Write-Info "Protocol: $($json.details.protocol)"
    Write-Info "Environment: $($json.details.environment)"
    
    if ($json.ssl_configured) {
        Write-Success "✅ SSL/TLS properly configured"
    } else {
        Write-Warning "⚠️  Some security checks failed"
    }
    
} catch {
    Write-Warning "API endpoint not available or not responding: $_"
}
Write-Host ""

# ============================================================================
# Test 7: DNS Propagation Check
# ============================================================================
Write-Host "[Test 7] DNS Propagation Check" -ForegroundColor $Blue
Write-Host "Checking DNS propagation to public nameservers" -ForegroundColor $Yellow

$publicNameservers = @(
    "8.8.8.8",      # Google
    "1.1.1.1",      # Cloudflare
    "9.9.9.9"       # Quad9
)

foreach ($ns in $publicNameservers) {
    try {
        $result = Resolve-DnsName -Name $Domain -Server $ns -ErrorAction Stop -Type A 2>$null
        Write-Success "Propagated to $ns : $($result.IPAddress)"
    } catch {
        Write-Warning "Not yet propagated to $ns"
    }
}
Write-Host ""

# ============================================================================
# Summary
# ============================================================================
Write-Header "Verification Summary"
Write-Info "Domain: $Domain"
Write-Info "Test Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor $Blue
Write-Host "1. Verify all tests pass (green checkmarks)" -ForegroundColor $Yellow
Write-Host "2. Check SSL Labs rating: https://www.ssllabs.com/ssltest/?d=$Domain" -ForegroundColor $Yellow
Write-Host "3. Test from browser: https://$Domain" -ForegroundColor $Yellow
Write-Host "4. Verify padlock icon visible (🔒)" -ForegroundColor $Yellow
Write-Host ""

Write-Success "Verification script completed!"
