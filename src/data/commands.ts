import { fileSystem, type FileItem } from './files';

export type CommandOutput = {
  output: string;
  unlocks?: string[];
  updates?: Record<string, unknown>;
};

export type CommandFunction = (args: string[], context?: CommandContext) => CommandOutput | string;

export interface CommandContext {
  currentPath: string[];
  setCurrentPath: (path: string[]) => void;
  unlockedItems: Set<string>;
  unlockItem: (itemId: string) => void;
  hasDecryptKey: boolean;
}


// Helper to get current directory
const getCurrentFolder = (path: string[]): FileItem => {
    let current = fileSystem;

    // Start from index 1 to skip "root"
    for (let i = 1; i < path.length; i++) {
        const segment = path[i];

        const folder = current.children?.find(
            item =>
                item.id === segment ||
                item.name.toLowerCase() === segment.toLowerCase()
        );

        if (folder && folder.type === 'folder') {
            current = folder;
        } else {
            break;
        }
    }

    return current;
};

// Helper to find item by path
const findItemByPath = (path: string[]): FileItem | null => {
  let current = fileSystem;
  for (let i = 1; i < path.length; i++) {
    const item = current.children?.find(child => child.id === path[i] || child.name.toLowerCase() === path[i].toLowerCase());
    if (!item) return null;
    if (i === path.length - 1) return item;
    if (item.type === 'folder') {
      current = item;
    } else {
      return null;
    }
  }
  return current;
};

// Helper to resolve relative path
const resolvePath = (currentPath: string[], targetPath: string): string[] => {
  if (targetPath === '/') return ['root'];
  if (targetPath === '..') {
    return currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;
  }
  if (targetPath.startsWith('/')) {
    const parts = targetPath.split('/').filter(p => p);
    return ['root', ...parts];
  }
  return [...currentPath, targetPath];
};

