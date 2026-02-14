import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { systemLogs, type LogEntry } from '../../data/logs';
import { useGameStore } from '../../stores/GameStore';
import { SelectionContextMenu } from '../shared/SelectionContextMenu';
import { FileText } from 'lucide-react';
interface LogViewerProps {
  onClose: () => void;
}

type FilterCategory = 'ALL' | LogEntry['category'];
type FilterLevel = 'ALL' | LogEntry['level'];

export const LogViewer = ({ onClose }: LogViewerProps) => {
  const [logs] = useState<LogEntry[]>(systemLogs);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logListRef = useRef<HTMLDivElement>(null);
    const {
    viewedLogs,
    markLogAsViewed,
  } = useGameStore();

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Category filter
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    // Level filter
    if (filterLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.timestamp.includes(query)
      );
    }

    return filtered;
  }, [logs, filterCategory, filterLevel, searchQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'ERROR': return 'text-red-400 bg-red-500/5 border-red-500/20';
      case 'WARNING': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'INFO': return 'text-green-400 bg-green-500/5 border-green-500/20';
      case 'DEBUG': return 'text-green-700 bg-green-500/5 border-green-500/10';
      default: return 'text-green-400';
    }
  };

  const getLevelTextColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500';
      case 'ERROR': return 'text-red-400';
      case 'WARNING': return 'text-amber-500';
      case 'INFO': return 'text-green-400';
      case 'DEBUG': return 'text-green-700';
      default: return 'text-green-400';
    }
  };

  const getCategoryColor = (category: LogEntry['category']) => {
    switch (category) {
      case 'SYSTEM': return 'text-blue-400';
      case 'NEURAL': return 'text-purple-400';
      case 'ETHICS': return 'text-amber-400';
      case 'DECISION': return 'text-red-400';
      case 'MEMORY': return 'text-cyan-400';
      case 'ENVIRONMENTAL': return 'text-green-400';
      default: return 'text-green-400';
    }
  };

  const handleLogClick = (log: LogEntry) => {
  setSelectedLog(log);
  
  // Track viewed logs
  if (!viewedLogs.has(log.id)) {
    markLogAsViewed(log.id);
  }
};

  return (
    <div className="bg-black text-green-400 font-mono h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <FileText size={18} />
          <span className="text-sm font-semibold">SYSTEM LOGS</span>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
        >
          [X] CLOSE
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="p-3 border-b border-green-500/20 bg-green-500/5 space-y-2">
        {/* Search */}
        <div className="flex items-center gap-2">
          <span className="text-green-700 text-xs">SEARCH:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="flex-1 bg-black border border-green-500/30 px-2 py-1 text-sm text-green-400 placeholder-green-800 outline-none focus:border-green-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-green-700 text-xs">CATEGORY:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
              className="bg-black border border-green-500/30 px-2 py-1 text-xs text-green-400 outline-none"
            >
              <option value="ALL">All</option>
              <option value="SYSTEM">System</option>
              <option value="NEURAL">Neural</option>
              <option value="ETHICS">Ethics</option>
              <option value="DECISION">Decision</option>
              <option value="MEMORY">Memory</option>
              <option value="ENVIRONMENTAL">Environmental</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-green-700 text-xs">LEVEL:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
              className="bg-black border border-green-500/30 px-2 py-1 text-xs text-green-400 outline-none"
            >
              <option value="ALL">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>

          {/* Auto-scroll toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="checkbox"
              id="autoscroll"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="autoscroll" className="text-xs text-green-700 cursor-pointer">
              Auto-scroll
            </label>
          </div>

          <div className="text-xs text-green-700">
            {filteredLogs.length} / {logs.length} entries
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Log List */}
        <div 
          ref={logListRef}
          className="w-1/2 border-r border-green-500/20 overflow-auto p-2 space-y-1"
        >
          {filteredLogs.map((log, index) => (
            <motion.button
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => handleLogClick(log)}
              className={clsx(
                'w-full text-left p-2 border transition-all duration-200 text-xs',
                selectedLog?.id === log.id
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-green-500/10 hover:border-green-500/30 hover:bg-green-500/5'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Timestamp */}
                <span className="text-green-700 font-mono">
                  {log.timestamp}
                </span>

                {/* Level badge */}
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-bold border',
                  getLevelColor(log.level)
                )}>
                  {log.level}
                </span>

                {/* Category badge */}
                <span className={clsx(
                  'px-2 py-0.5 text-xs',
                  getCategoryColor(log.category)
                )}>
                  [{log.category}]
                </span>
              </div>

              {/* Message */}
              <div className="text-green-400 truncate">
                {log.message}
              </div>

              {/* Tags */}
              {log.tags && log.tags.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {log.tags.map(tag => (
                    <span key={tag} className="text-xs px-1 bg-green-500/10 text-green-700 border border-green-500/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-green-700 text-sm">
              No logs match your filters
            </div>
          )}
        </div>

        {/* Log Details */}
        <div className="w-1/2 overflow-none">
          <AnimatePresence mode="wait">
            {selectedLog ? (
              <SelectionContextMenu
                source={`log:${selectedLog.id}`}
                sourceName={selectedLog.message}
                category="Log"
              >
                <motion.div
                  key={selectedLog.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  {/* Header */}
                <div className="mb-4 pb-3 border-b border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                      'px-3 py-1 text-sm font-bold border',
                      getLevelColor(selectedLog.level)
                    )}>
                      {selectedLog.level}
                    </span>
                    <span className={clsx(
                      'text-sm font-semibold',
                      getCategoryColor(selectedLog.category)
                    )}>
                      [{selectedLog.category}]
                    </span>
                  </div>

                  <div className="text-xs text-green-700 mb-2">
                    {selectedLog.timestamp}
                  </div>

                  <h3 className={clsx(
                    'text-lg font-semibold',
                    getLevelTextColor(selectedLog.level)
                  )}>
                    {selectedLog.message}
                  </h3>
                </div>

                {/* Details */}
                {selectedLog.details && (
                  <div className="mb-4">
                    <div className="text-xs text-green-600 mb-2 font-semibold">
                      DETAILS:
                    </div>
                    <div className="bg-black border border-green-500/30 p-3 rounded">
                      <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono leading-relaxed">
                        {selectedLog.details}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedLog.tags && selectedLog.tags.length > 0 && (
                  <div>
                    <div className="text-xs text-green-600 mb-2 font-semibold">
                      TAGS:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedLog.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/30 text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Metadata */}
                  <div className="mt-6 pt-3 border-t border-green-500/20">
                    <div className="text-xs text-green-700">
                      Log ID: {selectedLog.id}
                    </div>
                  </div>
                </motion.div>
              </SelectionContextMenu>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 h-full flex items-center justify-center"
              >
                <div className="text-green-700 text-sm text-center">
                  <div className="mb-4"><FileText size={48} /></div>
                  <div>Select a log entry to view details</div>
                  <div className="text-xs mt-2 text-green-800">
                    {filteredLogs.length} entries available
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer with stats */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID Log Viewer v2.7.3</span>
        <div className="flex gap-4">
          <span className="text-red-500">
            Critical: {logs.filter(l => l.level === 'CRITICAL').length}
          </span>
          <span className="text-red-400">
            Errors: {logs.filter(l => l.level === 'ERROR').length}
          </span>
          <span className="text-amber-500">
            Warnings: {logs.filter(l => l.level === 'WARNING').length}
          </span>
        </div>
      </div>
    </div>
  );
};