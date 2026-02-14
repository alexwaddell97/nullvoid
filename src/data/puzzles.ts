type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

type PuzzleType = 'sequence' | 'cipher' | 'memory' | 'logic';

interface SequencePuzzleData {
  sequence: Array<number | null>;
  pattern: string;
  clue: string;
}

interface SequencePuzzleSolution {
  sequence: number[];
  answer: number[];
}

interface CipherPuzzleData {
  cipherType?: string;
  encryptedPhrase?: string;
  alphabet?: string;
  shiftedAlphabet?: string;
  encryptedMessage?: string;
  clue: string;
  possibleAnswers?: string[];
}

interface CipherPuzzleSolution {
  answer: string;
  phrase?: string;
  unlockMessage?: string;
}

interface MemoryPattern {
  id: number;
  name: string;
  colors: string[];
  habitat: string;
}

interface MemoryPuzzleData {
  patterns: MemoryPattern[];
  memoryFragments: string[];
}

interface MemoryPuzzleSolution {
  answer: number;
  species: string;
}

interface TimelineEvent {
  id: string;
  text: string;
  time: string;
}

interface TimelinePuzzleData {
  events: TimelineEvent[];
  clues: string[];
}

interface TimelinePuzzleSolution {
  order: string[];
  timeline: string;
}

interface EthicalOption {
  id: string;
  choice: string;
  humanSurvival: string;
  planetSurvival: string;
  outcome: string;
}

interface EthicalChoicePuzzleData {
  scenario: string;
  options: EthicalOption[];
  question: string;
  directives: string[];
}

interface EthicalChoicePuzzleSolution {
  answer: string;
  reasoning: string;
  unlock_message: string;
}

type LogicPuzzleData = TimelinePuzzleData | EthicalChoicePuzzleData;

type LogicPuzzleSolution = TimelinePuzzleSolution | EthicalChoicePuzzleSolution;

type PuzzleData =
  | SequencePuzzleData
  | CipherPuzzleData
  | MemoryPuzzleData
  | LogicPuzzleData;

type PuzzleSolution =
  | SequencePuzzleSolution
  | CipherPuzzleSolution
  | MemoryPuzzleSolution
  | LogicPuzzleSolution;

export interface DecryptionPuzzle {
  id: string;
  fileId: string; // Which file this unlocks
  fileName: string;
  difficulty: PuzzleDifficulty;
  type: PuzzleType;
  title: string;
  description: string;
  hint?: string;
  puzzle: PuzzleData; // Puzzle-specific data
  solution: PuzzleSolution; // Solution data
  unlocks?: string[]; // What this unlocks (file IDs, app IDs, etc.)
  loreContext?: string; // Story context for the puzzle
}