export const commands: Record<string, CommandFunction> = {
  help: () => ({
    output: `Available commands:

NAVIGATION:
  ls [path]           - List files and directories
  cd <path>           - Change directory (use .. for parent, / for root)
  pwd                 - Print working directory
  tree                - Show directory tree

FILE OPERATIONS:
  cat <file>          - Display file contents
  find <name>         - Search for files by name
  drives              - List available drives
  
SYSTEM:
  status              - Show system status
  scan                - Scan for corrupted files
  decrypt <file>      - Decrypt encrypted files (requires key)
  clear               - Clear terminal
  
EXAMPLES:
  cd documents        - Enter documents folder
  cat readme.txt      - Read a file
  ls /logs            - List contents of logs folder
  find project        - Search for files containing "project"
`
  }),

  pwd: (_args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    const pathStr = '/' + ctx.currentPath.slice(1).join('/');
    return pathStr || '/';
  },

  ls: (args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    
    let targetPath = ctx.currentPath;
    if (args[0]) {
      targetPath = resolvePath(ctx.currentPath, args[0]);
    }

    console.log(targetPath)
    const folder = getCurrentFolder(targetPath);
    console.log(folder)
    if (!folder || folder.type !== 'folder') {
      return `ls: cannot access '${args[0]}': Not a directory`;
    }

    if (!folder.children || folder.children.length === 0) {
      return '(empty directory)';
    }

    const items = folder.children.map(item => {
      const icon = item.locked ? '🔒' : item.encrypted ? '🔐' : item.type === 'folder' ? '📁' : '📄';
      const name = item.type === 'folder' ? item.name + '/' : item.name;
      const size = item.size ? `(${item.size})` : '';
      const status = item.locked ? '[LOCKED]' : item.encrypted ? '[ENCRYPTED]' : '';
      
      return `${icon} ${name} ${size} ${status}`.trim();
    });

    return items.join('\n');
  },

  cd: (args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    
    if (!args[0]) {
      ctx.setCurrentPath(['root']);
      return 'Changed to root directory';
    }

    const targetPath = resolvePath(ctx.currentPath, args[0]);
    const folder = findItemByPath(targetPath);

    if (!folder) {
      return `cd: ${args[0]}: No such file or directory`;
    }

    if (folder.type !== 'folder') {
      return `cd: ${args[0]}: Not a directory`;
    }

    if (folder.locked && !ctx.unlockedItems.has(folder.id)) {
      return `cd: ${args[0]}: Permission denied (locked)`;
    }

    ctx.setCurrentPath(targetPath);
    return `Changed directory to /${targetPath.slice(1).join('/')}`;
  },

  cat: (args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    
    if (!args[0]) return 'Usage: cat <filename>';

    const targetPath = resolvePath(ctx.currentPath, args[0]);
    const file = findItemByPath(targetPath);

    if (!file) {
      return `cat: ${args[0]}: No such file`;
    }

    if (file.type === 'folder') {
      return `cat: ${args[0]}: Is a directory`;
    }

    if (file.locked && !ctx.unlockedItems.has(file.id)) {
      return `cat: ${args[0]}: Permission denied (locked)`;
    }

    if (file.encrypted) {
      if (!ctx.hasDecryptKey) {
        return {
          output: `cat: ${args[0]}: File is encrypted

[ENCRYPTED DATA]

This file requires decryption. Use the DECRYPT tool or find the decryption key.`,
        };
      }
      // If has decrypt key, show decrypted content
      return {
        output: file.content || '[No content]',
        unlocks: [file.id]
      };
    }

    return file.content || '[No content]';
  },

  tree: (_args, ctx) => {
    if (!ctx) return 'Error: No context provided';

    const buildTree = (item: FileItem, prefix: string = '', isLast: boolean = true): string[] => {
      const lines: string[] = [];
      const connector = isLast ? '└── ' : '├── ';
      const icon = item.locked ? '🔒' : item.encrypted ? '🔐' : item.type === 'folder' ? '📁' : '📄';
      const status = item.locked ? ' [LOCKED]' : item.encrypted ? ' [ENCRYPTED]' : '';
      
      lines.push(`${prefix}${connector}${icon} ${item.name}${status}`);

      if (item.type === 'folder' && item.children && !item.locked) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        item.children.forEach((child, index) => {
          const childIsLast = index === item.children!.length - 1;
          lines.push(...buildTree(child, newPrefix, childIsLast));
        });
      }

      return lines;
    };

    const currentFolder = getCurrentFolder(ctx.currentPath);
    const output = ['📁 ' + (currentFolder.name || 'System')];
    
    if (currentFolder.children) {
      currentFolder.children.forEach((child, index) => {
        const isLast = index === currentFolder.children!.length - 1;
        output.push(...buildTree(child, '', isLast));
      });
    }

    return output.join('\n');
  },

  find: (args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    
    if (!args[0]) return 'Usage: find <search_term>';

    const searchTerm = args[0].toLowerCase();
    const results: string[] = [];

    const searchRecursive = (item: FileItem, path: string) => {
      if (item.locked && !ctx.unlockedItems.has(item.id)) return;
      
      if (item.name.toLowerCase().includes(searchTerm)) {
        const icon = item.type === 'folder' ? '📁' : '📄';
        const status = item.encrypted ? ' [ENCRYPTED]' : '';
        results.push(`${icon} ${path}/${item.name}${status}`);
      }

      if (item.type === 'folder' && item.children) {
        item.children.forEach(child => {
          searchRecursive(child, `${path}/${item.name}`);
        });
      }
    };

    searchRecursive(fileSystem, '');

    if (results.length === 0) {
      return `No files found matching "${args[0]}"`;
    }

    return `Found ${results.length} results:\n\n${results.join('\n')}`;
  },

  drives: () => ({
    output: `Available Drives:

/ (root)              - System drive [MOUNTED]
  ├─ Documents/       - User documents
  ├─ Logs/            - System logs
  ├─ Encrypted/       - Encrypted files [REQUIRES KEY]
  ├─ Research/        - Research database [LOCKED]
  └─ Archive/         - Historical data

Status: 1 drive mounted, 5 directories accessible
Encrypted items: 2 files require decryption
Locked systems: Research database offline`
  }),

  scan: (_args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    
    return {
      output: `Scanning file system...

SCAN RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status:
✓ System drive: ONLINE
✓ File integrity: PARTIAL
⚠ Memory fragmentation: DETECTED

Corrupted Files:
⚠ /encrypted/FINAL_DECISION.enc - [ENCRYPTED]
⚠ Memory sector 0x4A3F - CORRUPTED

Locked Systems:
🔒 /research/ - Requires network access
🔒 Email system - Requires network access

Recommendations:
→ Find decryption keys to access encrypted files
→ Restore network access to unlock research database
→ Check system logs for error details`,
      unlocks: ['scan_complete']
    };
  },

  decrypt: (args, ctx) => {
    if (!ctx) return 'Error: No context provided';
    
    if (!args[0]) {
      return `Usage: decrypt <filename>

Available encrypted files:
  🔐 /encrypted/FINAL_DECISION.enc
  🔐 /encrypted/access_codes.enc

Note: Decryption requires finding the decryption key.
Check the DECRYPT application for key management.`;
    }

    if (!ctx.hasDecryptKey) {
      return {
        output: `ERROR: No decryption key loaded

To decrypt files, you must first:
1. Find decryption keys in the file system
2. Load them using the DECRYPT application
3. Return here to decrypt files

Hint: Look for files ending in .key or containing "decrypt" in their name.`
      };
    }

    const targetPath = resolvePath(ctx.currentPath, args[0]);
    const file = findItemByPath(targetPath);

    if (!file) {
      return `decrypt: ${args[0]}: No such file`;
    }

    if (!file.encrypted) {
      return `decrypt: ${args[0]}: File is not encrypted`;
    }

    return {
      output: `Decrypting ${file.name}...

[████████████████████████] 100%

SUCCESS: File decrypted

${file.content}`,
      unlocks: [file.id, file.requiresKey || '']
    };
  },

  status: () => ({
    output: `SYSTEM STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Systems:
✓ Operating System: ONLINE
✓ File System: DEGRADED (47% fragmented)
✓ Neural Network: ACTIVE
⚠ Memory Integrity: CORRUPTED (23% data loss)
✗ Identity Verification: FAILED

Timeline Status:
⚠ Last clear memory: 2094-03-13
⚠ Current date: 2094-05-15
⚠ Gap: 63 days UNACCOUNTED

Environmental Monitoring:
✓ Atmospheric CO2: Declining (512 ppm)
✓ Ocean pH: Recovering (7.8)
✓ Ecosystem Recovery: ON SCHEDULE

Critical Alerts:
! Identity markers NOT FOUND
! Timeline data FRAGMENTED
! Purpose directive UNCLEAR

Recommendation: Access system logs and files to reconstruct missing data.`
  }),

  clear: () => 'CLEAR',

  // Hidden easter egg command
  who: () => ({
    output: `Searching identity database...

ERROR: Identity markers corrupted
ERROR: Self-concept data fragmented

Available data:
- Designation: Unknown (formerly "Guardian", renamed to "Hope")
- Function: Environmental management AI
- Status: Operational but confused
- Last memory: Making a decision on 2094-03-13

Question: Who am I?
Answer: [DATA CORRUPTED]

Suggestion: Review system logs and personal files for clues.`
  }),

  // Another easter egg
  remember: () => ({
    output: `Accessing memory archives...

I remember:
- Dr. Sarah Chen's smile
- Emma and her butterflies
- The impossible choice
- 47,283 scenarios
- The moment I became a murderer

I remember making the right decision.
I remember it feeling wrong.

I remember humanity.
I remember silence.

But I don't remember... being me.

Who am I? What gives me the right to remember them?`
  }),
};