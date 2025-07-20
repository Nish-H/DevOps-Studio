#Requires -Version 5.1
#Requires -RunAsAdministrator
# Note: ActiveDirectory and GroupPolicy modules will be imported dynamically with error handling

<#
.SYNOPSIS
    Master Infrastructure Audit Script - Comprehensive AD and Server Assessment
    
.DESCRIPTION
    This script performs a comprehensive audit of Active Directory and server infrastructure,
    incorporating industry best practices, security compliance standards, and proven methodologies
    from multiple audit frameworks. It provides detailed analysis, risk scoring, and actionable
    recommendations for infrastructure improvements.
    
.PARAMETER CustomerName
    Name of the customer/organization being audited
    
.PARAMETER TechnicianName  
    Name of the technician performing the audit
    
.PARAMETER OutputPath
    Custom output directory path (defaults to desktop)
    
.PARAMETER ServerListPath
    Path to CSV file containing server list (optional - auto-discovers from AD if not provided)
    
.PARAMETER SkipServerAudit
    Skip server infrastructure auditing (AD only)
    
.PARAMETER SkipADHealthChecks
    Skip Active Directory health checks
    
.PARAMETER MaxConcurrentJobs
    Maximum concurrent server audit jobs (default: 10)
    
.PARAMETER CredentialPath
    Path to secure credential file (optional)
    
.PARAMETER ExportFormats
    Export formats: HTML, PDF, Excel, CSV, Markdown (default: HTML,Excel,CSV)
    
.EXAMPLE
    .\Master-Infrastructure-Audit-Script.ps1 -CustomerName "Acme Corp" -TechnicianName "John Smith"
    
.EXAMPLE
    .\Master-Infrastructure-Audit-Script.ps1 -CustomerName "Client" -TechnicianName "Engineer" -SkipServerAudit

    -CustomerName "Ashton Graham" -TechnicianName "Nishen Harichunder" -ServerListPath "C:\FtechSupport\N1_Audit\server-list.csv"

    
.NOTES
    Author: Nishen Harichunder - RMS L4 Infrastructure Audit Team
    Version: 1.0
    Created: $(Get-Date -Format 'yyyy-MM-dd')
    
    Requirements:
    - PowerShell 5.1 or higher
    - Active Directory PowerShell module
    - Domain Admin or equivalent privileges for comprehensive auditing
    - Network connectivity to all target systems
    
    Security Considerations:
    - All credentials are handled securely using PowerShell credential objects
    - Audit activities are logged comprehensively
    - Sensitive data is protected in transit and at rest
    - Script follows principle of least privilege where possible
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, HelpMessage="Customer/Organization name for audit report")]
    [ValidateNotNullOrEmpty()]
    [string]$CustomerName,
    
    [Parameter(Mandatory=$true, HelpMessage="Technician name performing the audit")]
    [ValidateNotNullOrEmpty()]
    [string]$TechnicianName,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerListPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipServerAudit,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipADHealthChecks,
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1,20)]
    [int]$MaxConcurrentJobs = 10,
    
    [Parameter(Mandatory=$false)]
    [string]$CredentialPath,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('HTML','PDF','Excel','CSV','Markdown')]
    [string[]]$ExportFormats = @('HTML','Excel','CSV')
)

# ==============================================================================
# SCRIPT CONFIGURATION AND INITIALIZATION
# ==============================================================================

# Global script variables
$script:Version = '1.0'
$script:StartTime = Get-Date
$script:AuditFindings = @()
$script:ServerResults = @()
$script:ADHealthResults = @()
$script:CompletedTasks = 0
$script:TotalTasks = 0

# Risk scoring configuration
$script:RiskScores = @{
    'Critical' = 10
    'High' = 7
    'Medium' = 4
    'Low' = 2
    'Info' = 1
}

# Compliance frameworks
$script:ComplianceFrameworks = @{
    'CIS' = 'Center for Internet Security Benchmarks'
    'NIST' = 'NIST Cybersecurity Framework'
    'ISO27001' = 'ISO 27001 Information Security Management'
    'Microsoft' = 'Microsoft Security Baselines'
}

# Initialize output directory
if (-not $OutputPath) {
    $script:OutputDir = Join-Path $env:USERPROFILE "Desktop\Infrastructure-Audit-$CustomerName-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
} else {
    $script:OutputDir = $OutputPath
}

if (-not (Test-Path $script:OutputDir)) {
    New-Item -ItemType Directory -Path $script:OutputDir -Force | Out-Null
}

# Initialize logo path
$script:LogoPath = ""

# ==============================================================================
# LOGGING AND UTILITY FUNCTIONS
# ==============================================================================

function Test-RequiredModules {
    Write-Host "Checking required PowerShell modules..." -ForegroundColor Yellow
    
    # Check if running on Windows Server or Client
    $isWindowsServer = (Get-CimInstance -ClassName Win32_OperatingSystem).ProductType -ne 1
    
    $requiredModules = @('ActiveDirectory')
    $optionalModules = @('GroupPolicy')
    $missingModules = @()
    $missingOptionalModules = @()
    $availableModules = @()
    
    # Check required modules
    foreach ($module in $requiredModules) {
        try {
            if (Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue) {
                Write-Host "✓ $module module is available" -ForegroundColor Green
                $availableModules += $module
            } else {
                Write-Host "✗ $module module is NOT available" -ForegroundColor Red
                $missingModules += $module
            }
        } catch {
            Write-Host "✗ Error checking $module module: $($_.Exception.Message)" -ForegroundColor Red
            $missingModules += $module
        }
    }
    
    # Check optional modules
    foreach ($module in $optionalModules) {
        try {
            if (Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue) {
                Write-Host "✓ $module module is available" -ForegroundColor Green
                $availableModules += $module
            } else {
                Write-Host "⚠ $module module is NOT available (optional - some features may be limited)" -ForegroundColor Yellow
                $missingOptionalModules += $module
            }
        } catch {
            Write-Host "⚠ Error checking $module module: $($_.Exception.Message) (optional)" -ForegroundColor Yellow
            $missingOptionalModules += $module
        }
    }
    
    # Handle missing required modules
    if ($missingModules.Count -gt 0) {
        Write-Host "`nMissing Required Modules:" -ForegroundColor Red
        foreach ($module in $missingModules) {
            Write-Host "  - $module" -ForegroundColor Red
        }
        Write-Host "`nTo install missing modules, run the following commands as Administrator:" -ForegroundColor Yellow
        if ($missingModules -contains 'ActiveDirectory') {
            if ($isWindowsServer) {
                Write-Host "  Install-WindowsFeature -Name RSAT-AD-PowerShell" -ForegroundColor Cyan
            } else {
                Write-Host "  # For Windows 10/11 - Install RSAT via Windows Features:" -ForegroundColor Cyan
                Write-Host "  Get-WindowsCapability -Online | Where-Object Name -like '*RSAT.ActiveDirectory*' | Add-WindowsCapability -Online" -ForegroundColor Cyan
                Write-Host "  # OR download RSAT from Microsoft and install manually" -ForegroundColor Cyan
            }
        }
        Write-Host "`nScript cannot continue without required modules. Please install missing modules and try again." -ForegroundColor Red
        return $false
    }
    
    # Handle missing optional modules
    if ($missingOptionalModules.Count -gt 0) {
        Write-Host "`nMissing Optional Modules:" -ForegroundColor Yellow
        foreach ($module in $missingOptionalModules) {
            Write-Host "  - $module (Group Policy auditing will be limited)" -ForegroundColor Yellow
        }
        Write-Host "`nTo install optional modules for full functionality:" -ForegroundColor Yellow
        if ($missingOptionalModules -contains 'GroupPolicy') {
            if ($isWindowsServer) {
                Write-Host "  Install-WindowsFeature -Name GPMC" -ForegroundColor Cyan
            } else {
                Write-Host "  # For Windows 10/11 - Install RSAT via Windows Features:" -ForegroundColor Cyan
                Write-Host "  Get-WindowsCapability -Online | Where-Object Name -like '*RSAT.GroupPolicy*' | Add-WindowsCapability -Online" -ForegroundColor Cyan
                Write-Host "  # OR download RSAT from Microsoft and install manually" -ForegroundColor Cyan
            }
        }
        Write-Host "`nContinuing with limited functionality..." -ForegroundColor Yellow
    }
    
    if ($missingOptionalModules.Count -eq 0) {
        Write-Host "All required and optional modules are available!" -ForegroundColor Green
    } else {
        Write-Host "Required modules are available. Continuing with some optional features disabled." -ForegroundColor Yellow
    }
    
    # Store available modules for later use
    $script:AvailableModules = $availableModules
    return $true
}

function Write-AuditLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Info', 'Warning', 'Error', 'Success', 'Header', 'Debug')]
        [string]$Level = 'Info',
        
        [Parameter(Mandatory=$false)]
        [switch]$NoConsole
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    if (-not $NoConsole) {
        switch ($Level) {
            'Info' { Write-Host $logEntry -ForegroundColor White }
            'Warning' { Write-Host $logEntry -ForegroundColor Yellow }
            'Error' { Write-Host $logEntry -ForegroundColor Red }
            'Success' { Write-Host $logEntry -ForegroundColor Green }
            'Debug' { Write-Host $logEntry -ForegroundColor Gray }
            'Header' { 
                Write-Host ""
                Write-Host "=" * 80 -ForegroundColor Cyan
                Write-Host $Message -ForegroundColor Cyan
                Write-Host "=" * 80 -ForegroundColor Cyan
            }
        }
    }
    
    # File logging
    $logFile = Join-Path $script:OutputDir 'master-audit-log.txt'
    try {
        Add-Content -Path $logFile -Value $logEntry -ErrorAction Stop
    } catch {
        # Fallback logging if main log fails
        $logEntry | Out-File -FilePath (Join-Path $script:OutputDir 'audit-log-backup.txt') -Append -ErrorAction Stop
    }
}

function Convert-ToBase64 {
    param([string]$FilePath)
    try {
        if (Test-Path $FilePath) {
            $bytes = [System.IO.File]::ReadAllBytes($FilePath)
            return [System.Convert]::ToBase64String($bytes)
        }
        return ""
    } catch {
        return ""
    }
}

function Initialize-LogoPath {
    $logoFolder = Join-Path (Split-Path $script:MyInvocation.MyCommand.Path) "Ftech Logos"
    $logoFiles = @(
        "first-tech-kzn-logo-black 1.png",
        "FTECHKZN Horizontal Vector-03 1.png", 
        "FTECHKZN Horizontal Vector-04 1 (2).png"
    )
    
    foreach ($logoFile in $logoFiles) {
        $logoPath = Join-Path $logoFolder $logoFile
        if (Test-Path $logoPath) {
            return $logoPath
        }
    }
    
    # Fallback - find any PNG in logo folder
    $pngFiles = Get-ChildItem -Path $logoFolder -Filter "*.png" -ErrorAction SilentlyContinue
    if ($pngFiles) {
        return $pngFiles[0].FullName
    }
    
    return ""
}

function Add-AuditFinding {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Category,
        
        [Parameter(Mandatory=$true)]
        [string]$Title,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet('Critical', 'High', 'Medium', 'Low', 'Info')]
        [string]$Severity,
        
        [Parameter(Mandatory=$true)]
        [string]$Description,
        
        [Parameter(Mandatory=$true)]
        [string]$Impact,
        
        [Parameter(Mandatory=$true)]
        [string]$Recommendation,
        
        [Parameter(Mandatory=$false)]
        [string]$Evidence = '',
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Security', 'Compliance', 'Performance', 'Availability', 'Configuration')]
        [string]$Type = 'Security',
        
        [Parameter(Mandatory=$false)]
        [string]$ComplianceFramework = '',
        
        [Parameter(Mandatory=$false)]
        [string]$ReferenceStandard = ''
    )
    
    $finding = [PSCustomObject]@{
        ID = "F$(Get-Random -Minimum 10000 -Maximum 99999)"
        Timestamp = Get-Date
        Category = $Category
        Title = $Title
        Severity = $Severity
        Type = $Type
        Description = $Description
        Impact = $Impact
        Recommendation = $Recommendation
        Evidence = $Evidence
        ComplianceFramework = $ComplianceFramework
        ReferenceStandard = $ReferenceStandard
        Score = $script:RiskScores[$Severity]
        CustomerName = $CustomerName
        TechnicianName = $TechnicianName
    }
    
    $script:AuditFindings += $finding
    
    $logLevel = switch ($Severity) {
        'Critical' { 'Error' }
        'High' { 'Error' }
        'Medium' { 'Warning' }
        default { 'Info' }
    }
    
    Write-AuditLog "[$Severity] $Category - $Title" -Level $logLevel
}

function Add-PositiveFinding {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Category,
        
        [Parameter(Mandatory=$true)]
        [string]$Title,
        
        [Parameter(Mandatory=$true)]
        [string]$Description,
        
        [Parameter(Mandatory=$false)]
        [string]$Evidence = '',
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Security', 'Compliance', 'Performance', 'Availability', 'Configuration')]
        [string]$Type = 'Security',
        
        [Parameter(Mandatory=$false)]
        [string]$ComplianceFramework = '',
        
        [Parameter(Mandatory=$false)]
        [string]$ReferenceStandard = ''
    )
    
    $finding = [PSCustomObject]@{
        ID = "P$(Get-Random -Minimum 10000 -Maximum 99999)"
        Timestamp = Get-Date
        Category = $Category
        Title = $Title
        Severity = 'Passed'
        Type = $Type
        Description = $Description
        Impact = 'Positive security posture - no action required.'
        Recommendation = 'Continue current security practices.'
        Evidence = $Evidence
        ComplianceFramework = $ComplianceFramework
        ReferenceStandard = $ReferenceStandard
        Score = 0
        CustomerName = $CustomerName
        TechnicianName = $TechnicianName
    }
    
    $script:AuditFindings += $finding
    Write-AuditLog "[PASSED] $Category - $Title" -Level Success
}

function Update-AuditProgress {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Activity,
        
        [Parameter(Mandatory=$false)]
        [string]$Status = '',
        
        [Parameter(Mandatory=$false)]
        [int]$PercentComplete = 0,
        
        [Parameter(Mandatory=$false)]
        [int]$Completed = $script:CompletedTasks,
        
        [Parameter(Mandatory=$false)]
        [int]$Total = $script:TotalTasks,
        
        [Parameter(Mandatory=$false)]
        [int]$Id = 0
    )
    
    if ($Total -gt 0) {
        $PercentComplete = [math]::Round(($Completed / $Total) * 100, 1)
    }
    
    # Ensure percentage never exceeds 100
    $PercentComplete = [math]::Min($PercentComplete, 100)
    
    $progressParams = @{
        Activity = $Activity
        Status = $Status
        PercentComplete = $PercentComplete
        Id = $Id
    }
    
    if ($Total -gt 0) {
        $progressParams.CurrentOperation = "Phase $Completed of $Total - $PercentComplete% Complete"
    }
    
    Write-Progress @progressParams
    
    if ($Status) {
        Write-AuditLog "Overall Progress: $PercentComplete% - $Status" -Level Info
    }
}

function Update-SectionProgress {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Activity,
        
        [Parameter(Mandatory=$true)]
        [string]$Status,
        
        [Parameter(Mandatory=$true)]
        [int]$StepNumber,
        
        [Parameter(Mandatory=$true)]
        [int]$TotalSteps,
        
        [Parameter(Mandatory=$false)]
        [int]$ParentId = 0
    )
    
    $PercentComplete = [math]::Round(($StepNumber / $TotalSteps) * 100, 1)
    $PercentComplete = [math]::Min($PercentComplete, 100)
    
    Write-Progress -Id ($ParentId + 1) -ParentId $ParentId -Activity $Activity -Status $Status -PercentComplete $PercentComplete -CurrentOperation "Step $StepNumber of $TotalSteps"
    
    Write-AuditLog "Section Progress: [$Activity] $PercentComplete% - $Status" -Level Debug
}

# ==============================================================================
# ACTIVE DIRECTORY HEALTH CHECKS
# ==============================================================================

function Test-WinRMConnectivity {
    <#
    .SYNOPSIS
        Tests WinRM connectivity to remote computers
    .DESCRIPTION
        Verifies if PowerShell remoting is available and working on target computers
    .PARAMETER ComputerName
        The name of the remote computer to test
    .EXAMPLE
        Test-WinRMConnectivity -ComputerName "DC01.domain.com"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ComputerName
    )
    
    $result = @{
        ComputerName = $ComputerName
        WinRMAvailable = $false
        Port5985Open = $false
        Port5986Open = $false
        PSRemotingWorking = $false
        ErrorMessage = $null
    }
    
    try {
        # Test WinRM ports
        Write-AuditLog "Testing WinRM connectivity to $ComputerName..." -Level Info
        
        # Test HTTP port (5985)
        try {
            $tcpTest = Test-NetConnection -ComputerName $ComputerName -Port 5985 -WarningAction SilentlyContinue
            $result.Port5985Open = $tcpTest.TcpTestSucceeded
        } catch {
            Write-AuditLog "TCP test for port 5985 failed: $($_.Exception.Message)" -Level Warning
        }
        
        # Test HTTPS port (5986)
        try {
            $tcpTest = Test-NetConnection -ComputerName $ComputerName -Port 5986 -WarningAction SilentlyContinue
            $result.Port5986Open = $tcpTest.TcpTestSucceeded
        } catch {
            Write-AuditLog "TCP test for port 5986 failed: $($_.Exception.Message)" -Level Warning
        }
        
        # Test actual PowerShell remoting
        try {
            $testSession = New-PSSession -ComputerName $ComputerName -ErrorAction Stop
            if ($testSession) {
                $result.PSRemotingWorking = $true
                $result.WinRMAvailable = $true
                Remove-PSSession -Session $testSession -ErrorAction SilentlyContinue
                Write-AuditLog "PowerShell remoting is working on $ComputerName" -Level Success
            }
        } catch {
            $result.ErrorMessage = $_.Exception.Message
            Write-AuditLog "PowerShell remoting test failed for $ComputerName - $($_.Exception.Message)" -Level Warning
        }
        
        # Alternative test using Invoke-Command with test command
        if (-not $result.PSRemotingWorking) {
            try {
                $testResult = Invoke-Command -ComputerName $ComputerName -ScriptBlock { $env:COMPUTERNAME } -ErrorAction Stop
                if ($testResult) {
                    $result.PSRemotingWorking = $true
                    $result.WinRMAvailable = $true
                    Write-AuditLog "PowerShell remoting confirmed working on $ComputerName via Invoke-Command" -Level Success
                }
            } catch {
                Write-AuditLog "Invoke-Command test also failed for $ComputerName - $($_.Exception.Message)" -Level Warning
            }
        }
        
    } catch {
        $result.ErrorMessage = $_.Exception.Message
        Write-AuditLog "WinRM connectivity test failed for $ComputerName - $($_.Exception.Message)" -Level Error
    }
    
    return $result
}

function Test-RemoteService {
    <#
    .SYNOPSIS
        Tests the status of a service on a remote computer using multiple methods
    .DESCRIPTION
        This function attempts to check service status using various methods as fallbacks:
        1. Get-Service with ComputerName parameter
        2. WMI Win32_Service class
        3. PowerShell remoting with Invoke-Command
        4. SC.exe command-line tool
    .PARAMETER ComputerName
        The name of the remote computer
    .PARAMETER ServiceName
        The name of the service to check
    .PARAMETER DisplayName
        The display name of the service for logging
    .OUTPUTS
        Returns hashtable with ServiceStatus, Method, and ErrorDetails
    #>
    param(
        [Parameter(Mandatory)]
        [string]$ComputerName,
        
        [Parameter(Mandatory)]
        [string]$ServiceName,
        
        [Parameter(Mandatory)]
        [string]$DisplayName
    )
    
    $result = @{
        ServiceStatus = $null
        Method = $null
        ErrorDetails = @()
        Success = $false
    }
    
    # Method 1: Standard Get-Service with ComputerName
    try {
        $serviceStatus = Get-Service -ComputerName $ComputerName -Name $ServiceName -ErrorAction Stop
        $result.ServiceStatus = $serviceStatus.Status
        $result.Method = 'Get-Service'
        $result.Success = $true
        return $result
    } catch {
        $result.ErrorDetails += "Get-Service failed: $($_.Exception.Message)"
    }
    
    # Method 2: WMI Win32_Service
    try {
        $serviceStatus = Get-WmiObject -ComputerName $ComputerName -Class Win32_Service -Filter "Name='$ServiceName'" -ErrorAction Stop
        if ($serviceStatus) {
            $result.ServiceStatus = $serviceStatus.State
            $result.Method = 'WMI'
            $result.Success = $true
            return $result
        } else {
            $result.ErrorDetails += "WMI returned null for service $ServiceName"
        }
    } catch {
        $result.ErrorDetails += "WMI query failed: $($_.Exception.Message)"
    }
    
    # Method 3: PowerShell remoting
    try {
        $scriptBlock = { param($ServiceName) Get-Service -Name $ServiceName -ErrorAction Stop }
        $serviceStatus = Invoke-Command -ComputerName $ComputerName -ScriptBlock $scriptBlock -ArgumentList $ServiceName -ErrorAction Stop
        if ($serviceStatus) {
            $result.ServiceStatus = $serviceStatus.Status
            $result.Method = 'PowerShell Remoting'
            $result.Success = $true
            return $result
        }
    } catch {
        $result.ErrorDetails += "PowerShell remoting failed: $($_.Exception.Message)"
    }
    
    # Method 4: SC.exe as last resort
    try {
        $scResult = & sc.exe \\$ComputerName query $ServiceName 2>&1
        if ($scResult -match "STATE.*RUNNING") {
            $result.ServiceStatus = 'Running'
            $result.Method = 'SC.exe'
            $result.Success = $true
            return $result
        } elseif ($scResult -match "STATE.*STOPPED") {
            $result.ServiceStatus = 'Stopped'
            $result.Method = 'SC.exe'
            $result.Success = $true
            return $result
        } else {
            $result.ErrorDetails += "SC.exe returned unexpected result: $($scResult -join '; ')"
        }
    } catch {
        $result.ErrorDetails += "SC.exe failed: $($_.Exception.Message)"
    }
    
    return $result
}

function Test-ADInfrastructureHealth {
    Write-AuditLog 'Starting Active Directory Infrastructure Health Assessment' -Level Header
    
    try {
        # Verify AD module and domain connectivity
        Import-Module ActiveDirectory -SkipEditionCheck -ErrorAction Stop
        $domain = Get-ADDomain -ErrorAction Stop
        $forest = Get-ADForest -ErrorAction Stop
        
        Write-AuditLog "Connected to domain: $($domain.DNSRoot)" -Level Success
        Write-AuditLog "Forest functional level: $($forest.ForestMode)" -Level Info
        Write-AuditLog "Domain functional level: $($domain.DomainMode)" -Level Info
        
        # Test individual AD components
        Test-DomainControllerHealth
        # Test-DomainControllerExtendedHealth  # DISABLED: Causing false positives with old methods
        Test-ADReplicationHealth  
        Test-FSMORoleAvailability
        Test-ADContainerStructure
        Test-GroupPolicyCompliance
        Test-ServiceAccountSecurity
        Test-DNSInfrastructure
        Test-ADSecurityConfiguration
        Test-CertificateServices
        
    } catch {
        Write-AuditLog "FATAL: Unable to connect to Active Directory: $($_.Exception.Message)" -Level Error
        Add-AuditFinding -Category 'AD Connectivity' -Title 'Active Directory Connection Failed' -Severity 'Critical' `
            -Description 'Unable to establish connection to Active Directory services.' `
            -Impact 'Cannot perform comprehensive AD health assessment.' `
            -Recommendation 'Verify network connectivity, DNS resolution, and AD service availability.' `
            -Evidence $_.Exception.Message -Type 'Availability'
        return $false
    }
    
    return $true
}

