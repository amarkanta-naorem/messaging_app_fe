"use client";

import { X, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteMessagesForEveryone, deleteMessagesForMe } from "@/lib/messages";
import { clearSelection, toggleSelectionMode, selectSelectionMode, selectSelectedMessages, selectActiveConversationId, selectMessagesForConversation, markMessagesDeletedForMe, markMessagesDeletedForEveryone, updateMessageContent } from "@/store/slices/chatSlice";

export function BottomActionBar() {
  const dispatch = useAppDispatch();
  const selectionMode = useAppSelector(selectSelectionMode);
  const selectedMessages = useAppSelector(selectSelectedMessages);
  const activeConversationId = useAppSelector(selectActiveConversationId);
  
  const conversationMessages = useAppSelector(activeConversationId ? selectMessagesForConversation(activeConversationId) : () => []);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const selectedCount = selectedMessages.length;
  const shouldRender = selectionMode && selectedCount > 0;
  const conversationId = activeConversationId;
  const messages = conversationMessages || [];
  
  const canDeleteForEveryone = useMemo(() => {
    for (const msgId of selectedMessages) {
      const message = messages.find(m => Number(m.id) === msgId);
      if (message?.createdAt) {
        const createdTime = new Date(message.createdAt).getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (createdTime > oneHourAgo) {
          return true;
        }
      }
    }
    return false;
  }, [selectedMessages, messages]);

  const getSenderName = () => {
    const firstSelectedMsg = messages.find(m => selectedMessages.includes(Number(m.id)));
    return firstSelectedMsg?.senderName || "User";
  };

  const handleCancel = () => {
    dispatch(clearSelection());
    dispatch(toggleSelectionMode(false));
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteForEveryone = async () => {
    setDeleting(true);
    try {
      const senderName = getSenderName();
      const messageIds = selectedMessages.map(id => Number(id)).filter(id => !isNaN(id));
      const result = await deleteMessagesForEveryone(messageIds);
      const deletedIds = result.deleted?.map(m => m.id) || [];
      
if (deletedIds.length > 0 && conversationId) {
        for (const msgId of deletedIds) {
          dispatch(updateMessageContent({
            conversationId: conversationId as number,
            messageId: msgId,
            content: { type: "text", text: `${senderName} deleted this message for everyone` }
          }));
        }
        dispatch(markMessagesDeletedForEveryone({ conversationId: conversationId as number, messageIds: deletedIds }));
      }
    } catch (error) {
      console.error("Delete for everyone failed:", error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      handleCancel();
    }
  };

  const handleDeleteForMe = async () => {
    setDeleting(true);
    try {
      const messageIds = selectedMessages.map(id => Number(id)).filter(id => !isNaN(id));
      const result = await deleteMessagesForMe(messageIds);
      const deletedIds = result.deleted?.map(m => m.id) || [];
      
if (deletedIds.length > 0 && conversationId) {
        for (const msgId of deletedIds) {
          dispatch(updateMessageContent({
            conversationId: conversationId as number,
            messageId: msgId,
            content: { type: "text", text: "You deleted this message only for you" }
          }));
        }
        dispatch(markMessagesDeletedForMe({ conversationId: conversationId as number, messageIds: deletedIds }));
      }
    } catch (error) {
      console.error("Delete for me failed:", error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      handleCancel();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

if (!shouldRender || !conversationId) {
    return null;
  }

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#2a2f32] border-t border-[#e2e8f0] dark:border-[#4a5568] px-4 py-3 z-40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={handleCancel} className="p-2 hover:bg-[#f5f6f7] dark:hover:bg-[#3d4a51] rounded-full transition-colors" aria-label="Cancel selection">
            <X size={20} className="text-[#667781] dark:text-[#aebac2]" />
          </button>
          <span className="text-sm font-medium text-[#333333] dark:text-[#e2e8f0]">{selectedCount} selected</span>
        </div>

        <button onClick={handleDeleteClick} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      <Modal isOpen={showDeleteModal} onClose={handleCancelDelete} title="Delete messages" maxWidth="max-w-sm">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleDeleteForEveryone}
            disabled={!canDeleteForEveryone || deleting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              canDeleteForEveryone
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Trash2 size={16} />
            Delete for everyone
          </button>
          
          {!canDeleteForEveryone && (
            <p className="text-xs text-center text-[#667781] dark:text-[#aebac2]">Messages can only be deleted for everyone within 1 hour of sending</p>
          )}

          <button onClick={handleDeleteForMe} disabled={deleting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f5f6f7] dark:bg-[#3d4a51] hover:bg-[#e2e8f0] dark:hover:bg-[#4a5568] text-[#333333] dark:text-[#e2e8f0] rounded-lg text-sm font-medium transition-colors">
            <Trash2 size={16} />
            Delete for me
          </button>

          <button onClick={handleCancelDelete} disabled={deleting} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#667781] dark:text-[#aebac2] hover:bg-[#f5f6f7] dark:hover:bg-[#3d4a51] rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}

export default BottomActionBar;
