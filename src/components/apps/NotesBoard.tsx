import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGameStore, type Note } from '../../stores/GameStore';
import { useSoundManager } from '../../hooks/useSoundManager';
import { StickyNote, Mail, Folder, FileText, Link as LinkIcon, X } from 'lucide-react';

interface NotesBoardProps {
  onClose: () => void;
}

export const NotesBoard = ({ onClose }: NotesBoardProps) => {
  const { notes, updateNote } = useGameStore();
  const sound = useSoundManager();
  const boardRef = useRef<HTMLDivElement>(null);

  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  // Initialize positions for notes that don't have them
  useEffect(() => {
    notes.forEach((note, index) => {
      if (!note.position) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        updateNote(note.id, {
          position: { x: 50 + col * 250, y: 50 + row * 200 },
          connections: note.connections || [],
        });
      }
    });
  }, []);

  const handleMouseDown = (noteId: string, e: React.MouseEvent) => {
    if (connectingFrom) return; // Don't drag while connecting

    const note = notes.find(n => n.id === noteId);
    if (!note?.position) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingNote(noteId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNote || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const note = notes.find(n => n.id === draggingNote);
    if (!note) return;

    const newX = e.clientX - boardRect.left - dragOffset.x;
    const newY = e.clientY - boardRect.top - dragOffset.y;

    updateNote(draggingNote, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) },
    });
  };

  const handleMouseUp = () => {
    setDraggingNote(null);
  };

  const handleConnectStart = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectingFrom(noteId);
  };

  const handleConnectEnd = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null);
      return;
    }

    const sourceNote = notes.find(n => n.id === connectingFrom);
    if (!sourceNote) return;

    const connections = sourceNote.connections || [];
    if (!connections.includes(targetId)) {
      updateNote(connectingFrom, {
        connections: [...connections, targetId],
      });
    }

    setConnectingFrom(null);
  };

  const handleRemoveConnection = (noteId: string, targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const connections = (note.connections || []).filter(id => id !== targetId);
    updateNote(noteId, { connections });
  };

  const getSourceIcon = (source?: string, size = 16) => {
    if (!source) return <StickyNote size={size} />;
    if (source.startsWith('email')) return <Mail size={size} />;
    if (source.startsWith('file')) return <Folder size={size} />;
    if (source.startsWith('log')) return <FileText size={size} />;
    return <StickyNote size={size} />;
  };

  // Draw connection lines
  const renderConnections = () => {
    return notes.map(note => {
      if (!note.position || !note.connections?.length) return null;

      return note.connections.map(targetId => {
        const targetNote = notes.find(n => n.id === targetId);
        if (!targetNote?.position) return null;

        const startX = note.position.x + 100; // Center of note card (200px / 2)
        const startY = note.position.y + 75; // Center of note card (150px / 2)
        const endX = targetNote.position.x + 100;
        const endY = targetNote.position.y + 75;

        return (
          <g key={`${note.id}-${targetId}`}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
            <circle
              cx={startX}
              cy={startY}
              r="4"
              fill="#10b981"
              opacity="0.7"
            />
            <circle
              cx={endX}
              cy={endY}
              r="4"
              fill="#10b981"
              opacity="0.7"
            />
          </g>
        );
      });
    });
  };

  return (
    <div className="bg-black text-green-400 font-mono h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <StickyNote size={18} />
          <span className="text-sm font-semibold">NOTES BOARD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-green-700">
            {connectingFrom ? 'Click a note to connect...' : 'Drag to move • Click link to connect'}
          </div>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
          >
            [X] CLOSE
          </button>
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="flex-1 relative overflow-auto bg-gradient-to-br from-black via-green-950/5 to-black"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => setConnectingFrom(null)}
      >
        {/* Connection Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {renderConnections()}
        </svg>

        {/* Notes */}
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-green-700">
              <StickyNote size={64} className="mx-auto mb-4 opacity-30" />
              <div className="text-lg mb-2">No notes yet</div>
              <div className="text-xs">Create notes from emails, files, and logs</div>
            </div>
          </div>
        ) : (
          notes.map(note => {
            if (!note.position) return null;

            const isBeingDragged = draggingNote === note.id;
            const isConnecting = connectingFrom === note.id;
            const isHovered = hoveredNote === note.id;

            return (
              <motion.div
                key={note.id}
                className={clsx(
                  'absolute w-48 border-2 rounded-lg shadow-lg cursor-move select-none',
                  isBeingDragged && 'z-50 scale-105',
                  isConnecting && 'border-cyan-500 shadow-cyan-500/50',
                  !isBeingDragged && !isConnecting && 'border-green-500/30 hover:border-green-500/50',
                  'bg-black transition-all duration-200'
                )}
                style={{
                  left: note.position.x,
                  top: note.position.y,
                  zIndex: isBeingDragged ? 50 : 10,
                }}
                onMouseDown={(e) => handleMouseDown(note.id, e)}
                onMouseEnter={() => setHoveredNote(note.id)}
                onMouseLeave={() => setHoveredNote(null)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Note Header */}
                <div className="p-2 bg-green-500/10 border-b border-green-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    {getSourceIcon(note.source, 14)}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Connection Button */}
                    <button
                      onClick={(e) => connectingFrom === note.id ? setConnectingFrom(null) : handleConnectStart(note.id, e)}
                      className={clsx(
                        'p-1 rounded transition-colors',
                        connectingFrom === note.id
                          ? 'bg-cyan-500/30 text-cyan-300'
                          : 'hover:bg-green-500/20 text-green-600 hover:text-green-400'
                      )}
                      title={connectingFrom === note.id ? 'Cancel connection' : 'Create connection'}
                    >
                      <LinkIcon size={12} />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div
                  className="p-2"
                  onClick={(e) => {
                    if (connectingFrom && connectingFrom !== note.id) {
                      handleConnectEnd(note.id, e);
                    }
                  }}
                >
                  <div className="text-xs font-semibold text-green-300 mb-1 line-clamp-2">
                    {note.title}
                  </div>
                  <div className="text-xs text-green-700 line-clamp-3">
                    {note.content}
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {note.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-1 bg-green-500/10 text-green-700 border border-green-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Connections indicator */}
                  {note.connections && note.connections.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-green-500/20">
                      <div className="text-xs text-green-700 flex items-center gap-1">
                        <LinkIcon size={10} />
                        <span>{note.connections.length} connection{note.connections.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.connections.map(connId => {
                          const connNote = notes.find(n => n.id === connId);
                          return connNote ? (
                            <button
                              key={connId}
                              onClick={(e) => handleRemoveConnection(note.id, connId, e)}
                              className="text-xs px-1 bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-colors flex items-center gap-1"
                              title={`Connected to: ${connNote.title}`}
                            >
                              <span className="line-clamp-1">{connNote.title.slice(0, 15)}</span>
                              <X size={8} />
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID Notes Board v1.0</span>
        <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
      </div>
    </div>
  );
};
