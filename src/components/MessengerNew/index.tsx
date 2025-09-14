import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { aesCreateKeyFromWord } from '../../System/Modules/Crypto';
import { useModalsStore } from '../../Store/modalsStore';
import { useWebSocket } from '../../System/Context/WebSocket';
import Chat from './Elements/Chat';
import Chats from './Elements/Chats';
import { isMobile } from 'react-device-detect';
import { motion } from 'framer-motion';
import './Messenger.scss';
import { Window } from '../../System/Elements/Modal';
import { useTranslation } from 'react-i18next';
import { I_UPLOAD_IMAGE } from '../../System/UI/IconPack';
import { FormButton, Textarea, TextInput } from '../../UIKit';
import { useDispatch, useSelector } from 'react-redux';
import { setChat, setChats } from '../../Store/Slices/messenger';
import { useAuth } from '../../System/Hooks/useAuth';

const CreateGroup = () => {
  const { t } = useTranslation();
  const { wsClient } = useWebSocket();
  const { openModal } = useModalsStore() as any;
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
    }
  };

  const createBufferFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const create = async () => {
    setIsLoading(true);

    wsClient.send({
      type: 'messenger',
      action: 'create_group',
      name,
      avatar: avatar ? new Uint8Array(await createBufferFromFile(avatar)) : null,
    }).then((res) => {
      setIsLoading(false);
      if (res.status === 'success') {
        openModal({
          type: 'alert',
          props: {
            title: t('success'),
            message: res.message,
          }
        });
      } else {
        openModal({
          type: 'alert',
          props: {
            title: t('error'),
            message: res.message,
          }
        });
      }
    })
  };

  useEffect(() => {
    if (avatar) {
      const url = URL.createObjectURL(avatar);
      setAvatarUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAvatarUrl(null);
    }
  }, [avatar]);

  return (
    <>
      <div className="Avatar">
        <input
          id="CC-AvatarInput"
          type="file"
          accept="image/*"
          onChange={handleAvatar}
        />
        <label htmlFor="CC-AvatarInput"></label>
        {avatar ? (
          <img src={avatarUrl || ''} />
        ) : (
          <I_UPLOAD_IMAGE />
        )}
      </div>

      <div className="Inputs">
        <TextInput
          placeholder="Введите название"
          value={name}
          type="text"
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <FormButton
        isLoading={isLoading}
        title={t('create')}
        onClick={create}
      />
    </>
  );
};

