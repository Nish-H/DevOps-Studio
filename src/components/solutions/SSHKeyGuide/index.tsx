import React, { useState } from 'react';
import { Key, Terminal, Lock, Shield, Copy, CheckCircle, AlertCircle, Monitor, Server, Github, GitBranch, Folder, Eye, EyeOff, RefreshCw } from 'lucide-react';

const SSHKeyGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOS, setSelectedOS] = useState('windows');
  const [selectedKeyType, setSelectedKeyType] = useState('ed25519');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

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

  const CommandBlock = ({ command, description, id }: { command: string; description: string; id: string }) => (
    <div className="bg-gray-800 rounded-lg p-4 mb-3">
      <p className="text-sm text-gray-400 mb-2">{description}</p>
      <div className="flex items-center justify-between bg-gray-900 rounded p-3">
        <code className="text-green-400 text-sm flex-1 font-mono">{command}</code>
        <button
          onClick={() => copyToClipboard(command, id)}
          className="ml-3 p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          {copiedCommand === id ? <CheckCircle size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );

  const KeyTypeCard = ({ type, title, description, recommended, speed, security }) => (
    <div
      onClick={() => setSelectedKeyType(type)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selectedKeyType === type
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-800">{title}</h4>
        {recommended && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>}
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex gap-4 text-xs">
        <div>
          <span className="text-gray-500">Speed: </span>
          <span className="font-medium text-gray-700">{speed}</span>
        </div>
        <div>
          <span className="text-gray-500">Security: </span>
          <span className="font-medium text-gray-700">{security}</span>
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key className="text-blue-600" size={28} />
          SSH Key Authentication Overview
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          SSH (Secure Shell) keys provide a more secure and convenient way to authenticate to remote servers compared to passwords.
          They use public-key cryptography where a key pair consists of a private key (kept secret) and a public key (shared with servers).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="text-green-600" size={20} />
              <h3 className="font-bold text-gray-800">Private Key</h3>
            </div>
            <p className="text-sm text-gray-600">Never share this file. Keep it secure on your local machine. Used to prove your identity.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <Server className="text-blue-600" size={20} />
              <h3 className="font-bold text-gray-800">Public Key</h3>
            </div>
            <p className="text-sm text-gray-600">Safe to share. Added to servers and services. Used to verify your private key signature.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Your Key Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KeyTypeCard
            type="ed25519"
            title="ED25519"
            description="Modern, fast, and secure. Recommended for most use cases."
            recommended={true}
            speed="Excellent"
            security="Very High"
          />
          <KeyTypeCard
            type="rsa"
            title="RSA 4096"
            description="Traditional and widely supported. Good for compatibility."
            recommended={false}
            speed="Good"
            security="High"
          />
          <KeyTypeCard
            type="ecdsa"
            title="ECDSA"
            description="Elliptic curve algorithm. Good balance of speed and security."
            recommended={false}
            speed="Very Good"
            security="High"
          />
          <KeyTypeCard
            type="rsa2048"
            title="RSA 2048"
            description="Older standard, minimum recommended RSA size."
            recommended={false}
            speed="Fair"
            security="Medium"
          />
        </div>
      </div>
    </div>
  );

  const GenerationTab = () => {
    const getCommand = () => {
      const email = 'your.email@example.com';
      switch (selectedKeyType) {
        case 'ed25519':
          return `ssh-keygen -t ed25519 -C "${email}"`;
        case 'rsa':
          return `ssh-keygen -t rsa -b 4096 -C "${email}"`;
        case 'ecdsa':
          return `ssh-keygen -t ecdsa -b 521 -C "${email}"`;
        case 'rsa2048':
          return `ssh-keygen -t rsa -b 2048 -C "${email}"`;
        default:
          return `ssh-keygen -t ed25519 -C "${email}"`;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Terminal className="text-blue-600" size={24} />
            <div>
              <h3 className="font-bold text-gray-800">Generate SSH Key: {selectedKeyType.toUpperCase()}</h3>
              <p className="text-sm text-gray-600">Follow the platform-specific instructions below</p>
            </div>
          </div>
          <select
            value={selectedOS}
            onChange={(e) => setSelectedOS(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium"
          >
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
            <option value="macos">macOS</option>
          </select>
        </div>

        {selectedOS === 'windows' && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Windows Instructions</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 1: Open PowerShell or Command Prompt</h4>
                <p className="text-gray-600 text-sm mb-2">Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Win + X</kbd> and select "Windows PowerShell" or "Terminal"</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 2: Generate the Key</h4>
                <CommandBlock
                  command={getCommand()}
                  description="Generate your SSH key pair (replace email with your actual email)"
                  id="win-gen"
                />
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 3: Follow the Prompts</h4>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-sm">
                  <p><strong>File location:</strong> Press Enter to use default location <code className="bg-gray-200 px-1 rounded">C:\Users\YourName\.ssh\id_{selectedKeyType}</code></p>
                  <p><strong>Passphrase:</strong> Enter a strong passphrase (optional but recommended)</p>
                  <p><strong>Confirm passphrase:</strong> Re-enter the same passphrase</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 4: Verify Key Creation</h4>
                <CommandBlock
                  command={`dir $env:USERPROFILE\\.ssh`}
                  description="List SSH directory contents to verify key files"
                  id="win-verify"
                />
                <p className="text-sm text-gray-600 mt-2">You should see <code className="bg-gray-100 px-1 rounded">id_{selectedKeyType}</code> (private) and <code className="bg-gray-100 px-1 rounded">id_{selectedKeyType}.pub</code> (public)</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 5: Copy Public Key</h4>
                <CommandBlock
                  command={`type $env:USERPROFILE\\.ssh\\id_${selectedKeyType}.pub | clip`}
                  description="Copy public key to clipboard (ready to paste into services)"
                  id="win-copy"
                />
              </div>
            </div>
          </div>
        )}

        {selectedOS === 'linux' && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Linux Instructions</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 1: Open Terminal</h4>
                <p className="text-gray-600 text-sm">Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl + Alt + T</kbd> or search for "Terminal" in your applications</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 2: Generate the Key</h4>
                <CommandBlock
                  command={getCommand()}
                  description="Generate your SSH key pair"
                  id="linux-gen"
                />
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 3: Follow the Prompts</h4>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-sm">
                  <p><strong>File location:</strong> Press Enter to use default <code className="bg-gray-200 px-1 rounded">~/.ssh/id_{selectedKeyType}</code></p>
                  <p><strong>Passphrase:</strong> Enter a strong passphrase (highly recommended for Linux servers)</p>
                  <p><strong>Confirm passphrase:</strong> Re-enter the passphrase</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 4: Set Correct Permissions</h4>
                <CommandBlock
                  command={`chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_${selectedKeyType}`}
                  description="Secure your private key with proper permissions (critical for security)"
                  id="linux-chmod"
                />
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 5: Copy Public Key</h4>
                <CommandBlock
                  command={`cat ~/.ssh/id_${selectedKeyType}.pub`}
                  description="Display public key (select and copy the output)"
                  id="linux-cat"
                />
                <p className="text-sm text-gray-600 mt-2">Or use xclip to copy directly to clipboard:</p>
                <CommandBlock
                  command={`xclip -sel clip < ~/.ssh/id_${selectedKeyType}.pub`}
                  description="Copy to clipboard (requires xclip: sudo apt install xclip)"
                  id="linux-xclip"
                />
              </div>
            </div>
          </div>
        )}

        {selectedOS === 'macos' && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">macOS Instructions</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 1: Open Terminal</h4>
                <p className="text-gray-600 text-sm">Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Cmd + Space</kbd>, type "Terminal", and press Enter</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 2: Generate the Key</h4>
                <CommandBlock
                  command={getCommand()}
                  description="Generate your SSH key pair"
                  id="mac-gen"
                />
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 3: Follow the Prompts</h4>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-sm">
                  <p><strong>File location:</strong> Press Enter for default <code className="bg-gray-200 px-1 rounded">~/.ssh/id_{selectedKeyType}</code></p>
                  <p><strong>Passphrase:</strong> Enter a strong passphrase (recommended)</p>
                  <p><strong>Confirm passphrase:</strong> Re-enter the passphrase</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 4: Add to Keychain (Optional)</h4>
                <CommandBlock
                  command={`ssh-add --apple-use-keychain ~/.ssh/id_${selectedKeyType}`}
                  description="Store passphrase in macOS Keychain for convenience"
                  id="mac-keychain"
                />
                <p className="text-sm text-gray-600 mt-2">Then add this to <code className="bg-gray-100 px-1 rounded">~/.ssh/config</code>:</p>
                <div className="bg-gray-800 rounded p-3 mt-2">
                  <code className="text-green-400 text-sm font-mono whitespace-pre">
{`Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_${selectedKeyType}`}
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Step 5: Copy Public Key</h4>
                <CommandBlock
                  command={`pbcopy < ~/.ssh/id_${selectedKeyType}.pub`}
                  description="Copy public key to clipboard (ready to paste)"
                  id="mac-copy"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const UsageTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Server className="text-green-600" size={28} />
          Using Your SSH Keys
        </h2>
        <p className="text-gray-700">Add your public key to various services and servers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub */}
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Github className="text-gray-800" size={24} />
            <h3 className="text-lg font-bold text-gray-800">GitHub</h3>
          </div>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Go to GitHub.com → Settings → SSH and GPG keys</li>
            <li>2. Click "New SSH key"</li>
            <li>3. Title: "Work Laptop" (or descriptive name)</li>
            <li>4. Paste your public key</li>
            <li>5. Click "Add SSH key"</li>
          </ol>
          <CommandBlock
            command="ssh -T git@github.com"
            description="Test your GitHub connection"
            id="github-test"
          />
        </div>

        {/* GitLab */}
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="text-orange-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">GitLab</h3>
          </div>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Go to GitLab.com → Preferences → SSH Keys</li>
            <li>2. Paste your public key in the "Key" field</li>
            <li>3. Title: Descriptive name for this key</li>
            <li>4. Optional: Set expiration date</li>
            <li>5. Click "Add key"</li>
          </ol>
          <CommandBlock
            command="ssh -T git@gitlab.com"
            description="Test your GitLab connection"
            id="gitlab-test"
          />
        </div>

        {/* Linux Server */}
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Server className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Linux Server</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Add your public key to a remote Linux server:</p>
          <CommandBlock
            command={`ssh-copy-id -i ~/.ssh/id_${selectedKeyType}.pub user@server.example.com`}
            description="Automated method (easiest)"
            id="server-copy-id"
          />
          <p className="text-sm text-gray-600 mt-3 mb-2">Or manually:</p>
          <CommandBlock
            command={`cat ~/.ssh/id_${selectedKeyType}.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"`}
            description="Manual method (if ssh-copy-id not available)"
            id="server-manual"
          />
        </div>

        {/* Azure DevOps */}
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Folder className="text-blue-500" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Azure DevOps</h3>
          </div>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Go to User Settings → SSH public keys</li>
            <li>2. Click "+ New Key"</li>
            <li>3. Name: Descriptive key name</li>
            <li>4. Paste your public key data</li>
            <li>5. Click "Add"</li>
          </ol>
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
            <strong>Note:</strong> Azure DevOps requires RSA keys with minimum 2048 bits
          </div>
        </div>
      </div>
    </div>
  );

  const ManagementTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Folder className="text-purple-600" size={28} />
          Key Management & Best Practices
        </h2>
        <p className="text-gray-700">Manage multiple keys and maintain security</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw className="text-blue-600" size={22} />
          Managing Multiple Keys
        </h3>
        <p className="text-gray-600 mb-4">Create an SSH config file to manage multiple keys for different services:</p>

        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-2">Create or edit <code className="bg-gray-100 px-2 py-1 rounded">~/.ssh/config</code></p>
          <div className="bg-gray-800 rounded-lg p-4">
            <code className="text-green-400 text-sm font-mono whitespace-pre">
{`# GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github

# GitLab
Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_ed25519_gitlab

# Company Server
Host company-server
  HostName server.company.com
  User your-username
  IdentityFile ~/.ssh/id_rsa_company
  Port 2222`}
            </code>
          </div>
        </div>

        <CommandBlock
          command="ssh -T github.com"
          description="Test connection using config (no need to specify key)"
          id="config-test"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="text-green-600" size={22} />
          Security Best Practices
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-800">Use ED25519 keys when possible</h4>
              <p className="text-sm text-gray-600">Modern, secure, and faster than RSA</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-800">Always use a strong passphrase</h4>
              <p className="text-sm text-gray-600">Protects your private key if device is compromised</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-800">Set correct file permissions</h4>
              <p className="text-sm text-gray-600">Private key: 600, Public key: 644, .ssh directory: 700</p>
              <CommandBlock
                command="chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_* && chmod 644 ~/.ssh/*.pub"
                description="Fix all SSH permissions at once (Linux/macOS)"
                id="fix-perms"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-800">Use different keys for different purposes</h4>
              <p className="text-sm text-gray-600">Separate keys for work, personal, and high-security servers</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-800">Rotate keys periodically</h4>
              <p className="text-sm text-gray-600">Generate new keys every 1-2 years for sensitive systems</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-gray-800">Never share your private key</h4>
              <p className="text-sm text-gray-600">Only share the .pub file. Private key stays on your machine.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="text-orange-600" size={22} />
          View Your Keys
        </h3>
        <CommandBlock
          command="ls -la ~/.ssh"
          description="List all SSH keys and files"
          id="list-keys"
        />
        <CommandBlock
          command={`ssh-keygen -lf ~/.ssh/id_${selectedKeyType}.pub`}
          description="Show fingerprint of your public key"
          id="fingerprint"
        />
        <CommandBlock
          command="ssh-add -l"
          description="List keys currently loaded in SSH agent"
          id="agent-list"
        />
      </div>
    </div>
  );

  const TroubleshootingTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle className="text-red-600" size={28} />
          Troubleshooting Common Issues
        </h2>
        <p className="text-gray-700">Solutions to frequent SSH key problems</p>
      </div>

      <div className="space-y-4">
        {/* Issue 1 */}
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">❌ Permission denied (publickey)</h3>
          <p className="text-gray-600 mb-3 text-sm">This usually means the server doesn't have your public key or SSH agent isn't running.</p>
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Solutions:</p>
            <CommandBlock
              command="ssh-add ~/.ssh/id_ed25519"
              description="Add your key to SSH agent"
              id="add-key"
            />
            <CommandBlock
              command="ssh -vT git@github.com"
              description="Verbose output to debug connection"
              id="verbose"
            />
            <CommandBlock
              command="cat ~/.ssh/id_ed25519.pub"
              description="Verify public key is correct"
              id="verify-pub"
            />
          </div>
        </div>

        {/* Issue 2 */}
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-orange-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ Bad permissions warning</h3>
          <p className="text-gray-600 mb-3 text-sm">SSH requires strict file permissions for security.</p>
          <CommandBlock
            command="chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519 && chmod 644 ~/.ssh/id_ed25519.pub"
            description="Fix SSH file permissions (Linux/macOS)"
            id="fix-perms-issue"
          />
          <div className="mt-3 p-3 bg-orange-50 rounded text-sm">
            <strong>Windows:</strong> Right-click private key → Properties → Security → Advanced → Disable inheritance → Remove all users except yourself
          </div>
        </div>

        {/* Issue 3 */}
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">⚠️ SSH agent not running</h3>
          <p className="text-gray-600 mb-3 text-sm">The SSH agent manages your keys and passphrases.</p>
          <CommandBlock
            command="eval $(ssh-agent -s)"
            description="Start SSH agent (Linux/macOS)"
            id="start-agent-unix"
          />
          <CommandBlock
            command="Get-Service ssh-agent | Set-Service -StartupType Automatic -PassThru | Start-Service"
            description="Start SSH agent (Windows PowerShell as Admin)"
            id="start-agent-win"
          />
        </div>

        {/* Issue 4 */}
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔍 Key not being offered to server</h3>
          <p className="text-gray-600 mb-3 text-sm">Force SSH to use a specific key file.</p>
          <CommandBlock
            command="ssh -i ~/.ssh/id_ed25519 user@server.com"
            description="Specify key explicitly"
            id="explicit-key"
          />
          <p className="text-sm text-gray-600 mt-2">Or add to ~/.ssh/config for permanent solution (see Management tab)</p>
        </div>

        {/* Issue 5 */}
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🔄 Key rejected by service (GitHub/GitLab)</h3>
          <p className="text-gray-600 mb-3 text-sm">The public key might not be added correctly or is expired.</p>
          <div className="space-y-2">
            <CommandBlock
              command="cat ~/.ssh/id_ed25519.pub"
              description="Copy your ENTIRE public key (including ssh-ed25519 and email)"
              id="full-pub"
            />
            <p className="text-sm text-gray-700">Common mistakes:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
              <li>Only copying part of the key</li>
              <li>Adding extra spaces or line breaks</li>
              <li>Using the private key instead of public (.pub file)</li>
              <li>Key has expired (check service settings)</li>
            </ul>
          </div>
        </div>

        {/* Issue 6 */}
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-lg font-bold text-gray-800 mb-2">✅ Test your SSH connection</h3>
          <p className="text-gray-600 mb-3 text-sm">Verify everything is working correctly.</p>
          <CommandBlock
            command="ssh -T git@github.com"
            description="Test GitHub connection"
            id="test-github"
          />
          <CommandBlock
            command="ssh -T git@gitlab.com"
            description="Test GitLab connection"
            id="test-gitlab"
          />
          <CommandBlock
            command="ssh -v user@server.com"
            description="Test server connection with verbose output"
            id="test-server"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SSH Key Generation & Management</h1>
                <p className="text-sm text-gray-600">Complete guide for creating and managing SSH keys</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>Version 1.0.0</div>
              <div>DevOps Studio</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton id="overview" label="Overview" icon={Key} />
            <TabButton id="generation" label="Generate Keys" icon={Terminal} />
            <TabButton id="usage" label="Usage" icon={Server} />
            <TabButton id="management" label="Management" icon={Folder} />
            <TabButton id="troubleshooting" label="Troubleshooting" icon={AlertCircle} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'generation' && <GenerationTab />}
        {activeTab === 'usage' && <UsageTab />}
        {activeTab === 'management' && <ManagementTab />}
        {activeTab === 'troubleshooting' && <TroubleshootingTab />}
      </div>
    </div>
  );
};

export default SSHKeyGuide;
