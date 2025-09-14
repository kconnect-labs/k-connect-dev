import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../System/Hooks/useAuth';
import { I_BACK, I_SMILE } from '../../../../System/UI/IconPack';
import { useNavigate } from 'react-router-dom';
import { Avatar, GovernButtons, SavesAvatar } from '../../../../UIKit';
import { useDispatch, useSelector } from 'react-redux';
import { toggleEmojiSidebar } from '../../../../Store/Slices/messenger';
import { isMobile } from 'react-device-detect';

const HandleUserStatus = ({ status }) => {
    const { t } = useTranslation();
    const [active, setActive] = useState(false);
    const [text, setText] = useState('');

    useEffect(() => {
        switch (status) {
            case 'online':
                setActive(true);
                setText(t('chat_status_online'));
                break;
            case 'offline':
                setActive(false);
                setText(t('chat_status_offline'));
                break;
            default:
                setActive(false);
                setText(t('chat_status_hz'));
        }
    }, [status]);

    return (
        <div className="Chat-Status" style={active ? { color: 'var(--ACCENT_COLOR)' } : {}}>
            {text}
        </div>
    );
};

const TopBar = ({ chatDataLoaded, chatData, openChatMenu }: any) => {
    const { t } = useTranslation();
    const { accountData } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const emojiSidebarOpen = useSelector((state: any) => state.messenger.emojiSidebarOpen);
    const [menuOpen, setMenuOpen] = useState(false);
    const [buttonsIsOpen, setButtonsIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const close = () => {
        navigate('/chat')
    }

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    const handleToggleEmojiSidebar = () => {
        dispatch(toggleEmojiSidebar());
        setMenuOpen(false);
    }
    
    const emojiButtons = [
        {
            icon: <I_SMILE />,
            title: emojiSidebarOpen ? t('close_emoji_sidebar') : t('open_emoji_sidebar'),
            onClick: handleToggleEmojiSidebar
        }
    ];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="Chat-TopBar">
            <div onClick={close} className="Back">
                <I_BACK />
            </div>
            <div className="Chat-TB_Data">
                <div className="Chat-Name" onClick={openChatMenu}>
                    {
                        chatDataLoaded ? (
                            <div className="Text" onClick={openChatMenu}>
                                {
                                    accountData.id === chatData?.user_data?.id ? (
                                        t('chat_fav')
                                    ) : (
                                        chatData?.user_data?.name
                                    )
                                }
                            </div>
                        ) : (
                            <div className="UI-PRELOAD" style={{ width: '100px', height: '15px' }}></div>
                        )
                    }
                </div>
                {
                    chatDataLoaded ? (
                        (accountData.id !== chatData?.user_data?.id && chatData.type === 0) && (
                            <HandleUserStatus status={chatData?.user_data?.status} />
                        )
                    ) : (
                        <div className="Chat-Status">
                            <div className="UI-PRELOAD" style={{ width: '80px', height: '10px' }}></div>
                        </div>
                    )
                }
            </div>

            <div className="TopBar-Actions">
                {!isMobile && (
                    <button className="MenuButton" onClick={() => setButtonsIsOpen(!buttonsIsOpen)}>
                        <I_SMILE />
                    </button>
                )}
                
                <GovernButtons
                    isOpen={buttonsIsOpen}
                    setIsOpen={setButtonsIsOpen}
                    buttons={emojiButtons}
                />

            {
                chatDataLoaded ? (
                    accountData.id === chatData?.user_data?.id ? (
                        <SavesAvatar />
                    ) : (
                        <Avatar
                            avatar={chatData.user_data.avatar}
                            name={chatData.user_data.name}
                            onClick={openChatMenu}
                        />
                    )
                ) : (
                    <div className="Avatar">
                        <div className="UI-PRELOAD"></div>
                    </div>
                )
            }
            </div>
        </div>
    )
}

export default TopBar;