const Messenger = () => {
  const { t } = useTranslation();
  const { wsClient } = useWebSocket();
  const { openModal } = useModalsStore() as any;
  const { isSocketAuthorized } = useAuth();
  const dispatch = useDispatch();
  const params = useParams();

  const messengerStore = useSelector((state: any) => state.messenger);

  // Ключ-фраза
  const [selectedKeyword, setSelectedKeyword] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Чаты
  const chats = useSelector((state: any) => state.messenger.chatsList || []);
  const [chatsLoaded, setChatsLoaded] = useState(false);

  // Чат
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDataLoaded, setChatDataLoaded] = useState(false);

  // Создание группы
  const [cgOpen, setCgOpen] = useState(false);

  useEffect(() => {
    if (isSocketAuthorized) {
      if (localStorage.getItem('M-Keyword')) {
        wsClient.send({
          type: 'messenger',
          action: 'aes_messages_key',
          key: localStorage.getItem('M-Keyword'),
        }).then((res: any) => {
          handleKeyword(res);
        })
      }
      wsClient.send({
        type: 'messenger',
        action: 'load_chats',
      }).then((res: any) => {
        if (res.chats && res.chats?.length > 0) {
          dispatch(setChats(res.chats));
        }
        setChatsLoaded(true);
      })
    }
  }, [isSocketAuthorized]);

  useEffect(() => {
    console.log('Хранилище обновлено', messengerStore)
  }, [messengerStore])

  const parseSelectedChat = (str) => {
    try {
      const match = str.match(/^t(\d+)i(\d+)$/);
      if (!match) {
        console.warn('Неверный формат строки:', str);
        return null;
      }
      return {
        chat_type: parseInt(match[1], 10),
        chat_id: parseInt(match[2], 10)
      };
    } catch (error) {
      console.error('Ошибка при разборе chat_id:', error);
      return null;
    }
  }

  useEffect(() => {
    if (params.selectedChat && selectedKeyword) {

      const parsed = parseSelectedChat(params.selectedChat);

      if (parsed?.chat_id !== undefined && parsed?.chat_type !== undefined) {

        setChatOpen(true);
        setChatDataLoaded(false);

        wsClient.send({
          type: 'messenger',
          action: 'load_chat',
          target: {
            id: parsed.chat_id,
            type: parsed.chat_type
          }
        }).then((res: any) => {
          if (res.status === 'success') {
            dispatch(setChat(res.chat_data));
            setChatDataLoaded(true);
          } else if (res.status === 'error') {
            dispatch(setChat({
              not_found: true
            }))
          }
        })
      } else {
        setChatOpen(false);
      }
    } else {
      setChatOpen(false);
    }
  }, [params.selectedChat, selectedKeyword]);

  const selectKeyword = () => {
    wsClient.send({
      type: 'messenger',
      action: 'aes_messages_key',
      key: aesCreateKeyFromWord(keyword),
    }).then((res: any) => {
      handleKeyword(res);
    })
  };

  const handleKeyword = async (data) => {
    if (data.status === 'success') {
      setKeyword(data.keyword);
      setSelectedKeyword(true);
      localStorage.setItem('M-Keyword', data.keyword);
    } else {
      openModal({
        type: 'alert',
        props: {
          title: 'Ошибка',
          message: data.content,
        }
      });
    }
  };

  const deleteAll = () => {
    openModal({
      type: 'query',
      props: {
        title: 'Вы уверенны что хотите удалить все свои чаты?',
        message: 'Нажимая «Да» вы безвозвратно удалите все свои чаты, при этом ваши сообщения у других пользователей останутся.',
        onConfirm: () => {
          wsClient.send({
            type: 'messenger',
            action: 'delete_all_chats',
          });
          dispatch(setChats([]))
        }
      }
    });
  };

  const chatAnimations = {
    open: {
      transform: 'translateX(0%)'
    },
    closed: {
      transform: 'translateX(100%)'
    }
  };

  return (
    <>
      <div className="Messenger">
        <Chats
          chatsLoaded={chatsLoaded}
          chats={chats}
          setCgOpen={setCgOpen}
        />
        <motion.div
          className="Chat"
          variants={chatAnimations}
          initial="open"
          animate={
            isMobile 
              ? (!selectedKeyword || chatOpen) ? "open" : "closed" 
              : "open" 
          }
        >
          {(keyword && chatOpen) && (
            <Chat
              chatDataLoaded={chatDataLoaded}
              setChats={setChats}
              keyword={keyword}
            />
          )}
          {!wsClient.isConnected ? (
            <div className="Chat-Error">
              <div className="Chat-Error_message">{t('chat_connect')}</div>
            </div>
          ) : (
            !chatOpen && (
              <div className="Chat-Error">
                {!selectedKeyword ? (
                  <div className="Chat-SelectKeyWord">
                    <div className="Title">
                      {t('chat_keyword')}
                    </div>
                    <Textarea
                      value={keyword}
                      onChange={(e) => {
                        setKeyword(e.target.value);
                      }}
                      placeholder={t('chat_keyword_input')}
                    />
                    <div className="Buttons">
                      <button onClick={selectKeyword} className="UI-FormButton">
                        {t('chat_select_keyword')}
                      </button>
                      <button onClick={deleteAll}>{t('chat_delete_all')}</button>
                    </div>
                  </div>
                ) : (
                  <div className="Chat-Error_message no-chat-selected">
                    {t('chat_not_selected')}
                  </div>
                )}
              </div>
            )
          )}
        </motion.div>
      </div>
      <Window
        title="Создание группы"
        content={<CreateGroup />}
        contentClass="MultiForm"
        style={{ width: 'fit-content' }}
        isOpen={cgOpen}
        setOpen={setCgOpen}
      />
    </>
  );
};

export default Messenger;
