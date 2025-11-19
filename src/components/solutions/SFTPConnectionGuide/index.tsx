import React, { useState } from 'react';
import { FileText, Server, User, Key, Lock, Monitor, AlertCircle, CheckCircle, ArrowRight, Download, Upload, Shield } from 'lucide-react';

const SFTPConnectionGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOS, setSelectedOS] = useState('windows');

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
        activeTab === id
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const ConnectionDiagram = () => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg">
      <h3 className="text-xl font-bold text-center mb-8 text-gray-800">SFTP Connection Architecture</h3>
      
      {/* Client Side */}
      <div className="flex items-center justify-between mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg w-64 border-2 border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="text-blue-600" size={32} />
            <div>
              <h4 className="font-bold text-gray-800">Remote Client</h4>
              <p className="text-sm text-gray-600">User Workstation</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-600" />
              <span>Domain: PATHERANDPATHER</span>
            </div>
            <div className="flex items-center gap-2">
              <Key size={16} className="text-gray-600" />
              <span>Private Key: id_ed25519</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-600" />
              <span>SFTP Client Software</span>
            </div>
          </div>
        </div>

        {/* Connection Arrow */}
        <div className="flex-1 px-4">
          <div className="relative">
            <div className="border-t-4 border-green-500 border-dashed"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-full shadow border-2 border-green-500">
              <div className="flex items-center gap-2">
                <Shield className="text-green-600" size={20} />
                <div className="text-sm">
                  <div className="font-bold text-green-600">SSH Port 22</div>
                  <div className="text-xs text-gray-600">Encrypted Tunnel</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 space-y-1">
            <div className="text-xs font-medium text-gray-600">Authentication Method</div>
            <div className="text-sm text-green-700 font-bold">SSH Key-Based (No Password)</div>
            <div className="text-xs text-gray-500">Ed25519 / RSA-4096</div>
          </div>
        </div>

        {/* Server Side */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-64 border-2 border-purple-500">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-purple-600" size={32} />
            <div>
              <h4 className="font-bold text-gray-800">SFTP Server</h4>
              <p className="text-sm text-gray-600">Windows Server 2019</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-gray-600" />
              <span>OpenSSH Server</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-gray-600" />
              <span>Chroot Jail: L:\SFTP_Server</span>
            </div>
            <div className="flex items-center gap-2">
              <Key size={16} className="text-gray-600" />
              <span>Public Key Validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Flow */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="font-bold mb-4 text-gray-800">Connection Flow</h4>
        <div className="grid grid-cols-5 gap-2">
          {[
            { step: '1', label: 'Client Initiates', desc: 'Connect to port 22', color: 'blue' },
            { step: '2', label: 'SSH Handshake', desc: 'Key exchange', color: 'indigo' },
            { step: '3', label: 'Authentication', desc: 'Private key signed', color: 'purple' },
            { step: '4', label: 'Validation', desc: 'Public key match', color: 'pink' },
            { step: '5', label: 'Chroot Jail', desc: 'Isolated access', color: 'green' }
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className={`bg-${item.color}-100 border-2 border-${item.color}-500 rounded-lg p-3 mb-2`}>
                <div className={`text-2xl font-bold text-${item.color}-700 mb-1`}>{item.step}</div>
                <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-600 mt-1">{item.desc}</div>
              </div>
              {idx < 4 && (
                <ArrowRight className="mx-auto text-gray-400" size={20} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WindowsInstructions = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-blue-900">Prerequisites</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Private SSH key file (provided by administrator)</li>
              <li>• SFTP server address and port (default: port 22)</li>
              <li>• Your domain username (e.g., PATHERANDPATHER\username)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Method 1: WinSCP (Recommended)</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Download and Install WinSCP</h4>
              <p className="text-sm text-gray-600 mt-1">Download from: <span className="text-blue-600 font-mono">https://winscp.net</span></p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Configure Connection</h4>
              <div className="bg-gray-50 p-4 rounded mt-2 font-mono text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">File Protocol:</div>
                  <div className="font-semibold">SFTP</div>
                  <div className="text-gray-600">Host Name:</div>
                  <div className="font-semibold">sftp.yourcompany.com</div>
                  <div className="text-gray-600">Port:</div>
                  <div className="font-semibold">22</div>
                  <div className="text-gray-600">User Name:</div>
                  <div className="font-semibold">yourusername</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Configure SSH Key Authentication</h4>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Click "Advanced" button</li>
                <li>Navigate to SSH → Authentication</li>
                <li>Browse and select your private key file (e.g., id_ed25519.ppk)</li>
                <li>If key is in OpenSSH format, WinSCP will offer to convert it</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">4</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Connect</h4>
              <p className="text-sm text-gray-600 mt-1">Click "Login" - You should connect without password prompt</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Method 2: FileZilla</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded font-mono text-sm">
            <div className="text-gray-700 mb-2">Edit → Settings → SFTP → Add key file</div>
            <div className="text-gray-700 mb-2">Host: <span className="text-blue-600">sftp://sftp.yourcompany.com</span></div>
            <div className="text-gray-700 mb-2">Port: <span className="text-blue-600">22</span></div>
            <div className="text-gray-700 mb-2">Protocol: <span className="text-blue-600">SFTP - SSH File Transfer Protocol</span></div>
            <div className="text-gray-700">Logon Type: <span className="text-blue-600">Key file</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Method 3: Command Line (PowerShell/CMD)</h3>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
          <div className="mb-2"># Connect using OpenSSH client</div>
          <div className="text-white">sftp -i C:\Users\YourName\.ssh\id_ed25519 yourusername@sftp.yourcompany.com</div>
          <div className="mt-4 text-gray-400"># Basic SFTP commands after connection:</div>
          <div className="text-white mt-1">ls              # List remote files</div>
          <div className="text-white">pwd             # Show remote directory</div>
          <div className="text-white">cd upload       # Change to upload directory</div>
          <div className="text-white">put file.txt    # Upload file</div>
          <div className="text-white">get file.txt    # Download file</div>
          <div className="text-white">exit            # Disconnect</div>
        </div>
      </div>
    </div>
  );

  const LinuxMacInstructions = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-green-600 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-green-900">Prerequisites</h4>
            <p className="text-sm text-green-800 mt-2">OpenSSH client is pre-installed on most Linux/macOS systems</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Method 1: Command Line (Native SFTP)</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Step 1: Place Your Private Key</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              <div className="text-white">mkdir -p ~/.ssh</div>
              <div className="text-white mt-1">cp /path/to/your/id_ed25519 ~/.ssh/</div>
              <div className="text-white mt-1">chmod 600 ~/.ssh/id_ed25519</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Step 2: Connect to SFTP Server</h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              <div className="text-white">sftp -i ~/.ssh/id_ed25519 yourusername@sftp.yourcompany.com</div>
              <div className="text-gray-400 mt-2"># Or add to ~/.ssh/config for easier access:</div>
              <div className="text-white mt-1">cat &lt;&lt;EOF &gt;&gt; ~/.ssh/config</div>
              <div className="text-white">Host company-sftp</div>
              <div className="text-white">    HostName sftp.yourcompany.com</div>
              <div className="text-white">    User yourusername</div>
              <div className="text-white">    Port 22</div>
              <div className="text-white">    IdentityFile ~/.ssh/id_ed25519</div>
              <div className="text-white">EOF</div>
              <div className="text-gray-400 mt-3"># Then simply connect with:</div>
              <div className="text-white mt-1">sftp company-sftp</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Step 3: SFTP Commands Reference</h4>
            <div className="bg-gray-50 p-4 rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 font-bold text-gray-800">Command</th>
                    <th className="text-left py-2 font-bold text-gray-800">Description</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">ls</td>
                    <td className="py-2 text-gray-700">List remote directory contents</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">pwd</td>
                    <td className="py-2 text-gray-700">Print remote working directory</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">cd directory</td>
                    <td className="py-2 text-gray-700">Change remote directory</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">lcd directory</td>
                    <td className="py-2 text-gray-700">Change local directory</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">put file.txt</td>
                    <td className="py-2 text-gray-700">Upload single file</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">put -r folder</td>
                    <td className="py-2 text-gray-700">Upload directory recursively</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">get file.txt</td>
                    <td className="py-2 text-gray-700">Download single file</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">get -r folder</td>
                    <td className="py-2 text-gray-700">Download directory recursively</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-blue-600">rm file.txt</td>
                    <td className="py-2 text-gray-700">Delete remote file</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-blue-600">exit</td>
                    <td className="py-2 text-gray-700">Disconnect from server</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Method 2: GUI Applications</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Linux: FileZilla</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Install: <span className="font-mono text-blue-600">sudo apt install filezilla</span></div>
              <div>Configure SSH key in Edit → Settings → SFTP</div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded p-4">
            <h4 className="font-semibold text-gray-800 mb-2">macOS: Cyberduck</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Download from: cyberduck.io</div>
              <div>Add private key in Preferences → SFTP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Method 3: Automated Scripts</h3>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
          <div className="text-gray-400">#!/bin/bash</div>
          <div className="text-gray-400"># Automated SFTP upload script</div>
          <div className="text-white mt-2">sftp -i ~/.ssh/id_ed25519 yourusername@sftp.yourcompany.com &lt;&lt;EOF</div>
          <div className="text-white">cd upload</div>
          <div className="text-white">put /local/path/file.txt</div>
          <div className="text-white">ls -la</div>
          <div className="text-white">bye</div>
          <div className="text-white">EOF</div>
        </div>
      </div>
    </div>
  );

  const TroubleshootingGuide = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
          <AlertCircle size={24} />
          Common Connection Issues
        </h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <h4 className="font-bold text-gray-800">Permission Denied (publickey)</h4>
            <div className="text-sm text-gray-600 mt-2">
              <div className="font-semibold mb-1">Causes:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Wrong private key file</li>
                <li>Public key not deployed on server</li>
                <li>Incorrect file permissions (should be 600)</li>
              </ul>
              <div className="font-semibold mt-3 mb-1">Solutions:</div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs mt-2">
                <div className="text-white">chmod 600 ~/.ssh/id_ed25519</div>
                <div className="text-white mt-1">ssh-keygen -y -f ~/.ssh/id_ed25519  # Verify key</div>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <h4 className="font-bold text-gray-800">Connection Timeout</h4>
            <div className="text-sm text-gray-600 mt-2">
              <div className="font-semibold mb-1">Causes:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Firewall blocking port 22</li>
                <li>Wrong server address</li>
                <li>Server not running</li>
              </ul>
              <div className="font-semibold mt-3 mb-1">Solutions:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Verify server address and port</li>
                <li>Check firewall rules allow outbound port 22</li>
                <li>Test with: <span className="font-mono text-blue-600">telnet sftp.server.com 22</span></li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <h4 className="font-bold text-gray-800">Cannot Write to Directory</h4>
            <div className="text-sm text-gray-600 mt-2">
              <div className="font-semibold mb-1">Causes:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Trying to write to chroot root directory</li>
                <li>Insufficient NTFS permissions</li>
              </ul>
              <div className="font-semibold mt-3 mb-1">Solutions:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Change to 'upload' directory: <span className="font-mono text-blue-600">cd upload</span></li>
                <li>Root directory (/) is read-only by design for security</li>
                <li>Contact administrator if upload directory inaccessible</li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <h4 className="font-bold text-gray-800">Host Key Verification Failed</h4>
            <div className="text-sm text-gray-600 mt-2">
              <div className="font-semibold mb-1">Causes:</div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Server host key changed</li>
                <li>Man-in-the-middle attack (rare)</li>
              </ul>
              <div className="font-semibold mt-3 mb-1">Solutions:</div>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs mt-2">
                <div className="text-gray-400"># Remove old host key</div>
                <div className="text-white">ssh-keygen -R sftp.yourcompany.com</div>
                <div className="text-gray-400 mt-2"># Or edit known_hosts manually</div>
                <div className="text-white">nano ~/.ssh/known_hosts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-green-600 flex items-center gap-2">
          <CheckCircle size={24} />
          Connection Test Checklist
        </h3>
        
        <div className="space-y-2">
          {[
            'Verify you have the correct private key file',
            'Confirm private key permissions are 600 (Linux/Mac)',
            'Test basic SSH connectivity: ssh -v user@server',
            'Verify you are member of SFTP_Users group',
            'Check firewall allows outbound port 22',
            'Confirm server address and port are correct',
            'Test from command line before using GUI tools',
            'Check with administrator that public key is deployed'
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
              <div className="text-green-600 mt-1">□</div>
              <div className="text-gray-700">{item}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-blue-900">Need Help?</h4>
            <p className="text-sm text-blue-800 mt-2">Contact your system administrator with:</p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside ml-4">
              <li>Your username</li>
              <li>Client operating system and SFTP software</li>
              <li>Complete error message</li>
              <li>Time of connection attempt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const SecurityBestPractices = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <Shield size={24} className="text-blue-600" />
          Private Key Security
        </h3>
        
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <h4 className="font-bold text-red-900 mb-2">CRITICAL SECURITY RULES</h4>
            <ul className="text-sm text-red-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">❌</span>
                <span>NEVER share your private key file with anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">❌</span>
                <span>NEVER email or upload private keys to cloud storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">❌</span>
                <span>NEVER commit private keys to version control (Git)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">❌</span>
                <span>NEVER store private keys on shared network drives</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-bold text-green-900 mb-2">BEST PRACTICES</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Store private keys in ~/.ssh/ with 600 permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Use strong passphrases to encrypt private keys</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Keep backups of keys in secure, encrypted storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Report lost or compromised keys immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span>Request key rotation every 12-24 months</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold text-gray-800 mb-3">File Permission Reference</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 font-bold">File</th>
                  <th className="text-left py-2 font-bold">Permissions</th>
                  <th className="text-left py-2 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-200">
                  <td className="py-2">id_ed25519</td>
                  <td className="py-2 text-blue-600">600 (-rw-------)</td>
                  <td className="py-2 text-gray-600">Private key - owner read/write only</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">id_ed25519.pub</td>
                  <td className="py-2 text-green-600">644 (-rw-r--r--)</td>
                  <td className="py-2 text-gray-600">Public key - can be shared</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-2">~/.ssh/</td>
                  <td className="py-2 text-blue-600">700 (drwx------)</td>
                  <td className="py-2 text-gray-600">SSH directory - owner access only</td>
                </tr>
                <tr>
                  <td className="py-2">known_hosts</td>
                  <td className="py-2 text-green-600">644 (-rw-r--r--)</td>
                  <td className="py-2 text-gray-600">Host keys - can be readable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Access Control & Restrictions</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={18} />
              What You CAN Do
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Upload files to /upload directory</li>
              <li>• Download files from accessible directories</li>
              <li>• List directory contents</li>
              <li>• Delete your own uploaded files</li>
              <li>• Create subdirectories in /upload</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="text-red-600" size={18} />
              What You CANNOT Do
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Access other users' directories</li>
              <li>• Write to root directory (/)</li>
              <li>• Execute commands on server</li>
              <li>• Port forwarding or tunneling</li>
              <li>• Access files outside chroot jail</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Compliance & Data Handling</h3>
        
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 mt-1 flex-shrink-0" size={18} />
            <div>
              <span className="font-semibold">Encryption:</span> All data is encrypted in transit using AES-256 and ChaCha20-Poly1305 ciphers
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="text-purple-600 mt-1 flex-shrink-0" size={18} />
            <div>
              <span className="font-semibold">Authentication:</span> Strong cryptographic key-based authentication (Ed25519/RSA-4096)
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="text-green-600 mt-1 flex-shrink-0" size={18} />
            <div>
              <span className="font-semibold">Logging:</span> All connection attempts and file operations are logged and monitored
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 mt-1 flex-shrink-0" size={18} />
            <div>
              <span className="font-semibold">Data Classification:</span> Only upload data classified for external sharing per company policy
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickReference = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Quick Connection Reference</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-blue-100">Server Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Protocol:</span>
                <span className="font-mono">SFTP (SSH File Transfer)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Port:</span>
                <span className="font-mono">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Domain:</span>
                <span className="font-mono">PATHERANDPATHER</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Auth Method:</span>
                <span className="font-mono">SSH Key Only</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-blue-100">Your Access</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Home Directory:</span>
                <span className="font-mono">/</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Upload Directory:</span>
                <span className="font-mono">/upload</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Access Type:</span>
                <span className="font-mono">Chroot Jail (Isolated)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Key Type:</span>
                <span className="font-mono">Ed25519 / RSA-4096</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow">
          <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
            <Monitor size={20} />
            Windows
          </h4>
          <div className="text-sm space-y-2">
            <div className="font-semibold text-gray-800">Recommended Tool:</div>
            <div className="text-gray-700">WinSCP (GUI)</div>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-2">
              sftp -i key user@host
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-green-500 rounded-lg p-4 shadow">
          <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
            <Monitor size={20} />
            Linux
          </h4>
          <div className="text-sm space-y-2">
            <div className="font-semibold text-gray-800">Recommended Tool:</div>
            <div className="text-gray-700">Native sftp command</div>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-2">
              sftp -i ~/.ssh/key user@host
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-purple-500 rounded-lg p-4 shadow">
          <h4 className="font-bold text-purple-600 mb-3 flex items-center gap-2">
            <Monitor size={20} />
            macOS
          </h4>
          <div className="text-sm space-y-2">
            <div className="font-semibold text-gray-800">Recommended Tool:</div>
            <div className="text-gray-700">Cyberduck / Native sftp</div>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-2">
              sftp -i ~/.ssh/key user@host
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Common SFTP Commands</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Navigation & Listing</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs space-y-1">
              <div><span className="text-yellow-400">ls</span><span className="text-gray-400"> - List files</span></div>
              <div><span className="text-yellow-400">pwd</span><span className="text-gray-400"> - Current directory</span></div>
              <div><span className="text-yellow-400">cd upload</span><span className="text-gray-400"> - Change directory</span></div>
              <div><span className="text-yellow-400">lcd /local</span><span className="text-gray-400"> - Local directory</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">File Operations</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs space-y-1">
              <div><span className="text-yellow-400">put file.txt</span><span className="text-gray-400"> - Upload</span></div>
              <div><span className="text-yellow-400">get file.txt</span><span className="text-gray-400"> - Download</span></div>
              <div><span className="text-yellow-400">rm file.txt</span><span className="text-gray-400"> - Delete</span></div>
              <div><span className="text-yellow-400">mkdir folder</span><span className="text-gray-400"> - Create directory</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
        <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
          <Download size={18} />
          Download Complete User Guide (PDF)
        </h4>
        <p className="text-sm text-amber-800">
          For a comprehensive offline reference including screenshots and detailed troubleshooting,
          contact your system administrator for the complete SFTP User Guide PDF.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">SFTP Remote Connection Guide</h1>
              <p className="text-blue-100">Secure File Transfer Protocol - User Documentation</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Server size={16} />
                  <span>Windows Server 2019</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>OpenSSH Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={16} />
                  <span>Key-Based Authentication</span>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">Port 22</div>
              <div className="text-sm text-blue-100">SFTP Protocol</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
          <div className="flex border-b">
            <TabButton id="overview" label="Overview" icon={FileText} />
            <TabButton id="windows" label="Windows" icon={Monitor} />
            <TabButton id="linux-mac" label="Linux/macOS" icon={Monitor} />
            <TabButton id="troubleshooting" label="Troubleshooting" icon={AlertCircle} />
            <TabButton id="security" label="Security" icon={Shield} />
            <TabButton id="reference" label="Quick Reference" icon={Key} />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'overview' && <ConnectionDiagram />}
          {activeTab === 'windows' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <Monitor className="text-blue-600" size={32} />
                Windows Client Connection Instructions
              </h2>
              <WindowsInstructions />
            </div>
          )}
          {activeTab === 'linux-mac' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <Monitor className="text-green-600" size={32} />
                Linux & macOS Connection Instructions
              </h2>
              <LinuxMacInstructions />
            </div>
          )}
          {activeTab === 'troubleshooting' && <TroubleshootingGuide />}
          {activeTab === 'security' && <SecurityBestPractices />}
          {activeTab === 'reference' && <QuickReference />}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>For technical support or questions, contact your system administrator</p>
          <p className="mt-2">Document Version 1.0 | Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SFTPConnectionGuide;