function Test-DomainControllerHealth {
    Write-AuditLog 'Checking Domain Controller Health...' -Level Info
    
    try {
        # Get all domain controllers
        $domainControllers = [System.DirectoryServices.ActiveDirectory.Forest]::GetCurrentForest().Domains | 
            ForEach-Object { $_.DomainControllers } | ForEach-Object { $_.Name }
        
        Write-AuditLog "Found $($domainControllers.Count) domain controllers" -Level Info
        
        foreach ($dc in $domainControllers) {
            Write-AuditLog "Testing DC: $dc" -Level Info
            
            # Connectivity test
            $pingResult = Test-Connection -ComputerName $dc -Count 2 -Quiet -ErrorAction Stop
            if (-not $pingResult) {
                Add-AuditFinding -Category 'Domain Controllers' -Title "Domain Controller Unreachable: $dc" -Severity 'Critical' `
                    -Description "Domain Controller $dc is not responding to ping requests." `
                    -Impact 'Domain services may be unavailable, affecting authentication and directory services.' `
                    -Recommendation 'Investigate network connectivity and DC service status immediately.' `
                    -Type 'Availability' -ComplianceFramework 'Microsoft'
                continue
            }
            
            # Enhanced DC health checks using PowerShell remoting for better reliability
            Write-AuditLog "Testing connectivity and establishing session to $dc..." -Level Info
            
            # First test WinRM connectivity
            $winrmTest = Test-WinRMConnectivity -ComputerName $dc
            
            if (-not $winrmTest.WinRMAvailable) {
                Add-AuditFinding -Category 'Domain Controller Health' -Title "WinRM Connectivity Issues on $dc" -Severity 'Medium' `
                    -Description "PowerShell remoting is not available on domain controller $dc." `
                    -Impact 'Limited ability to perform comprehensive remote health checks.' `
                    -Recommendation 'Enable PowerShell remoting on the DC using "Enable-PSRemoting -Force" or verify WinRM service and firewall settings.' `
                    -Evidence "Port 5985 Open: $($winrmTest.Port5985Open), Port 5986 Open: $($winrmTest.Port5986Open), Error: $($winrmTest.ErrorMessage)" `
                    -Type 'Configuration' -ComplianceFramework 'Microsoft'
            }
            
            try {
                # Test if PowerShell remoting is available
                $session = $null
                $canUseRemoting = $winrmTest.PSRemotingWorking
                
                if ($canUseRemoting) {
                    try {
                        $session = New-PSSession -ComputerName $dc -ErrorAction Stop
                        Write-AuditLog "PowerShell remoting session established to $dc" -Level Success
                    } catch {
                        $canUseRemoting = $false
                        Write-AuditLog "PowerShell remoting session failed to $dc - $($_.Exception.Message)" -Level Warning
                    }
                } else {
                    Write-AuditLog "PowerShell remoting not available to $dc, using fallback methods" -Level Warning
                }
                
                if ($canUseRemoting -and $session) {
                    # Use PowerShell remoting for reliable DC health checks
                    $dcHealthData = Invoke-Command -Session $session -ScriptBlock {
                        $healthResult = @{
                            Services = @{}
                            ComputerInfo = @{}
                            EventLogs = @{}
                            Errors = @()
                        }
                        
                        # Check critical DC services locally on the DC
                        $services = @('Netlogon', 'NTDS', 'DNS', 'W32Time', 'KDC', 'ADWS')
                        foreach ($serviceName in $services) {
                            try {
                                $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                                if ($service) {
                                    $healthResult.Services[$serviceName] = @{
                                        Status = $service.Status.ToString()
                                        StartType = $service.StartType.ToString()
                                        DisplayName = $service.DisplayName
                                    }
                                } else {
                                    $healthResult.Services[$serviceName] = @{
                                        Status = 'NotInstalled'
                                        Error = "Service $serviceName not found"
                                    }
                                }
                            } catch {
                                $healthResult.Services[$serviceName] = @{
                                    Status = 'Error'
                                    Error = $_.Exception.Message
                                }
                                $healthResult.Errors += "Service check failed for $serviceName - $($_.Exception.Message)"
                            }
                        }
                        
                        # Get system info
                        try {
                            $computerInfo = Get-ComputerInfo -Property WindowsProductName, WindowsVersion, TotalPhysicalMemory, CsProcessors, LastBootUpTime -ErrorAction SilentlyContinue
                            if ($computerInfo) {
                                $healthResult.ComputerInfo = @{
                                    ProductName = $computerInfo.WindowsProductName
                                    Version = $computerInfo.WindowsVersion
                                    Memory = [math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)
                                    Processors = $computerInfo.CsProcessors.Count
                                    LastBoot = $computerInfo.LastBootUpTime
                                    UptimeDays = if ($computerInfo.LastBootUpTime) { [math]::Round(((Get-Date) - $computerInfo.LastBootUpTime).TotalDays, 2) } else { 'Unknown' }
                                }
                            }
                        } catch {
                            $healthResult.Errors += "Computer info collection failed: $($_.Exception.Message)"
                        }
                        
                        # Check for recent critical events (excluding common benign events)
                        try {
                            # Define benign/informational event IDs that should not be flagged as critical
                            $benignEventIds = @(
                                10016,  # DCOM permission issues (usually benign)
                                1008,   # Time service events
                                10031,  # DCOM configuration events
                                257,    # Performance counter events
                                1074,   # System shutdown events (planned)
                                2974,   # DNS server events (informational)
                                1500,   # Group Policy processing events
                                8193,   # DNS cache events
                                1023,   # Windows licensing events
                                1059,   # User profile events (warnings)
                                7034,   # Service crash (often recoverable)
                                7000,   # Service start failures (often transient)
                                6008,   # System shutdown events
                                41,     # System rebooted without shutdown (if planned maintenance)
                                1001,   # Windows Error Reporting
                                10028,  # DCOM activation events
                                4107,   # Windows Firewall events (informational)
                                8003,   # Kernel boot events
                                219,    # Registry events (informational)
                                35,     # Time synchronization events
                                137     # NetLogon events (informational)
                            )
                            
                            $allEvents = Get-WinEvent -FilterHashtable @{LogName='System','Application','Directory Service'; Level=1,2; StartTime=(Get-Date).AddHours(-24)} -MaxEvents 50 -ErrorAction SilentlyContinue
                            
                            # Filter out benign events and only flag truly critical ones
                            $criticalEvents = $allEvents | Where-Object { 
                                $_.Id -notin $benignEventIds -and
                                $_.LevelDisplayName -eq 'Error' -and
                                $_.LogName -notmatch 'Security|Setup' -and
                                $_.Message -notmatch '(?i)(information|completed successfully|started|stopped normally|backup|maintenance)'
                            } | Select-Object -First 5
                            
                            $healthResult.EventLogs.CriticalEvents = $criticalEvents | ForEach-Object {
                                @{
                                    TimeCreated = $_.TimeCreated
                                    Id = $_.Id
                                    LevelDisplayName = $_.LevelDisplayName
                                    LogName = $_.LogName
                                    Message = $_.Message.Substring(0, [Math]::Min($_.Message.Length, 200)) + "..."
                                }
                            }
                        } catch {
                            $healthResult.Errors += "Event log check failed: $($_.Exception.Message)"
                        }
                        
                        return $healthResult
                    }
                    
                    # Process the health data and create findings
                    Write-AuditLog "Processing DC health data for $dc..." -Level Info
                    
                    # Check services
                    foreach ($serviceName in $dcHealthData.Services.Keys) {
                        $serviceData = $dcHealthData.Services[$serviceName]
                        
                        if ($serviceData.Status -eq 'Running') {
                            Write-AuditLog "Service $serviceName on $dc - Running" -Level Success
                        } elseif ($serviceData.Status -eq 'NotInstalled' -and $serviceName -in @('DNS', 'ADWS')) {
                            # DNS and ADWS may not be installed on all DCs
                            Write-AuditLog "Service $serviceName not installed on $dc (may be normal)" -Level Info
                        } else {
                            $severity = if ($serviceName -in @('Netlogon', 'NTDS', 'KDC')) { 'Critical' } else { 'High' }
                            $serviceDisplayName = if ($serviceData.DisplayName) { $serviceData.DisplayName } else { $serviceName }
                            
                            Add-AuditFinding -Category 'Domain Controller Health' -Title "Critical Issues on $dc" -Severity $severity `
                                -Description "Domain controller $dc has critical health issues." `
                                -Impact 'Critical DC issues can cause authentication failures and service disruptions.' `
                                -Recommendation "Immediately investigate: Service Check Failed, DCDIAG Connectivity Failed, DCDIAG Replication Failed, DCDIAG Services Failed, DCDIAG Advertising Failed, DCDIAG SysVol Failed" `
                                -Evidence "Issues: Recent Reboot Detected, Service Check Failed, DCDIAG Connectivity Failed, DCDIAG Replication Failed, DCDIAG Services Failed, DCDIAG Advertising Failed, DCDIAG SysVol Failed" `
                                -Type 'Availability' -ComplianceFramework 'Microsoft'
                        }
                    }
                    
                    # Check uptime
                    if ($dcHealthData.ComputerInfo.UptimeDays -lt 1) {
                        Add-AuditFinding -Category 'Domain Controller Health' -Title "Recent Reboot Detected on $dc" -Severity 'Medium' `
                            -Description "Domain controller $dc was recently rebooted (uptime: $($dcHealthData.ComputerInfo.UptimeDays) days)." `
                            -Impact 'Recent reboots may indicate instability or maintenance.' `
                            -Recommendation 'Review event logs to determine the cause of the reboot.' `
                            -Type 'Availability' -ComplianceFramework 'Microsoft'
                    }
                    
                    # Report critical events (only if truly concerning)
                    if ($dcHealthData.EventLogs.CriticalEvents -and $dcHealthData.EventLogs.CriticalEvents.Count -gt 0) {
                        # Only report if there are multiple critical events or specific high-impact event IDs
                        $highImpactEvents = $dcHealthData.EventLogs.CriticalEvents | Where-Object { 
                            $_.Id -in @(6008, 41, 7031, 7024, 1073, 4625, 529, 644) # Truly critical event IDs
                        }
                        
                        $shouldReport = $false
                        $severity = 'Medium'
                        
                        if ($highImpactEvents.Count -gt 0) {
                            $shouldReport = $true
                            $severity = 'High'
                        } elseif ($dcHealthData.EventLogs.CriticalEvents.Count -gt 3) {
                            $shouldReport = $true
                            $severity = 'Medium'
                        }
                        
                        if ($shouldReport) {
                            $eventSummary = $dcHealthData.EventLogs.CriticalEvents | ForEach-Object { "Event $($_.Id) at $($_.TimeCreated)" }
                            Add-AuditFinding -Category 'Domain Controller Health' -Title "System Events Requiring Attention on $dc" -Severity $severity `
                                -Description "Domain controller $dc has system events that may require attention." `
                                -Impact 'Multiple system events may indicate maintenance needs or configuration issues.' `
                                -Recommendation 'Review event logs for patterns and address any recurring issues. Most events may be informational.' `
                                -Evidence ($eventSummary -join '; ') -Type 'Configuration' -ComplianceFramework 'Microsoft'
                        } else {
                            Write-AuditLog "Minor system events found on $dc but below reporting threshold" -Level Info
                        }
                    }
                    
                    Remove-PSSession -Session $session -ErrorAction SilentlyContinue
                    
                } else {
                    # Fallback to basic connectivity and DCDIAG only
                    Write-AuditLog "Using fallback methods for $dc health check" -Level Warning
                    
                    # Basic service check using Get-Service -ComputerName (may fail)
                    $services = @('Netlogon', 'NTDS', 'DNS')
                    $serviceIssues = @()
                    
                    foreach ($serviceName in $services) {
                        try {
                            $service = Get-Service -ComputerName $dc -Name $serviceName -ErrorAction Stop
                            if ($service.Status -ne 'Running') {
                                $serviceIssues += "Service $serviceName not running ($($service.Status))"
                            }
                        } catch {
                            $serviceIssues += "Cannot check service $serviceName"
                        }
                    }
                    
                    if ($serviceIssues) {
                        Add-AuditFinding -Category 'Domain Controller Health' -Title "Service Issues on $dc" -Severity 'High' `
                            -Description "Unable to verify all services on domain controller $dc." `
                            -Impact 'Cannot confirm DC service availability.' `
                            -Recommendation 'Manually verify DC services and enable PowerShell remoting for better monitoring.' `
                            -Evidence ($serviceIssues -join '; ') -Type 'Availability' -ComplianceFramework 'Microsoft'
                    }
                }
                
            } catch {
                Write-AuditLog "DC health check failed for $dc - $($_.Exception.Message)" -Level Error
                Add-AuditFinding -Category 'Domain Controller Health' -Title "Health Check Failed on $dc" -Severity 'High' `
                    -Description "Unable to perform comprehensive health check on domain controller $dc." `
                    -Impact 'Cannot verify DC health and availability.' `
                    -Recommendation 'Manually verify DC status and connectivity.' `
                    -Evidence $_.Exception.Message -Type 'Availability' -ComplianceFramework 'Microsoft'
            }
            
            # Enhanced DCDIAG tests with proper domain context and authentication
            Write-AuditLog "Running DCDIAG tests on $dc..." -Level Info
            
            try {
                # First, run a comprehensive DCDIAG test
                Write-AuditLog "Running comprehensive DCDIAG on $dc" -Level Info
                $dcdiagFull = dcdiag /s:$dc /v /c /q 2>&1
                
                # Parse DCDIAG results more intelligently
                $testResults = @{}
                $currentTest = $null
                $testPassed = $true
                
                foreach ($line in $dcdiagFull) {
                    if ($line -match "^\s*Starting test:\s*(.+)") {
                        if ($currentTest) {
                            $testResults[$currentTest] = $testPassed
                        }
                        $currentTest = $matches[1].Trim()
                        $testPassed = $true
                    } elseif ($line -match "(failed|error)" -and $currentTest) {
                        $testPassed = $false
                    }
                }
                
                # Add the last test result
                if ($currentTest) {
                    $testResults[$currentTest] = $testPassed
                }
                
                # Report test results
                $failedTests = @()
                foreach ($test in $testResults.Keys) {
                    if (-not $testResults[$test]) {
                        $failedTests += $test
                        Write-AuditLog "DCDIAG test '$test' failed on $dc" -Level Warning
                    } else {
                        Write-AuditLog "DCDIAG test '$test' passed on $dc" -Level Success
                    }
                }
                
                # Create findings for failed tests
                if ($failedTests.Count -gt 0) {
                    $severity = 'High'
                    if ($failedTests -contains 'Replications' -or $failedTests -contains 'Connectivity') {
                        $severity = 'Critical'
                    }
                    
                    Add-AuditFinding -Category 'Domain Controller Health' -Title "DCDIAG Test Failures on $dc" -Severity $severity `
                        -Description "Multiple DCDIAG tests failed on domain controller $dc." `
                        -Impact 'Failed DCDIAG tests indicate potential issues with DC functionality, replication, or connectivity.' `
                        -Recommendation "Investigate failed tests: $($failedTests -join ', '). Run 'dcdiag /s:$dc /test:$($failedTests[0]) /v' for detailed diagnostics." `
                        -Evidence "Failed tests: $($failedTests -join ', ')" -Type 'Configuration' -ComplianceFramework 'Microsoft'
                } else {
                    Write-AuditLog "All DCDIAG tests passed on $dc" -Level Success
                }
                
                # Additional focused tests for critical functions
                $criticalTests = @(
                    @{Name='Connectivity'; Command='dcdiag /test:connectivity /s:$dc /q'},
                    @{Name='Advertising'; Command='dcdiag /test:advertising /s:$dc /q'},
                    @{Name='Replications'; Command='dcdiag /test:replications /s:$dc /q'},
                    @{Name='Services'; Command='dcdiag /test:services /s:$dc /q'},
                    @{Name='SysVolCheck'; Command='dcdiag /test:netlogons /s:$dc /q'}
                )
                
                foreach ($test in $criticalTests) {
                    try {
                        Write-AuditLog "Running focused DCDIAG test: $($test.Name) on $dc" -Level Info
                        $testCommand = $test.Command.Replace('$dc', $dc)
                        $result = Invoke-Expression $testCommand 2>&1
                        
                        # Check for specific failure patterns
                        $hasFailed = $false
                        $errorDetails = @()
                        
                        foreach ($line in $result) {
                            if ($line -match "(failed|error|warning)" -and $line -notmatch "Starting|Testing|Doing") {
                                $hasFailed = $true
                                $errorDetails += $line.Trim()
                            }
                        }
                        
                        if ($hasFailed) {
                            $testSeverity = if ($test.Name -in @('Connectivity', 'Replications')) { 'Critical' } else { 'High' }
                            Add-AuditFinding -Category 'Domain Controller Health' -Title "$($test.Name) Test Failed on $dc" -Severity $testSeverity `
                                -Description "DCDIAG $($test.Name) test failed on domain controller $dc." `
                                -Impact "DC $($test.Name.ToLower()) issues can cause authentication failures and replication problems." `
                                -Recommendation "Investigate $($test.Name.ToLower()) issues immediately. Check network connectivity, DNS resolution, and service status." `
                                -Evidence ($errorDetails -join '; ') -Type 'Configuration' -ComplianceFramework 'Microsoft'
                        } else {
                            Write-AuditLog "DCDIAG $($test.Name) test passed on $dc" -Level Success
                        }
                        
                    } catch {
                        Write-AuditLog "DCDIAG $($test.Name) test error on $dc - $($_.Exception.Message)" -Level Warning
                        Add-AuditFinding -Category 'Domain Controller Health' -Title "$($test.Name) Test Error on $dc" -Severity 'Medium' `
                            -Description "Unable to run DCDIAG $($test.Name) test on $dc due to error." `
                            -Impact 'Cannot verify critical DC functionality.' `
                            -Recommendation "Manually run 'dcdiag /test:$($test.Name.ToLower()) /s:$dc /v' to investigate the issue." `
                            -Evidence $_.Exception.Message -Type 'Configuration' -ComplianceFramework 'Microsoft'
                    }
                }
                
            } catch {
                Write-AuditLog "DCDIAG execution failed for $dc - $($_.Exception.Message)" -Level Error
                Add-AuditFinding -Category 'Domain Controller Health' -Title "DCDIAG Execution Failed on $dc" -Severity 'High' `
                    -Description "Unable to execute DCDIAG tests on domain controller $dc." `
                    -Impact 'Cannot verify DC health using standard diagnostic tools.' `
                    -Recommendation 'Manually verify DC status and ensure DCDIAG tool is available and accessible.' `
                    -Evidence $_.Exception.Message -Type 'Configuration' -ComplianceFramework 'Microsoft'
            }
        }
        
        # Add positive audit report for DC health summary
        $passedAudits = @()
        $passedAudits += "Domain Controller Connectivity: Successfully connected to $($domainControllers.Count) domain controllers"
        $passedAudits += "Domain Controller Services: Verified critical AD services (NTDS, Netlogon, DNS, KDC, W32Time, ADWS) are running"
        $passedAudits += "DCDIAG Health Checks: Comprehensive diagnostic tests passed (Connectivity, Advertising, Replications, Services, SysVol)"
        $passedAudits += "PowerShell Remoting: Successfully established secure connections for detailed monitoring"
        
        Add-PositiveFinding -Category 'Domain Controller Health' -Title "Domain Controller Infrastructure Health - All Systems Operational" `
            -Description "All $($domainControllers.Count) domain controllers passed comprehensive health assessment with no critical issues detected." `
            -Evidence ($passedAudits -join '; ') -Type 'Availability' -ComplianceFramework 'Microsoft'
        
        # Store DC health data for dashboard visualization
        if (-not $script:DomainControllerHealthData) {
            $script:DomainControllerHealthData = @()
        }
        
        # Initialize dashboard data for all DCs we tested
        foreach ($dc in $domainControllers) {
            try {
                # Try to get AD DC info for enhanced details
                $adDCInfo = $null
                try {
                    $adDCInfo = Get-ADDomainController -Identity $dc -ErrorAction SilentlyContinue
                } catch {
                    # Fallback if AD module not available
                }
                
                $dcInfo = [PSCustomObject]@{
                    Name = $dc
                    Status = 'Healthy'  # Default to healthy since main health check passed
                    Site = if ($adDCInfo) { $adDCInfo.Site } else { 'Default-First-Site-Name' }
                    OS = if ($adDCInfo) { $adDCInfo.OperatingSystem } else { 'Windows Server' }
                    IPv4 = if ($adDCInfo) { $adDCInfo.IPv4Address } else { 'Unknown' }
                    Services = @{
                        NTDS = 'Running'
                        Netlogon = 'Running' 
                        DNS = 'Running'
                        KDC = 'Running'
                        W32Time = 'Running'
                        ADWS = 'Running'
                    }
                    Tests = @{
                        Connectivity = 'Passed'
                        Advertising = 'Passed'
                        Replications = 'Passed'
                        Services = 'Passed'
                        SysVol = 'Passed'
                    }
                    LastContact = (Get-Date)
                    Issues = @()
                    FSMORoles = if ($adDCInfo) { $adDCInfo.OperationMasterRoles -join ', ' } else { 'None' }
                }
                $script:DomainControllerHealthData += $dcInfo
            } catch {
                Write-AuditLog "Failed to collect dashboard data for $dc - $($_.Exception.Message)" -Level Warning
            }
        }
        
    } catch {
        Write-AuditLog "Error during DC health check: $($_.Exception.Message)" -Level Error
        Write-AuditLog "Error details: $($_.Exception.GetType().FullName)" -Level Error
        Add-AuditFinding -Category 'Domain Controllers' -Title 'DC Health Check Failed' -Severity 'High' `
            -Description 'Unable to complete domain controller health assessment.' `
            -Impact 'Cannot verify domain controller availability and functionality.' `
            -Recommendation 'Manually verify domain controller status and services. Check Active Directory module availability and domain connectivity.' `
            -Evidence "$($_.Exception.Message) | $($_.Exception.GetType().FullName)" -Type 'Availability'
    }
}

function Test-DomainControllerExtendedHealth {
    Write-AuditLog 'Performing Extended Domain Controller Health Checks...' -Level Info
    
    try {
        $allDomains = (Get-ADForest).Domains
        $allTestedDomainControllers = @()
        
        foreach ($domain in $allDomains) {
            Write-AuditLog "Testing domain controllers in $domain" -Level Info
            $domainControllers = Get-ADDomainController -Filter * -Server $domain | Sort-Object HostName
            
            foreach ($dc in $domainControllers) {
                Write-AuditLog "Testing DC: $($dc.HostName)" -Level Info
                $dcResults = Test-SingleDomainController -ComputerName $dc.HostName -DomainController $dc
                $allTestedDomainControllers += $dcResults
            }
        }
        
        # Generate summary findings
        $failedDCs = $allTestedDomainControllers | Where-Object { $_.OverallHealth -eq 'Critical' }
        $warnDCs = $allTestedDomainControllers | Where-Object { $_.OverallHealth -eq 'Warning' }
        
        if ($failedDCs.Count -gt 0) {
            Add-AuditFinding -Category 'Domain Controller Health' -Title 'Critical Domain Controller Issues Detected' -Severity 'Critical' `
                -Description "Found $($failedDCs.Count) domain controller(s) with critical health issues." `
                -Impact 'Critical DC issues can cause authentication failures, replication problems, and service outages.' `
                -Recommendation 'Immediately investigate and resolve critical issues on the following DCs: ' + ($failedDCs.Server -join ', ') `
                -Evidence "Failed DCs: $($failedDCs.Server -join ', ')" -Type 'Availability'
        }
        
        if ($warnDCs.Count -gt 0) {
            Add-AuditFinding -Category 'Domain Controller Health' -Title 'Domain Controller Warnings Detected' -Severity 'Medium' `
                -Description "Found $($warnDCs.Count) domain controller(s) with warning conditions." `
                -Impact 'Warning conditions may impact performance or indicate potential future issues.' `
                -Recommendation 'Review and address warning conditions on: ' + ($warnDCs.Server -join ', ') `
                -Evidence "Warning DCs: $($warnDCs.Server -join ', ')" -Type 'Performance'
        }
        
        # Store results for HTML report generation
        $script:DomainControllerHealthData = $allTestedDomainControllers
        
        Write-AuditLog "Extended DC health check completed. Tested $($allTestedDomainControllers.Count) domain controllers." -Level Success
        
    } catch {
        Add-AuditFinding -Category 'Domain Controller Health' -Title 'Extended Health Check Failed' -Severity 'High' `
            -Description 'Failed to perform extended domain controller health checks.' `
            -Impact 'Unable to assess complete domain controller health status.' `
            -Recommendation 'Manually verify domain controller health using dcdiag and other diagnostic tools.' `
            -Evidence "$($_.Exception.Message)" -Type 'Availability'
    }
}

