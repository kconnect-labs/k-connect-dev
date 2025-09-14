import { useRef } from 'react';
import { PreloadChats } from '../../../System/UI/Preload';
import LottieAnimation from '../../../UIKit/Components/Base/LotteAnimation';
import { I_USERS } from '../../../System/UI/IconPack';
import { useTranslation } from 'react-i18next';
import { NavButton } from '../../../Components/Navigate';
import { useAuth } from '../../../System/Hooks/useAuth';
import { Avatar, NavigatedHeader, SavesAvatar } from '../../../UIKit';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

interface ChatTarget {
    type: number;
    id: number;
}

export interface ChatData {
    target: ChatTarget;
    avatar: string;
    name: string;
    last_message: string;
    last_message_date: string;
    notifications: number;
}

interface HandleChatProps {
    chatData: ChatData;
    selectedChat?: ChatTarget | null;
}

export const HandleChat: React.FC<HandleChatProps> = ({ chatData, selectedChat }) => {
    const { accountData } = useAuth();
    const { t } = useTranslation();

    const isSelected =
        selectedChat &&
        chatData.target.type === selectedChat.type &&
        chatData.target.id === selectedChat.id;

    return (
        <NavButton
            to={`/chat/t${chatData.target.type}i${chatData.target.id}`}
            className={classNames('Chats-User', {
                'Chats-UserSelected': isSelected,
            })}
        >
            {(chatData.target.type === 0 && accountData.id === chatData.target.id) ? (
                <SavesAvatar />
            ) : (
                <Avatar
                    avatar={chatData.avatar}
                    name={chatData.name}
                />
            )}
            <div className="Chats-Data">
                <div className="Chats-Name">
                    {(accountData.id === chatData.target.id && chatData.target.type === 0)
                        ? t('chat_fav')
                        : chatData.name}
                </div>
                <div className="Chats-LastMessage">{chatData.last_message}</div>
            </div>
            {chatData.notifications > 0 && (
                <div className="UI-NCounter">{chatData.notifications}</div>
            )}
        </NavButton>
    );
};

interface ChatsProps {
    chatsLoaded: boolean;
    chats: ChatData[];
    setCgOpen: (open: boolean) => void;
}

const Chats: React.FC<ChatsProps> = ({ chatsLoaded, chats, setCgOpen }) => {
    const { t } = useTranslation();
    const scrollRef = useRef(null);
    const selectedChat = useSelector((state: any) => state.messenger.selectedChat) as ChatTarget | null;
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
    }

    const buttons = [
        {
            icon: <I_USERS />,
            title: t('chat_create_group'),
            onClick: () => {
                setCgOpen(true);
            },
        }
    ];

    return (
        <div className="Chats">
            <NavigatedHeader
                title={t('chats_title')}
                onBack={goHome}
                buttons={buttons}
                scrollRef={scrollRef}
            />
            <div ref={scrollRef} className="UI-ScrollView">
                <div className="Chats-List">
                    {chatsLoaded ? (
                        chats.length > 0 ? (
                            [...chats]
                                .sort((b, a) => new Date(a.last_message_date).getTime() - new Date(b.last_message_date).getTime())
                                .map((chat) => (
                                    <HandleChat
                                        key={`t${chat.target.type}i${chat.target.id}`}
                                        chatData={chat}
                                        selectedChat={selectedChat}
                                    />
                                ))
                        ) : (
                            <div className="UI-ErrorMessage">
                                <LottieAnimation
                                    className="Emoji"
                                    url="/static_sys/Lottie/Sorry.json"
                                />
                                {t('chats_null')}
                            </div>
                        )
                    ) : (
                        <PreloadChats />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chats;
