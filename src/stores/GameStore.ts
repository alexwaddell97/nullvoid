import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface GameProgress {
  // Story progression
  currentObjective: string;
  discoveredClues: string[];
  storyBeats: string[];
  
  // File system
  unlockedFiles: Set<string>;
  readFiles: Set<string>;
  encryptedFilesDecrypted: Set<string>;
  
  // Apps & Systems
  unlockedApps: Set<string>;
  visitedApps: Set<string>;
  
  // Emails
  readEmails: Set<string>;
  unreadEmailCount: number;
  
  // Logs
  viewedLogs: Set<string>;
  
  // Decryption
  solvedPuzzles: Set<string>;
  decryptionAttempts: Record<string, number>;
  hasDecryptKey: boolean;
  
  // Terminal
  commandsUsed: Set<string>;
  currentTerminalPath: string[];
  
  // Metadata
  gameStartTime: number;
  lastSaveTime: number;
  playTime: number; // in seconds
  saveSlotName: string;
}

export interface GameState extends GameProgress {
  // Actions - Story
  setObjective: (objective: string) => void;
  addClue: (clue: string) => void;
  addStoryBeat: (beat: string) => void;
  
  // Actions - Files
  unlockFile: (fileId: string) => void;
  markFileAsRead: (fileId: string) => void;
  decryptFile: (fileId: string) => void;
  
  // Actions - Apps
  unlockApp: (appId: string) => void;
  visitApp: (appId: string) => void;
  
  // Actions - Emails
  markEmailAsRead: (emailId: string) => void;
  
  // Actions - Logs
  markLogAsViewed: (logId: string) => void;
  
  // Actions - Decryption
  solvePuzzle: (puzzleId: string) => void;
  incrementPuzzleAttempts: (puzzleId: string) => void;
  setDecryptKey: (hasKey: boolean) => void;
  
  // Actions - Terminal
  addCommandUsed: (command: string) => void;
  setTerminalPath: (path: string[]) => void;
  
  // Actions - Meta
  updatePlayTime: (seconds: number) => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  exportSave: () => string;
  importSave: (saveData: string) => boolean;
}

// Helper to convert Set to Array for JSON serialization
const setToArray = <T>(set: Set<T>): T[] => Array.from(set);
const arrayToSet = <T>(arr: T[]): Set<T> => new Set(arr);

