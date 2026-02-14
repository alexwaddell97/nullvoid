# Tab/Window System

The game now features a browser-style tab system that allows you to have multiple applications open simultaneously and switch between them seamlessly.

## Features

### Multi-Tab Management
- **Open Multiple Apps**: Click any app on the desktop to open it in a new tab
- **Quick Switching**: Click on any tab to switch to that app instantly
- **App State Preservation**: Apps maintain their state when you switch away (no need to reload!)
- **Desktop Access**: The desktop is always accessible via the "Desktop" tab

### Tab Bar Controls
- **Desktop Tab** (🏠): Return to desktop view while keeping apps open
- **App Tabs**: Each open app shows its icon and name
- **Close Button** (×): Hover over a tab to reveal the close button
- **Close All**: Button on the right to close all tabs and return to desktop

### Keyboard Shortcuts
- **Cmd/Ctrl + W**: Close the current tab
- **Cmd/Ctrl + Tab**: Cycle forward through tabs
- **Cmd/Ctrl + Shift + Tab**: Cycle backward through tabs
- **Cmd/Ctrl + 1-9**: Jump directly to tab 1-9

### Mouse Controls
- **Left Click**: Switch to a tab
- **Middle Click**: Close a tab (like in web browsers!)
- **Hover**: Reveal the close button on each tab

## User Experience Improvements

### Smooth Transitions
- Tabs animate in/out smoothly
- Active tab indicator slides between tabs
- App content fades when switching

### Mobile Friendly
- Tab bar scrolls horizontally on smaller screens
- Touch-friendly tab sizes
- "Close All" button text hides on mobile to save space

### Visual Feedback
- Active tab is highlighted with green accent
- Active indicator bar under current tab
- Hover states on all interactive elements

## Technical Implementation

### Architecture
- **WindowManager Store** (`/src/stores/WindowManager.ts`): Manages open windows and active state
- **TabBar Component** (`/src/components/boot/Desktop/TabBar.tsx`): Renders and controls tabs
- **Desktop Component** (`/src/components/boot/Desktop/index.tsx`): Orchestrates the tab system

### Key Behaviors
- Only one app is visible at a time (active tab)
- All open apps remain mounted in the background
- Apps are identified by `appId` (e.g., 'terminal', 'files')
- Only one instance of each app can be open at a time
- Clicking an already-open app focuses its tab instead of opening a new one

### State Management
- Window stack tracked in Zustand store
- Active window ID determines which app is visible
- Closing the last window automatically shows the desktop
- Window state is NOT persisted between sessions (fresh start each time)

## Future Enhancements (Potential)

- Draggable tabs to reorder
- Pin important tabs
- Tab groups/organization
- Recently closed tabs recovery
- Maximum tab limit with overflow menu
