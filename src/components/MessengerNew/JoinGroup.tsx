import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../Components/Navigate';
import { FormButton } from '../../UIKit';
import { useWebSocket } from '../../System/Context/WebSocket';
import { useModalsStore } from '../../Store/modalsStore';
import { useAuth } from '../../System/Hooks/useAuth';

const JoinGroup = () => {
    const { wsClient } = useWebSocket();
    const { t } = useTranslation();
    const { accountData, isSocketAuthorized } = useAuth();
    const { openModal } = useModalsStore() as any;
    const params = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<any>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isSocketAuthorized) {
            wsClient.send({
                type: 'messenger',
                action: 'load_group',
                link: params?.link,
            }).then((res: any) => {
                if (res.status === 'success') {
                    setGroup(res.group_data);
                } else {
                    openModal({
                        type: 'alert',
                        props: {
                            title: t('error'),
                            message: 'Группа не найдена'
                        }
                    });
                    navigate('/');
                }
            })
        }
    }, [accountData, isSocketAuthorized]);

    const handleConnect = () => [
        setIsLoading(true),
        wsClient.send({
            type: 'messenger',
            action: 'join_group',
            link: params?.link,
        }).then((res: any) => {
            setIsLoading(false);
            if (res.status === 'success') {
                navigate(`/chat/t1i${group.id}`)
            } else {
                openModal({
                    type: 'alert',
                    props: {
                        title: t('error'),
                        message: res.message
                    }
                });
            }
        })
    ]

    const handleClose = () => {
        navigate('/');
    }

    return (
        <>
            <TopBar search={true} />
            <div className="Content">
                <div className="UI-Block UI-ConnectBlock">
                    <div className="UI-Title">{`${t('group_join_title')} «${group.name}»?`}</div>
                    <div className="Buttons">
                        <FormButton
                            title={t('join')}
                            onClick={handleConnect}
                            isLoading={isLoading}
                        />
                        <button onClick={handleClose}>{t('close')}</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default JoinGroup;