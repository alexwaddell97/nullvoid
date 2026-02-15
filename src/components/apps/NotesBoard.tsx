import { useEffect, useRef } from 'react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import clsx from 'clsx';
import { useGameStore, type Note } from '../../stores/GameStore';
import { useSoundManager } from '../../hooks/useSoundManager';
import { StickyNote, Mail, Folder, FileText, Link as LinkIcon, X, List } from 'lucide-react';
import { useState } from 'react';

interface NotesBoardProps {
  onClose: () => void;
  onSwitchToList?: () => void;
}

interface DraggableNoteProps {
  note: Note;
  onMove: (id: string, left: number, top: number) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  onRemoveConnection: (noteId: string, targetId: string) => void;
  connectingFrom: string | null;
  getSourceIcon: (source?: string, size?: number) => JSX.Element;
  notes: Note[];
}

const ItemType = 'NOTE';

const DraggableNote = ({
  note,
  onMove,
  onConnectStart,
  onConnectEnd,
  onRemoveConnection,
  connectingFrom,
  getSourceIcon,
  notes,
}: DraggableNoteProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => ({
      id: note.id,
      left: note.position?.x || 0,
      top: note.position?.y || 0,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !connectingFrom,
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const left = Math.max(0, Math.round(item.left + delta.x));
        const top = Math.max(0, Math.round(item.top + delta.y));
        onMove(item.id, left, top);
      }
    },
  });

  drag(ref);

  const isConnecting = connectingFrom === note.id;

  return (
    <div
      ref={ref}
      className={clsx(
        'absolute w-48 border-2 rounded-lg shadow-lg select-none',
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab',
        isConnecting && 'border-cyan-500 shadow-cyan-500/50',
        !isDragging && !isConnecting && 'border-green-500/30 hover:border-green-500/50',
        'bg-black transition-colors duration-200'
      )}
      style={{
        left: note.position?.x || 0,
        top: note.position?.y || 0,
        zIndex: isDragging ? 1000 : 'auto',
      }}
      onClick={(e) => {
        if (connectingFrom && connectingFrom !== note.id) {
          e.stopPropagation();
          onConnectEnd(note.id);
        }
      }}
    >
      {/* Note Header */}
      <div className="p-2 bg-green-500/10 border-b border-green-500/30 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          {getSourceIcon(note.source, 14)}
        </div>
        <div className="flex items-center gap-1">
          {/* Connection Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting) {
                onConnectStart(''); // Cancel
              } else {
                onConnectStart(note.id);
              }
            }}
            className={clsx(
              'p-1 rounded transition-colors',
              isConnecting
                ? 'bg-cyan-500/30 text-cyan-300'
                : 'hover:bg-green-500/20 text-green-600 hover:text-green-400'
            )}
            title={isConnecting ? 'Cancel connection' : 'Create connection'}
          >
            <LinkIcon size={12} />
          </button>
        </div>
      </div>

      {/* Note Content */}
      <div className="p-2">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveConnection(note.id, connId);
                    }}
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
    </div>
  );
};

export const NotesBoard = ({ onClose, onSwitchToList }: NotesBoardProps) => {
  const { notes, updateNote } = useGameStore();
  const sound = useSoundManager();
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

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

  const handleMove = (id: string, left: number, top: number) => {
    updateNote(id, {
      position: { x: left, y: top },
    });
  };

  const handleConnectStart = (noteId: string) => {
    setConnectingFrom(noteId);
  };

  const handleConnectEnd = (targetId: string) => {
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

  const handleRemoveConnection = (noteId: string, targetId: string) => {
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

        const startX = note.position.x + 96; // Center of note card (192px / 2)
        const startY = note.position.y + 75; // Approximate center
        const endX = targetNote.position.x + 96;
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
    <DndProvider backend={HTML5Backend}>
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
            {onSwitchToList && (
              <button
                onClick={onSwitchToList}
                className="text-cyan-500 hover:text-cyan-400 text-sm px-2 py-1 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors flex items-center gap-1"
                title="Switch to list view"
              >
                <List size={14} />
                <span className="hidden sm:inline">LIST</span>
              </button>
            )}
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
          className="flex-1 relative overflow-auto bg-gradient-to-br from-black via-green-950/5 to-black"
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
            notes.map(note => (
              <DraggableNote
                key={note.id}
                note={note}
                onMove={handleMove}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
                onRemoveConnection={handleRemoveConnection}
                connectingFrom={connectingFrom}
                getSourceIcon={getSourceIcon}
                notes={notes}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
          <span>NULLVOID Notes Board v1.0</span>
          <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
        </div>
      </div>
    </DndProvider>
  );
};
