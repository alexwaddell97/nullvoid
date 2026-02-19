import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop, type XYCoord } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import clsx from 'clsx';
import { useGameStore, type Note } from '../../stores/GameStore';

import { StickyNote, Mail, Folder, FileText, Link as LinkIcon, X, List, ZoomIn, ZoomOut, LoaderCircle } from 'lucide-react';

interface NotesBoardProps {
  onClose: () => void;
  onSwitchToList?: () => void;
}

const DEFAULT_NOTE_WIDTH = 192;
const DEFAULT_NOTE_HEIGHT = 160;
const MIN_NOTE_WIDTH = 120;
const MIN_NOTE_HEIGHT = 80;

interface DraggableNoteProps {
  note: Note;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  onRemoveConnection: (noteId: string, targetId: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onBringToFront: (id: string) => void;
  connectingFrom: string | null;
  getSourceIcon: (source?: string, size?: number) => React.ReactElement;
  notes: Note[];
  zoom: number;
  zIndex: number;
}

const ItemType = 'NOTE';

type DragItem = {
  type: typeof ItemType;
  id: string;
  left: number;
  top: number;
  grabOffsetX: number;
  grabOffsetY: number;
};

const DraggableNote = ({
  note,
  onConnectStart,
  onConnectEnd,
  onRemoveConnection,
  onResize,
  onBringToFront,
  connectingFrom,
  getSourceIcon,
  notes,
  zoom,
  zIndex,
}: DraggableNoteProps) => {
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: ItemType,
    item: (monitor) => {
      const left = note.position?.x ?? 0;
      const top = note.position?.y ?? 0;

      const initialClient = monitor.getInitialClientOffset();
      const initialSource = monitor.getInitialSourceClientOffset();

      const grabOffsetX =
        initialClient && initialSource ? (initialClient.x - initialSource.x) / zoom : 0;
      const grabOffsetY =
        initialClient && initialSource ? (initialClient.y - initialSource.y) / zoom : 0;

      return { type: ItemType, id: note.id, left, top, grabOffsetX, grabOffsetY };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => connectingFrom == null && !isResizing,
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const setDragRef = useCallback(
    (node: HTMLDivElement | null) => {
      drag(node);
    },
    [drag]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = note.size?.width ?? DEFAULT_NOTE_WIDTH;
      const startHeight = note.size?.height ?? DEFAULT_NOTE_HEIGHT;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / zoom;
        const dy = (moveEvent.clientY - startY) / zoom;
        const newWidth = Math.max(MIN_NOTE_WIDTH, startWidth + dx);
        const newHeight = Math.max(MIN_NOTE_HEIGHT, startHeight + dy);
        onResize(note.id, Math.round(newWidth), Math.round(newHeight));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [note.id, note.size, onResize, zoom]
  );

  const isConnecting = connectingFrom === note.id;
  const noteWidth = note.size?.width ?? DEFAULT_NOTE_WIDTH;
  const noteHeight = note.size?.height ?? DEFAULT_NOTE_HEIGHT;

  return (
    <div
      ref={setDragRef}
      data-note
      className={clsx(
        'absolute border-2 rounded-lg shadow-lg select-none',
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab',
        isConnecting && 'border-cyan-500 shadow-cyan-500/50',
        !isDragging && !isConnecting && 'border-green-500/30 hover:border-green-500/50',
        'bg-black transition-colors duration-200'
      )}
      style={{
        left: note.position?.x ?? 0,
        top: note.position?.y ?? 0,
        width: noteWidth,
        height: noteHeight,
        zIndex: isDragging ? 2000 : zIndex,
      }}
      onMouseDown={() => onBringToFront(note.id)}
      onClick={(e) => {
        if (connectingFrom && connectingFrom !== note.id) {
          e.stopPropagation();
          onConnectEnd(note.id);
        }
      }}
    >
      {/* Note Header */}
      <div className="p-2 bg-green-500/10 border-b border-green-500/30 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">{getSourceIcon(note.source, 14)}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting) {
                onConnectStart('');
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
      <div className="p-2 overflow-hidden" style={{ height: noteHeight - 40 }}>
        <div className="text-xs font-semibold text-green-300 mb-1 line-clamp-2 break-all overflow-wrap-anywhere">
          {note.title}
        </div>
        <div className="text-xs text-green-700 line-clamp-3 break-all overflow-wrap-anywhere">{note.content}</div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1 bg-green-500/10 text-green-700 border border-green-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {note.connections && note.connections.length > 0 && (
          <div className="mt-2 pt-2 border-t border-green-500/20">
            <div className="text-xs text-green-700 flex items-center gap-1">
              <LinkIcon size={10} />
              <span>
                {note.connections.length} connection{note.connections.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {note.connections.map((connId) => {
                const connNote = notes.find((n) => n.id === connId);
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

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
        title="Resize"
      >
        <svg
          className="w-full h-full text-green-700 group-hover:text-green-400 transition-colors"
          viewBox="0 0 16 16"
        >
          <line x1="14" y1="4" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" />
          <line x1="14" y1="9" x2="9" y2="14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};

export const NotesBoard = ({ onClose, onSwitchToList }: NotesBoardProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <NotesBoardInner onClose={onClose} onSwitchToList={onSwitchToList} />
    </DndProvider>
  );
};

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.15;
const BOARD_SIZE = 10000;
const BOARD_CENTER = BOARD_SIZE / 2;

const NotesBoardInner = ({ onClose, onSwitchToList }: NotesBoardProps) => {
  const { notes, updateNote } = useGameStore();
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDndInitializing, setIsDndInitializing] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: -BOARD_CENTER, y: -BOARD_CENTER });
  const [noteStack, setNoteStack] = useState<string[]>([]);
  const zoomTargetRef = useRef(1);
  const zoomAnimRef = useRef<number | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const hasCenteredViewRef = useRef(false);
  const hasMigratedLegacyPositionsRef = useRef(false);

  const boardDivRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsDndInitializing(false));
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    setNoteStack((prev) => {
      const currentIds = notes.map((note) => note.id);
      const existing = prev.filter((id) => currentIds.includes(id));
      const missing = currentIds.filter((id) => !existing.includes(id));
      return [...existing, ...missing];
    });
  }, [notes]);

  useEffect(() => {
    notes.forEach((note, index) => {
      if (!note.position) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        updateNote(note.id, {
          position: {
            x: BOARD_CENTER - 375 + col * 250,
            y: BOARD_CENTER - 300 + row * 200,
          },
          connections: note.connections || [],
        });
      }
    });
  }, [notes, updateNote]);

  useEffect(() => {
    if (hasMigratedLegacyPositionsRef.current) return;
    if (notes.length === 0) return;

    const positionedNotes = notes.filter((note) => note.position);
    if (positionedNotes.length === 0) return;

    const legacyThreshold = BOARD_SIZE * 0.25;
    const isLegacyTopLeftCluster = positionedNotes.every(
      (note) =>
        (note.position?.x ?? 0) >= 0 &&
        (note.position?.y ?? 0) >= 0 &&
        (note.position?.x ?? 0) < legacyThreshold &&
        (note.position?.y ?? 0) < legacyThreshold
    );

    hasMigratedLegacyPositionsRef.current = true;
    if (!isLegacyTopLeftCluster) return;

    const xs = positionedNotes.map((note) => note.position!.x);
    const ys = positionedNotes.map((note) => note.position!.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const clusterCenterX = (minX + maxX) / 2;
    const clusterCenterY = (minY + maxY) / 2;

    const dx = BOARD_CENTER - clusterCenterX;
    const dy = BOARD_CENTER - clusterCenterY;

    notes.forEach((note) => {
      if (!note.position) return;
      updateNote(note.id, {
        position: {
          x: Math.max(0, Math.round(note.position.x + dx)),
          y: Math.max(0, Math.round(note.position.y + dy)),
        },
      });
    });
  }, [notes, updateNote]);

  useEffect(() => {
    if (hasCenteredViewRef.current) return;

    const board = boardDivRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    setPan({
      x: rect.width / (2 * zoom) - BOARD_CENTER,
      y: rect.height / (2 * zoom) - BOARD_CENTER,
    });
    hasCenteredViewRef.current = true;
  }, [zoom]);

  const moveNote = useCallback(
    (id: string, left: number, top: number) => {
      updateNote(id, { position: { x: left, y: top } });
    },
    [updateNote]
  );

  const resizeNote = useCallback(
    (id: string, width: number, height: number) => {
      updateNote(id, { size: { width, height } });
    },
    [updateNote]
  );

  const bringNoteToFront = useCallback((id: string) => {
    setNoteStack((prev) => {
      if (prev[prev.length - 1] === id) return prev;
      const without = prev.filter((noteId) => noteId !== id);
      return [...without, id];
    });
  }, []);

  const clamp = useCallback((left: number, top: number) => {
    return {
      left: Math.max(0, Math.round(left)),
      top: Math.max(0, Math.round(top)),
    };
  }, []);

  const computeBoardRelative = useCallback(
    (item: DragItem, client: XYCoord) => {
      const board = boardDivRef.current;
      if (!board) return { left: item.left, top: item.top };

      const rect = board.getBoundingClientRect();
      const left = (client.x - rect.left) / zoom - pan.x - item.grabOffsetX;
      const top = (client.y - rect.top) / zoom - pan.y - item.grabOffsetY;

      return clamp(left, top);
    },
    [clamp, zoom, pan]
  );

  const [, drop] = useDrop<DragItem>({
    accept: ItemType,
    hover: (item, monitor) => {
      const client = monitor.getClientOffset();
      if (!client) return;

      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const { left, top } = computeBoardRelative(item, client);
        moveNote(item.id, left, top);
      });
    },
    drop: (item, monitor) => {
      const client = monitor.getClientOffset();
      if (!client) return;

      const { left, top } = computeBoardRelative(item, client);
      moveNote(item.id, left, top);
      bringNoteToFront(item.id);
    },
  });

  const orderedNotes = useMemo(() => {
    const noteById = new Map(notes.map((note) => [note.id, note]));
    return noteStack
      .map((id) => noteById.get(id))
      .filter((note): note is Note => Boolean(note));
  }, [notes, noteStack]);

  const setBoardRef = useCallback(
    (node: HTMLDivElement | null) => {
      boardDivRef.current = node;
      drop(node);
    },
    [drop]
  );

  useEffect(() => {
    const board = boardDivRef.current;
    if (!board) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomTargetRef.current = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomTargetRef.current + delta));

      if (zoomAnimRef.current != null) return;

      const tick = () => {
        setZoom((current) => {
          const target = zoomTargetRef.current;
          const diff = target - current;
          if (Math.abs(diff) < 0.005) {
            zoomAnimRef.current = null;
            return target;
          }
          zoomAnimRef.current = requestAnimationFrame(tick);
          return current + diff * 0.2;
        });
      };
      zoomAnimRef.current = requestAnimationFrame(tick);
    };