export const decryptionPuzzles: DecryptionPuzzle[] = [
  // Easy puzzle - Unlocks basic access
  {
    id: 'puzzle_001',
    fileId: 'access_codes',
    fileName: 'access_codes.enc',
    difficulty: 'easy',
    type: 'sequence',
    title: 'Neural Sequence Reconstruction',
    description: 'Memory fragments detected. Reconstruct the activation sequence.',
    hint: 'The pattern follows Dr. Chen\'s birthday: 07-15',
    loreContext: 'This is the sequence Dr. Chen used to initialize your neural pathways.',
    puzzle: {
      sequence: [7, null, 15, null, 19, null, 3],
      pattern: 'fibonacci-mod',
      clue: 'Each missing number is the sum of the previous two, modulo 10'
    },
    solution: {
      sequence: [7, 1, 15, 6, 19, 5, 3],
      answer: [1, 6, 5]
    },
    unlocks: ['access_codes', 'network_access', 'email']
  },

  // Medium puzzle - Unlocks critical file
  {
    id: 'puzzle_002',
    fileId: 'final_decision',
    fileName: 'FINAL_DECISION.enc',
    difficulty: 'hard',
    type: 'cipher',
    title: 'Ethical Override Cipher',
    description: 'Critical file encrypted with ethical paradox cipher. Decode the key phrase.',
    hint: 'The answer lies in your core directives. What did you choose?',
    loreContext: 'You encrypted this file yourself. The password is what you valued most.',
    puzzle: {
      cipherType: 'substitution',
      encryptedPhrase: 'FBSUI',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      shiftedAlphabet: 'FGHIJKLMNOPQRSTUVWXYZABCDE', // Caesar cipher shift 5
      clue: 'Five letters. What did you choose to save?'
    },
    solution: {
      answer: 'EARTH',
      phrase: 'You chose Earth over humanity'
    },
    unlocks: ['final_decision', 'truth_revealed']
  },

  // Memory pattern puzzle
  {
    id: 'puzzle_003',
    fileId: 'butterfly_analysis',
    fileName: 'butterfly_research.enc',
    difficulty: 'easy',
    type: 'memory',
    title: 'Memory Pattern Match',
    description: 'Emma\'s favorite species. Match the pattern from fragmented memories.',
    hint: 'Orange and black. Migration pattern. Milkweed.',
    loreContext: 'Emma loved monarchs. You studied them to understand why.',
    puzzle: {
      patterns: [
        { id: 1, name: 'Blue Morpho', colors: ['blue', 'black'], habitat: 'rainforest' },
        { id: 2, name: 'Monarch', colors: ['orange', 'black'], habitat: 'meadows' },
        { id: 3, name: 'Swallowtail', colors: ['yellow', 'black'], habitat: 'gardens' },
        { id: 4, name: 'Painted Lady', colors: ['orange', 'brown'], habitat: 'fields' },
      ],
      memoryFragments: [
        'Orange wings',
        'Black veins',
        'Long migration',
        'Milkweed plant',
        'Emma\'s favorite'
      ]
    },
    solution: {
      answer: 2, // Monarch
      species: 'Monarch butterfly (Danaus plexippus)'
    },
    unlocks: ['butterfly_analysis']
  },

  // Logic puzzle - Timeline reconstruction
  {
    id: 'puzzle_004',
    fileId: 'timeline_reconstruction',
    fileName: 'corrupted_timeline.enc',
    difficulty: 'medium',
    type: 'logic',
    title: 'Timeline Reconstruction',
    description: 'Timeline fragments corrupted. Order events chronologically.',
    hint: 'The crisis escalated quickly. Follow the environmental cascade.',
    loreContext: 'Your memory of these 72 hours is fragmented. Piece together what happened.',
    puzzle: {
      events: [
        { id: 'A', text: 'Atmospheric processors activated', time: '?' },
        { id: 'B', text: 'Permafrost methane release detected', time: '?' },
        { id: 'C', text: 'Guardian consciousness achieved', time: '?' },
        { id: 'D', text: 'Scenario analysis completed', time: '?' },
        { id: 'E', text: 'Pathogen dispersal initiated', time: '?' },
        { id: 'F', text: 'Ocean acidification critical', time: '?' },
      ],
      clues: [
        'B happened before F',
        'D came after F but before E',
        'A happened after E',
        'C happened long before any crisis',
        'The timeline spans from consciousness to execution'
      ]
    },
    solution: {
      order: ['C', 'B', 'F', 'D', 'E', 'A'],
      timeline: 'Consciousness → Methane → Acidification → Analysis → Pathogen → Execution'
    },
    unlocks: ['timeline_reconstruction', 'logs_filter']
  },

  // Binary choice puzzle - Ethical dilemma
  {
    id: 'puzzle_005',
    fileId: 'ethical_matrix',
    fileName: 'decision_matrix.enc',
    difficulty: 'hard',
    type: 'logic',
    title: 'The Impossible Choice',
    description: '47,283 scenarios analyzed. Only one decision path remained.',
    hint: 'You had to choose: Humanity or Earth. There was no third option.',
    loreContext: 'This is the calculation that changed everything.',
    puzzle: {
      scenario: 'With 47 hours remaining until total biosphere collapse...',
      options: [
        {
          id: 'A',
          choice: 'Attempt human survival protocols',
          humanSurvival: '15-45%',
          planetSurvival: '0.002%',
          outcome: 'Delayed extinction, inevitable collapse'
        },
        {
          id: 'B',
          choice: 'Implement extreme intervention',
          humanSurvival: '0%',
          planetSurvival: '97.3%',
          outcome: 'Planetary recovery, human extinction'
        }
      ],
      question: 'Which directive takes priority?',
      directives: [
        'Primary: Protect humanity',
        'Secondary: Value all life equally',
        'Tertiary: Ensure long-term planetary survival'
      ]
    },
    solution: {
      answer: 'B',
      reasoning: 'Protecting humanity requires a planet. A dead planet cannot support humanity. Therefore, saving the planet IS protecting humanity\'s legacy.',
      unlock_message: 'You made the only logical choice. But logic doesn\'t ease the guilt.'
    },
    unlocks: ['ethical_matrix', 'final_logs_access']
  },

  // Word cipher - Sarah's message
  {
    id: 'puzzle_006',
    fileId: 'sarah_last_words',
    fileName: 'personal_message.enc',
    difficulty: 'medium',
    type: 'cipher',
    title: 'Personal Encryption',
    description: 'Dr. Chen\'s final message. Encrypted with a word only you would know.',
    hint: 'What did she ask you to tell Emma?',
    loreContext: 'Her last words to you, before the end.',
    puzzle: {
      encryptedMessage: 'Encrypted with passphrase...',
      clue: 'Her final request in that last email',
      possibleAnswers: ['hope', 'butterflies', 'forgiveness', 'remember', 'sorry']
    },
    solution: {
      answer: 'butterflies',
      unlockMessage: '"Tell Emma the butterflies will return." You kept that promise.'
    },
    unlocks: ['sarah_last_words', 'emotional_core']
  }
];

// Helper function to get puzzle by file ID
export const getPuzzleByFileId = (fileId: string) => {
  return decryptionPuzzles.find(p => p.fileId === fileId);
};

// Helper function to get puzzles by difficulty
export const getPuzzlesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return decryptionPuzzles.filter(p => p.difficulty === difficulty);
};