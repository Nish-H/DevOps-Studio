// Simple PowerShell Command Execution
// Provides PowerShell functionality without complex escape sequences

interface PowerShellResult {
  success: boolean
  output: string
  error?: string
  executionTime: number
}

class SimplePowerShellExecutor {
  private currentLocation: string = 'C:/Users/Nishen'
  private variables: Map<string, any> = new Map()

  constructor() {
    this.initializePowerShell()
  }

  private initializePowerShell() {
    this.variables.set('PWD', this.currentLocation)
    this.variables.set('HOME', 'C:/Users/Nishen')
    this.variables.set('PSVersionTable', {
      PSVersion: '7.4.0',
      PSEdition: 'Core',
      Platform: 'Win32NT'
    })
  }

  async executeCommand(command: string): Promise<PowerShellResult> {
    const startTime = Date.now()
    const trimmedCommand = command.trim().toLowerCase()
    
    if (!trimmedCommand) {
      return {
        success: true,
        output: '',
        executionTime: Date.now() - startTime
      }
    }

    try {
      let output = ''

      if (trimmedCommand.startsWith('get-childitem') || trimmedCommand === 'ls' || trimmedCommand === 'dir') {
        output = this.getDirectoryListing()
      } else if (trimmedCommand.startsWith('set-location') || trimmedCommand.startsWith('cd ')) {
        output = this.changeLocation(trimmedCommand)
      } else if (trimmedCommand === 'get-location' || trimmedCommand === 'pwd') {
        output = this.currentLocation
      } else if (trimmedCommand.startsWith('get-process') || trimmedCommand === 'ps') {
        output = this.getProcessList()
      } else if (trimmedCommand === 'get-date') {
        output = new Date().toString()
      } else if (trimmedCommand === 'get-help' || trimmedCommand === 'help') {
        output = this.getHelpText()
      } else if (trimmedCommand.startsWith('write-output ') || trimmedCommand.startsWith('echo ')) {
        output = command.substring(command.indexOf(' ') + 1)
      } else if (trimmedCommand === 'get-host') {
        output = this.getHostInfo()
      } else if (trimmedCommand === 'whoami') {
        output = 'DEVOPS-STUDIO\\Nishen'
      } else if (trimmedCommand === 'get-service') {
        output = this.getServiceList()
      } else if (trimmedCommand === 'get-module') {
        output = this.getModuleList()
      } else if (trimmedCommand === 'get-variable') {
        output = this.getVariableList()
      } else if (trimmedCommand.startsWith('test-path ')) {
        output = this.testPath(trimmedCommand)
      } else if (trimmedCommand === 'clear-host' || trimmedCommand === 'cls') {
        output = 'CLEAR_SCREEN'
      } else if (trimmedCommand === 'get-computerinfo') {
        output = this.getComputerInfo()
      } else if (trimmedCommand.startsWith('invoke-webrequest ') || trimmedCommand.startsWith('iwr ')) {
        output = this.invokeWebRequest(trimmedCommand)
      } else {
        throw new Error(`The term '${command}' is not recognized as the name of a cmdlet, function, script file, or operable program.`)
      }
      
      return {
        success: true,
        output,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: Date.now() - startTime
      }
    }
  }

  private getDirectoryListing(): string {
    const items = [
      'Directory: ' + this.currentLocation,
      '',
      'Mode                 LastWriteTime         Length Name',
      '----                 -------------         ------ ----',
      'd-----        ' + new Date().toLocaleDateString() + '                Documents',
      'd-----        ' + new Date().toLocaleDateString() + '                Desktop',
      'd-----        ' + new Date().toLocaleDateString() + '                Downloads',
      'd-----        ' + new Date().toLocaleDateString() + '                Projects',
      '-a----        ' + new Date().toLocaleDateString() + '           1234 DevOps-Studio.lnk',
      '-a----        ' + new Date().toLocaleDateString() + '            567 README.txt'
    ]
    return items.join('\n')
  }

  private changeLocation(command: string): string {
    const parts = command.split(' ')
    const path = parts[1] || this.variables.get('HOME')
    
    if (path === '~' || path === '$HOME') {
      this.currentLocation = this.variables.get('HOME')
    } else if (path === '..') {
      const pathParts = this.currentLocation.split('/')
      if (pathParts.length > 1) {
        pathParts.pop()
        this.currentLocation = pathParts.join('/') || 'C:/'
      }
    } else {
      this.currentLocation = path
    }
    
    this.variables.set('PWD', this.currentLocation)
    return ''
  }

