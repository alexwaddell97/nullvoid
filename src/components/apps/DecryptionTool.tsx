import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { decryptionPuzzles, type DecryptionPuzzle } from '../../data/puzzles';
import { useGameStore } from '../../stores/GameStore';

interface DecryptionToolProps {
    onClose: () => void;
}

/* --- Local puzzle type helpers (match data/puzzles.ts) --- */

type SequencePuzzleData = {
    sequence: Array<number | null>;
    pattern: string;
    clue: string;
};

type SequencePuzzleSolution = {
    sequence: number[];
    answer: number[];
};

type CipherPuzzleData = {
    cipherType?: string;
    encryptedPhrase?: string;
    alphabet?: string;
    shiftedAlphabet?: string;
    encryptedMessage?: string;
    clue: string;
    possibleAnswers?: string[];
};

type CipherPuzzleSolution = {
    answer: string;
    phrase?: string;
    unlockMessage?: string;
};

type MemoryPattern = {
    id: number;
    name: string;
    colors: string[];
    habitat: string;
};

type MemoryPuzzleData = {
    patterns: MemoryPattern[];
    memoryFragments: string[];
};

type TimelineEvent = {
    id: string;
    text: string;
    time: string;
};

type TimelinePuzzleData = {
    events: TimelineEvent[];
    clues: string[];
};

type SequenceDecryptionPuzzle = DecryptionPuzzle & {
    type: 'sequence';
    puzzle: SequencePuzzleData;
    solution: SequencePuzzleSolution;
};

type CipherDecryptionPuzzle = DecryptionPuzzle & {
    type: 'cipher';
    puzzle: CipherPuzzleData;
    solution: CipherPuzzleSolution;
};

type MemoryDecryptionPuzzle = DecryptionPuzzle & {
    type: 'memory';
    puzzle: MemoryPuzzleData;
};

type TimelineLogicPuzzle = DecryptionPuzzle & {
    type: 'logic';
    puzzle: TimelinePuzzleData;
};

type PuzzleState =
    | { type: 'sequence'; inputs: string[] }
    | { type: 'cipher'; input: string }
    | { type: 'memory'; selected: number | null }
    | { type: 'logic'; order: string[] };

type HasUnlockMessageCamel = { unlockMessage: string };
type HasUnlockMessageSnake = { unlock_message: string };