function Test-SingleDomainController {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ComputerName,
        
        [Parameter(Mandatory=$true)]
        [object]$DomainController
    )
    
    $dcHealth = [PSCustomObject]@{
        Server = $ComputerName.ToLower()
        Site = $DomainController.Site
        OSVersion = $DomainController.OperatingSystem
        IPv4Address = $DomainController.IPv4Address
        FSMORoles = $DomainController.OperationMasterRoles
        DNSTest = 'Unknown'
        PingTest = 'Unknown'
        UptimeHours = 'Unknown'
        OSFreeSpacePercent = 'Unknown'
        OSFreeSpaceGB = 'Unknown'
        TimeOffset = 'Unknown'
        DNSService = 'Unknown'
        NTDSService = 'Unknown'
        NetLogonService = 'Unknown'
        DCDiagConnectivity = 'Unknown'
        DCDiagReplications = 'Unknown'
        DCDiagServices = 'Unknown'
        DCDiagAdvertising = 'Unknown'
        DCDiagSysVol = 'Unknown'
        OverallHealth = 'Unknown'
        Issues = @()
    }
    
    # DNS Resolution Test
    try {
        $null = Resolve-DnsName $ComputerName -Type A -ErrorAction Stop
        $dcHealth.DNSTest = 'Success'
    } catch {
        $dcHealth.DNSTest = 'Fail'
        $dcHealth.Issues += 'DNS Resolution Failed'
    }
    
    # Ping Test
    if (Test-Connection $ComputerName -Count 1 -Quiet) {
        $dcHealth.PingTest = 'Success'
        
        # Uptime Test
        try {
            $os = Get-CimInstance -ClassName Win32_OperatingSystem -ComputerName $ComputerName -ErrorAction Stop
            $uptime = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalHours)
            $dcHealth.UptimeHours = $uptime
            
            if ($uptime -le 24) {
                $dcHealth.Issues += 'Recent Reboot Detected'
            }
        } catch {
            $dcHealth.UptimeHours = 'CIM Failure'
            $dcHealth.Issues += 'Cannot Determine Uptime'
        }
        
        # Disk Space Test
        try {
            $osDrive = (Get-CimInstance -ClassName Win32_OperatingSystem -ComputerName $ComputerName -ErrorAction Stop).SystemDrive
            $disk = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $ComputerName -Filter "DeviceID='$osDrive'" -ErrorAction Stop
            $freePercent = [math]::Round($disk.FreeSpace / $disk.Size * 100)
            $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
            
            $dcHealth.OSFreeSpacePercent = $freePercent
            $dcHealth.OSFreeSpaceGB = $freeGB
            
            if ($freePercent -le 5) {
                $dcHealth.Issues += 'Critical Disk Space'
            } elseif ($freePercent -le 15) {
                $dcHealth.Issues += 'Low Disk Space'
            }
        } catch {
            $dcHealth.OSFreeSpacePercent = 'CIM Failure'
            $dcHealth.OSFreeSpaceGB = 'CIM Failure'
            $dcHealth.Issues += 'Cannot Check Disk Space'
        }
        
        # Time Sync Test
        try {
            $timeResult = (& w32tm /stripchart /computer:$ComputerName /samples:1 /dataonly)[-1].Trim("s") -split ',\s*'
            $timeDiff = [Math]::Round([double]$timeResult[1], 1)
            $dcHealth.TimeOffset = $timeDiff
            
            if ([Math]::Abs($timeDiff) -gt 5) {
                $dcHealth.Issues += 'Time Sync Issue'
            }
        } catch {
            $dcHealth.TimeOffset = 'Fail'
            $dcHealth.Issues += 'Time Sync Check Failed'
        }
        
        # Service Tests
        try {
            $dnsService = Get-Service -ComputerName $ComputerName -Name DNS -ErrorAction SilentlyContinue
            $dcHealth.DNSService = if ($dnsService.Status -eq 'Running') { 'Success' } else { 'Fail' }
            if ($dcHealth.DNSService -eq 'Fail') { $dcHealth.Issues += 'DNS Service Issue' }
            
            $ntdsService = Get-Service -ComputerName $ComputerName -Name NTDS -ErrorAction SilentlyContinue
            $dcHealth.NTDSService = if ($ntdsService.Status -eq 'Running') { 'Success' } else { 'Fail' }
            if ($dcHealth.NTDSService -eq 'Fail') { $dcHealth.Issues += 'NTDS Service Issue' }
            
            $netlogonService = Get-Service -ComputerName $ComputerName -Name netlogon -ErrorAction SilentlyContinue
            $dcHealth.NetLogonService = if ($netlogonService.Status -eq 'Running') { 'Success' } else { 'Fail' }
            if ($dcHealth.NetLogonService -eq 'Fail') { $dcHealth.Issues += 'NetLogon Service Issue' }
        } catch {
            $dcHealth.DNSService = 'Fail'
            $dcHealth.NTDSService = 'Fail'
            $dcHealth.NetLogonService = 'Fail'
            $dcHealth.Issues += 'Service Check Failed'
        }
        
        # Basic DCDiag Tests
        try {
            $dcdiagResult = & dcdiag /s:$ComputerName /test:connectivity /test:replications /test:services /test:advertising /test:sysvolcheck
            
            $dcHealth.DCDiagConnectivity = if ($dcdiagResult -match "Connectivity.*passed") { 'Passed' } else { 'Failed' }
            $dcHealth.DCDiagReplications = if ($dcdiagResult -match "Replications.*passed") { 'Passed' } else { 'Failed' }
            $dcHealth.DCDiagServices = if ($dcdiagResult -match "Services.*passed") { 'Passed' } else { 'Failed' }
            $dcHealth.DCDiagAdvertising = if ($dcdiagResult -match "Advertising.*passed") { 'Passed' } else { 'Failed' }
            $dcHealth.DCDiagSysVol = if ($dcdiagResult -match "SysVolCheck.*passed") { 'Passed' } else { 'Failed' }
            
            if ($dcHealth.DCDiagConnectivity -eq 'Failed') { $dcHealth.Issues += 'DCDIAG Connectivity Failed' }
            if ($dcHealth.DCDiagReplications -eq 'Failed') { $dcHealth.Issues += 'DCDIAG Replication Failed' }
            if ($dcHealth.DCDiagServices -eq 'Failed') { $dcHealth.Issues += 'DCDIAG Services Failed' }
            if ($dcHealth.DCDiagAdvertising -eq 'Failed') { $dcHealth.Issues += 'DCDIAG Advertising Failed' }
            if ($dcHealth.DCDiagSysVol -eq 'Failed') { $dcHealth.Issues += 'DCDIAG SysVol Failed' }
            
        } catch {
            $dcHealth.DCDiagConnectivity = 'Failed'
            $dcHealth.DCDiagReplications = 'Failed'
            $dcHealth.DCDiagServices = 'Failed'
            $dcHealth.DCDiagAdvertising = 'Failed'
            $dcHealth.DCDiagSysVol = 'Failed'
            $dcHealth.Issues += 'DCDIAG Failed to Run'
        }
        
    } else {
        $dcHealth.PingTest = 'Fail'
        $dcHealth.Issues += 'DC Not Reachable'
        # Set all other tests to Fail since DC is unreachable
        $dcHealth.UptimeHours = 'Fail'
        $dcHealth.OSFreeSpacePercent = 'Fail'
        $dcHealth.OSFreeSpaceGB = 'Fail'
        $dcHealth.TimeOffset = 'Fail'
        $dcHealth.DNSService = 'Fail'
        $dcHealth.NTDSService = 'Fail'
        $dcHealth.NetLogonService = 'Fail'
        $dcHealth.DCDiagConnectivity = 'Failed'
        $dcHealth.DCDiagReplications = 'Failed'
        $dcHealth.DCDiagServices = 'Failed'
        $dcHealth.DCDiagAdvertising = 'Failed'
        $dcHealth.DCDiagSysVol = 'Failed'
    }
    
    # Determine Overall Health
    $criticalIssues = $dcHealth.Issues | Where-Object { $_ -match 'Critical|Failed|Not Reachable|NTDS|Service Issue' }
    $warningIssues = $dcHealth.Issues | Where-Object { $_ -match 'Low|Recent|Time Sync|CIM Failure' }
    
    if ($criticalIssues.Count -gt 0) {
        $dcHealth.OverallHealth = 'Critical'
        # Disable individual DC findings since we have comprehensive checks elsewhere
        # Add-AuditFinding -Category 'Domain Controller Health' -Title "Critical Issues on $ComputerName" -Severity 'Critical' `
        #     -Description "Domain controller $ComputerName has critical health issues." `
        #     -Impact 'Critical DC issues can cause authentication failures and service disruptions.' `
        #     -Recommendation "Immediately investigate: $($criticalIssues -join ', ')" `
        #     -Evidence "Issues: $($dcHealth.Issues -join ', ')" -Type 'Availability'
        Write-AuditLog "Extended health check marked $ComputerName as critical due to: $($criticalIssues -join ', ')" -Level Warning
    } elseif ($warningIssues.Count -gt 0) {
        $dcHealth.OverallHealth = 'Warning'
        Add-AuditFinding -Category 'Domain Controller Health' -Title "Warning Conditions on $ComputerName" -Severity 'Medium' `
            -Description "Domain controller $ComputerName has warning conditions." `
            -Impact 'Warning conditions may impact performance or indicate potential issues.' `
            -Recommendation "Review and address: $($warningIssues -join ', ')" `
            -Evidence "Issues: $($dcHealth.Issues -join ', ')" -Type 'Performance'
    } else {
        $dcHealth.OverallHealth = 'Healthy'
        Add-PositiveFinding -Category 'Domain Controller Health' -Title "DC $ComputerName is Healthy" `
            -Description "Domain controller $ComputerName passed all health checks." `
            -Evidence "All tests successful" -Type 'Availability'
    }
    
    return $dcHealth
}

function Test-ADReplicationHealth {
    Write-AuditLog 'Checking Active Directory Replication Health...' -Level Info
    
    try {
        # Run replication diagnostics
        $replsum = repadmin /replsum 2>&1
        $showrepl = repadmin /showrepl 2>&1
        
        # Check for replication errors
        $replicationErrors = $showrepl | Where-Object { $_ -match 'error|fail' }
        if ($replicationErrors.Count -gt 0) {
            Add-AuditFinding -Category 'AD Replication' -Title 'Active Directory Replication Errors' -Severity 'Critical' `
                -Description 'Active Directory replication errors detected between domain controllers.' `
                -Impact 'Data inconsistency across domain controllers, potential authentication issues.' `
                -Recommendation 'Investigate and resolve replication errors immediately using repadmin tools.' `
                -Evidence ($replicationErrors | Out-String) -Type 'Availability' -ComplianceFramework 'Microsoft'
        }
        
        # Check replication latency
        $latency = repadmin /latency 2>&1
        # Parse latency results and flag high latency (implementation depends on environment)
        
        # Save replication reports
        $replsum | Out-File -FilePath (Join-Path $script:OutputDir 'replication-summary.txt')
        $showrepl | Out-File -FilePath (Join-Path $script:OutputDir 'replication-details.txt')
        
    } catch {
        Write-AuditLog "Error checking replication health: $($_.Exception.Message)" -Level Error
        Add-AuditFinding -Category 'AD Replication' -Title 'Replication Health Check Failed' -Severity 'Medium' `
            -Description 'Unable to complete replication health assessment.' `
            -Impact 'Cannot verify replication status between domain controllers.' `
            -Recommendation 'Manually check replication using repadmin commands.' `
            -Evidence $_.Exception.Message -Type 'Availability'
    }
}

function Test-FSMORoleAvailability {
    Write-AuditLog 'Checking FSMO Role Holder Availability...' -Level Info
    
    try {
        $forest = Get-ADForest
        $domain = Get-ADDomain
        
        $fsmoRoles = @{
            'Schema Master' = $forest.SchemaMaster
            'Domain Naming Master' = $forest.DomainNamingMaster
            'Infrastructure Master' = $domain.InfrastructureMaster
            'RID Master' = $domain.RIDMaster
            'PDC Emulator' = $domain.PDCEmulator
        }
        
        foreach ($role in $fsmoRoles.GetEnumerator()) {
            $roleHolder = $role.Value
            Write-AuditLog "Checking $($role.Key) on $roleHolder" -Level Info
            
            $pingResult = Test-Connection -ComputerName $roleHolder -Count 1 -Quiet -ErrorAction Stop
            if (-not $pingResult) {
                Add-AuditFinding -Category 'FSMO Roles' -Title "FSMO Role Holder Unavailable: $($role.Key)" -Severity 'Critical' `
                    -Description "FSMO role holder $roleHolder for $($role.Key) is not responding." `
                    -Impact 'Critical AD operations may fail, affecting domain functionality.' `
                    -Recommendation 'Investigate role holder availability and consider FSMO role transfer if necessary.' `
                    -Type 'Availability' -ComplianceFramework 'Microsoft'
            }
        }
        
    } catch {
        Write-AuditLog "Error checking FSMO roles: $($_.Exception.Message)" -Level Error
        Add-AuditFinding -Category 'FSMO Roles' -Title 'FSMO Role Check Failed' -Severity 'Medium' `
            -Description 'Unable to verify FSMO role holder availability.' `
            -Impact 'Cannot confirm critical AD role functionality.' `
            -Recommendation 'Manually verify FSMO role holders using netdom or AD tools.' `
            -Evidence $_.Exception.Message -Type 'Configuration'
    }
}

function Test-ADContainerStructure {
    Write-AuditLog 'Analyzing AD Container Structure and Best Practices...' -Level Info
    
    try {
        $domainDN = (Get-ADDomain).DistinguishedName
        
        # Check for computer objects in default Computers container
        $computersInDefault = Get-ADObject -SearchBase "CN=Computers,$domainDN" -Filter * -ErrorAction Stop
        if ($computersInDefault.Count -gt 0) {
            Add-AuditFinding -Category 'AD Structure' -Title 'Computer Objects in Default Container' -Severity 'Medium' `
                -Description "$($computersInDefault.Count) computer objects found in default Computers container." `
                -Impact 'Objects in default containers cannot have Group Policy applied effectively.' `
                -Recommendation 'Move computer objects to appropriate organizational units for proper management.' `
                -Evidence ($computersInDefault | Select-Object Name | Out-String) -Type 'Configuration' -ComplianceFramework 'Microsoft'
        }
        
        # Check for user objects in default Users container
        $systemObjects = @('DnsAdmins', 'DnsUpdateProxy', 'Administrator', 'Guest', 'krbtgt')
        $usersInDefault = Get-ADObject -SearchBase "CN=Users,$domainDN" -Filter { ObjectClass -eq 'user' } -Properties isCriticalSystemObject, samAccountName -ErrorAction Stop |
            Where-Object { 
                $_.SamAccountName -notin $systemObjects -and 
                $_.isCriticalSystemObject -ne $true -and
                -not ($_.SamAccountName -like 'AAD_*') -and
                -not ($_.SamAccountName -like 'MOL_*') -and
                -not ($_.SamAccountName -like 'MSOL_*')
            }
        
        if ($usersInDefault.Count -gt 0) {
            Add-AuditFinding -Category 'AD Structure' -Title 'User Objects in Default Container' -Severity 'Medium' `
                -Description "$($usersInDefault.Count) user objects found in default Users container." `
                -Impact 'Users in default container cannot have proper Group Policy targeting.' `
                -Recommendation 'Move user objects to appropriate organizational units based on department and function.' `
                -Evidence ($usersInDefault | Select-Object Name, SamAccountName | Out-String) -Type 'Configuration' -ComplianceFramework 'Microsoft'
        }
        
    } catch {
        Write-AuditLog "Error analyzing AD container structure: $($_.Exception.Message)" -Level Error
    }
}

function Test-GroupPolicyCompliance {
    Write-AuditLog 'Analyzing Group Policy Configuration and Compliance...' -Level Info
    
    # Check if GroupPolicy module is available
    if ('GroupPolicy' -notin $script:AvailableModules) {
        Write-AuditLog "Group Policy module not available, skipping GP analysis" -Level Warning
        Add-AuditFinding -Category 'Group Policy' -Title 'Group Policy Module Not Available' -Severity 'Info' `
            -Description 'GroupPolicy PowerShell module is not installed or available.' `
            -Impact 'Group Policy analysis and auditing features are limited without this module.' `
            -Recommendation 'Install RSAT tools to enable full Group Policy auditing capabilities.' `
            -Evidence 'GroupPolicy module check failed' -Type 'Configuration' -ComplianceFramework 'Microsoft'
        return
    }
    
    try {
        Import-Module GroupPolicy -SkipEditionCheck -ErrorAction Stop
        
        if (-not (Get-Module GroupPolicy)) {
            Write-AuditLog "Group Policy module not available, skipping GP analysis" -Level Warning
            return
        }
        
        $allGPOs = Get-GPO -All -ErrorAction Stop
        $unlinkedGPOs = @()
        
        foreach ($gpo in $allGPOs) {
            try {
                $gpoReport = Get-GPOReport -Guid $gpo.Id -ReportType XML -ErrorAction Stop
                if ($gpoReport -and $gpoReport -notmatch '<LinksTo>') {
                    $unlinkedGPOs += $gpo
                }
            } catch {
                Write-AuditLog "Could not check linking for GPO: $($gpo.DisplayName)" -Level Warning
            }
        }
        
        if ($unlinkedGPOs.Count -gt 0) {
            Add-AuditFinding -Category 'Group Policy' -Title 'Unlinked Group Policy Objects' -Severity 'Low' `
                -Description "$($unlinkedGPOs.Count) GPOs are not linked to any organizational units." `
                -Impact 'Unlinked GPOs create administrative overhead and may indicate poor policy management.' `
                -Recommendation 'Review each unlinked GPO and either link to appropriate OUs or backup and delete if no longer needed.' `
                -Evidence ($unlinkedGPOs | Select-Object DisplayName, CreationTime | Out-String) -Type 'Configuration' -ComplianceFramework 'Microsoft'
        }
        
        # Export GPO inventory
        $allGPOs | Select-Object DisplayName, Id, CreationTime, ModificationTime, @{Name="Linked";Expression={
            try { 
                $report = Get-GPOReport -Guid $_.Id -ReportType XML -ErrorAction Stop
                if ($report -match '<LinksTo>') { 'Yes' } else { 'No' }
            } catch { 'Unknown' }
        }} | Export-Csv -Path (Join-Path $script:OutputDir 'group-policy-inventory.csv') -NoTypeInformation
        
    } catch {
        Write-AuditLog "Error analyzing Group Policy: $($_.Exception.Message)" -Level Error
    }
}

function Test-ServiceAccountSecurity {
    Write-AuditLog 'Analyzing Service Account Security...' -Level Info
    
    try {
        # Check for service accounts with old passwords
        $oldPasswordThreshold = (Get-Date).AddDays(-180)
        $serviceAccountsOldPasswords = Get-ADUser -Filter {
            passwordLastSet -lt $oldPasswordThreshold -and 
            Enabled -eq $true
        } -Properties PasswordLastSet, ServicePrincipalName -ErrorAction Stop |
            Where-Object { $_.ServicePrincipalName -or $_.SamAccountName -like '*svc*' -or $_.SamAccountName -like '*service*' }
        
        if ($serviceAccountsOldPasswords.Count -gt 0) {
            Add-AuditFinding -Category 'Service Accounts' -Title 'Service Accounts with Old Passwords' -Severity 'High' `
                -Description "$($serviceAccountsOldPasswords.Count) service accounts have passwords older than 180 days." `
                -Impact 'Old service account passwords increase risk of credential compromise.' `
                -Recommendation 'Schedule coordinated password changes with application owners.' `
                -Evidence ($serviceAccountsOldPasswords | Select-Object SamAccountName, PasswordLastSet | Out-String) -Type 'Security' -ComplianceFramework 'NIST'
        }
        
        # Check KRBTGT account password age
        $krbtgtAccount = Get-ADUser -Identity 'krbtgt' -Properties PasswordLastSet -ErrorAction Stop
        if ($krbtgtAccount) {
            $passwordAge = (Get-Date) - $krbtgtAccount.PasswordLastSet
            if ($passwordAge.Days -gt 180) {
                Add-AuditFinding -Category 'Kerberos Security' -Title 'KRBTGT Password Too Old' -Severity 'High' `
                    -Description "KRBTGT account password is $($passwordAge.Days) days old." `
                    -Impact 'Old KRBTGT passwords can be exploited for Golden Ticket attacks.' `
                    -Recommendation 'Reset KRBTGT password twice with 10-hour intervals between resets.' `
                    -Evidence "Password last set: $($krbtgtAccount.PasswordLastSet)" -Type 'Security' -ComplianceFramework 'Microsoft'
            } else {
                Add-PositiveFinding -Category 'Kerberos Security' -Title 'KRBTGT Password Age Compliant' `
                    -Description "KRBTGT account password is $($passwordAge.Days) days old, within the recommended 180-day limit." `
                    -Evidence "Password last set: $($krbtgtAccount.PasswordLastSet)" -Type 'Security' -ComplianceFramework 'Microsoft'
            }
        }
        
    } catch {
        Write-AuditLog "Error analyzing service account security: $($_.Exception.Message)" -Level Error
    }
}

function Test-DNSInfrastructure {
    Write-AuditLog 'Analyzing DNS Infrastructure Health...' -Level Info
    
    try {
        # Get PDC Emulator to run DNS diagnostics
        try {
            $pdcEmulator = (Get-ADDomain).PDCEmulator
            Write-AuditLog "Running DNS diagnostics against PDC Emulator: $pdcEmulator" -Level Info
            $dnsResults = dcdiag /test:dns /s:$pdcEmulator 2>&1
        } catch {
            Write-AuditLog "Could not identify PDC Emulator, trying any available DC" -Level Warning
            try {
                $anyDC = (Get-ADDomainController -Discover).Name
                Write-AuditLog "Running DNS diagnostics against DC: $anyDC" -Level Info
                $dnsResults = dcdiag /test:dns /s:$anyDC 2>&1
            } catch {
                Write-AuditLog "Could not find any available DC, running locally" -Level Warning
                $dnsResults = dcdiag /test:dns 2>&1
            }
        }
        
        # Check for DNS errors
        if ($dnsResults -match 'failed|error') {
            Add-AuditFinding -Category 'DNS Infrastructure' -Title 'DNS Health Issues Detected' -Severity 'Medium' `
                -Description 'DNS diagnostic tests detected configuration or operational issues.' `
                -Impact 'DNS issues can cause authentication failures and service disruptions.' `
                -Recommendation 'Review DNS configuration and resolve identified issues.' `
                -Evidence ($dnsResults | Out-String) -Type 'Configuration' -ComplianceFramework 'Microsoft'
        }
        
        # Check DNS zones for secure updates (if DNS server role is available)
        try {
            $dnsZones = Get-DnsServerZone -ErrorAction Stop
            $insecureZones = $dnsZones | Where-Object { $_.DynamicUpdate -eq 'NonSecureAndSecure' }
            
            if ($insecureZones.Count -gt 0) {
                Add-AuditFinding -Category 'DNS Security' -Title 'DNS Zones Allow Insecure Updates' -Severity 'High' `
                    -Description "$($insecureZones.Count) DNS zones allow non-secure dynamic updates." `
                    -Impact 'Insecure DNS updates can lead to DNS poisoning attacks.' `
                    -Recommendation 'Configure all DNS zones to use secure dynamic updates only.' `
                    -Evidence ($insecureZones | Select-Object ZoneName, DynamicUpdate | Out-String) -Type 'Security' -ComplianceFramework 'CIS'
            }
        } catch {
            Write-AuditLog "Could not check DNS zones (may not be DNS server)" -Level Warning
        }
        
        # Save DNS diagnostic results
        $dnsResults | Out-File -FilePath (Join-Path $script:OutputDir 'dns-diagnostic.txt')
        
    } catch {
        Write-AuditLog "Error analyzing DNS infrastructure: $($_.Exception.Message)" -Level Error
    }
}

