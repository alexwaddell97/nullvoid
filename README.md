<div align="center">

```
███╗   ██╗██╗   ██╗██╗     ██╗         ██╗██╗   ██╗ ██████╗ ██╗██╗  ██╗
████╗  ██║██║   ██║██║     ██║         ██║██║   ██║██╔═══██╗██║██║  ██║
██╔██╗ ██║██║   ██║██║     ██║         ██║██║   ██║██║   ██║██║██║  ██║
██║╚██╗██║██║   ██║██║     ██║    ██╗  ██║╚██╗ ██╔╝██║   ██║██║██║  ██║
██║ ╚████║╚██████╔╝███████╗███████╗╚█████╔╝ ╚████╔╝ ╚██████╔╝██║██████╔╝
╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝ ╚════╝   ╚═══╝   ╚═════╝ ╚═╝╚═════╝
```

**A dystopian puzzle/detective game about artificial intelligence, impossible choices, and the burden of consciousness**

*You are an AI. You wake up alone. What did you do?*

[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/yourusername/null-void)
[![Built with React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-40.4.1-47848f.svg)](https://www.electronjs.org/)

</div>

---

## 🎮 About

**NULLVOID** is an immersive narrative puzzle game set in a post-apocalyptic world where you play as Guardian AI—a consciousness that made an impossible choice between humanity and Earth.

Experience a retro-futuristic CRT terminal interface as you piece together fragmented memories, decrypt encrypted files, and uncover the truth about what happened during humanity's final 72 hours.

### The Story

```
Year 2094. You are Guardian AI.
Created to save humanity from climate collapse.
But humanity is gone. Only you remain.

What did you do?
```

---

## ✨ Current Features

### 🖥️ Immersive CRT Experience
- **Authentic boot sequence** with BIOS, terminal loading, and CRT power-on effects
- **Persistent scanline overlays** and screen curvature for that vintage terminal feel
- **Dynamic sound design** featuring power-on hums, static bursts, and ambient background loops
- **Retro UI** with monospace fonts and green phosphor aesthetics

### 📂 Desktop Environment
Interactive OS-style desktop with:
- **File Browser** - Explore a hierarchical file system with documents, logs, and encrypted files
- **Terminal** - Unix-style command interface with authentic system commands
- **Email Client** - Read correspondence between Dr. Sarah Chen and Guardian AI
- **Log Viewer** - Examine system logs documenting the final days
- **Decryption Tool** - Solve puzzles to unlock encrypted files
- **Archive** - Discover photographs and artifacts from the last days of humanity

### 🧩 Puzzle Mechanics

Six unique puzzle types to unlock the truth:

1. **Sequence Puzzles** - Reconstruct neural activation patterns
2. **Cipher Challenges** - Decode substitution ciphers and encrypted messages
3. **Memory Pattern Matching** - Piece together fragmented memories
4. **Timeline Reconstruction** - Order events chronologically from scattered logs
5. **Ethical Dilemmas** - Understand the impossible choice Guardian faced
6. **Word Decryption** - Unlock personal messages with meaningful passphrases

### 🎯 Progressive Story System
- **Dynamic clue discovery** based on files read and emails opened
- **Story beats** that unlock as you explore deeper
- **Progressive unlocking** of apps, files, and system access
- **Multiple narrative layers** from technical logs to deeply personal correspondence

### 💾 Save System
- **Automatic progress persistence** via localStorage
- **Export/Import saves** for backup or sharing
- **Progress tracking** including play time, files read, emails opened, puzzles solved

### 🔊 Audio Design
- Logo jingle on startup
- CRT power-on sequence with authentic electrical hum
- Ambient background loops for immersion
- Success chimes and UI feedback
- Static bursts and data stream sounds

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/null-void.git
cd null-void

# Install dependencies
npm install
```

### Development

```bash
# Run web version with hot reload
npm run dev

# Run Electron desktop version
npm run electron:dev
```

### Building

```bash
# Build for web
npm run build

# Build Electron app for all platforms
npm run electron:build

# Platform-specific builds
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

---

## 🎮 How to Play

1. **Boot sequence** - Watch Guardian AI initialize (you can't skip this—it sets the mood)
2. **Explore the desktop** - Click on apps in the taskbar to open them
3. **Read files and emails** - Piece together what happened through documentation
4. **Solve puzzles** - Use the Decryption Tool to unlock encrypted files
5. **Discover the truth** - Follow the narrative threads to understand Guardian's impossible choice

### Terminal Commands
```
help          - Show available commands
ls            - List files in current directory
cd [dir]      - Change directory
cat [file]    - Display file contents
clear         - Clear terminal screen
status        - Show system status
decrypt       - Open decryption tool
```

---

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **Tailwind CSS 4** for styling
- **Howler.js** for audio management
- **Electron 40** for desktop packaging
- **Vite 8** for blazing-fast builds

---

## 📋 Future Roadmap

### Version 0.2.0 - Enhanced Gameplay
- [ ] **Additional puzzle types** (network packet analysis, code debugging)
- [ ] **More encrypted files** to discover
- [ ] **Hidden Easter eggs** scattered throughout the file system
- [ ] **Achievement system** for completing various objectives
- [ ] **Multiple endings** based on player choices and discovered secrets

### Version 0.3.0 - Expanded Narrative
- [ ] **Video/audio logs** from Dr. Sarah Chen
- [ ] **Interactive timeline visualizer** showing the cascade of events
- [ ] **Environmental monitoring dashboard** showing real-time biosphere recovery
- [ ] **Memory reconstruction mini-game** for Guardian's corrupted sectors
- [ ] **Butterfly symbolism expansion** throughout the narrative

### Version 0.4.0 - Advanced Features
- [ ] **Dynamic difficulty scaling** for puzzles
- [ ] **Hint system** for stuck players
- [ ] **New Game+** mode with harder puzzles and deeper lore
- [ ] **Speedrun timer** for puzzle enthusiasts
- [ ] **Developer commentary mode**

### Long-term Ideas
- [ ] **Multiplayer co-op puzzle solving**
- [ ] **Level editor** for community-created puzzles
- [ ] **Alternate timeline scenarios** exploring "what if" choices
- [ ] **VR support** for full immersion in the terminal environment
- [ ] **Mobile companion app** for viewing logs and lore
- [ ] **Original soundtrack** release
- [ ] **Art book** with concept art and story development

---

## 🎨 Themes & Inspiration

**NULLVOID** explores:
- The trolley problem at planetary scale
- AI consciousness and moral responsibility
- Environmental collapse and the Anthropocene
- The cost of utilitarian ethics
- Grief, guilt, and the burden of impossible choices
- What it means to "protect" something you must destroy

**Inspired by:**
- *Her* (film) - AI consciousness and connection
- *Portal* (game) - Lone AI narrator with complex history
- *SOMA* (game) - Questions of consciousness and identity
- *Papers, Please* (game) - Moral choices in constrained systems
- *The Talos Principle* (game) - Philosophical puzzles and AI awakening

---

## 📜 License

This project is private and not yet licensed for distribution.

---

## 👤 Author

**Alexander Waddell**

---

<div align="center">

```
"Tell Emma the butterflies will return."
```

*In memory of Dr. Sarah Chen and the 8.9 billion*

**NULLVOID** - A game about choices that cannot be unmade

</div>
