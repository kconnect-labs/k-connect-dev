import { useRef, useEffect } from 'react';
import { I_LOCK } from '../../../../System/UI/IconPack';
import { PreloadMessages } from '../../../../System/UI/Preload';
import HandleMessage from './HandleMessage';
import { AnimatePresence, motion } from 'framer-motion';
import { useWebSocket } from '../../../../System/Context/WebSocket';
import { useDispatch, useSelector } from 'react-redux';
import { updateChat } from '../../../../Store/Slices/messenger';
import { useAuth } from '../../../../System/Hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface Message {
    id: string | number;
    uid?: number;
    date: number | string;
    text: string;
}

interface ChatViewProps {
    messages: Message[];
    messagesLoaded: boolean;
    loadMoreRef: any;
    showLoadMore: boolean;
    stopSendingFile: (arg?: any) => void;
    messagesScrollRef?: React.RefObject<HTMLDivElement>;
}

const ChatView: React.FC<ChatViewProps> = ({
    messages,
    messagesLoaded,
    loadMoreRef,
    showLoadMore,
    stopSendingFile,
    messagesScrollRef
}) => {
    const { t } = useTranslation();
    const { updateAccount } = useAuth();
    const { wsClient } = useWebSocket();
    const dispatch = useDispatch();
    const selectedChat = useSelector((state: any) => state.messenger.selectedChat)
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedChat) {
            wsClient.send({
                type: 'messenger',
                action: 'view_messages',
                target: {
                    id: selectedChat.id,
                    type: selectedChat.type
                }
            })
            dispatch(updateChat({
                chat_id: selectedChat.id,
                chat_type: selectedChat.type,
                newData: {
                    notifications: 0
                }
            }))
            updateAccount({
                messenger_notificationsDelta: -selectedChat.notifications
            })
        }
    }, [messages.length]);

    const formatDate = (timestamp: number | string): string => {
        const messageDate = new Date(timestamp);
        const now = new Date();

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (messageDate >= today) return 'Сегодня';
        if (messageDate >= yesterday) return 'Вчера';

        return messageDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const sortedMessages = [...messages].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return sortedMessages.reduce((acc: { [key: string]: Message[] }, msg) => {
            const dateLabel = formatDate(msg.date);
            if (!acc[dateLabel]) acc[dateLabel] = [];
            acc[dateLabel].push(msg);
            return acc;
        }, {});
    };

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="Chat-Messages">
            <div className="Chat-MessagesScroll" ref={messagesScrollRef}>
                <div ref={containerRef} className="Chat-MessagesList">
                    {messagesLoaded && (
                        <>
                            {showLoadMore && <span ref={loadMoreRef}></span>}
                            {messages.length > 0 ? (
                                Object.entries(groupedMessages).map(([date, msgs]) => (
                                    <div key={date}>
                                        <div className="Chat-DateSeparator">{date}</div>
                                        <AnimatePresence initial={false}>
                                        {msgs.map((message, i) => {
                                            const isLastOfSequence =
                                                i === msgs.length - 1 || msgs[i + 1].uid !== message.uid;
                                            return (
                                                    <motion.div
                                                        key={message.id || i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                <HandleMessage
                                                    message={message}
                                                    stopSendingFile={stopSendingFile}
                                                    hasTail={isLastOfSequence}
                                                />
                                                    </motion.div>
                                            );
                                        })}
                                        </AnimatePresence>
                                    </div>
                                ))
                            ) : (
                                <div className="Chat-NonMessages">
                                    <I_LOCK />
                                    <div>
                                       {t('chat_non_messages')}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {!messagesLoaded && (
                    <motion.div className="Chat-PreloadScroll" exit={{ opacity: 0, filter: 'blur(10px)' }}>
                        <motion.div className="Chat-PreloadList">
                            <PreloadMessages />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatView;
