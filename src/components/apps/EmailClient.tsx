import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { emails, type Email, type Attachment } from '../../data/emails';
import { useSoundManager } from '../../hooks/useSoundManager';
import { useGameStore } from '../../stores/GameStore';
import { useWindowManager } from '../../stores/WindowManager';
import { SelectionContextMenu } from '../shared/SelectionContextMenu';
import { Mail, File, FileText, Image, Paperclip } from 'lucide-react';

interface EmailClientProps {
  onClose: () => void;
}

type FilterType = 'all' | 'unread' | 'urgent' | 'personal' | 'project' | 'crisis';
type SortType = 'date-desc' | 'date-asc' | 'importance' | 'sender';

export const EmailClient = ({ onClose }: EmailClientProps) => {

     const {
    readEmails,
    markEmailAsRead,
    dynamicEmails,
    //unreadEmailCount,
  } = useGameStore();

  const { setNotification, clearNotification } = useWindowManager();

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  // Combine static emails with dynamic emails
  const allEmails = useMemo(() => {
    return [...emails, ...dynamicEmails];
  }, [dynamicEmails]);

  const [emailList, setEmailList] = useState<Email[]>(
    allEmails.map(email => ({
      ...email,
      read: readEmails.has(email.id)
    }))
  );

  // Update email list when dynamic emails change
  useEffect(() => {
    setEmailList(allEmails.map(email => ({
      ...email,
      read: readEmails.has(email.id)
    })));
  }, [dynamicEmails, readEmails, allEmails]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const sound = useSoundManager();

  // Set notification on mount if there are unread emails
  useEffect(() => {
    const unreadCount = emailList.filter(e => !e.read).length;
    if (unreadCount > 0) {
      setNotification('email', unreadCount);
      // Play notification sound
      sound.play('appHover');
    }
    // Clear notification when component unmounts (user viewed the emails)
    return () => {
      clearNotification('email');
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAttachment) {
        setSelectedAttachment(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedAttachment]);

  // Filter and sort emails
  const filteredEmails = useMemo(() => {
    let filtered = [...emailList];

    // Apply filters
    if (filterType === 'unread') {
      filtered = filtered.filter(e => !e.read);
    } else if (filterType === 'urgent') {
      filtered = filtered.filter(e => e.importance === 'urgent' || e.importance === 'high');
    } else if (filterType !== 'all') {
      filtered = filtered.filter(e => e.tags?.includes(filterType));
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(query) ||
        e.from.toLowerCase().includes(query) ||
        e.body.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'date-desc':
          return b.date.localeCompare(a.date);
        case 'date-asc':
          return a.date.localeCompare(b.date);
        case 'importance': {
          const importanceOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          return (importanceOrder[b.importance || 'normal'] || 0) - (importanceOrder[a.importance || 'normal'] || 0);
        }
        case 'sender':
          return a.from.localeCompare(b.from);
        default:
          return 0;
      }
    });

    return filtered;
  }, [emailList, filterType, sortType, searchQuery]);

const handleEmailClick = (email: Email) => {
  setSelectedEmail(email);
  setSelectedAttachment(null);
  
  // Mark as read in game store (triggers clue discovery!)
  if (!readEmails.has(email.id)) {
    markEmailAsRead(email.id);
  }
  
  // Also update local state
  const updatedList = emailList.map(e => 
    e.id === email.id ? { ...e, read: true } : e
  );
  setEmailList(updatedList);
};

  const handleAttachmentClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
  };

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-amber-400';
      case 'normal': return 'text-green-400';
      case 'low': return 'text-green-700';
      default: return 'text-green-400';
    }
  };

  const getImportanceIndicator = (importance?: string) => {
    switch (importance) {
      case 'urgent': return '!!!';
      case 'high': return '!!';
      case 'normal': return '!';
      default: return '';
    }
  };

  const getAttachmentIcon = (type: string) => {
    const iconSize = 16;
    switch (type) {
      case 'document': return <FileText size={iconSize} />;
      case 'image': return <Image size={iconSize} />;
      case 'audio': return <File size={iconSize} />;
      case 'video': return <File size={iconSize} />;
      case 'data': return <File size={iconSize} />;
      default: return <Paperclip size={iconSize} />;
    }
  };

  const renderAttachmentViewer = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'document':
      case 'data':
        return (
          <div className="bg-black border border-green-500/30 p-4 rounded">
            <div className="text-sm text-green-400 whitespace-pre-wrap font-mono">
              {attachment.content || '[Content not available]'}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="bg-black border border-green-500/30 p-4 rounded flex items-center justify-center">
            <div className="text-center">
              {attachment.url && (
                <div className="mt-4 text-green-700 text-xs max-w-md">
                  <img src={attachment.url} alt={attachment.name} className="max-w-full h-auto" />
                </div>
              )}
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-black border border-green-500/30 p-6 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">🔊</div>
              <div className="text-green-600 text-sm mb-2">Audio: {attachment.name}</div>
              <div className="text-green-800 text-xs mb-4">
                [Audio player placeholder - {attachment.size}]
              </div>
              <div className="flex gap-2 justify-center">
                <button className="px-3 py-1 border border-green-500/30 text-green-600 text-xs hover:bg-green-500/10">
                  ▶ PLAY
                </button>
                <button className="px-3 py-1 border border-green-500/30 text-green-700 text-xs hover:bg-green-500/10">
                  ⏸ PAUSE
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="bg-black border border-green-500/30 p-6 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-green-600 text-sm">Video: {attachment.name}</div>
              <div className="text-green-800 text-xs mt-2">
                [Video player placeholder - {attachment.size}]
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-black border border-green-500/30 p-4 rounded">
            <div className="text-green-600 text-sm">
              Unknown file type: {attachment.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono h-screen w-screen flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <Mail size={18} />
          <span className="text-sm font-semibold">EMAIL CLIENT</span>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
        >
          [X] CLOSE
        </button>
      </div>

      {/* Toolbar with filters and search */}
      <div className="p-3 border-b border-green-500/20 bg-green-500/5 space-y-2">
        {/* Search */}
        <div className="flex items-center gap-2">
          <span className="text-green-700 text-xs">SEARCH:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails..."
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
              <option value="all">All ({emailList.length})</option>
              <option value="unread">Unread ({emailList.filter(e => !e.read).length})</option>
              <option value="urgent">Urgent</option>
              <option value="personal">Personal</option>
              <option value="project">Project</option>
              <option value="crisis">Crisis</option>
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
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="importance">By Importance</option>
              <option value="sender">By Sender</option>
            </select>
          </div>

          <div className="flex-1" />
          
          <div className="text-xs text-green-700">
            Showing {filteredEmails.length} of {emailList.length}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div className="w-2/5 border-r border-green-500/20 overflow-y-auto overflow-hidden">
          <div className="divide-y divide-green-500/10">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-green-700 text-sm">
                No emails match your filters
              </div>
            ) : (
              filteredEmails.map((email) => (
                <motion.button
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  onHoverStart={() => sound.play('appHover')}
                  className={clsx(
                    'w-full text-left p-4 transition-all duration-200',
                    selectedEmail?.id === email.id
                      ? 'bg-green-500/10 border-l-2 border-green-500'
                      : 'hover:bg-green-500/5 border-l-2 border-transparent',
                    !email.read && 'bg-green-500/5'
                  )}
                  whileHover={{ x: 4 }}
                >
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-xs">
                      {!email.read && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                      <span className={getImportanceColor(email.importance)}>
                        {getImportanceIndicator(email.importance)}
                      </span>
                      <span className="text-green-700">{email.date}</span>
                      {email.attachments && email.attachments.length > 0 && (
                        <span className="text-green-600">📎{email.attachments.length}</span>
                      )}
                    </div>

                    {/* From */}
                    <div className={clsx(
                      'text-sm truncate',
                      !email.read ? 'font-bold text-green-300' : 'text-green-500'
                    )}>
                      {email.from}
                    </div>

                    {/* Subject */}
                    <div className={clsx(
                      'text-sm truncate',
                      !email.read ? 'font-semibold text-green-400' : 'text-green-600'
                    )}>
                      {email.subject}
                    </div>

                    {/* Tags */}
                    {email.tags && email.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {email.tags.map(tag => (
                          <span key={tag} className="text-xs px-1 bg-green-500/10 text-green-700 border border-green-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Preview */}
                    <div className="text-xs text-green-700 truncate">
                      {email.body.substring(0, 60)}...
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Email Viewer */}
        <div className="w-3/5 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {selectedEmail ? (
              <SelectionContextMenu
                source={`email:${selectedEmail.id}`}
                sourceName={selectedEmail.subject}
                category="Email"
              >
                <motion.div
                  key={selectedEmail.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* Email header */}
                  <div className="mb-6 pb-4 border-b border-green-500/20">
                    <h2 className={clsx(
                      'text-xl font-semibold mb-3',
                      getImportanceColor(selectedEmail.importance)
                    )}>
                      {selectedEmail.subject}
                    </h2>

                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-green-700 w-16">From:</span>
                        <span className="text-green-400">{selectedEmail.from}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-700 w-16">To:</span>
                        <span className="text-green-400">{selectedEmail.to}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-700 w-16">Date:</span>
                        <span className="text-green-400">{selectedEmail.date}</span>
                      </div>
                      {selectedEmail.importance && (
                        <div className="flex gap-2">
                          <span className="text-green-700 w-20">Priority:</span>
                          <span className={getImportanceColor(selectedEmail.importance)}>
                            {selectedEmail.importance.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email body */}
                  <div className="text-sm text-green-400 whitespace-pre-wrap leading-relaxed mb-6">
                    {selectedEmail.body}
                  </div>

                {/* Attachments */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-green-500/20">
                    <div className="text-xs text-green-700 mb-3 font-semibold">
                      ATTACHMENTS ({selectedEmail.attachments.length})
                    </div>
                    
                    {/* Attachment list */}
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <button
                          key={index}
                          onClick={() => handleAttachmentClick(attachment)}
                          className="w-full text-left p-3 border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xl">{getAttachmentIcon(attachment.type)}</span>
                          <div className="flex-1">
                            <div className="text-sm text-green-400">{attachment.name}</div>
                            <div className="text-xs text-green-700">
                              {attachment.type} • {attachment.size}
                            </div>
                          </div>
                          <span className="text-green-600">OPEN →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Urgency warning */}
                  {selectedEmail.importance === 'urgent' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 p-3 border border-red-500/30 bg-red-500/5 rounded"
                    >
                      <div className="text-xs text-red-400">
                        ⚠ This message was marked as URGENT
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </SelectionContextMenu>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 h-full flex items-center justify-center"
              >
                <div className="text-green-700 text-sm text-center">
                  <div className="mb-4"><Mail size={48} /></div>
                  <div>Select an email to read</div>
                  <div className="text-xs mt-2 text-green-800">
                    {emailList.filter(e => !e.read).length} unread messages
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID Mail v2.7.3</span>
        <span>Archive: {filteredEmails.length} / {emailList.length} messages</span>
      </div>

      {/* Attachment Modal Viewer */}
      <AnimatePresence>
        {selectedAttachment && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAttachment(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8"
            >
              <div className="bg-black border-2 border-green-500/50 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl shadow-green-500/20">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-green-500/30 bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getAttachmentIcon(selectedAttachment.type)}</span>
                    <div>
                      <div className="text-sm font-semibold text-green-300">
                        {selectedAttachment.name}
                      </div>
                      <div className="text-xs text-green-700">
                        {selectedAttachment.type.toUpperCase()} • {selectedAttachment.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAttachment(null)}
                    className="text-red-500 hover:text-red-400 px-3 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors text-sm"
                  >
                    [X] CLOSE
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-6">
                  {renderAttachmentViewer(selectedAttachment)}
                </div>

                {/* Modal Footer */}
                <div className="p-3 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700">
                  <div className="flex items-center justify-between">
                    <span>Attachment Viewer v1.0</span>
                    <span>Press ESC or click backdrop to close</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};