export const DecryptionTool = ({ onClose }: DecryptionToolProps) => {
    const {
        solvedPuzzles,
        decryptionAttempts,
        solvePuzzle,
        incrementPuzzleAttempts,
    } = useGameStore();

    const [selectedPuzzle, setSelectedPuzzle] = useState<DecryptionPuzzle | null>(null);
    const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [solved, setSolved] = useState<Set<string>>(solvedPuzzles);
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePuzzleSelect = (puzzle: DecryptionPuzzle) => {
        setSelectedPuzzle(puzzle);
        setPuzzleState(null);
        setAttempts(0);
        setShowSuccess(false);

        if (puzzle.type === 'sequence') {
            const sequenceData = puzzle.puzzle as SequencePuzzleData;
            setPuzzleState({
                type: 'sequence',
                inputs: sequenceData.sequence.map(() => ''),
            });
        } else if (puzzle.type === 'cipher') {
            setPuzzleState({ type: 'cipher', input: '' });
        } else if (puzzle.type === 'memory') {
            setPuzzleState({ type: 'memory', selected: null });
        } else if (puzzle.type === 'logic') {
            setPuzzleState({ type: 'logic', order: [] });
        }
    };

    const checkSolution = () => {
        if (!selectedPuzzle) return;

        incrementPuzzleAttempts(selectedPuzzle.id);
        setAttempts((prev) => prev + 1);

        const isCorrect = false;

        // TODO: implement per-puzzle-type checking using puzzleState/selectedPuzzle

        if (isCorrect) {
            solvePuzzle(selectedPuzzle.id);
            setSolved((prev) => new Set([...prev, selectedPuzzle.id]));
            setShowSuccess(true);
        }
    };

    const renderSequencePuzzle = (puzzle: SequenceDecryptionPuzzle) => {
        if (!puzzleState || puzzleState.type !== 'sequence') return null;
        const { sequence, clue } = puzzle.puzzle;

        return (
            <div className="space-y-6">
                <div className="text-sm text-green-600 bg-green-500/5 border border-green-500/20 p-4 rounded">
                    <div className="font-semibold mb-2">CLUE:</div>
                    {clue}
                </div>

                <div className="flex items-center justify-center gap-3">
                    {sequence.map((num: number | null, index: number) => (
                        <div key={index}>
                            {num === null ? (
                                <input
                                    type="text"
                                    maxLength={2}
                                    value={puzzleState.inputs[index]}
                                    onChange={(e) => {
                                        const newInputs = [...puzzleState.inputs];
                                        newInputs[index] = e.target.value;
                                        setPuzzleState({ type: 'sequence', inputs: newInputs });
                                    }}
                                    className="w-16 h-16 bg-black border-2 border-amber-500/50 text-amber-400 text-2xl text-center font-bold outline-none focus:border-amber-500"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500/50 text-green-400 text-2xl flex items-center justify-center font-bold">
                                    {num}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCipherPuzzle = (puzzle: CipherDecryptionPuzzle) => {
        if (!puzzleState || puzzleState.type !== 'cipher') return null;
        const { encryptedPhrase, clue } = puzzle.puzzle;

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="text-xs text-green-700 mb-2">ENCRYPTED TEXT:</div>
                    <div className="text-4xl font-bold text-red-400 tracking-widest mb-6 font-mono">
                        {encryptedPhrase}
                    </div>
                </div>

                <div className="text-sm text-green-600 bg-green-500/5 border border-green-500/20 p-4 rounded">
                    <div className="font-semibold mb-2">CLUE:</div>
                    {clue}
                </div>

                <div className="text-center">
                    <div className="text-xs text-amber-600 mb-2">ENTER DECRYPTION KEY:</div>
                    <input
                        type="text"
                        value={puzzleState.input}
                        onChange={(e) => setPuzzleState({ type: 'cipher', input: e.target.value })}
                        className="w-64 bg-black border-2 border-amber-500/50 text-amber-400 text-2xl text-center font-bold p-3 outline-none focus:border-amber-500 uppercase"
                        placeholder="?????"
                        maxLength={puzzle.solution.answer.length}
                    />
                </div>
            </div>
        );
    };

    const renderMemoryPuzzle = (puzzle: MemoryDecryptionPuzzle) => {
        if (!puzzleState || puzzleState.type !== 'memory') return null;
        const { patterns, memoryFragments } = puzzle.puzzle;

        return (
            <div className="space-y-6">
                <div className="bg-green-500/5 border border-green-500/20 p-4 rounded">
                    <div className="text-xs text-green-700 mb-2 font-semibold">MEMORY FRAGMENTS:</div>
                    <div className="flex flex-wrap gap-2">
                        {memoryFragments.map((fragment: string, i: number) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            >
                                {fragment}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {patterns.map((pattern: MemoryPattern) => (
                        <button
                            key={pattern.id}
                            onClick={() => setPuzzleState({ type: 'memory', selected: pattern.id })}
                            className={clsx(
                                'p-4 border-2 transition-all',
                                puzzleState.selected === pattern.id
                                    ? 'border-amber-500 bg-amber-500/20'
                                    : 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
                            )}
                        >
                            <div className="text-lg font-bold text-green-400 mb-2">{pattern.name}</div>
                            <div className="text-xs text-green-700 space-y-1">
                                <div>Colors: {pattern.colors.join(', ')}</div>
                                <div>Habitat: {pattern.habitat}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderLogicPuzzle = (puzzle: TimelineLogicPuzzle) => {
        if (!puzzleState || puzzleState.type !== 'logic') return null;
        const { events, clues } = puzzle.puzzle;

        const availableEvents = events.filter(
            (e: TimelineEvent) => !puzzleState.order.includes(e.id)
        );

        return (
            <div className="space-y-6">
                <div className="bg-green-500/5 border border-green-500/20 p-4 rounded">
                    <div className="text-xs text-green-700 mb-2 font-semibold">CLUES:</div>
                    <ul className="text-xs text-green-600 space-y-1">
                        {clues.map((clue: string, i: number) => (
                            <li key={i}>• {clue}</li>
                        ))}
                    </ul>
                </div>

                {/* Timeline slots */}
                <div className="space-y-2">
                    <div className="text-xs text-amber-600 font-semibold mb-2">TIMELINE ORDER:</div>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div
                            key={index}
                            className="h-12 border-2 border-green-500/30 bg-green-500/5 flex items-center px-4"
                        >
                            {puzzleState.order[index] ? (
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-green-400">
                                        {
                                            events.find(
                                                (e: TimelineEvent) => e.id === puzzleState.order[index]
                                            )?.text
                                        }
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newOrder = [...puzzleState.order];
                                            newOrder.splice(index, 1);
                                            setPuzzleState({ type: 'logic', order: newOrder });
                                        }}
                                        className="text-red-500 text-xs hover:text-red-400"
                                    >
                                        [REMOVE]
                                    </button>
                                </div>
                            ) : (
                                <span className="text-green-800 text-xs">[ Empty slot {index + 1} ]</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Available events */}
                <div className="space-y-2">
                    <div className="text-xs text-green-700 font-semibold mb-2">AVAILABLE EVENTS:</div>
                    <div className="grid grid-cols-2 gap-2">
                        {availableEvents.map((event: TimelineEvent) => (
                            <button
                                key={event.id}
                                onClick={() => {
                                    setPuzzleState({ type: 'logic', order: [...puzzleState.order, event.id] });
                                }}
                                className="p-3 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-left text-sm text-amber-400 transition-all"
                            >
                                <span className="font-bold">[{event.id}]</span> {event.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPuzzle = () => {
        if (!selectedPuzzle) return null;

        switch (selectedPuzzle.type) {
            case 'sequence':
                return renderSequencePuzzle(selectedPuzzle as SequenceDecryptionPuzzle);
            case 'cipher':
                return renderCipherPuzzle(selectedPuzzle as CipherDecryptionPuzzle);
            case 'memory':
                return renderMemoryPuzzle(selectedPuzzle as MemoryDecryptionPuzzle);
            case 'logic':
                // This UI currently only supports timeline-style logic puzzles
                return renderLogicPuzzle(selectedPuzzle as TimelineLogicPuzzle);
            default:
                return <div>Unknown puzzle type</div>;
        }
    };

    return (
        <div className="bg-black text-green-400 font-mono h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔓</span>
                    <span className="text-sm font-semibold">DECRYPTION TOOL</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
                >
                    [X] CLOSE
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Puzzle List */}
                <div className="w-1/3 border-r border-green-500/20 overflow-auto p-4">
                    <div className="text-xs text-green-700 mb-4 font-semibold uppercase tracking-wider">
                        Encrypted Files ({solved.size}/{decryptionPuzzles.length} Decrypted)
                    </div>

                    <div className="space-y-2">
                        {decryptionPuzzles.map((puzzle) => {
                            const isSolved = solved.has(puzzle.id);

                            return (
                                <button
                                    key={puzzle.id}
                                    onClick={() => handlePuzzleSelect(puzzle)}
                                    className={clsx(
                                        'w-full text-left p-3 border transition-all',
                                        selectedPuzzle?.id === puzzle.id
                                            ? 'border-amber-500/50 bg-amber-500/10'
                                            : isSolved
                                            ? 'border-green-500/30 bg-green-500/5'
                                            : 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{isSolved ? '✓' : '🔐'}</span>
                                        <span
                                            className={clsx(
                                                'text-xs px-2 py-0.5 border',
                                                puzzle.difficulty === 'easy' &&
                                                    'border-green-500/30 text-green-500',
                                                puzzle.difficulty === 'medium' &&
                                                    'border-amber-500/30 text-amber-500',
                                                puzzle.difficulty === 'hard' &&
                                                    'border-red-500/30 text-red-500'
                                            )}
                                        >
                                            {puzzle.difficulty.toUpperCase()}
                                        </span>
                                    </div>

                                    <div
                                        className={clsx(
                                            'text-sm font-semibold mb-1',
                                            isSolved ? 'text-green-400' : 'text-red-400'
                                        )}
                                    >
                                        {puzzle.fileName}
                                    </div>

                                    <div className="text-xs text-green-700">{puzzle.title}</div>

                                    {isSolved && (
                                        <div className="mt-2 text-xs text-green-600">✓ DECRYPTED</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Puzzle Interface */}
                <div className="w-2/3 overflow-auto">
                    <AnimatePresence mode="wait">
                        {selectedPuzzle ? (
                            <motion.div
                                key={selectedPuzzle.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-6"
                            >
                                {/* Puzzle Header */}
                                <div className="mb-6 pb-4 border-b border-green-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span
                                            className={clsx(
                                                'text-xs px-3 py-1 border font-bold',
                                                selectedPuzzle.difficulty === 'easy' &&
                                                    'border-green-500/50 text-green-500 bg-green-500/10',
                                                selectedPuzzle.difficulty === 'medium' &&
                                                    'border-amber-500/50 text-amber-500 bg-amber-500/10',
                                                selectedPuzzle.difficulty === 'hard' &&
                                                    'border-red-500/50 text-red-500 bg-red-500/10'
                                            )}
                                        >
                                            {selectedPuzzle.difficulty.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-green-700">
                                            {selectedPuzzle.type.toUpperCase()}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-amber-400 mb-2">
                                        {selectedPuzzle.title}
                                    </h2>

                                    <p className="text-sm text-green-500 mb-3">
                                        {selectedPuzzle.description}
                                    </p>

                                    {selectedPuzzle.loreContext && (
                                        <div className="text-xs text-green-700 italic bg-green-500/5 border border-green-500/20 p-3 rounded">
                                            "{selectedPuzzle.loreContext}"
                                        </div>
                                    )}
                                </div>

                                {/* Success Message */}
                                <AnimatePresence>
                                    {showSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="mb-6 p-4 border-2 border-green-500 bg-green-500/20 rounded"
                                        >
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">✓</div>
                                                <div className="text-lg font-bold text-green-300 mb-2">
                                                    DECRYPTION SUCCESSFUL
                                                </div>
                                                <div className="text-sm text-green-500">
                                                    {selectedPuzzle.fileName} has been unlocked
                                                </div>
                                                {(() => {
                                                    const solution = selectedPuzzle.solution;
                                                    const camel = solution as Partial<HasUnlockMessageCamel>;
                                                    const snake = solution as Partial<HasUnlockMessageSnake>;
                                                    const unlockMessage =
                                                        camel.unlockMessage ?? snake.unlock_message;

                                                    return (
                                                        unlockMessage && (
                                                            <div className="mt-3 text-xs text-green-600 italic">
                                                                "{unlockMessage}"
                                                            </div>
                                                        )
                                                    );
                                                })()}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Puzzle */}
                                {!showSuccess && (
                                    <>
                                        {renderPuzzle()}

                                        {/* Hint */}
                                        {selectedPuzzle.hint && attempts >= 2 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 p-4 border border-amber-500/30 bg-amber-500/5 rounded"
                                            >
                                                <div className="text-xs text-amber-600 mb-1 font-semibold">
                                                    HINT (after {attempts} attempts):
                                                </div>
                                                <div className="text-sm text-amber-400">
                                                    {selectedPuzzle.hint}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Check Button */}
                                        <div className="mt-6">
                                            <button
                                                onClick={checkSolution}
                                                className="w-full py-3 bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-colors font-semibold"
                                            >
                                                DECRYPT FILE
                                            </button>

                                            {decryptionAttempts[selectedPuzzle.id] > 0 && (
                                                <div className="text-xs text-green-700">
                                                    Total attempts: {decryptionAttempts[selectedPuzzle.id]}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 h-full flex items-center justify-center"
                            >
                                <div className="text-green-700 text-sm text-center">
                                    <div className="text-6xl mb-4">🔐</div>
                                    <div className="text-lg mb-2">
                                        Select an encrypted file to decrypt
                                    </div>
                                    <div className="text-xs mt-4 text-green-800">
                                        {decryptionPuzzles.length - solved.size} files remain encrypted
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
                <span>NULLVOID Decryption Tool v2.7.3</span>
                <span>
                    Progress: {solved.size}/{decryptionPuzzles.length} files decrypted
                </span>
            </div>
        </div>
    );
};