    board.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      board.removeEventListener('wheel', onWheel);
      if (zoomAnimRef.current != null) cancelAnimationFrame(zoomAnimRef.current);
    };
  }, []);

  const handleBoardMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan when clicking on empty board space, not on notes or their children
    const target = e.target as HTMLElement;
    if (target.closest('[data-note]')) return;
    e.preventDefault();
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = (moveEvent.clientX - panStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - panStartRef.current.y) / zoom;
      setPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [pan, zoom]);

  const handleConnectStart = (noteId: string) => {
    setConnectingFrom(noteId ? noteId : null);
  };

  const handleConnectEnd = (targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null);
      return;
    }

    const sourceNote = notes.find((n) => n.id === connectingFrom);
    if (!sourceNote) return;

    const connections = sourceNote.connections || [];
    if (!connections.includes(targetId)) {
      updateNote(connectingFrom, { connections: [...connections, targetId] });
    }

    setConnectingFrom(null);
  };

  const handleRemoveConnection = (noteId: string, targetId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    updateNote(noteId, {
      connections: (note.connections || []).filter((id) => id !== targetId),
    });
  };

  const getSourceIcon = (source?: string, size = 16) => {
    if (!source) return <StickyNote size={size} />;
    if (source.startsWith('email')) return <Mail size={size} />;
    if (source.startsWith('file')) return <Folder size={size} />;
    if (source.startsWith('log')) return <FileText size={size} />;
    return <StickyNote size={size} />;
  };

  const renderConnections = () => {
    return notes.map((note) => {
      if (!note.position || !note.connections?.length) return null;

      const noteW = note.size?.width ?? DEFAULT_NOTE_WIDTH;
      const noteH = note.size?.height ?? DEFAULT_NOTE_HEIGHT;

      return note.connections.map((targetId) => {
        const targetNote = notes.find((n) => n.id === targetId);
        if (!targetNote?.position) return null;

        const targetW = targetNote.size?.width ?? DEFAULT_NOTE_WIDTH;
        const targetH = targetNote.size?.height ?? DEFAULT_NOTE_HEIGHT;

        const startX = note.position!.x + noteW / 2;
        const startY = note.position!.y + noteH / 2;
        const endX = targetNote.position.x + targetW / 2;
        const endY = targetNote.position.y + targetH / 2;

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
            <circle cx={startX} cy={startY} r="4" fill="#10b981" opacity="0.7" />
            <circle cx={endX} cy={endY} r="4" fill="#10b981" opacity="0.7" />
          </g>
        );
      });
    });
  };

  const zoomPercent = Math.round(zoom * 100);

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

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-green-500/30 rounded px-1">
            <button
              onClick={() => {
                const next = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
                zoomTargetRef.current = next;
                setZoom(next);
              }}
              className="text-green-600 hover:text-green-400 p-0.5 transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-green-600 w-8 text-center">{zoomPercent}%</span>
            <button
              onClick={() => {
                const next = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
                zoomTargetRef.current = next;
                setZoom(next);
              }}
              className="text-green-600 hover:text-green-400 p-0.5 transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
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
        ref={setBoardRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-br from-black via-green-950/5 to-black cursor-grab active:cursor-grabbing"
        onClick={() => setConnectingFrom(null)}
        onMouseDown={handleBoardMouseDown}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            width: BOARD_SIZE,
            height: BOARD_SIZE,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <svg
            className="absolute pointer-events-none"
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            style={{ zIndex: 1, top: 0, left: 0 }}
          >
            {renderConnections()}
          </svg>

          {notes.length === 0 ? null : (
            orderedNotes.map((note, index) => (
              <DraggableNote
                key={note.id}
                note={note}
                onConnectStart={handleConnectStart}
                onConnectEnd={handleConnectEnd}
                onRemoveConnection={handleRemoveConnection}
                onResize={resizeNote}
                onBringToFront={bringNoteToFront}
                connectingFrom={connectingFrom}
                getSourceIcon={getSourceIcon}
                notes={notes}
                zoom={zoom}
                zIndex={index + 2}
              />
            ))
          )}
        </div>

        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-green-700">
              <StickyNote size={64} className="mx-auto mb-4 opacity-30" />
              <div className="text-lg mb-2">No notes yet</div>
              <div className="text-xs">Create notes from emails, files, and logs</div>
            </div>
          </div>
        )}

        {isDndInitializing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
            <div className="flex items-center gap-2 text-green-400 text-xs tracking-wide">
              <LoaderCircle size={18} className="animate-spin" />
              <span>Initializing board...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID Notes Board v1.0</span>
        <span>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} • {zoomPercent}% zoom
        </span>
      </div>
    </div>
  );
};