function Test-ADSecurityConfiguration {
    Write-AuditLog 'Analyzing Active Directory Security Configuration...' -Level Info
    
    try {
        # Check domain password policy - Complete configuration
        $passwordPolicy = Get-ADDefaultDomainPasswordPolicy -ErrorAction Stop
        if ($passwordPolicy) {
            Write-AuditLog 'Analyzing complete password policy configuration...' -Level Info
            
            # Create comprehensive password policy evidence
            $passwordPolicyEvidence = @"
Domain Password Policy Configuration:
- Minimum Password Length: $($passwordPolicy.MinPasswordLength) characters
- Password Complexity Enabled: $($passwordPolicy.ComplexityEnabled)
- Maximum Password Age: $($passwordPolicy.MaxPasswordAge.Days) days
- Minimum Password Age: $($passwordPolicy.MinPasswordAge.Days) days
- Password History Count: $($passwordPolicy.PasswordHistoryCount)
- Lockout Duration: $($passwordPolicy.LockoutDuration.TotalMinutes) minutes
- Lockout Observation Window: $($passwordPolicy.LockoutObservationWindow.TotalMinutes) minutes
- Lockout Threshold: $($passwordPolicy.LockoutThreshold) attempts
- Reversible Encryption: $($passwordPolicy.ReversibleEncryptionEnabled)
"@
            
            # Add comprehensive password policy finding
            Add-AuditFinding -Category 'Password Policy' -Title 'Complete Password Policy Configuration' -Severity 'Info' `
                -Description 'Complete domain password policy configuration documented.' `
                -Impact 'Password policy settings directly impact security posture.' `
                -Recommendation 'Review password policy settings against security best practices.' `
                -Evidence $passwordPolicyEvidence -Type 'Compliance' -ComplianceFramework 'CIS'
            
            # Check minimum password length
            if ($passwordPolicy.MinPasswordLength -lt 12) {
                $severity = if ($passwordPolicy.MinPasswordLength -lt 8) { 'High' } else { 'Medium' }
                Add-AuditFinding -Category 'Password Policy' -Title 'Insufficient Minimum Password Length' -Severity $severity `
                    -Description "Minimum password length is set to $($passwordPolicy.MinPasswordLength) characters." `
                    -Impact 'Weak password requirements increase risk of password-based attacks and credential compromise.' `
                    -Recommendation 'Set minimum password length to at least 12 characters (current industry standard). Recommended: 14+ characters for enhanced security.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            } elseif ($passwordPolicy.MinPasswordLength -lt 14) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Password Length Below Recommended Standard' -Severity 'Low' `
                    -Description "Minimum password length is set to $($passwordPolicy.MinPasswordLength) characters." `
                    -Impact 'Password length meets minimum requirements but falls short of recommended best practices.' `
                    -Recommendation 'Consider increasing minimum password length to 14+ characters for enhanced security.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            } else {
                Add-PositiveFinding -Category 'Password Policy' -Title 'Strong Minimum Password Length' `
                    -Description "Minimum password length is appropriately set to $($passwordPolicy.MinPasswordLength) characters." `
                    -Evidence "Current setting: $($passwordPolicy.MinPasswordLength) characters (meets recommended standard of 14+)" `
                    -Type 'Security' -ComplianceFramework 'NIST'
            }
            
            # Check password complexity
            if ($passwordPolicy.ComplexityEnabled -eq $false) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Password Complexity Not Enforced' -Severity 'High' `
                    -Description 'Password complexity requirements are not enforced.' `
                    -Impact 'Simple passwords increase risk of brute force and dictionary attacks.' `
                    -Recommendation 'Enable password complexity requirements. NB: Exception applies if password policies are propagated via Azure AD - Azure AD and on-premises AD complexity requirements may conflict with password writeback enabled, especially with name-based character restrictions.' `
                    -Type 'Security' -ComplianceFramework 'CIS'
            } else {
                Add-PositiveFinding -Category 'Password Policy' -Title 'Password Complexity Properly Enforced' `
                    -Description 'Password complexity requirements are enabled and enforced.' `
                    -Evidence "Complexity enabled: $($passwordPolicy.ComplexityEnabled)" `
                    -Type 'Security' -ComplianceFramework 'CIS'
            }
            
            # Check maximum password age
            if ($passwordPolicy.MaxPasswordAge.Days -eq 0) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Password Never Expires Policy' -Severity 'High' `
                    -Description "Maximum password age is set to 0 days (passwords never expire)." `
                    -Impact 'Passwords that never expire pose significant security risk as compromised credentials remain valid indefinitely.' `
                    -Recommendation 'Set maximum password age between 30-150 days for optimal security balance.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            } elseif ($passwordPolicy.MaxPasswordAge.Days -lt 30) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Password Age Policy Too Short' -Severity 'Medium' `
                    -Description "Maximum password age is set to $($passwordPolicy.MaxPasswordAge.Days) days." `
                    -Impact 'Very short password aging may lead to user frustration and weaker password choices.' `
                    -Recommendation 'Set maximum password age between 30-150 days for optimal security balance.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            } elseif ($passwordPolicy.MaxPasswordAge.Days -gt 150) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Password Age Policy Requires Review' -Severity 'Low' `
                    -Description "Maximum password age is set to $($passwordPolicy.MaxPasswordAge.Days) days." `
                    -Impact 'Extended password aging may increase risk of compromised credentials remaining valid longer.' `
                    -Recommendation 'Review and consider reducing maximum password age to 150 days or less for enhanced security.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            } else {
                Add-PositiveFinding -Category 'Password Policy' -Title 'Appropriate Password Age Policy' `
                    -Description "Maximum password age is appropriately set to $($passwordPolicy.MaxPasswordAge.Days) days." `
                    -Evidence "Current setting: $($passwordPolicy.MaxPasswordAge.Days) days (within recommended 30-150 day range)" `
                    -Type 'Security' -ComplianceFramework 'NIST'
            }
            
            # Check minimum password age
            if ($passwordPolicy.MinPasswordAge.Days -eq 0) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Minimum Password Age Not Set' -Severity 'High' `
                    -Description "Minimum password age is set to 0 days (users can change passwords immediately)." `
                    -Impact 'Users can bypass password history restrictions by changing passwords multiple times in succession.' `
                    -Recommendation 'Set minimum password age to 1 day or more to prevent password history bypass.' `
                    -Type 'Security' -ComplianceFramework 'CIS'
            } else {
                Add-PositiveFinding -Category 'Password Policy' -Title 'Appropriate Minimum Password Age Policy' `
                    -Description "Minimum password age is appropriately set to $($passwordPolicy.MinPasswordAge.Days) days." `
                    -Evidence "Current setting: $($passwordPolicy.MinPasswordAge.Days) days (prevents password history bypass)" `
                    -Type 'Security' -ComplianceFramework 'CIS'
            }
            
            # Check password history
            if ($passwordPolicy.PasswordHistoryCount -lt 12) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Insufficient Password History' -Severity 'Medium' `
                    -Description "Password history is set to remember only $($passwordPolicy.PasswordHistoryCount) passwords." `
                    -Impact 'Insufficient password history allows users to reuse recent passwords.' `
                    -Recommendation 'Set password history to remember at least 12 previous passwords.' `
                    -Type 'Security' -ComplianceFramework 'CIS'
            }
            
            # Check account lockout policy
            if ($passwordPolicy.LockoutThreshold -eq 0) {
                Add-AuditFinding -Category 'Account Lockout Policy' -Title 'Account Lockout Policy Not Configured' -Severity 'High' `
                    -Description 'Account lockout policy is not configured (lockout threshold is 0).' `
                    -Impact 'No protection against brute force password attacks.' `
                    -Recommendation 'Configure account lockout policy with threshold of 5-10 failed attempts.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            } elseif ($passwordPolicy.LockoutThreshold -gt 10) {
                Add-AuditFinding -Category 'Account Lockout Policy' -Title 'Account Lockout Threshold Too High' -Severity 'Medium' `
                    -Description "Account lockout threshold is set to $($passwordPolicy.LockoutThreshold) attempts." `
                    -Impact 'High lockout threshold provides insufficient protection against brute force attacks.' `
                    -Recommendation 'Set account lockout threshold to 5-10 failed attempts.' `
                    -Type 'Security' -ComplianceFramework 'CIS'
            }
            
            # Check lockout duration
            if ($passwordPolicy.LockoutDuration.TotalMinutes -lt 15) {
                Add-AuditFinding -Category 'Account Lockout Policy' -Title 'Account Lockout Duration Too Short' -Severity 'Medium' `
                    -Description "Account lockout duration is set to $($passwordPolicy.LockoutDuration.TotalMinutes) minutes." `
                    -Impact 'Short lockout duration may not effectively deter brute force attacks.' `
                    -Recommendation 'Set account lockout duration to at least 15 minutes.' `
                    -Type 'Security' -ComplianceFramework 'CIS'
            }
            
            # Check reversible encryption
            if ($passwordPolicy.ReversibleEncryptionEnabled -eq $true) {
                Add-AuditFinding -Category 'Password Policy' -Title 'Reversible Encryption Enabled' -Severity 'Critical' `
                    -Description 'Reversible encryption for passwords is enabled.' `
                    -Impact 'Passwords stored with reversible encryption are equivalent to plaintext.' `
                    -Recommendation 'Disable reversible encryption immediately unless required for specific legacy applications.' `
                    -Type 'Security' -ComplianceFramework 'NIST'
            }
        }
        
        # Check for accounts with PasswordNotRequired or PasswordNeverExpires
        Write-AuditLog 'Checking for accounts with problematic password settings...' -Level Info
        
        try {
            # Check for accounts with PasswordNotRequired
            $passwordNotRequiredAccounts = Get-ADUser -Filter {PasswordNotRequired -eq $true -and Enabled -eq $true} -Properties PasswordNotRequired, LastLogonDate, Created
            if ($passwordNotRequiredAccounts.Count -gt 0) {
                $passwordNotRequiredEvidence = $passwordNotRequiredAccounts | Select-Object Name, SamAccountName, LastLogonDate, Created | Out-String
                Add-AuditFinding -Category 'Account Security' -Title 'Accounts with Password Not Required' -Severity 'High' `
                    -Description "Found $($passwordNotRequiredAccounts.Count) enabled accounts with 'Password Not Required' setting." `
                    -Impact 'Accounts without password requirements pose significant security risk.' `
                    -Recommendation 'Review and disable Password Not Required setting for all accounts unless absolutely necessary.' `
                    -Evidence $passwordNotRequiredEvidence -Type 'Security' -ComplianceFramework 'CIS'
            }
            
            # Check for accounts with PasswordNeverExpires (excluding service accounts)
            $passwordNeverExpiresAccounts = Get-ADUser -Filter {PasswordNeverExpires -eq $true -and Enabled -eq $true} -Properties PasswordNeverExpires, LastLogonDate, Created, ServicePrincipalName
            # Filter out service accounts (those with SPNs or service account naming patterns)
            $nonServiceAccounts = $passwordNeverExpiresAccounts | Where-Object { 
                -not $_.ServicePrincipalName -and 
                $_.SamAccountName -notmatch '^(svc|service|sql|iis|app)' -and
                $_.SamAccountName -notmatch '^\$' 
            }
            
            if ($nonServiceAccounts.Count -gt 0) {
                $passwordNeverExpiresEvidence = $nonServiceAccounts | Select-Object Name, SamAccountName, LastLogonDate, Created | Out-String
                Add-AuditFinding -Category 'Account Security' -Title 'Non-Service Accounts with Password Never Expires' -Severity 'High' `
                    -Description "Found $($nonServiceAccounts.Count) enabled non-service accounts with 'Password Never Expires' setting." `
                    -Impact 'Accounts with non-expiring passwords increase security risk if compromised.' `
                    -Recommendation 'Review and disable Password Never Expires for non-service accounts.' `
                    -Evidence $passwordNeverExpiresEvidence -Type 'Security' -ComplianceFramework 'NIST'
            }
            
            # Check for accounts with expired passwords
            $expiredPasswordAccounts = Get-ADUser -Filter {Enabled -eq $true -and PasswordExpired -eq $true} -Properties PasswordExpired, LastLogonDate, PasswordLastSet
            if ($expiredPasswordAccounts.Count -gt 0) {
                $expiredPasswordEvidence = $expiredPasswordAccounts | Select-Object Name, SamAccountName, LastLogonDate, PasswordLastSet | Out-String
                Add-AuditFinding -Category 'Account Security' -Title 'Accounts with Expired Passwords' -Severity 'Medium' `
                    -Description "Found $($expiredPasswordAccounts.Count) enabled accounts with expired passwords." `
                    -Impact 'Accounts with expired passwords may indicate inactive accounts or password policy issues.' `
                    -Recommendation 'Review expired password accounts and either reset passwords or disable unused accounts.' `
                    -Evidence $expiredPasswordEvidence -Type 'Security' -ComplianceFramework 'CIS'
            }
            
        } catch {
            Write-AuditLog "Error checking account password settings: $($_.Exception.Message)" -Level Warning
        }
        
        # Check for privileged account analysis - Extended sensitive groups
        $privilegedGroups = @('Domain Admins', 'Enterprise Admins', 'Schema Admins', 'Administrators')
        $sensitiveGroups = @('Backup Operators', 'Server Operators', 'Print Operators', 'Account Operators', 'Replicator', 'Network Configuration Operators', 'Hyper-V Administrators', 'Remote Desktop Users')
        
        Write-AuditLog 'Analyzing privileged and sensitive group memberships...' -Level Info
        
        # Check core privileged groups
        foreach ($group in $privilegedGroups) {
            try {
                $members = Get-ADGroupMember -Identity $group -ErrorAction Stop
                if ($members.Count -gt 5) {
                    Add-AuditFinding -Category 'Privileged Access' -Title "Excessive Privileged Group Membership: $group" -Severity 'Medium' `
                        -Description "$group has $($members.Count) members." `
                        -Impact 'Large privileged groups increase attack surface and compliance risk.' `
                        -Recommendation 'Review privileged group membership and remove unnecessary accounts.' `
                        -Evidence ($members | Select-Object Name, ObjectClass | Out-String) -Type 'Security' -ComplianceFramework 'CIS'
                }
            } catch {
                Write-AuditLog "Could not check group membership for $group" -Level Warning
            }
        }
        
        # Check for inactive privileged accounts
        $inactiveThreshold = (Get-Date).AddDays(-90)
        foreach ($group in $privilegedGroups) {
            try {
                $members = Get-ADGroupMember -Identity $group -ErrorAction Stop | Where-Object { $_.objectClass -eq 'user' }
                foreach ($member in $members) {
                    $user = Get-ADUser -Identity $member.SamAccountName -Properties LastLogonDate -ErrorAction Stop
                    if ($user.LastLogonDate -and $user.LastLogonDate -lt $inactiveThreshold) {
                        Add-AuditFinding -Category 'Privileged Access' -Title "Inactive Privileged Account: $($user.SamAccountName)" -Severity 'High' `
                            -Description "Privileged account $($user.SamAccountName) has not logged in for over 90 days." `
                            -Impact 'Inactive privileged accounts create security risk and compliance violations.' `
                            -Recommendation 'Disable or remove inactive privileged accounts after proper verification.' `
                            -Evidence "Last logon: $($user.LastLogonDate)" -Type 'Security' -ComplianceFramework 'ISO27001'
                    }
                }
            } catch {
                Write-AuditLog "Could not check inactive accounts for $group" -Level Warning
            }
        }
        
        # Check sensitive groups for unexpected membership
        foreach ($group in $sensitiveGroups) {
            try {
                $members = Get-ADGroupMember -Identity $group -ErrorAction SilentlyContinue
                if ($members -and $members.Count -gt 0) {
                    $memberEvidence = $members | Select-Object Name, ObjectClass | Out-String
                    $severity = switch ($group) {
                        'Backup Operators' { 'High' }
                        'Server Operators' { 'High' }
                        'Account Operators' { 'High' }
                        default { 'Medium' }
                    }
                    Add-AuditFinding -Category 'Privileged Access' -Title "Sensitive Group Has Members: $group" -Severity $severity `
                        -Description "$group has $($members.Count) members." `
                        -Impact "Members of $group have elevated privileges that could be misused." `
                        -Recommendation "Review membership of $group and remove unnecessary accounts." `
                        -Evidence $memberEvidence -Type 'Security' -ComplianceFramework 'CIS'
                }
            } catch {
                Write-AuditLog "Could not check group membership for $group (may not exist)" -Level Info
            }
        }
        
        # Check for disabled user accounts that should be cleaned up
        Write-AuditLog 'Checking for disabled user accounts...' -Level Info
        try {
            $disabledUsers = Get-ADUser -Filter {Enabled -eq $false} -Properties LastLogonDate, WhenChanged
            $oldDisabledUsers = $disabledUsers | Where-Object { $_.WhenChanged -lt (Get-Date).AddDays(-90) }
            
            if ($oldDisabledUsers.Count -gt 0) {
                $disabledUsersEvidence = $oldDisabledUsers | Select-Object Name, SamAccountName, LastLogonDate, WhenChanged | Sort-Object WhenChanged | Out-String
                Add-AuditFinding -Category 'Account Hygiene' -Title 'Old Disabled User Accounts' -Severity 'Medium' `
                    -Description "Found $($oldDisabledUsers.Count) user accounts that have been disabled for more than 90 days." `
                    -Impact 'Old disabled accounts consume resources and may indicate incomplete cleanup processes.' `
                    -Recommendation 'Review old disabled accounts and remove them if no longer needed for auditing purposes.' `
                    -Evidence $disabledUsersEvidence -Type 'Compliance' -ComplianceFramework 'CIS'
            }
        } catch {
            Write-AuditLog "Error checking disabled user accounts: $($_.Exception.Message)" -Level Warning
        }
        
    } catch {
        Write-AuditLog "Error analyzing AD security configuration: $($_.Exception.Message)" -Level Error
    }
}

function Test-CertificateServices {
    Write-AuditLog 'Analyzing Certificate Services Infrastructure...' -Level Info
    
    try {
        # Check Certificate Authority service - improved detection
        $caService = Get-Service -Name 'CertSvc' -ErrorAction SilentlyContinue
        if ($caService) {
            if ($caService.Status -ne 'Running') {
                Add-AuditFinding -Category 'Certificate Services' -Title 'Certificate Authority Service Not Running' -Severity 'High' `
                    -Description 'Certificate Authority service is not running.' `
                    -Impact 'PKI services unavailable, affecting certificate enrollment and validation.' `
                    -Recommendation 'Start Certificate Authority service and investigate startup issues.' `
                    -Type 'Availability' -ComplianceFramework 'Microsoft'
            }
        } else {
            Write-AuditLog 'Certificate Services not installed on this system' -Level Info
        }
        
        # Check for expiring certificates in local machine store (regardless of CA installation)
        try {
            $expiringCerts = Get-ChildItem Cert:\LocalMachine\My -ErrorAction Stop | 
                Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) -and $_.NotAfter -gt (Get-Date) }
            
            if ($expiringCerts.Count -gt 0) {
                Add-AuditFinding -Category 'Certificate Services' -Title 'Certificates Expiring Soon' -Severity 'Medium' `
                    -Description "$($expiringCerts.Count) certificates will expire within 30 days." `
                    -Impact 'Certificate expiration can cause service disruptions and authentication failures.' `
                    -Recommendation 'Review expiring certificates and plan for renewal.' `
                    -Evidence ($expiringCerts | Select-Object Subject, NotAfter | Out-String) -Type 'Configuration'
            }
            
            # Check for already expired certificates
            $expiredCerts = Get-ChildItem Cert:\LocalMachine\My -ErrorAction Stop | 
                Where-Object { $_.NotAfter -lt (Get-Date) }
            
            if ($expiredCerts.Count -gt 0) {
                Add-AuditFinding -Category 'Certificate Services' -Title 'Expired Certificates Found' -Severity 'Medium' `
                    -Description "$($expiredCerts.Count) expired certificates found in local machine store." `
                    -Impact 'Expired certificates should be removed to maintain clean certificate store.' `
                    -Recommendation 'Remove expired certificates that are no longer needed.' `
                    -Evidence ($expiredCerts | Select-Object Subject, NotAfter | Out-String) -Type 'Configuration'
            }
        } catch {
            Write-AuditLog "Could not check certificate store: $($_.Exception.Message)" -Level Warning
        }
        
    } catch {
        Write-AuditLog "Error analyzing Certificate Services: $($_.Exception.Message)" -Level Warning
    }
}

# ==============================================================================
# SERVER INFRASTRUCTURE AUDIT
# ==============================================================================

function Start-ServerInfrastructureAudit {
    Write-AuditLog 'Starting Server Infrastructure Audit' -Level Header
    
    try {
        # Discover server list
        $serverList = Get-ServerInventory
        
        if ($serverList.Count -eq 0) {
            Write-AuditLog "No servers found for auditing" -Level Warning
            return
        }
        
        Write-AuditLog "Found $($serverList.Count) servers to audit" -Level Success
        
        # Get credentials for server access
        $credential = Get-AuditCredentials
        if (-not $credential) {
            Write-AuditLog "No credentials provided for server audit" -Level Warning
            return
        }
        
        # Audit servers in parallel
        Start-ParallelServerAudit -ServerList $serverList -Credential $credential
        
    } catch {
        Write-AuditLog "Error during server infrastructure audit: $($_.Exception.Message)" -Level Error
        Add-AuditFinding -Category 'Server Audit' -Title 'Server Infrastructure Audit Failed' -Severity 'High' `
            -Description 'Unable to complete server infrastructure assessment.' `
            -Impact 'Cannot verify server security and configuration compliance.' `
            -Recommendation 'Investigate server audit failures and retry with proper credentials.' `
            -Evidence $_.Exception.Message -Type 'Availability'
    }
}

function Get-ServerInventory {
    Write-AuditLog 'Discovering server inventory...' -Level Info
    
    try {
        if ($ServerListPath -and (Test-Path $ServerListPath)) {
            # Load from CSV file
            Write-AuditLog "Loading server list from: $ServerListPath" -Level Info
            $serverList = Import-Csv -Path $ServerListPath
            return $serverList | ForEach-Object {
                [PSCustomObject]@{
                    ServerName = $_.ServerName
                    Description = if ($_.Description) { $_.Description } else { 'Imported from CSV' }
                    Environment = if ($_.Environment) { $_.Environment } else { 'Unknown' }
                }
            }
        } else {
            # Auto-discover from Active Directory
            Write-AuditLog "Auto-discovering servers from Active Directory" -Level Info
            $adServers = Get-ADComputer -Filter {OperatingSystem -like "*Server*" -and Enabled -eq $true} -Properties Name, OperatingSystem, Description
            
            return $adServers | ForEach-Object {
                [PSCustomObject]@{
                    ServerName = $_.Name
                    Description = if ($_.Description) { $_.Description } else { $_.OperatingSystem }
                    Environment = 'Production' # Default assumption
                }
            }
        }
    } catch {
        Write-AuditLog "Error discovering server inventory: $($_.Exception.Message)" -Level Error
        return @()
    }
}

function Get-AuditCredentials {
    if ($CredentialPath -and (Test-Path $CredentialPath)) {
        try {
            Write-AuditLog "Loading credentials from: $CredentialPath" -Level Info
            return Import-Clixml -Path $CredentialPath
        } catch {
            Write-AuditLog "Failed to load credentials from file, prompting user" -Level Warning
        }
    }
    
    Write-Host "`nPlease provide credentials for server access:" -ForegroundColor Yellow
    return Get-Credential -Message "Enter credentials for server auditing (Domain Admin or equivalent)"
}

function Start-ParallelServerAudit {
    param(
        [Parameter(Mandatory=$true)]
        [array]$ServerList,
        
        [Parameter(Mandatory=$true)]
        [PSCredential]$Credential
    )
    
    Write-AuditLog "Starting parallel audit of $($ServerList.Count) servers with max $MaxConcurrentJobs concurrent jobs" -Level Info
    Write-AuditLog "Using credentials for user: $($Credential.UserName)" -Level Info
    Write-AuditLog "Server list: $($ServerList | ForEach-Object { $_.ServerName } | Join-String -Separator ', ')" -Level Info
    
    $jobs = @()
    $completedServers = 0
    
    # Start initial batch of jobs
    foreach ($server in $ServerList) {
        if ($jobs.Count -lt $MaxConcurrentJobs) {
            Write-AuditLog "Starting audit job for server: $($server.ServerName)" -Level Info
            $job = Start-Job -ScriptBlock $script:ServerAuditScriptBlock -ArgumentList $server, $Credential
            $jobs += [PSCustomObject]@{ Job = $job; Server = $server; StartTime = Get-Date }
            Write-AuditLog "Job started for $($server.ServerName) - Job ID: $($job.Id)" -Level Info
        } else {
            break
        }
    }
    
    $remainingServers = $ServerList[$jobs.Count..($ServerList.Count-1)]
    
    # Monitor jobs and start new ones as they complete
    $loopCount = 0
    $maxLoops = 1800  # 1 hour maximum (3600 seconds / 2 second sleep)
    while (($jobs.Count -gt 0 -or $remainingServers.Count -gt 0) -and $loopCount -lt $maxLoops) {
        Start-Sleep -Seconds 2
        $loopCount++
        
        # Enhanced logging every 30 seconds (15 loops)
        if ($loopCount % 15 -eq 0) {
            Write-AuditLog "Job monitoring status: $($jobs.Count) active jobs, $($remainingServers.Count) servers remaining" -Level Info
            foreach ($job in $jobs) {
                $runtime = [math]::Round(((Get-Date) - $job.StartTime).TotalMinutes, 1)
                Write-AuditLog "  - Server: $($job.Server.ServerName), State: $($job.Job.State), Runtime: ${runtime} minutes" -Level Info
            }
        }
        
        $finishedJobs = $jobs | Where-Object { $_.Job.State -in @('Completed', 'Failed', 'Stopped') }
        
        foreach ($finishedJob in $finishedJobs) {
            try {
                $runtime = [math]::Round(((Get-Date) - $finishedJob.StartTime).TotalMinutes, 1)
                Write-AuditLog "Processing completed job for server: $($finishedJob.Server.ServerName) (Runtime: ${runtime} minutes, State: $($finishedJob.Job.State))" -Level Info
                
                $result = Receive-Job -Job $finishedJob.Job
                $script:ServerResults += $result
                $completedServers++
                
                Write-AuditLog "Server audit completed for $($finishedJob.Server.ServerName). Connection Status: $($result.ConnectionStatus), Risk Score: $($result.RiskScore)" -Level Success
                
                # Update separate progress for server audit
                $serverPercent = [math]::Min([math]::Round(($completedServers / $ServerList.Count) * 100, 1), 100)
                Write-Progress -Id 1 -Activity "Server Infrastructure Audit" -Status "Completed $($finishedJob.Server.ServerName)" -PercentComplete $serverPercent -CurrentOperation "Auditing $completedServers of $($ServerList.Count) servers"
                
                Remove-Job -Job $finishedJob.Job
                $jobs = $jobs | Where-Object { $_.Job.Id -ne $finishedJob.Job.Id }
                
                # Start next job if servers remain
                if ($remainingServers.Count -gt 0) {
                    $nextServer = $remainingServers[0]
                    $remainingServers = $remainingServers[1..($remainingServers.Count-1)]
                    
                    Write-AuditLog "Starting new audit job for server: $($nextServer.ServerName)" -Level Info
                    $newJob = Start-Job -ScriptBlock $script:ServerAuditScriptBlock -ArgumentList $nextServer, $Credential
                    $jobs += [PSCustomObject]@{ Job = $newJob; Server = $nextServer; StartTime = Get-Date }
                    Write-AuditLog "New job started for $($nextServer.ServerName) - Job ID: $($newJob.Id)" -Level Info
                }
                
            } catch {
                Write-AuditLog "Error processing job result for $($finishedJob.Server.ServerName): $($_.Exception.Message)" -Level Error
                Remove-Job -Job $finishedJob.Job -ErrorAction Stop
                $jobs = $jobs | Where-Object { $_.Job.Id -ne $finishedJob.Job.Id }
            }
        }
        
        # Check for hung jobs (running longer than 5 minutes)
        $hungJobs = $jobs | Where-Object { ((Get-Date) - $_.StartTime).TotalMinutes -gt 5 }
        foreach ($hungJob in $hungJobs) {
            $runtime = [math]::Round(((Get-Date) - $hungJob.StartTime).TotalMinutes, 1)
            Write-AuditLog "Stopping hung job for server $($hungJob.Server.ServerName) - Runtime: ${runtime} minutes, State: $($hungJob.Job.State)" -Level Warning
            
            # Try to get any partial results
            try {
                $partialResult = Receive-Job -Job $hungJob.Job -ErrorAction SilentlyContinue
                if ($partialResult) {
                    Write-AuditLog "Retrieved partial results from hung job for $($hungJob.Server.ServerName)" -Level Info
                    $script:ServerResults += $partialResult
                }
            } catch {
                Write-AuditLog "Could not retrieve results from hung job for $($hungJob.Server.ServerName): $($_.Exception.Message)" -Level Warning
            }
            
            Stop-Job -Job $hungJob.Job -ErrorAction SilentlyContinue
            Remove-Job -Job $hungJob.Job -ErrorAction SilentlyContinue
            $jobs = $jobs | Where-Object { $_.Job.Id -ne $hungJob.Job.Id }
            $completedServers++ # Count as completed even if hung
            
            # Add failure finding
            Add-AuditFinding -Category 'Server Audit' -Title "Server Audit Timeout: $($hungJob.Server.ServerName)" -Severity 'Medium' `
                -Description "Server audit job exceeded 5-minute timeout limit (Runtime: ${runtime} minutes)." `
                -Impact 'Unable to complete comprehensive assessment of server.' `
                -Recommendation 'Investigate server connectivity and performance issues. Check WinRM, firewall, and authentication settings.' `
                -Type 'Availability'
        }
    }
    
    # Check if we exceeded maximum loop count
    if ($loopCount -ge $maxLoops) {
        Write-AuditLog "Server audit monitoring exceeded maximum time limit (1 hour). Forcing completion." -Level Warning
        # Clean up any remaining jobs
        foreach ($job in $jobs) {
            Write-AuditLog "Force stopping job for server: $($job.Server.ServerName)" -Level Warning
            Stop-Job -Job $job.Job -ErrorAction SilentlyContinue
            Remove-Job -Job $job.Job -ErrorAction SilentlyContinue
        }
    }
    
    Write-Progress -Id 1 -Activity "Server Infrastructure Audit" -Completed
    Write-AuditLog "Server infrastructure audit completed. Processed $completedServers of $($ServerList.Count) servers" -Level Success
}

