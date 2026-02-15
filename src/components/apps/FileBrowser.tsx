
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { fileSystem, type FileItem } from '../../data/files';
import { useGameStore } from '../../stores/GameStore';
import { SelectionContextMenu } from '../shared/SelectionContextMenu';
import { Folder, File, Lock } from 'lucide-react';

interface FileBrowserProps {
  onClose: () => void;
}

export const FileBrowser = ({ onClose }: FileBrowserProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Get state from game store
  const {
    unlockedFiles,
    readFiles,
    encryptedFilesDecrypted,
    //unlockFile,
    markFileAsRead,
    //decryptFile,
    hasDecryptKey,
  } = useGameStore();

  // Navigate through folder structure
  const getCurrentFolder = (): FileItem => {
    let current = fileSystem;
    for (let i = 1; i < currentPath.length; i++) {
      const folder = current.children?.find(item => item.id === currentPath[i]);
      if (folder && folder.type === 'folder') {
        current = folder;
      }
    }
    return current;
  };

  const currentFolder = getCurrentFolder();
  const items = currentFolder.children || [];

  const handleItemClick = (item: FileItem) => {
    // Check if locked and not unlocked in store
    if (item.locked && !unlockedFiles.has(item.id)) {
      console.log('Item locked:', item.name);
      // TODO: Play locked sound
      return;
    }

    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.id]);
      setSelectedFile(null);
    } else {
      setSelectedFile(item);
      // Mark file as read in game store
      if (!readFiles.has(item.id)) {
        markFileAsRead(item.id);
      }
    }
  };

  const handleGoBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
    }
  };

  const getBreadcrumb = () => {
    return currentPath.map((id) => {
      if (id === 'root') return 'System';
      const folder = getCurrentFolder();
      return folder.name || id;
    }).join(' / ');
  };

  // Check if file is accessible
  const isFileAccessible = (item: FileItem) => {
    if (item.locked && !unlockedFiles.has(item.id)) return false;
    return true;
  };

  // Check if file has been read
  const isFileRead = (item: FileItem) => {
    return readFiles.has(item.id);
  };

  return (
    <div className="bg-black text-green-400 font-mono h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-500/5">
        <div className="flex items-center gap-2">
          <Folder size={18} />
          <span className="text-sm font-semibold">FILE BROWSER</span>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-400 text-sm px-2 py-1 border border-red-500/30 hover:border-red-500/50 transition-colors"
        >
          [X] CLOSE
        </button>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-2 p-3 border-b border-green-500/20 bg-green-500/5">
        <button
          onClick={handleGoBack}
          disabled={currentPath.length <= 1}
          className={clsx(
            'px-3 py-1 border text-sm transition-colors',
            currentPath.length <= 1
              ? 'border-green-500/20 text-green-700 cursor-not-allowed'
              : 'border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10'
          )}
        >
          ← BACK
        </button>
        <div className="flex-1 text-sm text-green-600">
          {getBreadcrumb()}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File list */}
        <div className="w-1/2 border-r border-green-500/20 overflow-auto">
          <div className="p-4 space-y-1">
            {items.length === 0 ? (
              <div className="text-green-700 text-sm italic">Empty folder</div>
            ) : (
              items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={clsx(
                    'w-full text-left p-3 border transition-all duration-200 flex items-center gap-3',
                    !isFileAccessible(item)
                      ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed'
                      : selectedFile?.id === item.id
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5'
                  )}
                  whileHover={isFileAccessible(item) ? { scale: 1.01 } : {}}
                  whileTap={isFileAccessible(item) ? { scale: 0.99 } : {}}
                >
                  {/* Icon */}
                  <span>
                    {!isFileAccessible(item) ? <Lock size={20} className="text-red-400" /> :
                     item.encrypted && !encryptedFilesDecrypted.has(item.id) ? <Lock size={20} className="text-amber-400" /> :
                     item.type === 'folder' ? <Folder size={20} /> : <File size={20} />}
                  </span>

                  {/* File info */}
                  <div className="flex-1">
                    <div className={clsx(
                      'text-sm font-semibold flex items-center gap-2',
                      !isFileAccessible(item) ? 'text-red-400' : 'text-green-400'
                    )}>
                      {item.name}
                      {isFileRead(item) && item.type === 'file' && (
                        <span className="text-xs text-green-700">✓ read</span>
                      )}
                    </div>
                    {item.type === 'file' && (
                      <div className="text-xs text-green-700 flex gap-3 mt-1">
                        {item.size && <span>{item.size}</span>}
                        {item.dateModified && <span>{item.dateModified}</span>}
                        {item.loreImportance && (
                          <span className={clsx(
                            'px-1 rounded',
                            item.loreImportance === 'critical' && 'bg-red-500/20 text-red-400',
                            item.loreImportance === 'high' && 'bg-amber-500/20 text-amber-400',
                            item.loreImportance === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                            item.loreImportance === 'low' && 'bg-green-500/20 text-green-400'
                          )}>
                            {item.loreImportance}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Folder indicator */}
                  {item.type === 'folder' && isFileAccessible(item) && (
                    <span className="text-green-600">→</span>
                  )}
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* File viewer */}
        <div className="w-1/2 overflow-y-auto overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <SelectionContextMenu
                source={`file:${selectedFile.id}`}
                sourceName={selectedFile.name}
                category="File"
              >
                <motion.div
                  key={selectedFile.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4"
                >
                  {/* File header */}
                  <div className="mb-4 pb-3 border-b border-green-500/20">
                    <div className="text-green-300 font-semibold mb-2">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-green-700 flex gap-4">
                      {selectedFile.size && <span>Size: {selectedFile.size}</span>}
                      {selectedFile.dateModified && <span>Modified: {selectedFile.dateModified}</span>}
                      {isFileRead(selectedFile) && (
                        <span className="text-green-500">✓ Read</span>
                      )}
                    </div>
                  </div>

                  {/* File content */}
                  <div className="text-sm text-green-400 whitespace-pre-wrap leading-relaxed">
                    {selectedFile.encrypted && !encryptedFilesDecrypted.has(selectedFile.id) ? (
                      <div className="text-red-400">
                        [ENCRYPTED DATA]
                        <br /><br />
                        This file requires decryption.
                        <br />
                        Use the DECRYPT tool to access contents.
                        {!hasDecryptKey && (
                          <>
                            <br /><br />
                            <span className="text-amber-400">
                              Note: You need to solve decryption puzzles first.
                            </span>
                          </>
                        )}
                      </div>
                    ) : selectedFile.imagePath ? (
                      <div className="flex flex-col gap-3">
                        <img
                          src={selectedFile.imagePath}
                          alt={selectedFile.name}
                          className="max-w-full max-h-[60vh] object-contain border border-green-500/30"
                        />
                        {selectedFile.content && (
                          <div>{selectedFile.content}</div>
                        )}
                      </div>
                    ) : (
                      selectedFile.content
                    )}
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
                  <div className="mb-4"><File size={48} /></div>
                  <div>Select a file to view its contents</div>
                  <div className="text-xs mt-2 text-green-800">
                    {readFiles.size} files read
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-green-500/30 bg-green-500/5 text-xs text-green-700 flex justify-between">
        <span>NULLVOID File System v2.7.3</span>
        <span>{items.length} items | {readFiles.size} files read</span>
      </div>
    </div>
  );
};
