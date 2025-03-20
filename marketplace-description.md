# Sync-Rsync Extended

Sync-Rsync Extended is a powerful VS Code extension that enhances your development workflow with advanced rsync synchronization capabilities. Built on the original Sync-Rsync, this extended version adds:

• Multi-site support with template inheritance
• Pre/post sync commands for automated workflows
• Automatic sync on save/load
• Progress tracking and notifications
• Windows, macOS, and Linux support
• WSL and Cygwin integration
• Advanced file filtering with include/exclude patterns
• Customizable rsync flags and options

Perfect for developers working with remote servers, this extension provides seamless file synchronization with your development environment.

## Features

- **Multi-site Support**: Manage multiple remote servers with different configurations
- **Template System**: Create reusable configurations for similar environments
- **Automated Workflows**: Pre/post sync commands for cache clearing, deployments, etc.
- **Smart Sync**: Automatic file synchronization on save/load
- **Progress Tracking**: Real-time sync progress and status notifications
- **Cross-Platform**: Full support for Windows, macOS, and Linux
- **WSL & Cygwin**: Native support for Windows Subsystem for Linux and Cygwin
- **Advanced Filtering**: Fine-grained control over which files to sync
- **Customizable**: Extensive configuration options for rsync behavior

## Requirements

- rsync installed on both local and remote systems
- For Windows users: WSL (Windows 10 1803+) or Cygwin
- For WSL users: wslpath (optional)

## Quick Start

1. Install the extension
2. Configure your first site in settings.json:
```json
{
    "sync-rsync.sites": [{
        "name": "My Server",
        "remotePath": "user@server:/path/to/files/",
        "localPath": "/path/to/local/files/"
    }]
}
```
3. Use the status bar to select your site
4. Use the command palette (Ctrl/Cmd+Shift+P) to run sync commands

## Tags

rsync, sync, deployment, remote, file-sync, sftp, ssh, remote-development, file-transfer, automation 