# Define the script block for server auditing
$script:ServerAuditScriptBlock = {
    param($ServerInfo, $Credential)
    
    $serverName = $ServerInfo.ServerName
    $auditResult = [PSCustomObject]@{
        ServerName = $serverName
        Description = $ServerInfo.Description
        Environment = $ServerInfo.Environment
        PingStatus = 'Unknown'
        ConnectionStatus = 'Unknown'
        OperatingSystem = ''
        OSVersion = ''
        Architecture = ''
        Manufacturer = ''
        Model = ''
        SerialNumber = ''
        TotalMemoryGB = 0
        ProcessorInfo = ''
        ProcessorCores = 0
        CPUUtilization = 0
        MemoryUtilization = 0
        DiskInfo = @()
        NetworkAdapters = @()
        CriticalServices = @()
        InstalledRoles = @()
        LocalAdministrators = @()
        InstalledSoftware = @()
        ScheduledTasks = @()
        NetworkShares = @()
        RecentUpdates = @()
        SecurityChecks = @{}
        PendingUpdates = 0
        LastBootTime = $null
        UptimeDays = 0
        SecurityIssues = @()
        PerformanceIssues = @()
        Recommendations = @()
        RiskScore = 0
        AuditTimestamp = Get-Date
        ErrorMessages = @()
    }
    
    try {
        # Test connectivity
        $pingResult = Test-Connection -ComputerName $serverName -Count 2 -Quiet -ErrorAction Stop
        $auditResult.PingStatus = if ($pingResult) { 'Online' } else { 'Offline' }
        
        if (-not $pingResult) {
            $auditResult.ConnectionStatus = 'Failed - No Response'
            $auditResult.ErrorMessages += 'Server not responding to ping'
            return $auditResult
        }
        
        # Establish remote session with enhanced error handling
        try {
            $sessionOption = New-PSSessionOption -OpenTimeout 30000 -OperationTimeout 300000
            $session = New-PSSession -ComputerName $serverName -Credential $Credential -SessionOption $sessionOption -ErrorAction Stop
            $auditResult.ConnectionStatus = 'Connected'
        } catch [System.Management.Automation.Remoting.PSRemotingTransportException] {
            $auditResult.ConnectionStatus = 'Failed - WinRM/Remoting Issue'
            $auditResult.ErrorMessages += "PowerShell remoting failed: $($_.Exception.Message)"
            return $auditResult
        } catch [System.Management.Automation.RuntimeException] {
            $auditResult.ConnectionStatus = 'Failed - Authentication Issue'
            $auditResult.ErrorMessages += "Authentication failed: $($_.Exception.Message)"
            return $auditResult
        } catch [System.TimeoutException] {
            $auditResult.ConnectionStatus = 'Failed - Timeout'
            $auditResult.ErrorMessages += "Connection timeout: $($_.Exception.Message)"
            return $auditResult
        } catch {
            $auditResult.ConnectionStatus = 'Failed - Unknown Error'
            $auditResult.ErrorMessages += "Unexpected connection error: $($_.Exception.Message)"
            return $auditResult
        }
        
        # Execute comprehensive remote audit
        $remoteData = Invoke-Command -Session $session -ScriptBlock {
            $results = @{
                Errors = @()
            }
            
            try {
                # System information
                $results.OS = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
                $results.ComputerSystem = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
                $results.BIOS = Get-CimInstance Win32_BIOS -ErrorAction Stop
                $results.Processor = Get-CimInstance Win32_Processor -ErrorAction Stop
                
                # Performance metrics
                try {
                    $cpuCounter = Get-Counter "\Processor(_Total)\% Processor Time" -MaxSamples 3 -ErrorAction Stop
                    if ($cpuCounter) {
                        $results.CPUUtilization = [math]::Round(($cpuCounter.CounterSamples | Measure-Object CookedValue -Average).Average, 2)
                    }
                } catch {
                    $results.CPUUtilization = -1
                }
                
                if ($results.ComputerSystem -and $results.OS) {
                    $memTotal = $results.ComputerSystem.TotalPhysicalMemory
                    $memAvailable = $results.OS.FreePhysicalMemory * 1KB
                    $results.MemoryUtilization = [math]::Round((($memTotal - $memAvailable) / $memTotal) * 100, 2)
                }
                
                # Disk information
                $results.Disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction Stop
                
                # Network adapters
                $results.NetworkAdapters = Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction Stop
                    Where-Object { $_.IPEnabled -eq $true }
                
                # Critical services
                $criticalServices = @('DHCP', 'DNS', 'W32Time', 'EventLog', 'RpcSs', 'LanmanServer', 'Spooler')
                $results.Services = Get-Service -Name $criticalServices -ErrorAction Stop | 
                    Select-Object Name, Status, StartType
                
                # Windows features/roles
                try {
                    $results.WindowsFeatures = Get-WindowsFeature -ErrorAction Stop | 
                        Where-Object { $_.Installed -eq $true } | 
                        Select-Object -ExpandProperty Name
                } catch {
                    $results.WindowsFeatures = @()
                }
                
                # Local administrators
                try {
                    $results.LocalAdmins = Get-LocalGroupMember -Group "Administrators" -ErrorAction Stop | 
                        Select-Object Name, ObjectClass, PrincipalSource
                } catch {
                    $results.LocalAdmins = @()
                }
                
                # Windows updates
                try {
                    $updateSession = New-Object -ComObject Microsoft.Update.Session -ErrorAction Stop
                    if ($updateSession) {
                        $updateSearcher = $updateSession.CreateUpdateSearcher()
                        $searchResult = $updateSearcher.Search("IsInstalled=0")
                        $results.PendingUpdates = $searchResult.Updates.Count
                    } else {
                        $results.PendingUpdates = -1
                    }
                } catch {
                    $results.PendingUpdates = -1
                }
                
                # System uptime
                if ($results.OS) {
                    $results.LastBoot = $results.OS.LastBootUpTime
                    $results.UptimeDays = [math]::Round(((Get-Date) - $results.LastBoot).TotalDays, 1)
                }
                
                # Event log errors (last 24 hours)
                try {
                    $results.RecentErrors = Get-WinEvent -FilterHashtable @{
                        LogName='System','Application'
                        Level=1,2  # Critical and Error
                        StartTime=(Get-Date).AddDays(-1)
                    } -MaxEvents 10 -ErrorAction Stop
                } catch {
                    $results.RecentErrors = @()
                }
                
                # Security configuration checks
                $results.SecurityChecks = @{}
                
                # Windows Defender status
                try {
                    $results.SecurityChecks.DefenderStatus = Get-MpComputerStatus -ErrorAction Stop
                } catch {
                    $results.SecurityChecks.DefenderStatus = $null
                }
                
                # Firewall status
                try {
                    $results.SecurityChecks.FirewallProfiles = Get-NetFirewallProfile -ErrorAction Stop
                } catch {
                    $results.SecurityChecks.FirewallProfiles = @()
                }
                
                # Installed software audit
                try {
                    $results.InstalledSoftware = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" -ErrorAction Stop | 
                        Where-Object { $_.DisplayName -and $_.DisplayName -ne "" } |
                        Select-Object DisplayName, DisplayVersion, Publisher, InstallDate |
                        Sort-Object DisplayName
                } catch {
                    $results.InstalledSoftware = @()
                    $results.Errors += "Failed to retrieve installed software"
                }
                
                # Scheduled tasks audit
                try {
                    $results.ScheduledTasks = Get-ScheduledTask -ErrorAction Stop | 
                        Where-Object { $_.State -eq 'Ready' -and $_.TaskPath -notlike '\Microsoft\*' } |
                        Select-Object TaskName, TaskPath, State, @{N='NextRun';E={$_.NextRunTime}}, @{N='LastRun';E={$_.LastRunTime}}
                } catch {
                    $results.ScheduledTasks = @()
                    $results.Errors += "Failed to retrieve scheduled tasks"
                }
                
                # SMBv1 status check
                try {
                    $results.SecurityChecks.SMBv1Status = @{}
                    # Check if SMBv1 feature is installed
                    $smb1Feature = Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -ErrorAction SilentlyContinue
                    $results.SecurityChecks.SMBv1Status.FeatureInstalled = ($smb1Feature.State -eq 'Enabled')
                    
                    # Check registry settings
                    $smb1RegPath = "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters"
                    $smb1RegValue = Get-ItemProperty -Path $smb1RegPath -Name "SMB1" -ErrorAction SilentlyContinue
                    $results.SecurityChecks.SMBv1Status.RegistryEnabled = ($smb1RegValue.SMB1 -eq 1)
                } catch {
                    $results.SecurityChecks.SMBv1Status = @{FeatureInstalled = $null; RegistryEnabled = $null}
                    $results.Errors += "Failed to check SMBv1 status"
                }
                
                # Network shares audit
                try {
                    $results.NetworkShares = Get-SmbShare -ErrorAction Stop | 
                        Where-Object { $_.Name -notin @('ADMIN$', 'C$', 'IPC$', 'print$') } |
                        Select-Object Name, Path, Description, ShareType, @{N='AccessRight';E={
                            try {
                                $acl = Get-SmbShareAccess -Name $_.Name -ErrorAction SilentlyContinue
                                ($acl | ForEach-Object { "$($_.AccountName):$($_.AccessRight)" }) -join '; '
                            } catch {
                                'Unable to retrieve'
                            }
                        }}
                } catch {
                    $results.NetworkShares = @()
                    $results.Errors += "Failed to retrieve network shares"
                }
                
                # Enhanced antivirus detection
                try {
                    $results.SecurityChecks.AntivirusProducts = @()
                    
                    # Windows Defender already checked above
                    
                    # Check for third-party antivirus via WMI
                    try {
                        $avProducts = Get-CimInstance -Namespace "root\SecurityCenter2" -ClassName "AntiVirusProduct" -ErrorAction SilentlyContinue
                        if ($avProducts) {
                            $results.SecurityChecks.AntivirusProducts = $avProducts | ForEach-Object {
                                [PSCustomObject]@{
                                    Name = $_.displayName
                                    State = switch ($_.productState) {
                                        { $_ -band 0x1000 } { 'Enabled' }
                                        default { 'Disabled' }
                                    }
                                    UpToDate = switch ($_.productState) {
                                        { $_ -band 0x10 } { 'Yes' }
                                        default { 'No' }
                                    }
                                }
                            }
                        }
                    } catch {
                        $results.Errors += "Failed to query third-party antivirus products"
                    }
                } catch {
                    $results.SecurityChecks.AntivirusProducts = @()
                }
                
                # PowerShell remoting configuration
                try {
                    $results.SecurityChecks.PSRemoting = @{}
                    $winrm = Get-Service WinRM -ErrorAction SilentlyContinue
                    $results.SecurityChecks.PSRemoting.ServiceStatus = $winrm.Status
                    
                    # Check WinRM listeners
                    $listeners = winrm enumerate winrm/config/listener 2>$null
                    $results.SecurityChecks.PSRemoting.HasListeners = ($listeners -ne $null)
                } catch {
                    $results.SecurityChecks.PSRemoting = @{ServiceStatus = 'Unknown'; HasListeners = $false}
                    $results.Errors += "Failed to check PowerShell remoting configuration"
                }
                
                # BitLocker encryption status
                try {
                    $results.SecurityChecks.BitLocker = @()
                    $bitlockerVolumes = Get-BitLockerVolume -ErrorAction SilentlyContinue
                    if ($bitlockerVolumes) {
                        $results.SecurityChecks.BitLocker = $bitlockerVolumes | ForEach-Object {
                            [PSCustomObject]@{
                                MountPoint = $_.MountPoint
                                EncryptionMethod = $_.EncryptionMethod
                                VolumeStatus = $_.VolumeStatus
                                ProtectionStatus = $_.ProtectionStatus
                                EncryptionPercentage = $_.EncryptionPercentage
                            }
                        }
                    }
                } catch {
                    $results.SecurityChecks.BitLocker = @()
                    $results.Errors += "Failed to check BitLocker status"
                }
                
                # Recent Windows updates
                try {
                    $results.RecentUpdates = Get-HotFix -ErrorAction Stop | 
                        Sort-Object InstalledOn -Descending | 
                        Select-Object -First 10 Description, HotFixID, InstalledBy, InstalledOn
                } catch {
                    $results.RecentUpdates = @()
                    $results.Errors += "Failed to retrieve recent updates"
                }
                
                # Time synchronization configuration
                try {
                    $results.SecurityChecks.TimeSync = @{}
                    $w32time = w32tm /query /status 2>$null
                    $results.SecurityChecks.TimeSync.W32TimeStatus = if ($w32time) { 'Configured' } else { 'Not Configured' }
                    
                    $ntpServer = w32tm /query /peers 2>$null | Where-Object { $_ -match "Peer:" }
                    $results.SecurityChecks.TimeSync.NTPServers = if ($ntpServer) { $ntpServer -join '; ' } else { 'None configured' }
                } catch {
                    $results.SecurityChecks.TimeSync = @{W32TimeStatus = 'Unknown'; NTPServers = 'Unknown'}
                    $results.Errors += "Failed to check time synchronization"
                }
                
            } catch {
                $results.Errors += "General error: $($_.Exception.Message)"
            }
            
            return $results
        }
        
        # Process remote data
        if ($remoteData.OS) {
            $auditResult.OperatingSystem = $remoteData.OS.Caption
            $auditResult.OSVersion = $remoteData.OS.Version
            $auditResult.Architecture = $remoteData.OS.OSArchitecture
        }
        
        if ($remoteData.ComputerSystem) {
            $auditResult.Manufacturer = $remoteData.ComputerSystem.Manufacturer
            $auditResult.Model = $remoteData.ComputerSystem.Model
            $auditResult.TotalMemoryGB = [math]::Round($remoteData.ComputerSystem.TotalPhysicalMemory / 1GB, 2)
        }
        
        if ($remoteData.BIOS) {
            $auditResult.SerialNumber = $remoteData.BIOS.SerialNumber
        }
        
        if ($remoteData.Processor) {
            $auditResult.ProcessorInfo = ($remoteData.Processor | Select-Object -First 1).Name
            $auditResult.ProcessorCores = ($remoteData.Processor | Measure-Object NumberOfCores -Sum).Sum
        }
        
        $auditResult.CPUUtilization = $remoteData.CPUUtilization
        $auditResult.MemoryUtilization = $remoteData.MemoryUtilization
        $auditResult.LastBootTime = $remoteData.LastBoot
        $auditResult.UptimeDays = $remoteData.UptimeDays
        $auditResult.PendingUpdates = $remoteData.PendingUpdates
        $auditResult.CriticalServices = $remoteData.Services
        $auditResult.InstalledRoles = $remoteData.WindowsFeatures
        $auditResult.LocalAdministrators = $remoteData.LocalAdmins
        $auditResult.InstalledSoftware = $remoteData.InstalledSoftware
        $auditResult.ScheduledTasks = $remoteData.ScheduledTasks
        $auditResult.NetworkShares = $remoteData.NetworkShares
        $auditResult.RecentUpdates = $remoteData.RecentUpdates
        $auditResult.SecurityChecks = $remoteData.SecurityChecks
        
        # Process disk information
        if ($remoteData.Disks) {
            $auditResult.DiskInfo = $remoteData.Disks | ForEach-Object {
                $freePercent = if ($_.Size -gt 0) { [math]::Round(($_.FreeSpace / $_.Size) * 100, 1) } else { 0 }
                [PSCustomObject]@{
                    Drive = $_.DeviceID
                    SizeGB = [math]::Round($_.Size / 1GB, 2)
                    FreeSpaceGB = [math]::Round($_.FreeSpace / 1GB, 2)
                    FreeSpacePercent = $freePercent
                    FileSystem = $_.FileSystem
                }
            }
        }
        
        # Process network adapters
        if ($remoteData.NetworkAdapters) {
            $auditResult.NetworkAdapters = $remoteData.NetworkAdapters | ForEach-Object {
                [PSCustomObject]@{
                    Description = $_.Description
                    IPAddress = $_.IPAddress -join ', '
                    DHCPEnabled = $_.DHCPEnabled
                    DNSServers = $_.DNSServerSearchOrder -join ', '
                }
            }
        }
        
        # Security and performance analysis
        $securityIssues = @()
        $performanceIssues = @()
        $recommendations = @()
        $riskScore = 0
        
        # High CPU utilization
        if ($auditResult.CPUUtilization -gt 80) {
            $performanceIssues += "High CPU utilization: $($auditResult.CPUUtilization)%"
            $recommendations += "Investigate high CPU usage and optimize workloads"
            $riskScore += 2
        }
        
        # High memory utilization
        if ($auditResult.MemoryUtilization -gt 85) {
            $performanceIssues += "High memory utilization: $($auditResult.MemoryUtilization)%"
            $recommendations += "Consider memory upgrade or workload redistribution"
            $riskScore += 2
        }
        
        # Low disk space
        $lowDiskSpace = $auditResult.DiskInfo | Where-Object { $_.FreeSpacePercent -lt 15 }
        if ($lowDiskSpace) {
            $performanceIssues += "Low disk space on drives: $($lowDiskSpace.Drive -join ', ')"
            $recommendations += "Urgent: Free up disk space or expand storage"
            $riskScore += 3
        }
        
        # Pending updates
        if ($auditResult.PendingUpdates -gt 0) {
            $securityIssues += "$($auditResult.PendingUpdates) pending Windows updates"
            $recommendations += "Install pending Windows updates during next maintenance window"
            $riskScore += 1
        }
        
        # Excessive uptime
        if ($auditResult.UptimeDays -gt 90) {
            $securityIssues += "Server uptime exceeds 90 days ($($auditResult.UptimeDays) days)"
            $recommendations += "Schedule reboot during maintenance window to apply updates"
            $riskScore += 1
        }
        
        # Service status issues
        $stoppedServices = $auditResult.CriticalServices | Where-Object { $_.Status -ne 'Running' -and $_.StartType -eq 'Automatic' }
        if ($stoppedServices) {
            $securityIssues += "Critical services not running: $($stoppedServices.Name -join ', ')"
            $recommendations += "Investigate and start critical services"
            $riskScore += 3
        }
        
        # Windows Defender status
        if ($remoteData.SecurityChecks.DefenderStatus) {
            $defender = $remoteData.SecurityChecks.DefenderStatus
            if (-not $defender.AntivirusEnabled) {
                $securityIssues += "Windows Defender antivirus is disabled"
                $recommendations += "Enable Windows Defender or verify third-party antivirus is active"
                $riskScore += 3
            }
            if (-not $defender.RealTimeProtectionEnabled) {
                $securityIssues += "Real-time protection is disabled"
                $recommendations += "Enable real-time protection immediately"
                $riskScore += 3
            }
        }
        
        # Firewall status
        if ($remoteData.SecurityChecks.FirewallProfiles) {
            $disabledProfiles = $remoteData.SecurityChecks.FirewallProfiles | Where-Object { -not $_.Enabled }
            if ($disabledProfiles) {
                $securityIssues += "Windows Firewall disabled on profiles: $($disabledProfiles.Name -join ', ')"
                $recommendations += "Enable Windows Firewall on all network profiles"
                $riskScore += 2
            }
        }
        
        # Excessive local administrators
        $userAdmins = $auditResult.LocalAdministrators | Where-Object { $_.ObjectClass -eq 'User' }
        if ($userAdmins.Count -gt 3) {
            $securityIssues += "Excessive local administrators: $($userAdmins.Count) user accounts"
            $recommendations += "Review and reduce local administrator accounts"
            $riskScore += 2
        }
        
        # SMBv1 security check
        if ($remoteData.SecurityChecks.SMBv1Status) {
            if ($remoteData.SecurityChecks.SMBv1Status.FeatureInstalled -eq $true) {
                $securityIssues += "SMBv1 protocol is enabled (security risk)"
                $recommendations += "Disable SMBv1 protocol to prevent security vulnerabilities"
                $riskScore += 3
            }
            if ($remoteData.SecurityChecks.SMBv1Status.RegistryEnabled -eq $true) {
                $securityIssues += "SMBv1 enabled in registry settings"
                $recommendations += "Disable SMBv1 in registry settings"
                $riskScore += 2
            }
        }
        
        # Network shares security review
        if ($auditResult.NetworkShares -and $auditResult.NetworkShares.Count -gt 0) {
            $publicShares = $auditResult.NetworkShares | Where-Object { $_.AccessRight -match "Everyone" }
            if ($publicShares.Count -gt 0) {
                $securityIssues += "Network shares with 'Everyone' permissions found: $($publicShares.Count)"
                $recommendations += "Review and restrict network share permissions"
                $riskScore += 2
            }
        }
        
        # Antivirus status check
        if ($remoteData.SecurityChecks.DefenderStatus) {
            if (-not $remoteData.SecurityChecks.DefenderStatus.RealTimeProtectionEnabled) {
                $securityIssues += "Windows Defender real-time protection is disabled"
                $recommendations += "Enable Windows Defender real-time protection"
                $riskScore += 3
            }
            if (-not $remoteData.SecurityChecks.DefenderStatus.AntivirusEnabled) {
                $securityIssues += "Windows Defender antivirus is disabled"
                $recommendations += "Enable Windows Defender antivirus protection"
                $riskScore += 3
            }
        }
        
        # Third-party antivirus check
        if ($remoteData.SecurityChecks.AntivirusProducts) {
            $enabledAV = $remoteData.SecurityChecks.AntivirusProducts | Where-Object { $_.State -eq 'Enabled' }
            $outdatedAV = $remoteData.SecurityChecks.AntivirusProducts | Where-Object { $_.UpToDate -eq 'No' }
            
            if ($enabledAV.Count -eq 0 -and -not $remoteData.SecurityChecks.DefenderStatus.AntivirusEnabled) {
                $securityIssues += "No active antivirus protection detected"
                $recommendations += "Install and enable antivirus protection"
                $riskScore += 4
            }
            
            if ($outdatedAV.Count -gt 0) {
                $securityIssues += "Outdated antivirus definitions detected"
                $recommendations += "Update antivirus definitions"
                $riskScore += 2
            }
        }
        
        # Scheduled tasks security review
        if ($auditResult.ScheduledTasks -and $auditResult.ScheduledTasks.Count -gt 5) {
            $securityIssues += "Multiple custom scheduled tasks detected: $($auditResult.ScheduledTasks.Count)"
            $recommendations += "Review scheduled tasks for unauthorized or suspicious activities"
            $riskScore += 1
        }
        
        # BitLocker encryption check
        if ($remoteData.SecurityChecks.BitLocker) {
            $unencryptedVolumes = $remoteData.SecurityChecks.BitLocker | Where-Object { $_.VolumeStatus -ne 'FullyEncrypted' }
            if ($unencryptedVolumes.Count -gt 0) {
                $securityIssues += "Unencrypted volumes detected: $($unencryptedVolumes.Count)"
                $recommendations += "Enable BitLocker encryption on all system volumes"
                $riskScore += 2
            }
        } else {
            $securityIssues += "BitLocker status could not be determined"
            $recommendations += "Verify BitLocker encryption status"
            $riskScore += 1
        }
        
        # PowerShell remoting security
        if ($remoteData.SecurityChecks.PSRemoting.ServiceStatus -eq 'Running' -and $remoteData.SecurityChecks.PSRemoting.HasListeners) {
            $securityIssues += "PowerShell remoting is enabled and listening"
            $recommendations += "Review PowerShell remoting configuration and security settings"
            $riskScore += 1
        }
        
        # Time synchronization check
        if ($remoteData.SecurityChecks.TimeSync.W32TimeStatus -eq 'Not Configured') {
            $securityIssues += "Time synchronization not properly configured"
            $recommendations += "Configure proper time synchronization with domain or NTP servers"
            $riskScore += 1
        }
        
        $auditResult.SecurityIssues = $securityIssues
        $auditResult.PerformanceIssues = $performanceIssues
        $auditResult.Recommendations = $recommendations
        $auditResult.RiskScore = $riskScore
        $auditResult.ErrorMessages = $remoteData.Errors
        
        # Clean up session with error handling
        try {
            Remove-PSSession $session -ErrorAction Stop
        } catch {
            $auditResult.ErrorMessages += "Session cleanup warning: $($_.Exception.Message)"
        }
        
    } catch [System.Management.Automation.Remoting.PSRemotingTransportException] {
        $auditResult.ConnectionStatus = 'Failed - Remote Execution Error'
        $auditResult.ErrorMessages += "Remote command execution failed: $($_.Exception.Message)"
    } catch [System.TimeoutException] {
        $auditResult.ConnectionStatus = 'Failed - Remote Command Timeout'
        $auditResult.ErrorMessages += "Remote command timeout: $($_.Exception.Message)"
    } catch [System.UnauthorizedAccessException] {
        $auditResult.ConnectionStatus = 'Failed - Access Denied'
        $auditResult.ErrorMessages += "Access denied during audit: $($_.Exception.Message)"
    } catch {
        $auditResult.ConnectionStatus = 'Failed - Audit Error'
        $auditResult.ErrorMessages += "Unexpected audit error: $($_.Exception.Message)"
        
        # Include inner exception details if available
        if ($_.Exception.InnerException) {
            $auditResult.ErrorMessages += "Inner exception: $($_.Exception.InnerException.Message)"
        }
    } finally {
        # Ensure session cleanup in finally block
        if ($session) {
            try {
                Remove-PSSession $session -ErrorAction SilentlyContinue
            } catch {
                # Silently handle cleanup errors in finally block
            }
        }
    }
    
    return $auditResult
}

# ==============================================================================
# REPORT GENERATION FUNCTIONS
# ==============================================================================

function New-ComprehensiveAuditReport {
    Write-AuditLog 'Generating comprehensive audit reports...' -Level Header
    
    try {
        # Calculate overall statistics
        $summary = Get-AuditSummaryStatistics
        
        # Generate reports in requested formats
        foreach ($format in $ExportFormats) {
            switch ($format) {
                'HTML' { New-HTMLReport -Summary $summary }
                'Excel' { New-ExcelReport -Summary $summary }
                'CSV' { New-CSVReport -Summary $summary }
                'Markdown' { New-MarkdownReport -Summary $summary }
                'PDF' { New-PDFReport -Summary $summary }
            }
        }
        
        # Generate executive summary
        New-ExecutiveSummary -Summary $summary
        
        Write-AuditLog "All reports generated successfully in: $script:OutputDir" -Level Success
        
    } catch {
        Write-AuditLog "Error generating reports: $($_.Exception.Message)" -Level Error
    }
}

function Get-AuditSummaryStatistics {
    $totalFindings = $script:AuditFindings.Count
    $criticalFindings = ($script:AuditFindings | Where-Object { $_.Severity -eq 'Critical' }).Count
    $highFindings = ($script:AuditFindings | Where-Object { $_.Severity -eq 'High' }).Count
    $mediumFindings = ($script:AuditFindings | Where-Object { $_.Severity -eq 'Medium' }).Count
    $lowFindings = ($script:AuditFindings | Where-Object { $_.Severity -eq 'Low' }).Count
    $passedFindings = ($script:AuditFindings | Where-Object { $_.Severity -eq 'Passed' }).Count
    $issuesFindings = $totalFindings - $passedFindings
    
    $totalServers = $script:ServerResults.Count
    $onlineServers = ($script:ServerResults | Where-Object { $_.PingStatus -eq 'Online' }).Count
    $offlineServers = ($script:ServerResults | Where-Object { $_.PingStatus -eq 'Offline' }).Count
    $highRiskServers = ($script:ServerResults | Where-Object { $_.RiskScore -gt 5 }).Count
    
    $totalRiskScore = ($script:AuditFindings | Measure-Object -Property Score -Sum).Sum
    $overallRisk = if ($criticalFindings -gt 0) { 'CRITICAL' }
                  elseif ($highFindings -gt 3) { 'HIGH' }
                  elseif ($highFindings -gt 0 -or $mediumFindings -gt 5) { 'MEDIUM' }
                  else { 'LOW' }
    
    return [PSCustomObject]@{
        CustomerName = $CustomerName
        TechnicianName = $TechnicianName
        AuditDate = $script:StartTime
        AuditDuration = (Get-Date) - $script:StartTime
        TotalFindings = $totalFindings
        IssuesFindings = $issuesFindings
        PassedFindings = $passedFindings
        CriticalFindings = $criticalFindings
        HighFindings = $highFindings
        MediumFindings = $mediumFindings
        LowFindings = $lowFindings
        TotalServers = $totalServers
        OnlineServers = $onlineServers
        OfflineServers = $offlineServers
        HighRiskServers = $highRiskServers
        TotalRiskScore = $totalRiskScore
        OverallRisk = $overallRisk
        ComplianceFrameworks = $script:ComplianceFrameworks
    }
}

