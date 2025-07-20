# DevOps Studio

A professional development environment with integrated Claude AI and multi-terminal support, designed for engineers and developers worldwide.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### 🤖 **Claude AI Integration**
- **Real Claude CLI Execution**: Execute `claude --code` commands directly within the workspace
- **Streaming Output**: Real-time streaming of Claude responses to chat interface
- **Context Sharing**: Seamless communication between terminal and Claude AI
- **Quick Actions**: Pre-built commands for project analysis, git review, and debugging

### 💻 **Multi-Terminal Support**
- **Native Terminal Execution**: Real command execution via node-pty integration
- **Multi-Shell Support**: Bash, PowerShell, and Command Prompt
- **Session Management**: Multiple terminal tabs with persistence
- **Cross-Platform**: Automatic shell detection based on platform

### ⚡ **Productivity Tools**
- **System Monitoring**: Real-time CPU, memory, and network monitoring
- **File Management**: Integrated file browser with project navigation
- **Notes System**: Organized note-taking with categories
- **Settings Management**: Comprehensive configuration with export/import

### 🎨 **Professional Interface**
- **Dynamic Theming**: Real-time color switching (Red, Silver, Green accents)
- **Responsive Design**: Mobile-friendly interface with proper contrast
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Dark Mode**: Professional dark interface optimized for development

## 📦 Installation

### Download Pre-built Binaries
- **Windows**: Download `.exe` installer from [Releases](https://github.com/nishens/ai-workspace/releases)
- **macOS**: Download `.dmg` package from [Releases](https://github.com/nishens/ai-workspace/releases)
- **Linux**: Download `.AppImage` from [Releases](https://github.com/nishens/ai-workspace/releases)

### Build from Source

#### Prerequisites
- Node.js 18+ 
- npm 8+
- Claude CLI installed and configured

#### Steps
```bash
# Clone the repository
git clone https://github.com/nishens/ai-workspace.git
cd ai-workspace

# Install dependencies
npm install

# Development mode
npm run electron:dev

# Build for production
npm run dist
```

#### Platform-specific builds
```bash
# Windows
npm run dist:win

# macOS  
npm run dist:mac

# Linux
npm run dist:linux
```

## 🎯 Usage

### Quick Start
1. **Launch the application**
2. **Claude AI Tab**: Send messages and execute Claude commands
3. **Terminal Tab**: Access native terminal with multiple shell support
4. **Files Tab**: Browse and manage project files
5. **Tools Tab**: Monitor system performance and run utilities
6. **Settings Tab**: Customize appearance and behavior

### Key Workflows

#### Claude Command Execution
```bash
# From terminal
claude --code "analyze this project structure"

# From Claude AI interface
Quick action buttons or direct message input
```

#### Terminal Operations
- **Ctrl/Cmd+T**: New terminal session
- **Ctrl/Cmd+Shift+T**: New PowerShell session
- **Multiple tabs**: Switch between different shell sessions

#### Navigation
- **Ctrl/Cmd+1**: Claude AI
- **Ctrl/Cmd+2**: Terminal  
- **Ctrl/Cmd+3**: Files
- **Ctrl/Cmd+4**: Notes
- **Ctrl/Cmd+5**: System Tools

## 🛠️ Technical Architecture

### Frontend
- **Next.js 14.2.5**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom themes
- **React Context**: Global state management

### Desktop Integration  
- **Electron**: Cross-platform desktop framework
- **IPC Communication**: Secure renderer-main process communication
- **Native Menus**: Platform-appropriate menu systems
- **Auto-updater**: Seamless application updates

### Terminal Integration
- **node-pty**: Native pseudo-terminal functionality
- **Multi-shell**: Support for Bash, PowerShell, CMD
- **Process Management**: Secure subprocess handling

### Claude Integration
- **CLI Subprocess**: Execute claude commands via child_process
- **Real-time Streaming**: Live output streaming to interface
- **Context Preservation**: Maintain conversation context across components

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, Ubuntu 18.04
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Network**: Internet connection for Claude AI features

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 8GB+
- **Storage**: 1GB free space
- **Claude CLI**: Installed and authenticated

## 🔧 Configuration

### Settings Categories
- **Appearance**: Theme, colors, font size, animations
- **Notifications**: System alerts, sound preferences
- **Performance**: Auto-save, monitoring intervals
- **Privacy**: Data encryption, usage analytics
- **Advanced**: Debug mode, custom CSS, experimental features

### Export/Import
Settings can be exported as JSON and imported for backup or sharing configurations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)
- **Issues**: [GitHub Issues](https://github.com/nishens/ai-workspace/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nishens/ai-workspace/discussions)

## 🙏 Acknowledgments

- **Anthropic**: For Claude AI and CLI tools
- **Electron Team**: For the amazing desktop framework
- **Next.js Team**: For the excellent React framework
- **Open Source Community**: For the countless libraries that made this possible

---

**Built with ❤️ for the global engineering community**

*Empowering developers with AI-integrated workflows since 2025*