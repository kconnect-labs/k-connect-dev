import { useTranslation } from 'react-i18next';
import { CopyInput } from '../../../../UIKit';
import BaseConfig from '../../../../Configs/Base';
import { useDispatch, useSelector } from 'react-redux';
import { I_RELOAD } from '../../../../System/UI/IconPack';
import { useWebSocket } from '../../../../System/Context/WebSocket';
import { updateSelectedChat } from '../../../../Store/Slices/messenger';

const Invitations = () => {
    const { t } = useTranslation();
    const { wsClient } = useWebSocket();
    const dispatch = useDispatch();
    const selectedChat = useSelector((state: any) => state.messenger.selectedChat)

    const generateGroupLink = () => {
        wsClient.send({
            type: 'messenger',
            action: 'generate_group_link',
            gid: selectedChat.id
        }).then((res) => {
            if (res.status === 'success') {
                dispatch(updateSelectedChat({
                    chat_id: selectedChat.id,
                    chat_type: selectedChat.type,
                    newData: {
                        join_link: res.link
                    }
                }))
            }
        })
    }

    const buttons = selectedChat?.is_owner ? [
        {
            icon: <I_RELOAD />,
            onClick: generateGroupLink
        }
    ] : [];

    return (
        <div className="Invitations">
            <div className="UI-PartitionName">{t('chat_link_info')}</div>
            <CopyInput
                value={`${BaseConfig.domains.client}/join/${selectedChat?.join_link}`}
                buttons={buttons}
            />
        </div>
    )
}

export default Invitations;