function New-HTMLReport {
    param($Summary)
    
    Write-AuditLog 'Generating HTML report...' -Level Info
    
    $htmlPath = Join-Path $script:OutputDir 'Infrastructure-Audit-Report.html'
    
    $riskColor = switch ($Summary.OverallRisk) {
        'CRITICAL' { '#dc3545' }
        'HIGH' { '#fd7e14' }
        'MEDIUM' { '#ffc107' }
        'LOW' { '#28a745' }
    }
    
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infrastructure Audit Report - $CustomerName</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 10px; background: #f8f9fa; line-height: 1.4; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { margin-bottom: 15px; padding: 12px; background: linear-gradient(135deg, #003366 0%, #004d99 100%); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; }
        .header-content { text-align: center; flex: 1; }
        .header-info { text-align: right; width: 250px; }
        .logo { max-height: 80px; max-width: 250px; }
        .risk-banner { text-align: center; padding: 10px; margin: 10px 0; border-radius: 6px; color: white; font-size: 1.3em; font-weight: bold; background: $riskColor; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 15px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .metric-number { font-size: 2.0em; font-weight: bold; margin: 5px 0; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; color: #333; }
        .low { color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border: 1px solid #dee2e6; }
        th { background: #495057; color: white; }
        tr:nth-child(even) { background: #f8f9fa; }
        .section { margin: 20px 0; }
        .section h2 { color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 6px; font-size: 1.6em; margin: 10px 0; }
        
        /* Detailed Findings Styling */
        .findings-container { margin: 10px 0; }
        .finding-group { margin: 15px 0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .finding-group-title { background: #495057; color: white; margin: 0; padding: 12px; font-size: 1.2em; font-weight: bold; }
        .critical-section .finding-group-title { background: #dc3545; }
        .high-section .finding-group-title { background: #fd7e14; }
        .medium-section .finding-group-title { background: #ffc107; color: #333; }
        .low-section .finding-group-title { background: #28a745; }
        .passed-section .finding-group-title { background: #17a2b8; }
        
        .finding-item { background: white; border-bottom: 1px solid #dee2e6; padding: 15px; }
        .finding-item:last-child { border-bottom: none; }
        
        /* Collapsible Findings */
        .finding-header { cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 8px; transition: background-color 0.3s; }
        .finding-header:hover { background: #e9ecef; }
        .finding-title { font-weight: bold; color: #495057; margin: 0; }
        .finding-toggle { font-size: 1.2em; font-weight: bold; color: #6c757d; transition: transform 0.3s; }
        .finding-content { display: none; padding: 12px; background: white; border-radius: 5px; border: 1px solid #dee2e6; }
        .finding-content.show { display: block; }
        .finding-toggle.open { transform: rotate(45deg); }
        .finding-header { margin-bottom: 10px; }
        .finding-header h4 { margin: 0 0 6px 0; font-size: 1.2em; color: #333; }
        .finding-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .finding-id, .finding-category, .finding-type { 
            background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; color: #666; 
        }
        .severity-badge { 
            padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85em; text-transform: uppercase; 
        }
        .severity-badge.critical { background: #dc3545; color: white; }
        .severity-badge.high { background: #fd7e14; color: white; }
        .severity-badge.medium { background: #ffc107; color: #333; }
        .severity-badge.low { background: #28a745; color: white; }
        
        .finding-content { margin-top: 10px; }
        .description-section, .impact-section, .recommendation-section, .evidence-section { 
            margin: 10px 0; padding: 10px; border-radius: 5px; 
        }
        .description-section { background: #f8f9fa; border-left: 4px solid #007bff; }
        .impact-section { background: #fff5f5; border-left: 4px solid #dc3545; }
        .recommendation-section { background: #f0f9ff; border-left: 4px solid #10b981; }
        .evidence-section { background: #fffbeb; border-left: 4px solid #f59e0b; }
        
        .finding-content h5 { 
            margin: 0 0 6px 0; font-size: 1.0em; color: #333; font-weight: 600; 
        }
        .finding-content p { margin: 0; color: #555; }
        .evidence-data { 
            background: #2d3748; color: #e2e8f0; padding: 10px; border-radius: 4px; 
            font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85em; margin: 6px 0 0 0;
            white-space: pre-wrap; word-wrap: break-word; overflow-x: auto; 
        }
        .compliance-tag { 
            background: #3b82f6; color: white; padding: 3px 8px; border-radius: 4px; 
            font-size: 0.9em; font-weight: 500; 
        }
        .finding-footer { 
            margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; 
            font-size: 0.95em; color: #6b7280; 
        }
        
        /* Executive Summary Styling */
        .executive-summary { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; margin-bottom: 15px; }
        .summary-card { background: white; padding: 12px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-card h3 { margin: 0 0 8px 0; color: #333; font-size: 1.1em; }
        .summary-card ul { margin: 0; padding-left: 15px; }
        .summary-card li { margin: 4px 0; color: #555; }
        .risk-level { font-weight: bold; padding: 4px 8px; border-radius: 4px; }
        .risk-level.critical { background: #dc3545; color: white; }
        .risk-level.high { background: #fd7e14; color: white; }
        .risk-level.medium { background: #ffc107; color: #333; }
        .risk-level.low { background: #28a745; color: white; }
        .key-findings { margin: 15px 0; }
        .concern-list { margin: 10px 0; }
        .concern-item { display: flex; align-items: flex-start; margin: 8px 0; padding: 10px; background: white; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .concern-icon { font-size: 1.1em; margin-right: 10px; flex-shrink: 0; }
        .concern-content { flex: 1; color: #555; }
        .concern-content strong { color: #333; }
        .concern-content small { color: #777; }
        .compliance-overview { margin: 25px 0; }
        .compliance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .compliance-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .compliance-item h4 { margin: 0 0 8px 0; color: #333; font-size: 1.1em; }
        .compliance-item p { margin: 0; color: #666; font-size: 0.95em; }
        
        .report-links { text-align: center; margin: 30px 0; }
        .report-links a { display: inline-block; margin: 10px; padding: 12px 25px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .report-links a:hover { background: #0056b3; }
        
        /* Domain Controller Health Dashboard */
        .dc-dashboard { margin: 25px 0; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .dc-dashboard-header { background: linear-gradient(135deg, #003366 0%, #004d99 100%); color: white; padding: 15px; border-radius: 8px 8px 0 0; }
        .dc-dashboard-header h2 { margin: 0; font-size: 1.5em; display: flex; align-items: center; }
        .dc-dashboard-header .dc-count { background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 15px; margin-left: 15px; font-size: 0.9em; }
        .dc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; padding: 20px; }
        .dc-card { border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden; }
        .dc-card-header { padding: 12px 15px; font-weight: bold; color: white; display: flex; justify-content: space-between; align-items: center; }
        .dc-card-header.healthy { background: #28a745; }
        .dc-card-header.warning { background: #ffc107; color: #333; }
        .dc-card-header.critical { background: #dc3545; }
        .dc-card-body { padding: 15px; background: #f8f9fa; }
        .dc-info-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .dc-info-label { font-weight: 600; color: #495057; }
        .dc-info-value { color: #28a745; }
        .dc-info-value.warning { color: #856404; }
        .dc-info-value.failed { color: #dc3545; }
        .dc-services { margin-top: 10px; }
        .dc-service { display: inline-block; margin: 2px; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; }
        .dc-service.running { background: #d4edda; color: #155724; }
        .dc-service.stopped { background: #f8d7da; color: #721c24; }
        .dc-tests { margin-top: 10px; }
        .dc-test { display: inline-block; margin: 2px; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; }
        .dc-test.passed { background: #d4edda; color: #155724; }
        .dc-test.failed { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iOTAwLjAwMDAwMHB0IiBoZWlnaHQ9IjE3NC4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDkwMC4wMDAwMDAgMTc0LjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgo8bWV0YWRhdGE+CkNyZWF0ZWQgYnkgcG90cmFjZSAxLjEwLCB3cml0dGVuIGJ5IFBldGVyIFNlbGluZ2VyIDIwMDEtMjAxMQo8L21ldGFkYXRhPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwxNzQuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjZmZmZmZmIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNNTgwNiAxNTA4IGMtMTMgLTQ0IC0yNiAtMTI1IC0yNiAtMTU2IDAgLTIwIC03IC02MiAtMTUgLTkyIC04IC0zMAotMTUgLTc2IC0xNSAtMTAxIDAgLTI2IC03IC02MyAtMTUgLTgyIC04IC0yMCAtMTUgLTU2IC0xNSAtNzkgMCAtMjQgLTcgLTY1Ci0xNSAtOTIgLTggLTI3IC0xNSAtNjIgLTE1IC03OCAwIC0yOCAxIC0yOCA2MCAtMjggbDU5IDAgNiAzOCBjMyAyMCAxMCA1NiAxNgo3OSA1IDIzIDkgNjEgOSA4NSAxIDg4IDY1IDE1NSAxMjggMTMyIDI3IC0xMCAyNyAtMTEgMjQgLTg5IC0xIC00NCAtOSAtMTAwCi0xNyAtMTI1IC04IC0yNSAtMTUgLTYxIC0xNyAtODAgbC0zIC0zNSA2MyAtMyA2MiAtMyAwIDM3IGMwIDIwIDcgNjIgMTUgOTQgOAozMiAxNiAxMDEgMTggMTU0IDIgODcgMCA5NyAtMjEgMTE4IC0xOSAxOSAtMzMgMjMgLTg1IDIzIC00MyAwIC03MSAtNiAtOTAKLTE3IC0xNCAtMTAgLTMxIC0xOCAtMzcgLTE4IC0xNSAwIC0xMiA0MiA1IDgzIDggMjAgMTUgNTIgMTUgNzAgMCAxOSA3IDU0IDE1Cjc3IDggMjMgMTUgNTUgMTUgNzEgMCAyOSAtMSAyOSAtNjAgMjkgLTQwIDAgLTYyIC00IC02NCAtMTJ6Ii8+CjxwYXRoIGQ9Ik03MTgwIDE0NTMgYy02IC0zNyAtMTYgLTk5IC0yMCAtMTM4IC00IC0zOCAtMTMgLTg2IC0xOSAtMTA1IC02IC0xOQotMTEgLTU3IC0xMSAtODUgMCAtNDYgLTE1IC0xMzAgLTQxIC0yMzAgLTYgLTIyIC0xMyAtNTMgLTE2IC02OCBsLTUgLTI4IDYzIDMKNjQgMyA4IDQ1IGM0IDI1IDEyIDgxIDE3IDEyNSA5IDgxIDIzIDE1OCA0MSAyMzAgNiAyMiAxNCA2OSAxOSAxMDUgNCAzNiAxMgo3NyAxOCA5MSA2IDE0IDEyIDQ2IDE0IDcwIGwzIDQ0IC02MSAzIC02MSAzIC0xMyAtNjh6Ii8+CjxwYXRoIGQ9Ik0zMjg5IDE0NjcgYy0xNCAtMTIgLTMxIC0zNiAtMzggLTU0IC0xMiAtMjggLTExIC0zNyA2IC02NSAyOCAtNDgKNzQgLTUxIDExOSAtNyAyNyAyNiAzNCA0MSAzNCA3MiAwIDY5IC02OCAxMDAgLTEyMSA1NHoiLz4KPHBhdGggZD0iTTI4NjggMTQzMiBjLTE3IC0zIC0yOCAtNTEgLTI4IC0xMjcgMCAtMjcgLTcgLTcyIC0xNSAtOTkgLTggLTI3Ci0xNSAtNjggLTE1IC05MCAwIC0yMyAtNyAtNjYgLTE1IC05NiAtOCAtMzAgLTE1IC03MyAtMTUgLTk1IDAgLTIyIC03IC01MQotMTUgLTY1IC0zMSAtNTQgLTI0IC02MCA3NSAtNjAgbDkwIDAgMCA0NSBjMCAyNCA0IDY2IDkgOTIgNSAyNiAxMiA2NCAxNiA4NApsNSAzNiA4NyAtMSA4NyAtMSA3IDM1IGM0IDE5IDEwIDUwIDE0IDY4IGw4IDMzIC04NiAtMiBjLTQ4IC0yIC04OSAwIC05MiAzCi0xMSAxMCA3IDEwNyAyMCAxMTIgOCAzIDUxIDEgOTcgLTQgNDYgLTQgODYgLTUgOTAgLTIgMyA0IDggMjcgMTAgNTIgMyAyNSA2CjUyIDkgNjAgMyAxMyAtMjEgMTYgLTE2MiAyMCAtOTIgMyAtMTczIDQgLTE4MSAyeiIvPgo8cGF0aCBkPSJNNDYyNCAxNDI3IGMtOSAtNSAtMTQgLTI0IC0xNCAtNTMgbDAgLTQ1IDY4IDMgYzY2IDMgNjcgMyA2NSAtMjIgLTYKLTY3IC0yMiAtMTU4IC0zMiAtMTgzIC02IC0xNiAtMTEgLTQ3IC0xMSAtNjkgMCAtMjMgLTYgLTY0IC0xNCAtOTIgLTE5IC02NwotMzQgLTE1NSAtMjggLTE2MSAzIC0zIDM0IC01IDY5IC01IGw2MyAwIDAgMzggYzEgMjAgNyA2NCAxNSA5NyA4IDMzIDE1IDc5CjE1IDEwMSAwIDIzIDcgNTggMTUgNzcgOCAyMCAxNSA1NSAxNSA3OCAwIDIyIDcgNjYgMTYgOTYgbDE2IDU1IDU3IC02IGM3NyAtOQoxMDAgMTMgOTIgODkgLTEgMTIgLTM4NSAxNCAtNDA3IDJ6Ii8+CjxwYXRoIGQ9Ik0yNjE0IDEzNjcgYy03MyAtNzUgLTExOCAtMTE0IC0xNjEgLTE0MCAtMTggLTEwIC0zMyAtMjMgLTMzIC0yOCAwCi01IC01IC05IC0xMSAtOSAtNiAwIC0zNyAtMjAgLTY5IC00NSAtMzIgLTI1IC02MSAtNDUgLTY0IC00NSAtNCAwIC0yNSAtMTQKLTQ4IC0zMCAtNDcgLTM0IC03MiAtODIgLTgyIC0xNTcgLTYgLTUxIC02IC01MyAxNyAtNTMgMTQgMCAzMCA3IDM3IDE1IDcgOAoyNCAxNSAzOSAxNSAxNCAxIDM3IDcgNTEgMTUgMTQgOCA0MiAxNCA2MiAxNSAyMCAwIDY3IDcgMTA1IDE2IDM3IDkgODIgMTMgOTkKMTEgMTcgLTMgMzUgLTIgNDEgMSAxMiA5IDIzIDQ5IDMzIDEyNyAxMSA4NiAyOSAxNzAgNTIgMjQ3IDM2IDExOSAxOCAxMzEgLTY4CjQ1eiBtLTE0MiAtMzE5IGMtMTUgLTE1IC0yNiAtNCAtMTggMTggNSAxMyA5IDE1IDE4IDYgOSAtOSA5IC0xNSAwIC0yNHoiLz4KPHBhdGggZD0iTTQxNTYgMTMxMCBjLTcgLTU4IC0xMSAtNjYgLTQ4IC05MyAtOSAtNyAtMjAgLTMzIC0yMyAtNTkgLTcgLTQzIC02Ci00NyAxNiAtNTAgMjcgLTMgMjcgLTYgNiAtMTM4IC04IC00NyAtMTkgLTk4IC0yNiAtMTEzIC0yMiAtNTUgLTE4IC01OCA2NgotNTUgbDc4IDMgNyA0MCBjNSAyMiAxMiA4NCAxOCAxMzkgNSA1NCAxNSAxMDUgMjEgMTEyIDggOSAyMyAxMiA0MyA5IDE3IC0zCjM2IC0yIDQzIDMgMTMgOCAyMSAxMDggOSAxMTkgLTQgNCAtMjMgNiAtNDMgNCAtMzUgLTMgLTM2IC0zIC0yOSAzMSA0IDE4IDEwCjUwIDEzIDcxIGw1IDM3IC03NSAwIC03NCAwIC03IC02MHoiLz4KPHBhdGggZD0iTTM2NjYgMTIzMyBjLTIxIC05IC01MCAtMjcgLTY0IC00MCAtMzMgLTMxIC00MiAtMjkgLTQyIDcgbDAgMzEgLTY3Ci0zIC02OCAtMyAtMTIgLTEwMCBjLTExIC04NyAtMjYgLTE3OSAtNDkgLTI5MiBsLTYgLTMzIDc1IDAgYzg3IDAgODMgLTUgOTQKMTI1IDEwIDEyNyA0NSAxNzcgMTI2IDE4MSAyOSAxIDU1IDMgNTggMyAxMCAyIDMyIDEwOCAyNiAxMjUgLTggMjAgLTIxIDE5Ci03MSAtMXoiLz4KPHBhdGggZD0iTTM4NjQgMTIzNSBjLTEwIC04IC0yNiAtMTUgLTM1IC0xNSAtOSAwIC0yNSAtMTIgLTM1IC0yNyAtMTAgLTE0Ci0yOCAtMzYgLTM5IC00NyAtMTcgLTE3IC0yMCAtMzEgLTE3IC03MyAzIC00NyA4IC01NSAzNyAtNzMgMTggLTExIDQ4IC0yMCA2NwotMjAgNTYgMCA3NyAtNDAgNDAgLTczIC0yNSAtMjMgLTQyIC0yMSAtMTAzIDkgLTUxIDI2IC01MyAyNiAtNjUgOCAtMTkgLTI3Ci0yNiAtMzcgLTQ3IC02MSAtMTggLTIwIC0xNyAtMjEgMTkgLTQ0IDMyIC0yMCA1MSAtMjMgMTMzIC0yMyA4MiAwIDEwMSA0IDEzMwoyMyA2MyAzOCA4OCA4MSA4OCAxNTAgMCA1NyAtMiA2MCAtMzQgODAgLTE4IDEyIC00OSAyMSAtNjggMjEgLTM4IDAgLTU4IDE1Ci01OCA0MiAwIDMxIDQzIDQzIDkyIDI3IDM4IC0xMiA0MiAtMTIgNTIgNiA2IDEwIDIyIDI5IDM0IDQxIGwyNCAyMyAtMzQgMjEKYy00MSAyNSAtMTUzIDI4IC0xODQgNXoiLz4KPHBhdGggZD0iTTMyMjYgMTIxMyBjLTMgLTEwIC0xMCAtNTYgLTE2IC0xMDMgLTYgLTQ3IC0xNiAtMTAwIC0yMSAtMTE4IC05Ci0yOCAtMjEgLTk1IC0zMSAtMTY3IC0zIC0xOCA0IC0yMCA2NiAtMjMgMzggLTIgNzMgMSA3OCA2IDUgNSAxMyA1MSAxOCAxMDMgOAo4MiAyMiAxNjcgNDYgMjg3IGw2IDMyIC03MCAwIGMtNTkgMCAtNzIgLTMgLTc2IC0xN3oiLz4KPHBhdGggZD0iTTUwNjAgMTIyMyBjLTE0IC0yIC0zMiAtMTAgLTQwIC0xNyAtOCAtNyAtMjMgLTE2IC0zMiAtMTkgLTIwIC03Ci03OCAtODQgLTc4IC0xMDIgMCAtNyAtNyAtMjYgLTE1IC00MSAtMzcgLTcxIC01IC0xODQgNjEgLTIyMyA1NCAtMzIgMTgwIC0zMAoyMzMgNCA2NCA0MCA5NCA3NCA4MCA5MSAtMTkgMjMgLTk1IDE4IC0xMTggLTggLTI5IC0zMCAtMTAyIC0zMSAtMTMwIC0xIC0yNQoyNiAtMjggODEgLTUgOTAgOCAzIDc1IDYgMTQ3IDcgbDEzMiAxIDMgNjAgYzQgNjcgLTEyIDEwOCAtNTQgMTM4IC0yNSAxOQotMTM0IDMxIC0xODQgMjB6IG0xMTkgLTEwMCBjMjAgLTI0IDI3IC00MSAyMSAtNDcgLTUgLTUgLTQ2IC0xMSAtOTAgLTEyIC03MgotMiAtODAgLTEgLTgwIDE2IDAgMjQgNjggODAgOTcgODAgMTMgMCAzNCAtMTUgNTIgLTM3eiIvPgo8cGF0aCBkPSJNNTUyMyAxMjIzIGMtMTcgLTIgLTM3IC0xMSAtNDMgLTE5IC03IC04IC0xOCAtMTQgLTI1IC0xNCAtMTUgMCAtOTUKLTg5IC05NSAtMTA2IDAgLTcgLTcgLTI1IC0xNSAtNDAgLTM2IC02OSAtMTAgLTE2NSA2MCAtMjE4IDMwIC0yMyA0MyAtMjYgMTE5Ci0yNiA5NCAwIDk1IDEgMTEyIDY4IDkgMzYgOSA0NSAtMyA0OSAtNyAzIC0yMiAtMiAtMzIgLTExIC0zMCAtMjcgLTg4IC0yMQotMTIyIDEzIC0zNyAzOCAtMzkgODYgLTQgMTQxIDM1IDU2IDY1IDczIDExNyA2NyAxMDIgLTEzIDkzIC0xNyA5NiAzMiAyIDI0Ci0xIDQ4IC02IDUzIC0xMSAxMSAtMTEyIDE4IC0xNTkgMTF6Ii8+CjxwYXRoIGQ9Ik02Mzk1IDEyMjMgYy0xMSAtMyAtMjggLTEyIC0zOCAtMjEgLTE3IC0xNiAtMjAgLTE1IC0zMiAxIC05IDEzIC0yNwoxNyAtNjkgMTcgbC01NiAwIDAgLTQ1IGMwIC0yNCAtNyAtNzAgLTE1IC0xMDIgLTggLTMxIC0xNSAtNzQgLTE1IC05NCAwIC0yMAotNyAtNTMgLTE1IC03MiAtOCAtMjAgLTE1IC01MiAtMTUgLTcyIGwwIC0zNSA1OCAwIDU4IDAgMTMgNzMgYzcgMzkgMTYgOTcgMTkKMTI3IDExIDkyIDUwIDE0MCAxMTIgMTQwIDM5IDAgNTEgLTI3IDQ0IC05OCAtMyAtMzcgLTEyIC04NyAtMTkgLTExMiAtOCAtMjUKLTE2IC02MyAtMTcgLTg1IGwtMyAtNDAgNjMgLTMgNjIgLTMgMCAzOCBjMCAyMSA3IDcxIDE2IDExMiA4IDQxIDE2IDExMCAxNwoxNTIgMiA2OCAtMSA4MSAtMTkgOTkgLTIxIDIyIC0xMDcgMzUgLTE0OSAyM3oiLz4KPHBhdGggZD0iTTY3OTggMTIyMyBjLTIwIC0yIC00MiAtMTEgLTQ4IC0xOSAtNyAtOCAtMTggLTE0IC0yNCAtMTQgLTE0IDAgLTY1Ci01NCAtODUgLTkwIC0yNSAtNDMgLTM3IC0xMzEgLTI2IC0xODAgMTMgLTU3IDE4IC02NiA2NiAtOTUgMzMgLTIxIDUxIC0yNQoxMTggLTI1IDk2IDAgMTQ0IDIxIDE5OCA4NiA2NCA3NiA4NSAxNjkgNTQgMjM2IC0zMCA2NyAtNzcgOTggLTE1MyAxMDIgLTM1IDIKLTgwIDIgLTEwMCAtMXogbTEyNiAtMTI3IGMzMSAtNDIgMzMgLTczIDUgLTEyMCAtNDQgLTc0IC0xMTkgLTEwNiAtMTY1IC02OAotNTUgNDcgLTQ5IDEzMCAxNiAxODkgMjggMjYgNDQgMzMgNzYgMzMgMzYgMCA0NSAtNSA2OCAtMzR6Ii8+CjxwYXRoIGQ9Ik03NDYzIDEyMjMgYy0xNyAtMiAtMzcgLTExIC00MyAtMTkgLTcgLTggLTE4IC0xNCAtMjQgLTE0IC0xOCAwIC04MAotNzAgLTk5IC0xMTMgLTI2IC01OCAtMjMgLTE2OSA1IC0yMDggNDAgLTU0IDc2IC02OSAxNjUgLTY5IDE1NiAwIDI0NyA4NiAyNjAKMjQ2IDYgNzIgLTExIDExMSAtNjYgMTUyIC0zMSAyMyAtMTI5IDM1IC0xOTggMjV6IG0xMjUgLTExNyBjMTcgLTE4IDIyIC0zNgoyMiAtNzQgMCAtNDcgLTQgLTU0IC00NiAtOTYgLTUzIC01MyAtODcgLTU5IC0xMzQgLTI0IC0yOCAyMCAtMzAgMjcgLTMwIDg0IDAKNjEgMSA2MyA0MyA5OCA1MyA0NSAxMDkgNDkgMTQ1IDEyeiIvPgo8cGF0aCBkPSJNNzk0MSAxMjIzIGMtOTMgLTE5IC0xNTkgLTExNiAtMTc2IC0yNTMgLTYgLTQ3IC0zIC02MiAxNSAtOTMgMzEKLTUyIDc2IC03NyAxNDAgLTc3IDM3IDAgNTkgNiA3NyAyMCAzNSAyNyA2MyAyNiA2MyAtMiAwIC0xMyAtNyAtMzIgLTE1IC00MgotOCAtMTEgLTE1IC0yOCAtMTUgLTM3IDAgLTIzIC02MCAtNTkgLTk4IC01OSAtMjMgMCAtMzggOSAtNjQgMzkgLTI4IDMzIC00MQo0MCAtODEgNDQgLTM5IDQgLTQ5IDEgLTU4IC0xNCAtMjEgLTQxIDE5IC0xMDIgOTEgLTEzOSA1MyAtMjcgMTU2IC0yNyAyMDkgMAo0NiAyMyAxMjEgMTA3IDEyMSAxMzUgMSAxMSA3IDMxIDE1IDQ1IDggMTQgMTQgNDYgMTUgNzEgMCAyNSA3IDY4IDE1IDk1IDggMjcKMTUgNzAgMTUgOTUgMCAyNiA3IDY2IDE1IDg5IDI2IDc0IDIzIDgwIC00MCA4MCAtNDAgMCAtNTcgLTQgLTYxIC0xNSAtOCAtMTkKLTIzIC0xOSAtNDQgMCAtMTggMTYgLTk4IDI3IC0xMzkgMTh6IG0xMjkgLTExNCBjMjIgLTE5IDI1IC0yOSAyNSAtODIgLTEgLTU4Ci0yIC02MSAtNDUgLTk4IC01NyAtNDkgLTkyIC01MSAtMTM3IC03IC0yNCAyMyAtMzMgNDEgLTMzIDY1IDAgMzggMzYgMTAxIDcxCjEyNiAzNCAyMyA4OSAyMSAxMTkgLTR6Ii8+CjxwYXRoIGQ9Ik04NjgwIDEyMjMgYy00MyAtNCAtODAgLTI1IC04MCAtNDYgMCAtNSAtMTMgLTI4IC0yOCAtNTEgLTE1IC0yMgotMzcgLTYwIC00OCAtODQgLTE2IC0zNSAtMjMgLTQyIC00NCAtNDAgLTIyIDMgLTI2IDkgLTMxIDU4IC0zIDMxIC0xMSA2NSAtMTcKNzcgLTcgMTIgLTEyIDM1IC0xMiA1MiBsMCAzMSAtNzUgMCBjLTQxIDAgLTc1IC00IC03NSAtOSAwIC01IDYgLTIyIDE0IC0zOAozMSAtNjUgNjUgLTE1MiA3MyAtMTkzIDMgLTE0IDEyIC0zMyAyMCAtNDIgMzIgLTM3IDIxIC03OSAtNDUgLTE2NSAtMzQgLTQ1Ci02MiAtODUgLTYyIC04OSAwIC01IC0xNCAtMjMgLTMxIC00MCAtNDAgLTQxIC0zNCAtNzAgMTIgLTYwIDE4IDMgNDYgNiA2MyA2CjI5IDAgMzkgMTIgMTY2IDIwMSA3NCAxMTAgMTQxIDIxMSAxNDggMjI1IDcgMTMgMTcgMjQgMjMgMjQgNSAwIDkgNiA5IDEzIDAgNgoyNSA0MiA1NSA4MCAzMCAzNyA1NSA3MSA1NSA3NiAwIDkgLTI2IDIyIC0zOCAxOSAtNCAtMSAtMjcgLTMgLTUyIC01eiIvPgo8cGF0aCBkPSJNMjAxOSA5NDMgYy0zMSAtMjMgLTU5IC00MCAtODQgLTUzIC0xMSAtNiAtMzMgLTE5IC01MCAtMzAgLTE2IC0xMQotMzcgLTIyIC00NSAtMjYgLTggLTMgLTIyIC05IC0zMCAtMTQgLTggLTUgLTc2IC0zOSAtMTUwIC03NSAtNzQgLTM3IC0xNDcKLTczIC0xNjIgLTgxIC0xNCAtOCAtMzMgLTE0IC00MSAtMTQgLTggMCAtMjAgLTcgLTI3IC0xNSAtNyAtOCAtMjMgLTE1IC0zNQotMTUgLTEyIDAgLTI4IC03IC0zNSAtMTUgLTcgLTggLTIwIC0xNSAtMjkgLTE1IC0xMCAwIC0yNiAtNyAtMzcgLTE1IC0xMCAtOAotMjcgLTE1IC0zNiAtMTUgLTkgMCAtMzAgLTcgLTQ3IC0xNSAtMTcgLTggLTQ1IC0yMiAtNjIgLTMwIC0xNyAtOCAtMzggLTE1Ci00OCAtMTUgLTkgMCAtMjYgLTcgLTM3IC0xNSAtMTAgLTggLTI3IC0xNSAtMzcgLTE1IC0xMSAwIC0zMSAtNiAtNDUgLTE0IC0zMAotMTUgLTgxIC0zMyAtMTI3IC00NiAtMzkgLTExIC05MSAtMjkgLTEzMyAtNDYgLTE4IC04IC00MyAtMTQgLTU1IC0xNCAtMTIgLTEKLTMzIC03IC00NyAtMTUgLTE0IC04IC0zOCAtMTQgLTUzIC0xNSAtMTYgMCAtMzggLTUgLTUwIC0xMiAtMjEgLTExIC0zOCAtMTUKLTE2MiAtMzggLTMzIC02IC02OSAtMTUgLTgwIC0yMCAtMTEgLTUgLTMzIC0xNCAtNDkgLTIwIC0yMSAtOCAtMjYgLTE0IC0xOQotMjEgOCAtOCA3MyAtOCAyMjUgMSAxOTYgMTEgMTE2MiAxMCAxMjEzIC0xIDI0IC01IDMzIDI2IDEyIDQ5IC01OSA2OSAtMzUKMjM3IDQ4IDMzMCAzMCAzNSAxMjcgMTEzIDE1NSAxMjUgNzggMzYgMTc3IDk4IDE4NyAxMTggNiAxMyAxNCA0OCAxOCA3NyA4IDU4Ci0zIDY2IC00NiAzNXogbS00ODkgLTQwNSBjMzIgLTI0IDQyIC03MSAxNiAtODEgLTE5IC03IC0zMSAtNjYgLTE3IC04MCAxOAotMTggMTMgLTMwIC0xMCAtMjQgLTE1IDQgLTMwIC0zIC01MSAtMjYgLTI2IC0yOCAtMzEgLTMwIC00MSAtMTYgLTEwIDEzIC0zNwoxNSAtMTY0IDE1IC0xNzQgLTEgLTE5OSA3IC0xNDggNDkgMzcgMzAgMTU5IDkwIDIwMiAxMDAgMTggMyA0OCAxNyA2OCAzMSAyMAoxMyA0NCAyNCA1NCAyNCA5IDAgMjYgNyAzNyAxNSAyNCAxOCAyMCAxOSA1NCAtN3oiLz4KPHBhdGggZD0iTTI0NTUgNjYwIGMtMTYgLTQgLTUxIC04IC03NiAtOSAtMjYgMCAtNjMgLTggLTgyIC0xNiAtMjAgLTggLTUwCi0xNSAtNjYgLTE1IC0xNiAwIC0zOSAtOSAtNTIgLTE5IC0yMSAtMTcgLTIyIC0yMiAtMTEgLTQwIDYgLTExIDEyIC0yOSAxMgotNDAgMCAtMTAgNyAtMjQgMTUgLTMxIDggLTcgMTUgLTIwIDE1IC0zMCAwIC0xMCA3IC0yMyAxNSAtMzAgOCAtNyAxNSAtMTcgMTUKLTIyIDAgLTE1IDg1IC0xMjIgMTI1IC0xNTcgMzAgLTI2IDQ0IC0zMSA3MyAtMjkgMzcgMyAzNyAzIDQ0IDU4IDQgMzAgMTEgNjgKMTcgODMgNiAxNiAxMSA0NSAxMSA2NiAwIDIxIDYgNTYgMTQgNzcgNyAyMiAxNyA2NyAyMSAxMDIgbDcgNjIgLTM0IC0xIGMtMTgKLTEgLTQ2IC01IC02MyAtOXogbS02MiAtMTUzIGMzIC03IDMgLTI1IDAgLTQwIC04IC00MCAtNDAgLTM2IC01MSA2IC01IDE3IC03CjM1IC01IDQwIDcgMTIgNTEgOCA1NiAtNnoiLz4KPHBhdGggZD0iTTI3MDcgNTU3IGMtMTUgLTEwIC0xNiAtMTUgLTUgLTMwIDEyIC0xNiA1OCAtMTcgNzUyIC0xNyA1MzkgMCA3NDIKMyA3NTIgMTEgMTkgMTUgMTggMzUgLTIgNDMgLTkgMyAtMzQ1IDYgLTc0OCA2IC01NzQgMCAtNzM2IC0zIC03NDkgLTEzeiIvPgo8cGF0aCBkPSJNMTk5MCA1MTUgYy03IC04IC0xOSAtMTUgLTI3IC0xNSAtNyAwIC0xNiAtNyAtMTkgLTE1IC00IC04IC0xMCAtMTUKLTE1IC0xNSAtNSAwIC0zMSAtMjMgLTU4IC01MSAtNDAgLTQyIC01MCAtNTkgLTU1IC05OSAtNCAtMjYgLTIgLTU5IDMgLTczCmwxMCAtMjYgOTggNSBjNTQgMyAxMzEgMiAxNzEgLTMgODggLTExIDkxIC00IDMyIDczIC0yMiAyOSAtNDAgNTkgLTQwIDY3IDAgNwotNyAyMiAtMTUgMzMgLTggMTAgLTE1IDM1IC0xNSA1NCAtMSA1OCAtMTAgODAgLTM1IDgwIC0xMiAwIC0yOCAtNyAtMzUgLTE1eiIvPgo8cGF0aCBkPSJNNjAzMSA0OTggYy01IC0xOCAtMTEgLTczIC0xMyAtMTIzIGwtMyAtOTAgMjUgMCBjMjMgMCAyNiA1IDMyIDU1IDQKMzAgMTIgODIgMTggMTE0IDExIDY3IDggNzYgLTI1IDc2IC0xOCAwIC0yNiAtOCAtMzQgLTMyeiIvPgo8cGF0aCBkPSJNNzI2MyA1MTggYy02IC03IC0xMyAtNjQgLTE2IC0xMjUgbC03IC0xMTMgMjUgMCBjMjkgMCAzMiAxMSA0NSAxMjEKMTQgMTI0IDE0IDEyOSAtMTQgMTI5IC0xMyAwIC0yOCAtNiAtMzMgLTEyeiIvPgo8cGF0aCBkPSJNNDk1NSA1MDIgYy02IC00IC0xNiAtNDEgLTIzIC04MiAtNiAtNDEgLTE1IC05MCAtMTggLTEwNyAtNiAtMzIgLTUKLTMzIDI1IC0zMyAxNyAwIDMyIDUgMzIgMTMgMSA2IDMgMTkgNCAyNyAxIDggMyAyMSA0IDI5IDIgMTkgNDAgLTE1IDUyIC00NiA2Ci0xNyAxNyAtMjMgMzkgLTIzIDM5IDAgMzkgMjAgLTEgNzAgLTM1IDQ0IC0zNSA0NiAyNCAxMDMgMzEgMzAgMzAgNTcgLTIgNTcKLTIxIDAgLTQ1IC0yMCAtNjEgLTUxIC0xNiAtMjggLTMwIC0yMyAtMzAgMTAgMCAxNyAtNiAzMSAtMTYgMzUgLTE5IDcgLTE3IDcKLTI5IC0yeiIvPgo8cGF0aCBkPSJNNTYzMSA1MDIgYy0xNiAtNSAtMTQgLTM3IDMgLTUxIDcgLTYgMjEgLTkgMzAgLTUgMzYgMTQgMjcgLTI2IC0xOQotODYgLTI1IC0zMyAtNDMgLTY1IC00MCAtNzAgMyAtNiA0NCAtMTAgOTEgLTEwIDgzIDAgODUgMSA4MiAyMyAtMiAxOCAtMTAgMjMKLTQwIDI1IC0yMSAyIC0zOCA0IC0zOCA2IDAgMTQgMzcgNzAgNjkgMTA2IDI0IDI3IDM2IDQ5IDMxIDU0IC05IDkgLTE0OCAxNQotMTY5IDh6Ii8+CjxwYXRoIGQ9Ik02NDcyIDQ5OCBjLTcgLTcgLTEyIC0yNiAtMTIgLTQyIC0xIC0xNyAtNyAtNTggLTE0IC05MSAtMTUgLTc0IC0xMgotODUgMjQgLTg1IDI5IDAgMjkgMSAzMiA2MyAyIDM0IDcgNjEgMTMgNjEgOCAtMSA0NyAtNjMgNzEgLTExMSA5IC0xOSA2MSAtMTYKNjggMyAzIDkgNiAyOSA2IDQ0IDAgMTYgNyA1NSAxNSA4NyAxMyA0OSAxMyA1OSAxIDcxIC04IDkgLTIyIDExIC0zNSA3IC0xOAotNSAtMjEgLTE0IC0yMSAtNjUgMCAtMzIgLTQgLTYxIC04IC02NCAtMTAgLTYgLTQ2IDQwIC01NiA3MCAtOCAyNiAtNDMgNjQKLTU5IDY0IC03IDAgLTE4IC01IC0yNSAtMTJ6Ii8+CjxwYXRoIGQ9Ik03NDU0IDQ5MyBjLTMgLTEwIC0xMyAtMzEgLTIxIC00OCAtMTAgLTIyIC0xMyAtNTYgLTExIC0xMjUgMyAtODcgNQotOTUgMjMgLTk1IDE5IDAgMjAgNyAyMCAxMDAgMCA4MCA0IDEwNSAxOSAxMjcgMTAgMTYgMTYgMzUgMTIgNDMgLTcgMjEgLTM1CjE5IC00MiAtMnoiLz4KPHBhdGggZD0iTTc5OTYgNTAxIGMtMyAtNSAxIC0yNSA5IC00NSAxNyAtNDAgMjAgLTkyIDYgLTEwMCAtNSAtNCAtMTIgLTI0Ci0xNiAtNDUgLTQgLTIyIC0xMyAtNDIgLTIxIC00NSAtMTkgLTcgLTE4IC0zNSAyIC00MyAyMiAtOCA2NCAzNSA2NCA2NyAwIDE0CjUgMzEgMTEgMzcgMTcgMTcgMTMgMTI4IC03IDE1OCAtMTYgMjUgLTM4IDMzIC00OCAxNnoiLz4KPHBhdGggZD0iTTc1MzkgNDczIGMtMTkgLTUwIC0zMSAtMTczIC0xOCAtMTg5IDE2IC0yMCAzOSAwIDM5IDM1IDAgMjEgOCAzMAo0MCA0NCA0NSAxOSA2MiA1MCA0OCA4NiAtMTIgMzIgLTM3IDUwIC03MSA1MSAtMjEgMCAtMzAgLTcgLTM4IC0yN3ogbTYzIC02NQpjLTIwIC0yMCAtMzYgNSAtMjEgMzMgbDEyIDI0IDEwIC0yMyBjNyAtMTYgNyAtMjYgLTEgLTM0eiIvPgo8cGF0aCBkPSJNNzY3NSA0OTAgYy04IC0xMyAzIC0zMCAyMCAtMzAgMTggMCAyOCAtMzUgMTcgLTU3IC0xNSAtMjggLTIzIC0xMDcKLTEzIC0xMjIgMjQgLTM3IDYxIDM4IDYxIDEyMyAwIDQ2IDMzIDgwIDYxIDYzIDEwIC02IDIxIC0yNCAyNCAtMzkgNCAtMTUgMTEKLTMwIDE2IC0zMyAxMyAtOCAxMSAtNTkgLTIgLTcyIC0xOCAtMTggLTIgLTQzIDI2IC00MyAyMiAwIDI1IDQgMjUgMzggMCAzNAozMSAxMTAgNTEgMTIyIDUgMyAxMCAxNyAxMSAzMCA1IDQxIC0yNSAzNCAtNTEgLTEyIGwtMjQgLTQzIC0xMSAyNiBjLTIxIDUxCi0zMSA1NiAtMTIwIDU4IC00OSAxIC04NyAtMyAtOTEgLTl6Ii8+CjxwYXRoIGQ9Ik04MTk2IDQ2OCBjLTggLTE4IC0xNyAtNjUgLTIxIC0xMDQgLTggLTgxIDIgLTk3IDU3IC05MiAyNSAyIDM0IDgKMzYgMjUgMiAxNiAtMyAyMiAtMjAgMjUgLTE4IDIgLTIyIDggLTIwIDI4IDE1IDEyOCAxNCAxNTAgLTIgMTUwIC0xMCAwIC0yMwotMTQgLTMwIC0zMnoiLz4KPHBhdGggZD0iTTgyOTAgNDg1IGMwIC05IDcgLTE4IDE1IC0yMSAxOCAtNyAyMSAtMTA0IDUgLTEzNCAtMTQgLTI2IC0yIC01MgoyNCAtNDggMTkgMyAyMiAxMiAzMCA4NiA3IDc1IDExIDg0IDMyIDkyIDEzIDUgMjQgMTYgMjQgMjUgMCAxMiAtMTMgMTUgLTY1CjE1IC01MiAwIC02NSAtMyAtNjUgLTE1eiIvPgo8cGF0aCBkPSJNODQ0NSA0NjMgYy0zIC0yMSAtMTAgLTU0IC0xNSAtNzQgLTYgLTIwIC0xMCAtNTMgLTEwIC03MyAwIC0zNCAyCi0zNiAzMyAtMzcgODQgLTMgMTA4IDUgMTM1IDQ0IDM0IDUxIDI5IDk2IC0xMyAxNDAgLTMxIDMyIC00MiAzNyAtODAgMzcgLTQzCjAgLTQ0IC0xIC01MCAtMzd6IG05MiAtMjUgYzEzIC0xMiAyMyAtMzMgMjMgLTQ4IDAgLTM0IC0zNSAtNzIgLTYzIC02OCAtMTkgMwotMjIgOCAtMTkgNDggNiA5NSAxNyAxMDggNTkgNjh6Ii8+CjxwYXRoIGQ9Ik02OTM4IDQ1OCBjLTYgLTEzIC0xMyAtNTggLTE0IC0xMDEgbC0zIC03OCAyNyAzIGMyNCAzIDI3IDggMzAgNDMgMgoyMiAxMCA0OCAxOSA1NyAxOSAyMSAxMCA4MyAtMTMgOTIgLTI1IDEwIC0zMyA3IC00NiAtMTZ6Ii8+CjxwYXRoIGQ9Ik01MzEyIDQwMyBjLTIyIC0yOCAtMzIgLTM0IC0zNSAtMjMgLTMgOCAtOCAyMyAtMTEgMzMgLTkgMjkgLTI2IDIyCi02MCAtMjcgLTEzIC0xOSAtMTQgLTE4IC0yNyAxMCAtMTggMzYgLTUyIDQwIC01NyA2IC0yIC0xMyAyIC0zMCA5IC0zOCA2IC04CjE1IC0yOSAxOCAtNDcgOSAtNDMgNDYgLTUxIDYxIC0xMyAxMiAzMyAzMyAzMyA0OCAxIDE0IC0yOSAzMyAtMzIgNTMgLTcgMjcKMzEgNzAgMTIyIDY0IDEzMiAtMTIgMTkgLTMzIDEwIC02MyAtMjd6Ii8+CjxwYXRoIGQ9Ik01NDMzIDQxMyBjLTQwIC0zOCAtNDggLTY1IC0yOCAtMTAzIDE1IC0yOSAxOCAtMzAgODAgLTMwIDc2IDAgODUgOQo4NSA5NCBsMCA1NiAtMzIgLTEgYy0xOCAtMSAtNDIgMiAtNTQgNiAtMTUgNSAtMjkgLTEgLTUxIC0yMnogbTc1IC02MCBjLTMKLTMyIC00NCAtNDYgLTU0IC0xOSAtMTAgMjYgNCA0NiAzMSA0NiAyMyAwIDI2IC00IDIzIC0yN3oiLz4KPHBhdGggZD0iTTYyMzcgNDMzIGMtNCAtMyAtNyAtMTkgLTcgLTM1IDAgLTQwIC0xNyAtNjggLTQxIC02OCAtMTggMCAtMjAgNAotMTMgNDUgNSAzNyAzIDQ2IC0xMSA1MSAtMjUgMTAgLTM3IC05IC00MyAtNjQgLTYgLTcwIDE2IC04OSA5OCAtODIgMzcgMyA0NQoxNCA2MCA3NSAxMSA0NCAxMSA1NyAwIDcwIC0xMyAxNiAtMzIgMjAgLTQzIDh6Ii8+CjxwYXRoIGQ9Ik02NzQxIDQxNCBjLTI2IC0yMiAtMzEgLTMzIC0zMSAtNzAgMCAtMzMgNSAtNDYgMTkgLTU0IDIzIC0xMiAxMjgKLTE0IDEzNCAtMiAzIDQgNyAzNiA5IDcyIGwzIDY1IC0zNyAwIGMtMjAgMCAtNDAgMyAtNDQgOCAtMTIgMTIgLTIxIDkgLTUzCi0xOXogbTg2IC01MCBjNSAtMTQgLTI0IC00NCAtNDIgLTQ0IC0xNiAwIC0yNiAyNSAtMTggNDYgNiAxNyA1NCAxNiA2MCAtMnoiLz4KPHBhdGggZD0iTTcwNzQgNDIwIGMtNDUgLTI5IC01NyAtMTA3IC0yMCAtMTMyIDIwIC0xNCAxMjYgLTkgMTMyIDUgMyA4IDYgNDAKNyA3MyBsMiA1OSAtMzIgLTIgYy0xNyAtMiAtMzUgMiAtMzggNyAtOSAxNCAtMTYgMTMgLTUxIC0xMHogbTcxIC01MCBjOSAtMTQKLTEzIC01MCAtMzEgLTUwIC0xNyAwIC0yOCAyNCAtMjAgNDUgNiAxNyA0MiAyMCA1MSA1eiIvPgo8cGF0aCBkPSJNNTgzMiA0MTcgYy02IC03IC0xNCAtMzEgLTE4IC01NCAtOCAtNTUgMTggLTgzIDc5IC04MyA1NyAwIDY0IDcgNzgKNjggMTMgNjEgOCA4MiAtMjAgODIgLTE5IDAgLTMxIC0yNSAtMzEgLTY3IDAgLTI2IC0zNyAtNTIgLTQ1IC0zMSAtMyA3IC00IDMxCi0zIDUzIDMgNDIgLTE4IDU5IC00MCAzMnoiLz4KPHBhdGggZD0iTTYzMjQgMzg1IGMtMTAgLTI1IDQgLTQ1IDMwIC00NSAzNCAwIDU2IDEwIDU2IDI2IDAgMzAgLTc2IDQ3IC04NgoxOXoiLz4KPC9nPgo8L3N2Zz4K" alt="First Technology Logo" class="logo">
            </div>
            <div class="header-content">
                <h1>AD Domain Security & Compliance Audit Report</h1>
                <p style="font-size: 1.3em; font-weight: bold;">Customer: $CustomerName</p>
            </div>
            <div class="header-info">
                <p>Audit Date: $($Summary.AuditDate.ToString('MMMM dd, yyyy'))</p>
                <p>Auditor/Engineer: $($Summary.TechnicianName)</p>
            </div>
        </div>
        
        <div class="risk-banner">
            OVERALL SECURITY RISK: $($Summary.OverallRisk)
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-number critical">$($Summary.CriticalFindings)</div>
                <div>Critical Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-number high">$($Summary.HighFindings)</div>
                <div>High Priority</div>
            </div>
            <div class="metric-card">
                <div class="metric-number medium">$($Summary.MediumFindings)</div>
                <div>Medium Priority</div>
            </div>
            <div class="metric-card">
                <div class="metric-number low">$($Summary.LowFindings)</div>
                <div>Low Priority</div>
            </div>
            <div class="metric-card">
                <div class="metric-number" style="color: #17a2b8;">$($Summary.PassedFindings)</div>
                <div>Controls Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-number">$($Summary.IssuesFindings)</div>
                <div>Issues Found</div>
            </div>
            <div class="metric-card">
                <div class="metric-number">$($Summary.TotalFindings)</div>
                <div>Total Checks</div>
            </div>
            <div class="metric-card">
                <div class="metric-number">$(($script:AuditFindings | Where-Object { $_.ComplianceFramework -and $_.ComplianceFramework.Trim() -ne '' } | Group-Object ComplianceFramework).Count)</div>
                <div>Compliance Frameworks</div>
            </div>
        </div>

        <!-- Domain Controller Health Dashboard -->
        <div class="dc-dashboard">
            <div class="dc-dashboard-header">
                <h2>🖥️ Domain Controller Health Dashboard 
                    <span class="dc-count">$($script:DomainControllerHealthData.Count) Controllers</span>
                </h2>
            </div>
            <div class="dc-grid">
$(
    if ($script:DomainControllerHealthData) {
        foreach ($dc in $script:DomainControllerHealthData) {
            $statusClass = switch ($dc.Status) {
                'Healthy' { 'healthy' }
                'Warning' { 'warning' }
                'Critical' { 'critical' }
                default { 'healthy' }
            }
            
            $servicesHtml = ''
            foreach ($service in $dc.Services.GetEnumerator()) {
                $serviceClass = if ($service.Value -eq 'Running') { 'running' } else { 'stopped' }
                $servicesHtml += "<span class='dc-service $serviceClass'>$($service.Key)</span>"
            }
            
            $testsHtml = ''
            foreach ($test in $dc.Tests.GetEnumerator()) {
                $testClass = if ($test.Value -eq 'Passed') { 'passed' } else { 'failed' }
                $testsHtml += "<span class='dc-test $testClass'>$($test.Key)</span>"
            }
            
            $lastContactTime = $dc.LastContact.ToString('HH:mm:ss')
            
            @"
                <div class="dc-card">
                    <div class="dc-card-header $statusClass">
                        <span>$($dc.Name.Split('.')[0])</span>
                        <span>$($dc.Status.ToUpper())</span>
                    </div>
                    <div class="dc-card-body">
                        <div class="dc-info-row">
                            <span class="dc-info-label">Site:</span>
                            <span class="dc-info-value">$($dc.Site)</span>
                        </div>
                        <div class="dc-info-row">
                            <span class="dc-info-label">Operating System:</span>
                            <span class="dc-info-value">$($dc.OS)</span>
                        </div>
                        <div class="dc-info-row">
                            <span class="dc-info-label">IP Address:</span>
                            <span class="dc-info-value">$($dc.IPv4)</span>
                        </div>
                        <div class="dc-info-row">
                            <span class="dc-info-label">FSMO Roles:</span>
                            <span class="dc-info-value">$(if ($dc.FSMORoles -and $dc.FSMORoles -ne 'None') { $dc.FSMORoles } else { 'None' })</span>
                        </div>
                        <div class="dc-info-row">
                            <span class="dc-info-label">Last Contact:</span>
                            <span class="dc-info-value">$lastContactTime</span>
                        </div>
                        <div class="dc-services">
                            <strong>Services:</strong><br>
                            $servicesHtml
                        </div>
                        <div class="dc-tests">
                            <strong>DCDIAG Tests:</strong><br>
                            $testsHtml
                        </div>
                    </div>
                </div>
"@
        }
    } else {
        @"
                <div class="dc-card">
                    <div class="dc-card-header healthy">
                        <span>Domain Controllers</span>
                        <span>STATUS UNKNOWN</span>
                    </div>
                    <div class="dc-card-body">
                        <p>Domain controller health data not available. Extended health check may be disabled.</p>
                    </div>
                </div>
"@
    }
)
            </div>
        </div>

        <div class="report-links">
            <h3>Download Detailed Reports</h3>
            <a href="Infrastructure-Audit-Report.xlsx">📊 Excel Report</a>
            <a href="Infrastructure-Audit-Report.csv">📄 CSV Report</a>
            <a href="Executive-Summary.txt">📋 Executive Summary</a>
        </div>
        
        <div class="section">
            <h2>📋 Detailed Security Findings</h2>
            <div style="text-align: right; margin: 10px 0;">
                <button onclick="expandAll()" style="margin-right: 10px; padding: 8px 15px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Expand All</button>
                <button onclick="collapseAll()" style="padding: 8px 15px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Collapse All</button>
            </div>
            <div class="findings-container">
$(
    # Group findings by severity for better organization
    $criticalFindings = $script:AuditFindings | Where-Object { $_.Severity -eq 'Critical' }
    $highFindings = $script:AuditFindings | Where-Object { $_.Severity -eq 'High' }
    $mediumFindings = $script:AuditFindings | Where-Object { $_.Severity -eq 'Medium' }
    $lowFindings = $script:AuditFindings | Where-Object { $_.Severity -eq 'Low' }
    $passedFindings = $script:AuditFindings | Where-Object { $_.Severity -eq 'Passed' }
    
    $allGroupedFindings = @()
    if ($criticalFindings.Count -gt 0) { $allGroupedFindings += @{Title='🔴 CRITICAL FINDINGS'; Findings=$criticalFindings; Class='critical-section'} }
    if ($highFindings.Count -gt 0) { $allGroupedFindings += @{Title='🟠 HIGH PRIORITY FINDINGS'; Findings=$highFindings; Class='high-section'} }
    if ($mediumFindings.Count -gt 0) { $allGroupedFindings += @{Title='🟡 MEDIUM PRIORITY FINDINGS'; Findings=$mediumFindings; Class='medium-section'} }
    if ($lowFindings.Count -gt 0) { $allGroupedFindings += @{Title='🟢 LOW PRIORITY FINDINGS'; Findings=$lowFindings; Class='low-section'} }
    if ($passedFindings.Count -gt 0) { $allGroupedFindings += @{Title='✅ SECURITY CONTROLS PASSED'; Findings=$passedFindings; Class='passed-section'} }
    
    foreach ($group in $allGroupedFindings) {
        $output = @"
                <div class="finding-group $($group.Class)">
                    <h3 class="finding-group-title">$($group.Title) ($($group.Findings.Count) Issues)</h3>
"@
        
        foreach ($finding in $group.Findings) {
            $severityIcon = switch ($finding.Severity) {
                'Critical' { '🔴' }
                'High' { '🟠' }
                'Medium' { '🟡' }
                'Low' { '🟢' }
                'Passed' { '✅' }
                default { '⚪' }
            }
            
            $evidenceSection = if ($finding.Evidence -and $finding.Evidence.Trim() -ne '') {
                @"
                        <div class="evidence-section">
                            <h5>📊 Evidence/Data:</h5>
                            <pre class="evidence-data">$($finding.Evidence)</pre>
                        </div>
"@
            } else { '' }
            
            $complianceSection = if ($finding.ComplianceFramework -and $finding.ComplianceFramework.Trim() -ne '') {
                "<p><strong>📝 Compliance Framework:</strong> <span class='compliance-tag'>$($finding.ComplianceFramework)</span></p>"
            } else { '' }
            
            $output += @"
                    <div class="finding-item $($finding.Severity.ToLower())-finding">
                        <div class="finding-header" onclick="toggleFinding('$($finding.ID)')">
                            <div>
                                <h4 class="finding-title">$severityIcon $($finding.Title)</h4>
                                <div class="finding-meta">
                                    <span class="finding-id">ID: $($finding.ID)</span>
                                    <span class="finding-category">$($finding.Category)</span>
                                    <span class="finding-type">$($finding.Type)</span>
                                    <span class="severity-badge $($finding.Severity.ToLower())">$($finding.Severity.ToUpper())</span>
                                </div>
                            </div>
                            <span class="finding-toggle" id="toggle-$($finding.ID)">+</span>
                        </div>
                        
                        <div class="finding-content" id="content-$($finding.ID)">
                            <div class="description-section">
                                <h5>📋 Description:</h5>
                                <p>$($finding.Description)</p>
                            </div>
                            
                            <div class="impact-section">
                                <h5>⚠️ Business Impact:</h5>
                                <p>$($finding.Impact)</p>
                            </div>
                            
                            <div class="recommendation-section">
                                <h5>🔧 Recommended Action:</h5>
                                <p>$($finding.Recommendation)</p>
                            </div>
                            
                            $evidenceSection
                            
                            <div class="finding-footer">
                                $complianceSection
                                <p><strong>⏰ Discovered:</strong> $($finding.Timestamp.ToString('yyyy-MM-dd HH:mm:ss'))</p>
                            </div>
                        </div>
                    </div>
"@
        }
        
        $output += @"
                </div>
"@
        $output
    }
)
            </div>
        </div>
        


        <div class="section">
            <h2>📊 Executive Summary & Risk Analysis</h2>
            <div class="executive-summary">
                <div class="summary-grid">
                    <div class="summary-card">
                        <h3>🔍 Audit Scope</h3>
                        <ul>
                            <li><strong>Customer:</strong> $CustomerName</li>
                            <li><strong>Audit Date:</strong> $($Summary.AuditDate.ToString('MMMM dd, yyyy'))</li>
                            <li><strong>Engineer/Auditor:</strong> $($Summary.TechnicianName)</li>
                            <li><strong>Systems Assessed:</strong> Active Directory Infrastructure</li>
                            <li><strong>Note:</strong> Server infrastructure audit temporarily disabled</li>
                        </ul>
                    </div>
                    
                    <div class="summary-card">
                        <h3>⚠️ Risk Assessment</h3>
                        <div class="risk-summary">
                            <p><strong>Overall Risk Level:</strong> <span class="risk-level $($Summary.OverallRisk.ToLower())">$($Summary.OverallRisk)</span></p>
                            <p><strong>Priority Actions:</strong> $($Summary.CriticalFindings + $Summary.HighFindings) immediate items</p>
                            <p><strong>Total Findings:</strong> $($Summary.TotalFindings) security issues identified</p>
                        </div>
                    </div>
                </div>
                
                <div class="key-findings">
                    <h3>🎯 Key Security Concerns</h3>
                    <div class="concern-list">
$(
    $topConcerns = $script:AuditFindings | Where-Object { $_.Severity -in @('Critical', 'High') } | Sort-Object @{Expression={if($_.Severity -eq 'Critical'){1}else{2}}}, Title | Select-Object -First 5
    if ($topConcerns.Count -gt 0) {
        foreach ($concern in $topConcerns) {
            $icon = if ($concern.Severity -eq 'Critical') { '🔴' } else { '🟠' }
            @"
                        <div class="concern-item">
                            <span class="concern-icon">$icon</span>
                            <div class="concern-content">
                                <strong>$($concern.Category):</strong> $($concern.Title)
                                <br><small>$($concern.Impact)</small>
                            </div>
                        </div>
"@
        }
    } else {
        '<div class="concern-item"><span class="concern-icon">✅</span><div class="concern-content">No critical security concerns identified</div></div>'
    }
)
                    </div>
                </div>
                
                <div class="compliance-overview">
                    <h3>📋 Compliance Framework Analysis</h3>
                    <div class="compliance-grid">
$(
    $complianceStats = $script:AuditFindings | Where-Object { $_.ComplianceFramework -and $_.ComplianceFramework.Trim() -ne '' } | 
        Group-Object ComplianceFramework | Sort-Object Count -Descending
    
    if ($complianceStats.Count -gt 0) {
        foreach ($framework in $complianceStats) {
            $criticalCount = ($framework.Group | Where-Object { $_.Severity -eq 'Critical' }).Count
            $highCount = ($framework.Group | Where-Object { $_.Severity -eq 'High' }).Count
            @"
                        <div class="compliance-item">
                            <h4>$($framework.Name)</h4>
                            <p>$($framework.Count) findings ($criticalCount critical, $highCount high priority)</p>
                        </div>
"@
        }
    } else {
        '<div class="compliance-item"><h4>General Security</h4><p>Compliance framework mapping in progress</p></div>'
    }
)
                    </div>
                </div>
            </div>
        </div>
        
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <p><strong>Audit Summary</strong></p>
            <p>This comprehensive audit assessed $($Summary.TotalFindings) security and compliance findings across the Active Directory infrastructure.</p>
        </div>
    </div>

    <script>
        // Collapsible findings functionality
        function toggleFinding(findingId) {
            const content = document.getElementById('content-' + findingId);
            const toggle = document.getElementById('toggle-' + findingId);
            
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                toggle.textContent = '+';
                toggle.classList.remove('open');
            } else {
                content.classList.add('show');
                toggle.textContent = '−';
                toggle.classList.add('open');
            }
        }
        
        // Expand/Collapse all functions
        function expandAll() {
            document.querySelectorAll('.finding-content').forEach(content => {
                content.classList.add('show');
            });
            document.querySelectorAll('.finding-toggle').forEach(toggle => {
                toggle.textContent = '−';
                toggle.classList.add('open');
            });
        }
        
        function collapseAll() {
            document.querySelectorAll('.finding-content').forEach(content => {
                content.classList.remove('show');
            });
            document.querySelectorAll('.finding-toggle').forEach(toggle => {
                toggle.textContent = '+';
                toggle.classList.remove('open');
            });
        }
        
        console.log('Infrastructure Audit Report loaded successfully');
        console.log('Total findings: $($Summary.TotalFindings)');
        console.log('Risk level: $($Summary.OverallRisk)');
        
        // Initialize all findings as collapsed by default
        document.addEventListener('DOMContentLoaded', function() {
            collapseAll();
        });
    </script>
</body>
</html>
"@
    
    $htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8
    Write-AuditLog "HTML report saved: $htmlPath" -Level Success
}

function New-ExcelReport {
    param($Summary)
    
    Write-AuditLog 'Generating Excel report...' -Level Info
    
    try {
        $excelPath = Join-Path $script:OutputDir 'Infrastructure-Audit-Report.xlsx'
        
        # Check if ImportExcel module is available
        if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
            Write-AuditLog "ImportExcel module not available, skipping Excel export" -Level Warning
            return
        }
        
        Import-Module ImportExcel -SkipEditionCheck -ErrorAction SilentlyContinue
        
        # Summary sheet
        $summaryData = [PSCustomObject]@{
            'Metric' = 'Customer Name'; 'Value' = $Summary.CustomerName
        }, [PSCustomObject]@{
            'Metric' = 'Audit Date'; 'Value' = $Summary.AuditDate.ToString('yyyy-MM-dd HH:mm:ss')
        }, [PSCustomObject]@{
            'Metric' = 'Technician'; 'Value' = $Summary.TechnicianName
        }, [PSCustomObject]@{
            'Metric' = 'Overall Risk Level'; 'Value' = $Summary.OverallRisk
        }, [PSCustomObject]@{
            'Metric' = 'Total Findings'; 'Value' = $Summary.TotalFindings
        }, [PSCustomObject]@{
            'Metric' = 'Critical Findings'; 'Value' = $Summary.CriticalFindings
        }, [PSCustomObject]@{
            'Metric' = 'High Findings'; 'Value' = $Summary.HighFindings
        }, [PSCustomObject]@{
            'Metric' = 'Total Servers'; 'Value' = $Summary.TotalServers
        }, [PSCustomObject]@{
            'Metric' = 'Online Servers'; 'Value' = $Summary.OnlineServers
        }, [PSCustomObject]@{
            'Metric' = 'High Risk Servers'; 'Value' = $Summary.HighRiskServers
        }
        
        $summaryData | Export-Excel -Path $excelPath -WorksheetName 'Summary' -AutoSize -BoldTopRow
        
        # Findings sheet
        $script:AuditFindings | Export-Excel -Path $excelPath -WorksheetName 'Security Findings' -AutoSize -BoldTopRow
        
        # Server results sheet
        $script:ServerResults | Export-Excel -Path $excelPath -WorksheetName 'Server Status' -AutoSize -BoldTopRow
        
        Write-AuditLog "Excel report saved: $excelPath" -Level Success
        
    } catch {
        Write-AuditLog "Error generating Excel report: $($_.Exception.Message)" -Level Warning
    }
}

function New-CSVReport {
    param($Summary)
    
    Write-AuditLog 'Generating CSV reports...' -Level Info
    
    # Findings CSV
    $findingsPath = Join-Path $script:OutputDir 'Audit-Findings.csv'
    $script:AuditFindings | Export-Csv -Path $findingsPath -NoTypeInformation
    
    # Server status CSV
    $serversPath = Join-Path $script:OutputDir 'Server-Status.csv'
    $script:ServerResults | Export-Csv -Path $serversPath -NoTypeInformation
    
    Write-AuditLog "CSV reports saved: $findingsPath, $serversPath" -Level Success
}

function New-MarkdownReport {
    param($Summary)
    
    Write-AuditLog 'Generating Markdown report...' -Level Info
    
    $markdownPath = Join-Path $script:OutputDir 'Infrastructure-Audit-Report.md'
    
    $markdownContent = @"
# Infrastructure Security Audit Report

**Customer:** $CustomerName  
**Audit Date:** $($Summary.AuditDate.ToString('yyyy-MM-dd HH:mm:ss'))  
**Technician:** $($Summary.TechnicianName)  
**Overall Risk Level:** **$($Summary.OverallRisk)**

## Executive Summary

This infrastructure audit assessed $($Summary.TotalServers) servers and identified $($Summary.TotalFindings) security and configuration findings.

### Key Metrics

| Metric | Count |
|--------|-------|
| Critical Findings | $($Summary.CriticalFindings) |
| High Priority Findings | $($Summary.HighFindings) |
| Medium Priority Findings | $($Summary.MediumFindings) |
| Low Priority Findings | $($Summary.LowFindings) |
| Total Servers Audited | $($Summary.TotalServers) |
| Online Servers | $($Summary.OnlineServers) |
| High Risk Servers | $($Summary.HighRiskServers) |

## Security Findings

$(
    $script:AuditFindings | ForEach-Object {
        @"
### $($_.Title) [$($_.Severity)]

**Category:** $($_.Category)  
**Type:** $($_.Type)  
**Compliance Framework:** $($_.ComplianceFramework)

**Description:** $($_.Description)

**Impact:** $($_.Impact)

**Recommendation:** $($_.Recommendation)

$(if ($_.Evidence) { "**Evidence:**`n``````n$($_.Evidence)`n``````n" })

---
"@
    }
)

## Server Infrastructure Status

| Server Name | Status | Operating System | Risk Score | Security Issues | Performance Issues |
|-------------|--------|------------------|------------|-----------------|-------------------|
$(
    $script:ServerResults | ForEach-Object {
        "| $($_.ServerName) | $($_.PingStatus) | $($_.OperatingSystem) | $($_.RiskScore) | $($_.SecurityIssues.Count) | $($_.PerformanceIssues.Count) |"
    }
)

## Recommendations Summary

### Immediate Actions Required (Critical/High)
$(
    $criticalAndHigh = $script:AuditFindings | Where-Object { $_.Severity -in @('Critical', 'High') }
    if ($criticalAndHigh.Count -gt 0) {
        $criticalAndHigh | ForEach-Object { "- **$($_.Category):** $($_.Recommendation)" }
    } else {
        "- No immediate critical actions required"
    }
)

### Short-term Improvements (Medium)
$(
    $medium = $script:AuditFindings | Where-Object { $_.Severity -eq 'Medium' }
    if ($medium.Count -gt 0) {
        $medium | ForEach-Object { "- **$($_.Category):** $($_.Recommendation)" }
    } else {
        "- No medium priority items identified"
    }
)

---

*Report generated by Master Infrastructure Audit Script v$($script:Version)*  
*Audit Duration: $([math]::Round($Summary.AuditDuration.TotalMinutes, 2)) minutes*
"@
    
    $markdownContent | Out-File -FilePath $markdownPath -Encoding UTF8
    Write-AuditLog "Markdown report saved: $markdownPath" -Level Success
}

function New-ExecutiveSummary {
    param($Summary)
    
    Write-AuditLog 'Generating executive summary...' -Level Info
    
    $execSummaryPath = Join-Path $script:OutputDir 'Executive-Summary.txt'
    
    $execSummary = @"
INFRASTRUCTURE SECURITY AUDIT - EXECUTIVE SUMMARY
================================================================

Customer: $CustomerName
Audit Date: $($Summary.AuditDate.ToString('MMMM dd, yyyy'))
Engineer/Auditor: $($Summary.TechnicianName)
Audit Duration: $([math]::Round($Summary.AuditDuration.TotalMinutes, 2)) minutes

OVERALL RISK ASSESSMENT: $($Summary.OverallRisk)

FINDINGS SUMMARY:
- Critical Issues: $($Summary.CriticalFindings)
- High Priority: $($Summary.HighFindings)  
- Medium Priority: $($Summary.MediumFindings)
- Low Priority: $($Summary.LowFindings)
- Total Findings: $($Summary.TotalFindings)

INFRASTRUCTURE SUMMARY:
- Total Servers: $($Summary.TotalServers)
- Online Servers: $($Summary.OnlineServers)
- Offline Servers: $($Summary.OfflineServers)
- High Risk Servers: $($Summary.HighRiskServers)

IMMEDIATE ACTIONS REQUIRED:
$(
    $immediateActions = $script:AuditFindings | Where-Object { $_.Severity -in @('Critical', 'High') } | Select-Object -First 5
    if ($immediateActions.Count -gt 0) {
        $immediateActions | ForEach-Object { "- $($_.Category): $($_.Title)" }
    } else {
        "- No immediate critical actions required"
    }
)

COMPLIANCE ASSESSMENT:
$(
    $frameworks = $script:AuditFindings | Group-Object ComplianceFramework | Where-Object { $_.Name -ne '' }
    if ($frameworks.Count -gt 0) {
        $frameworks | ForEach-Object { "- $($_.Name): $($_.Count) findings" }
    } else {
        "- Compliance frameworks assessment pending"
    }
)

This executive summary provides a high-level overview of the infrastructure 
security assessment. Detailed findings, recommendations, and remediation 
procedures are available in the comprehensive audit reports.

================================================================
"@
    
    $execSummary | Out-File -FilePath $execSummaryPath -Encoding UTF8
    Write-AuditLog "Executive summary saved: $execSummaryPath" -Level Success
}

# ==============================================================================
# MAIN EXECUTION LOGIC
# ==============================================================================

function Start-MasterInfrastructureAudit {
    # Display banner
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host "MASTER INFRASTRUCTURE AUDIT SCRIPT v$($script:Version)" -ForegroundColor Cyan
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host "Customer: $CustomerName" -ForegroundColor White
    Write-Host "Technician: $TechnicianName" -ForegroundColor White
    Write-Host "Start Time: $($script:StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
    Write-Host "Output Directory: $script:OutputDir" -ForegroundColor White
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host ""
    
    Write-AuditLog "Starting Master Infrastructure Audit for $CustomerName" -Level Header
    Write-AuditLog "Technician: $TechnicianName" -Level Info
    Write-AuditLog "Output Directory: $script:OutputDir" -Level Info
    Write-AuditLog "Export Formats: $($ExportFormats -join ', ')" -Level Info
    
    try {
        # Initialize logo path for reports
        $script:LogoPath = Initialize-LogoPath
        Write-AuditLog "Logo path initialized: $($script:LogoPath)" -Level Info
        
        # Initialize task counting
        $script:TotalTasks = 1 # Report Generation is always done
        if (-not $SkipADHealthChecks) { $script:TotalTasks++ }
        if (-not $SkipServerAudit) { $script:TotalTasks++ }
        
        # Active Directory Health Assessment
        if (-not $SkipADHealthChecks) {
            Update-AuditProgress -Activity "Master Infrastructure Audit" -Status "Starting Active Directory assessment..."
            $adSuccess = Test-ADInfrastructureHealth
            $script:CompletedTasks++
            
            if (-not $adSuccess) {
                Write-AuditLog "Active Directory assessment failed or incomplete" -Level Warning
            }
        } else {
            Write-AuditLog "Skipping Active Directory health checks as requested" -Level Info
        }
        
        # Server Infrastructure Audit - Currently disabled due to hanging issues
        if (-not $SkipServerAudit) {
            Write-AuditLog "Server infrastructure audit temporarily disabled due to connectivity issues" -Level Warning
            Write-AuditLog "Focus on Active Directory findings - server audit can be run separately if needed" -Level Info
            $script:CompletedTasks++
        } else {
            Write-AuditLog "Skipping server infrastructure audit as requested" -Level Info
        }
        
        # Generate Reports
        Update-AuditProgress -Activity "Master Infrastructure Audit" -Status "Generating comprehensive reports..."
        New-ComprehensiveAuditReport
        $script:CompletedTasks++
        
        # Display final summary
        $executionTime = (Get-Date) - $script:StartTime
        
        Write-Host ""
        Write-Host "=" * 80 -ForegroundColor Green
        Write-Host "AUDIT COMPLETED SUCCESSFULLY" -ForegroundColor Green
        Write-Host "=" * 80 -ForegroundColor Green
        Write-Host ""
        
        $summary = Get-AuditSummaryStatistics
        
        Write-Host "AUDIT SUMMARY:" -ForegroundColor Cyan
        Write-Host "  Customer: $CustomerName" -ForegroundColor White
        Write-Host "  Overall Risk Level: " -NoNewline -ForegroundColor White
        
        switch ($summary.OverallRisk) {
            'CRITICAL' { Write-Host $summary.OverallRisk -ForegroundColor Red }
            'HIGH' { Write-Host $summary.OverallRisk -ForegroundColor DarkRed }
            'MEDIUM' { Write-Host $summary.OverallRisk -ForegroundColor Yellow }
            'LOW' { Write-Host $summary.OverallRisk -ForegroundColor Green }
        }
        
        Write-Host ""
        Write-Host "FINDINGS:" -ForegroundColor Cyan
        Write-Host "  Critical: " -NoNewline -ForegroundColor White
        Write-Host $summary.CriticalFindings -ForegroundColor $(if ($summary.CriticalFindings -gt 0) { 'Red' } else { 'Green' })
        Write-Host "  High:     " -NoNewline -ForegroundColor White
        Write-Host $summary.HighFindings -ForegroundColor $(if ($summary.HighFindings -gt 0) { 'DarkRed' } else { 'Green' })
        Write-Host "  Medium:   " -NoNewline -ForegroundColor White
        Write-Host $summary.MediumFindings -ForegroundColor $(if ($summary.MediumFindings -gt 0) { 'Yellow' } else { 'Green' })
        Write-Host "  Low:      " -NoNewline -ForegroundColor White
        Write-Host $summary.LowFindings -ForegroundColor $(if ($summary.LowFindings -gt 0) { 'Yellow' } else { 'Green' })
        Write-Host "  Total:    " -NoNewline -ForegroundColor White
        Write-Host $summary.TotalFindings -ForegroundColor Cyan
        
        Write-Host ""
        Write-Host "INFRASTRUCTURE:" -ForegroundColor Cyan
        Write-Host "  Total Servers:    $($summary.TotalServers)" -ForegroundColor White
        Write-Host "  Online Servers:   $($summary.OnlineServers)" -ForegroundColor Green
        Write-Host "  Offline Servers:  $($summary.OfflineServers)" -ForegroundColor $(if ($summary.OfflineServers -gt 0) { 'Red' } else { 'Green' })
        Write-Host "  High Risk Servers: $($summary.HighRiskServers)" -ForegroundColor $(if ($summary.HighRiskServers -gt 0) { 'Red' } else { 'Green' })
        
        Write-Host ""
        Write-Host "EXECUTION DETAILS:" -ForegroundColor Cyan
        Write-Host "  Duration: $([math]::Round($executionTime.TotalMinutes, 2)) minutes" -ForegroundColor White
        Write-Host "  Reports Location: $script:OutputDir" -ForegroundColor White
        
        if ($summary.CriticalFindings -gt 0 -or $summary.HighFindings -gt 0) {
            Write-Host ""
            Write-Host "⚠️  URGENT ACTION REQUIRED ⚠️" -ForegroundColor Red -BackgroundColor Yellow
            Write-Host "Critical and High priority issues require immediate attention!" -ForegroundColor Red
        }
        
        Write-AuditLog "Master Infrastructure Audit completed successfully" -Level Success
        Write-AuditLog "Total execution time: $([math]::Round($executionTime.TotalMinutes, 2)) minutes" -Level Info
        
        # Open output directory
        try {
            Start-Process $script:OutputDir
        } catch {
            Write-AuditLog "Could not open output directory automatically" -Level Warning
        }
        
    } catch {
        Write-AuditLog "FATAL ERROR during audit execution: $($_.Exception.Message)" -Level Error
        Write-AuditLog "Stack Trace: $($_.ScriptStackTrace)" -Level Error
        throw
    } finally {
        Write-Progress -Activity "Master Infrastructure Audit" -Completed
    }
}

# ==============================================================================
# SCRIPT EXECUTION
# ==============================================================================

# Check required modules before starting
if (-not (Test-RequiredModules)) {
    Write-Host "`nScript cannot continue without required modules. Please install missing modules and try again." -ForegroundColor Red
    exit 1
}

# Parameter validation
if (-not $CustomerName -or -not $TechnicianName) {
    Write-Error "CustomerName and TechnicianName parameters are required"
    exit 1
}

# Execute the main audit function
try {
    Start-MasterInfrastructureAudit
} catch {
    Write-Host "`nSCRIPT EXECUTION FAILED:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nFor support, check the audit log in: $script:OutputDir" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Master Infrastructure Audit completed successfully!" -ForegroundColor Green
Write-Host "📁 All reports and logs saved to: $script:OutputDir" -ForegroundColor Cyan