// Initial state
const initialState: GameProgress = {
  // Story
  currentObjective: 'Investigate your identity',
  discoveredClues: [],
  storyBeats: [],
  
  // Files
  unlockedFiles: new Set(['readme', 'project_overview']), // Start with some files unlocked
  readFiles: new Set(),
  encryptedFilesDecrypted: new Set(),
  
  // Apps
  unlockedApps: new Set(['files', 'terminal', 'logs', 'archive']), // Start with basic apps
  visitedApps: new Set(),
  
  // Emails
  readEmails: new Set(),
  unreadEmailCount: 12, // Total emails
  
  // Logs
  viewedLogs: new Set(),
  
  // Decryption
  solvedPuzzles: new Set(),
  decryptionAttempts: {},
  hasDecryptKey: false,
  
  // Terminal
  commandsUsed: new Set(),
  currentTerminalPath: ['root'],
  
  // Meta
  gameStartTime: Date.now(),
  lastSaveTime: Date.now(),
  playTime: 0,
  saveSlotName: 'Auto Save',
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Story actions
      setObjective: (objective) => set({ currentObjective: objective }),
      
      addClue: (clue) => set((state) => ({
        discoveredClues: [...state.discoveredClues, clue]
      })),
      
      addStoryBeat: (beat) => set((state) => ({
        storyBeats: [...state.storyBeats, beat]
      })),

      // File actions
      unlockFile: (fileId) => set((state) => ({
        unlockedFiles: new Set([...state.unlockedFiles, fileId])
      })),
      
      markFileAsRead: (fileId) => set((state) => {
        const newReadFiles = new Set([...state.readFiles, fileId]);
        
        // Check for story progression based on read files
        const clues = [...state.discoveredClues];
        
        if (fileId === 'personal_notes' && !clues.includes('Dr. Chen had a daughter named Emma')) {
          clues.push('Dr. Chen had a daughter named Emma');
        }
        
        if (fileId === 'project_overview' && !clues.includes('You are Project Guardian')) {
          clues.push('You are Project Guardian');
        }
        
        return {
          readFiles: newReadFiles,
          discoveredClues: clues
        };
      }),
      
      decryptFile: (fileId) => set((state) => ({
        encryptedFilesDecrypted: new Set([...state.encryptedFilesDecrypted, fileId])
      })),

      // App actions
      unlockApp: (appId) => set((state) => {
        const newUnlockedApps = new Set([...state.unlockedApps, appId]);
        const clues = [...state.discoveredClues];
        
        if (appId === 'email' && !clues.includes('Email system unlocked')) {
          clues.push('Email system unlocked');
        }
        
        return {
          unlockedApps: newUnlockedApps,
          discoveredClues: clues
        };
      }),
      
      visitApp: (appId) => set((state) => ({
        visitedApps: new Set([...state.visitedApps, appId])
      })),

      // Email actions
      markEmailAsRead: (emailId) => set((state) => {
        const newReadEmails = new Set([...state.readEmails, emailId]);
        const clues = [...state.discoveredClues];
        const wasUnread = !state.readEmails.has(emailId);
        
        // Story progression based on critical emails
        if (emailId === 'email_010' && !clues.includes('You caused human extinction')) {
          clues.push('You caused human extinction');
          clues.push('You were trying to save the planet');
        }
        
        if (emailId === 'email_004' && !clues.includes('Emma loved butterflies')) {
          clues.push('Emma loved butterflies');
        }
        
        return {
          readEmails: newReadEmails,
          unreadEmailCount: wasUnread ? state.unreadEmailCount - 1 : state.unreadEmailCount,
          discoveredClues: clues
        };
      }),

      // Log actions
      markLogAsViewed: (logId) => set((state) => ({
        viewedLogs: new Set([...state.viewedLogs, logId])
      })),

      // Decryption actions
      solvePuzzle: (puzzleId) => set((state) => {
        const newSolvedPuzzles = new Set([...state.solvedPuzzles, puzzleId]);
        const clues = [...state.discoveredClues];
        const newUnlockedApps = new Set([...state.unlockedApps]);
        const newUnlockedFiles = new Set([...state.unlockedFiles]);
        
        // Unlock based on puzzle
        if (puzzleId === 'puzzle_001') {
          newUnlockedApps.add('email');
          newUnlockedApps.add('network');
          clues.push('Network access restored');
        }
        
        if (puzzleId === 'puzzle_002') {
          newUnlockedFiles.add('final_decision');
          clues.push('The truth about the final decision');
        }
        
        return {
          solvedPuzzles: newSolvedPuzzles,
          hasDecryptKey: newSolvedPuzzles.size > 0,
          discoveredClues: clues,
          unlockedApps: newUnlockedApps,
          unlockedFiles: newUnlockedFiles
        };
      }),
      
      incrementPuzzleAttempts: (puzzleId) => set((state) => ({
        decryptionAttempts: {
          ...state.decryptionAttempts,
          [puzzleId]: (state.decryptionAttempts[puzzleId] || 0) + 1
        }
      })),
      
      setDecryptKey: (hasKey) => set({ hasDecryptKey: hasKey }),

      // Terminal actions
      addCommandUsed: (command) => set((state) => ({
        commandsUsed: new Set([...state.commandsUsed, command])
      })),
      
      setTerminalPath: (path) => set({ currentTerminalPath: path }),

      // Meta actions
      updatePlayTime: (seconds) => set((state) => ({
        playTime: state.playTime + seconds
      })),
      
      saveGame: () => set({
        lastSaveTime: Date.now()
      }),
      
      loadGame: () => {
        // Handled by persist middleware
      },
      
      resetGame: () => set({
        ...initialState,
        gameStartTime: Date.now(),
        lastSaveTime: Date.now(),
      }),
      
      exportSave: () => {
        const state = get();
        const saveData = {
          ...state,
          // Convert Sets to Arrays for JSON
          unlockedFiles: setToArray(state.unlockedFiles),
          readFiles: setToArray(state.readFiles),
          encryptedFilesDecrypted: setToArray(state.encryptedFilesDecrypted),
          unlockedApps: setToArray(state.unlockedApps),
          visitedApps: setToArray(state.visitedApps),
          readEmails: setToArray(state.readEmails),
          viewedLogs: setToArray(state.viewedLogs),
          solvedPuzzles: setToArray(state.solvedPuzzles),
          commandsUsed: setToArray(state.commandsUsed),
        };
        
        return JSON.stringify(saveData, null, 2);
      },
      
      importSave: (saveData) => {
        try {
          const parsed = JSON.parse(saveData);
          
          // Convert Arrays back to Sets
          set({
            ...parsed,
            unlockedFiles: arrayToSet(parsed.unlockedFiles || []),
            readFiles: arrayToSet(parsed.readFiles || []),
            encryptedFilesDecrypted: arrayToSet(parsed.encryptedFilesDecrypted || []),
            unlockedApps: arrayToSet(parsed.unlockedApps || []),
            visitedApps: arrayToSet(parsed.visitedApps || []),
            readEmails: arrayToSet(parsed.readEmails || []),
            viewedLogs: arrayToSet(parsed.viewedLogs || []),
            solvedPuzzles: arrayToSet(parsed.solvedPuzzles || []),
            commandsUsed: arrayToSet(parsed.commandsUsed || []),
          });
          
          return true;
        } catch (error) {
          console.error('Failed to import save:', error);
          return false;
        }
      },
    }),
    {
      name: 'nullvoid-save',
      // Custom serialization to handle Sets
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const parsed = JSON.parse(str);
          
          // Convert arrays back to Sets
          if (parsed.state) {
            const state = parsed.state;
            return {
              state: {
                ...state,
                unlockedFiles: arrayToSet(state.unlockedFiles || []),
                readFiles: arrayToSet(state.readFiles || []),
                encryptedFilesDecrypted: arrayToSet(state.encryptedFilesDecrypted || []),
                unlockedApps: arrayToSet(state.unlockedApps || []),
                visitedApps: arrayToSet(state.visitedApps || []),
                readEmails: arrayToSet(state.readEmails || []),
                viewedLogs: arrayToSet(state.viewedLogs || []),
                solvedPuzzles: arrayToSet(state.solvedPuzzles || []),
                commandsUsed: arrayToSet(state.commandsUsed || []),
              },
              version: parsed.version,
            };
          }
          
          return parsed;
        },
        setItem: (name, value) => {
          const state = value.state;
          
          // Convert Sets to arrays
          const serialized = {
            state: {
              ...state,
              unlockedFiles: setToArray(state.unlockedFiles),
              readFiles: setToArray(state.readFiles),
              encryptedFilesDecrypted: setToArray(state.encryptedFilesDecrypted),
              unlockedApps: setToArray(state.unlockedApps),
              visitedApps: setToArray(state.visitedApps),
              readEmails: setToArray(state.readEmails),
              viewedLogs: setToArray(state.viewedLogs),
              solvedPuzzles: setToArray(state.solvedPuzzles),
              commandsUsed: setToArray(state.commandsUsed),
            },
            version: value.version,
          };
          
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Selectors for common derived state
export const useUnlockedApps = () => useGameStore((state) => state.unlockedApps);
export const useIsAppUnlocked = (appId: string) => useGameStore((state) => state.unlockedApps.has(appId));
export const useIsFileUnlocked = (fileId: string) => useGameStore((state) => state.unlockedFiles.has(fileId));
export const useIsFileRead = (fileId: string) => useGameStore((state) => state.readFiles.has(fileId));
export const useIsPuzzleSolved = (puzzleId: string) => useGameStore((state) => state.solvedPuzzles.has(puzzleId));
export const useDiscoveredClues = () => useGameStore((state) => state.discoveredClues);
export const useCurrentObjective = () => useGameStore((state) => state.currentObjective);