  private getProcessList(): string {
    const processes = [
      '',
      'Id       ProcessName          CPU      WorkingSet',
      '--       -----------          ---      ----------',
      '1234     devops-studio        2.5      150MB',
      '5678     powershell           1.2      85MB',
      '9012     chrome               15.8     350MB',
      '3456     code                 8.3      250MB',
      '7890     explorer             0.5      120MB'
    ]
    return processes.join('\n')
  }

  private getHelpText(): string {
    return `PowerShell Help System

Available Cmdlets:
- Get-ChildItem (ls, dir)     List directory contents
- Set-Location (cd)           Change directory
- Get-Location (pwd)          Show current directory
- Get-Process (ps)            List running processes
- Get-Service                 List system services
- Get-Date                    Show current date/time
- Write-Output (echo)         Display text
- Get-Help                    Show this help
- Get-Host                    Show host information
- Get-Module                  List loaded modules
- Get-Variable                List variables
- Test-Path                   Test if path exists
- Clear-Host (cls)            Clear screen
- Get-ComputerInfo           Show computer information
- Invoke-WebRequest (iwr)     Make web requests

Type 'Get-Help [cmdlet]' for specific help on any cmdlet.`
  }

  private getHostInfo(): string {
    const info = [
      'Name             : DevOps Studio PowerShell',
      'Version          : 7.4.0',
      'InstanceId       : ' + Date.now(),
      'CurrentCulture   : en-US',
      'CurrentUICulture : en-US'
    ]
    return info.join('\n')
  }

  private getServiceList(): string {
    const services = [
      '',
      'Status     Name            DisplayName',
      '------     ----            -----------',
      'Running    Themes          Themes Service',
      'Running    Spooler         Print Spooler',
      'Stopped    Fax             Fax Service',
      'Running    EventLog        Windows Event Log'
    ]
    return services.join('\n')
  }

  private getModuleList(): string {
    const modules = [
      '',
      'ModuleType Version    Name',
      '---------- -------    ----',
      'Manifest   7.4.0.0    Microsoft.PowerShell.Core',
      'Manifest   7.4.0.0    Microsoft.PowerShell.Management',
      'Manifest   7.4.0.0    Microsoft.PowerShell.Security',
      'Manifest   7.4.0.0    Microsoft.PowerShell.Utility'
    ]
    return modules.join('\n')
  }

  private getVariableList(): string {
    const variables = Array.from(this.variables.entries()).map(([name, value]) => {
      const valueStr = typeof value === 'object' ? '[Object]' : String(value)
      return name.padEnd(15) + ' ' + valueStr.substring(0, 30).padEnd(32) + ' None'
    })

    return '\nName            Value                            Options\n----            -----                            -------\n' + variables.join('\n')
  }

  private testPath(command: string): string {
    const path = command.split(' ')[1]
    const commonPaths = ['C:/', 'C:/Users', 'C:/Windows', '~', '$HOME']
    const exists = commonPaths.some(p => path.toLowerCase().includes(p.toLowerCase()))
    return exists ? 'True' : 'False'
  }

  private getComputerInfo(): string {
    const info = [
      'WindowsProductName     : Microsoft Windows 11 Pro',
      'WindowsVersion         : 2009',
      'TotalPhysicalMemory    : 17179869184',
      'ProcessorDescription   : Intel(R) Core(TM) i7',
      'BiosVersion            : American Megatrends Inc.',
      'TimeZone               : (UTC-05:00) Eastern Time'
    ]
    return info.join('\n')
  }

  private invokeWebRequest(command: string): string {
    const url = command.split(' ')[1] || 'example.com'
    const response = [
      'StatusCode        : 200',
      'StatusDescription : OK',
      'Content           : [Web content for ' + url + ']',
      'RawContent        : HTTP/1.1 200 OK',
      'Headers           : {Content-Type, Content-Length}'
    ]
    return response.join('\n')
  }

  getCurrentLocation(): string {
    return this.currentLocation
  }

  getPrompt(): string {
    return `PS ${this.currentLocation}> `
  }
}

export const simplePowerShellExecutor = new SimplePowerShellExecutor()