import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useGameStore, type Note } from '../../stores/GameStore';
import { useSoundManager } from '../../hooks/useSoundManager';
import { StickyNote, Mail, Folder, FileText } from 'lucide-react';

interface NotesProps {
  onClose: () => void;
}

type FilterType = 'all' | 'email' | 'file' | 'log' | 'custom';
type SortType = 'newest' | 'oldest' | 'title' | 'source';

export const Notes = ({ onClose }: NotesProps) => {
  const { notes, addNote, updateNote, deleteNote } = useGameStore();
  const sound = useSoundManager();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Apply filters
    if (filterType !== 'all') {
      filtered = filtered.filter((note) => {
        if (!note.source) return filterType === 'custom';
        return note.source.startsWith(filterType);
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.category?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'source':
          return (a.source || 'custom').localeCompare(b.source || 'custom');
        default:
          return 0;
      }
    });

    return filtered;
  }, [notes, filterType, sortType, searchQuery]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('');
    setFormTags('');
    setSelectedNote(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (selectedNote) {
      setFormTitle(selectedNote.title);
      setFormContent(selectedNote.content);
      setFormCategory(selectedNote.category || '');
      setFormTags(selectedNote.tags?.join(', ') || '');
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleSave = () => {
    const tags = formTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (isCreating) {
      addNote({
        title: formTitle || 'Untitled Note',
        content: formContent,
        category: formCategory || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      //sound.play('success');
    } else if (isEditing && selectedNote) {
      updateNote(selectedNote.id, {
        title: formTitle,
        content: formContent,
        category: formCategory || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      //sound.play('success');
    }

    setIsEditing(false);
    setIsCreating(false);
    setSelectedNote(null);
  };

  const handleDelete = () => {
    if (selectedNote && confirm('Delete this note? This cannot be undone.')) {
      deleteNote(selectedNote.id);
      setSelectedNote(null);
      setIsEditing(false);
      //sound.play('error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  const getSourceIcon = (source?: string, size = 16) => {
    if (!source) return <StickyNote size={size} />;
    if (source.startsWith('email')) return <Mail size={size} />;
    if (source.startsWith('file')) return <Folder size={size} />;
    if (source.startsWith('log')) return <FileText size={size} />;
    return <StickyNote size={size} />;
  };

  const getSourceLabel = (source?: string) => {
    if (!source) return 'Custom Note';
    if (source.startsWith('email')) return 'From Email';
    if (source.startsWith('file')) return 'From File';
    if (source.startsWith('log')) return 'From Log';
    return 'Custom Note';
  };

  return (
    <div className="bg-black text-green-400 font-mono h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <StickyNote size={18} />
          <span className="text-sm font-semibold">NOTES</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="text-green-500 hover:text-green-400 text-sm px-2 py-1 border border-green-500/30 hover:border-green-500/50 transition-colors"
          >
            [+] NEW NOTE
          </button>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
          >
            [X] CLOSE
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-green-500/20 bg-green-500/5 space-y-2">
        {/* Search */}
        <div className="flex items-center gap-2">
          <span className="text-green-700 text-xs">SEARCH:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-black border border-green-500/30 px-2 py-1 text-sm text-green-400 placeholder-green-800 outline-none focus:border-green-500/50"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-green-700 text-xs">FILTER:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="bg-black border border-green-500/30 px-2 py-1 text-xs text-green-400 outline-none"
            >
              <option value="all">All ({notes.length})</option>
              <option value="email">From Emails</option>
              <option value="file">From Files</option>
              <option value="log">From Logs</option>
              <option value="custom">Custom Notes</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-green-700 text-xs">SORT:</span>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="bg-black border border-green-500/30 px-2 py-1 text-xs text-green-400 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
              <option value="source">By Source</option>
            </select>
          </div>

          <div className="flex-1" />

          <div className="text-xs text-green-700">
            Showing {filteredNotes.length} of {notes.length}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Notes List */}
        <div className="w-2/5 border-r border-green-500/20 overflow-y-auto overflow-x-hidden">
          <div className="divide-y divide-green-500/10">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-green-700 text-sm">
                {notes.length === 0 ? (
                  <>
                    <div className="mb-4"><StickyNote size={48} /></div>
                    <div className="mb-2">No notes yet</div>
                    <div className="text-xs text-green-800">
                      Create a note or highlight text in emails, files, and logs
                    </div>
                  </>
                ) : (
                  'No notes match your filters'
                )}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <motion.button
                  key={note.id}
                  onClick={() => handleNoteClick(note)}
                  onHoverStart={() => sound.play('appHover')}
                  className={clsx(
                    'w-full text-left p-4 transition-all duration-200',
                    selectedNote?.id === note.id
                      ? 'bg-green-500/10 border-l-2 border-green-500'
                      : 'hover:bg-green-500/5 border-l-2 border-transparent'
                  )}
                  whileHover={{ x: 4 }}
                >
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-lg">{getSourceIcon(note.source)}</span>
                      <span className="text-green-700">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-sm font-semibold text-green-400 truncate">
                      {note.title}
                    </div>

                    {/* Source */}
                    <div className="text-xs text-green-600">
                      {getSourceLabel(note.source)}
                      {note.sourceName && (
                        <span className="text-green-500 ml-1">· {note.sourceName}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-1 bg-green-500/10 text-green-700 border border-green-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Preview */}
                    <div className="text-xs text-green-700 truncate">
                      {note.content.substring(0, 60)}...
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Note Viewer/Editor */}
        <div className="w-3/5 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {isCreating || isEditing ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="mb-4">
                  <div className="text-xs text-green-700 mb-2 font-semibold uppercase">
                    {isCreating ? 'Create New Note' : 'Edit Note'}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs text-green-600 mb-1 block">TITLE:</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Note title..."
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-sm text-green-400 placeholder-green-800 outline-none focus:border-green-500/50"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-xs text-green-600 mb-1 block">CONTENT:</label>
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Note content..."
                      rows={12}
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-sm text-green-400 placeholder-green-800 outline-none focus:border-green-500/50 resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs text-green-600 mb-1 block">
                      CATEGORY (optional):
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g., Investigation, Clues, Timeline..."
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-sm text-green-400 placeholder-green-800 outline-none focus:border-green-500/50"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs text-green-600 mb-1 block">
                      TAGS (comma-separated, optional):
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="e.g., important, follow-up, mystery..."
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-sm text-green-400 placeholder-green-800 outline-none focus:border-green-500/50"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-green-500/20">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-colors text-sm"
                    >
                      💾 SAVE
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-green-500/30 text-green-600 hover:bg-green-500/5 transition-colors text-sm"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : selectedNote ? (
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                {/* Note header */}
                <div className="mb-6 pb-4 border-b border-green-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-green-300">
                      {selectedNote.title}
                    </h2>
                    <span className="text-2xl">{getSourceIcon(selectedNote.source)}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-green-700 w-20">Source:</span>
                      <span className="text-green-400">{getSourceLabel(selectedNote.source)}</span>
                    </div>
                    {selectedNote.sourceName && (
                      <div className="flex gap-2">
                        <span className="text-green-700 w-20">From:</span>
                        <span className="text-green-300 font-semibold">"{selectedNote.sourceName}"</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="text-green-700 w-20">Created:</span>
                      <span className="text-green-400">
                        {new Date(selectedNote.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {selectedNote.category && (
                      <div className="flex gap-2">
                        <span className="text-green-700 w-20">Category:</span>
                        <span className="text-green-400">{selectedNote.category}</span>
                      </div>
                    )}
                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-green-700 w-20">Tags:</span>
                        <div className="flex gap-1 flex-wrap">
                          {selectedNote.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note content */}
                <div className="text-sm text-green-400 whitespace-pre-wrap leading-relaxed mb-6">
                  {selectedNote.content}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-green-500/20">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-colors text-sm"
                  >
                    ✏️ EDIT
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-colors text-sm"
                  >
                    🗑️ DELETE
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 h-full flex items-center justify-center"
              >
                <div className="text-green-700 text-sm text-center">
                  <div className="mb-4"><StickyNote size={48} /></div>
                  <div>Select a note to view</div>
                  <div className="text-xs mt-2 text-green-800">
                    or create a new note
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID Notes v1.0</span>
        <span>
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
        </span>
      </div>
    </div>
  );
};
