import { useTranslation } from 'react-i18next';
import { Avatar, BoxButtons, MaterialTabs, NavigatedHeader, SavesAvatar } from '../../../../UIKit';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../../System/Hooks/useAuth';
import { I_USERNAME } from '../../../../System/UI/IconPack';
import Invitations from './Invitations';
import GroupMembers from './GroupMembers';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

const ChatMenu = ({ closeChatMenu }) => {
    const { accountData } = useAuth();
    const { t } = useTranslation();
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const selectedChat = useSelector((state: any) => state.messenger.selectedChat)

    const boxButtons = selectedChat.type === 0 ? [
        {
            icon: <I_USERNAME />,
            title: t('go_to_profile'),
            onClick: () => {
                navigate(`/e/${selectedChat.user_data.username}`)
            }
        }
    ] : [];

    const tabs = selectedChat.type === 1 ? [
        {
            title: t('members'),
            content: <GroupMembers groupID={selectedChat.id} />
        },
        {
            title: t('invitations'),
            content: <Invitations />
        }
    ] : [];

    return (
        <div ref={scrollRef} className="UI-ScrollView">
            <div className="Chat-Menu">
                <NavigatedHeader
                    onBack={closeChatMenu}
                    scrollRef={scrollRef}
                />
                <div className="Header">
                    {
                        accountData.id === selectedChat?.user_data?.id ? (
                            <SavesAvatar />
                        ) : (
                            <Avatar
                                avatar={selectedChat.user_data.avatar}
                                name={selectedChat.user_data.name}
                            />
                        )
                    }
                    <div className="Name">
                        {
                            accountData.id === selectedChat?.user_data?.id ? (
                                t('chat_fav')
                            ) : (
                                selectedChat?.user_data?.name
                            )
                        }
                    </div>
                    <BoxButtons
                        buttons={boxButtons}
                    />
                </div>
                <MaterialTabs
                    tabs={tabs}
                />
            </div>
        </div>
    )
}

export default ChatMenu;