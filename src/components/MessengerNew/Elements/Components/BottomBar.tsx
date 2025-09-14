import { useState, useRef, useEffect } from 'react';
import { useModalsStore } from '../../../../Store/modalsStore';
import { useMessengerEvent } from '../../../../System/Context/WebSocket';
import { I_PLUS, I_SEND, I_SMILE, I_CLOSE } from '../../../../System/UI/IconPack';
import { HandleFileIcon, HandleFileSize } from '../../../../System/Elements/Handlers';
import { useWebSocket } from '../../../../System/Context/WebSocket';
import { useTranslation } from 'react-i18next';
import { SocialInput, EmojiPicker } from '../../../../UIKit';
import { useAuth } from '../../../../System/Hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, updateChat, updateMessage } from '../../../../Store/Slices/messenger';
import { DragDropArea } from '../../../../System/Elements/DragDropArea';
import { createExplosionEffect } from '../../../../System/Elements/ExplosionEffect';

interface FileWithTemp {
    temp_mid: number;
    file: File;
}

const BottomBar = ({ createTempMesID, selectedChat, messageInputRef, setActionPanelOpen, actionPanelOpen }) => {
    const { t } = useTranslation();
    const { wsClient } = useWebSocket();
    const { openModal } = useModalsStore() as any;
    const { accountData } = useAuth();
    const dispatch = useDispatch();
    const [messageValue, setMessageValue] = useState('');
    const [epIsOpen, setEpIsOpen] = useState(false);
    const emojiSidebarOpen = useSelector((state: any) => state.messenger.emojiSidebarOpen);

    // Файловый инпут
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadFiles, setUploadFiles] = useState<FileWithTemp[]>([]);
    const fileRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const fileURLs = useRef<Map<number, string>>(new Map());
    const uploadControllers = useRef<Map<number, AbortController>>(new Map());
    
    // Отправка файла



    // Отправка целого файла
    const sendFile = ({ temp_mid, file }) => {
        const controller = new AbortController();
        uploadControllers.current.set(temp_mid, controller);

        // Показываем прогресс загрузки
        dispatch(updateMessage({
            temp_mid: temp_mid,
            newData: {
                upload_progress: 10
            }
        }));

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target && event.target.result) {
                // Показываем прогресс чтения
                dispatch(updateMessage({
                    temp_mid: temp_mid,
                    newData: {
                        upload_progress: 50
                    }
                }));

                wsClient.send({
                    type: 'messenger',
                    action: 'upload_file',
                    temp_mid: temp_mid,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    binary: new Uint8Array(event.target.result as ArrayBuffer)
                }).then(() => {
                    // Показываем прогресс отправки
                    dispatch(updateMessage({
                        temp_mid: temp_mid,
                        newData: {
                            upload_progress: 90
                        }
                    }));
                    uploadControllers.current.delete(temp_mid);
                    console.log('Файл отправлен');
                }).catch((error) => {
                    console.error('Ошибка при отправке файла:', error);
                    uploadControllers.current.delete(temp_mid);
                    dispatch(updateMessage({
                        temp_mid: temp_mid,
                        newData: {
                            status: 'error',
                            upload_progress: 0
                        }
                    }));
                    setUploadFiles(prevFiles => prevFiles.filter(file => file.temp_mid !== temp_mid));
                });
            }
        };
        
        reader.onerror = () => {
            console.error('Ошибка при чтении файла');
            uploadControllers.current.delete(temp_mid);
            dispatch(updateMessage({
                temp_mid: temp_mid,
                newData: {
                    status: 'error',
                    upload_progress: 0
                }
            }));
            setUploadFiles(prevFiles => prevFiles.filter(file => file.temp_mid !== temp_mid));
        };

        reader.readAsArrayBuffer(file);

        const cancelSend = () => {
            controller.abort();
            uploadControllers.current.delete(temp_mid);
        };

        return cancelSend;
    }


    const handleFileInputChange = (e) => {
        if (e.target.files) {
            setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)] as File[]);
            setActionPanelOpen(false);
        }
    };

    const handleFilesDrop = (droppedFiles) => {
        setFiles(prevFiles => [...prevFiles, ...Array.from(droppedFiles)] as File[]);
        setActionPanelOpen(false);
    };
    
    const handleRemoveFile = (index: number) => {
        const fileRef = fileRefs.current.get(index);
        
        const fileURL = fileURLs.current.get(index);
        if (fileURL) {
            URL.revokeObjectURL(fileURL);
            fileURLs.current.delete(index);
        }
        
        if (fileRef) {
            createExplosionEffect(fileRef);
            
            setTimeout(() => {
                setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
            }, 100);
        } else {
            setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        }
    };


    const sendMessage = async () => {
        if (files.length > 0 || messageValue.trim() !== '') {
            if (files.length > 0) {

                const temp_mid = createTempMesID(10);
                
                wsClient.send({
                    type: 'messenger',
                    action: 'send_message',
                    temp_mid: temp_mid,
                    target: {
                        id: selectedChat.id,
                        type: selectedChat.type
                    },
                    message: messageValue,
                    files: [
                        {
                            name: files[0].name,
                            type: files[0].type,
                            size: files[0].size,
                        }
                    ]
                });

                const newFile = {
                    temp_mid: temp_mid,
                    file: files[0]
                }

                setUploadFiles(prevFiles => [...prevFiles, newFile]);
                
                // Создаем сообщение и добавляем его в чат
                const fileType = files[0].type.startsWith('image/') ? 'image' : 'file';
                let newMessage: any = {
                    uid: accountData.id,
                    temp_mid: temp_mid,
                    status: 'not_sent',
                    is_decrypted: true,
                    is_uploaded: true,
                    decrypted: {
                        text: messageValue,
                        type: fileType
                    },
                    date: new Date().toISOString()
                }
                
                if (fileType === 'image') {
                    const base64 = await fileToB64(files[0]);
                    newMessage.decrypted.preview = { base64: base64 };
                    newMessage.decrypted.file = { base64: base64 };
                } else {
                    newMessage.decrypted.file = {
                        name: files[0].name,
                        type: files[0].type,
                        size: files[0].size
                    }
                }
                
                dispatch(addMessage({
                    chat_id: selectedChat.id,
                    chat_type: selectedChat.type,
                    message: newMessage
                }));
                
                // Для остальных файлов отправляем отдельные сообщения без текста
                for (let i = 1; i < files.length; i++) {
                    const file_temp_mid = createTempMesID(10);
                    
                    wsClient.send({
                        type: 'messenger',
                        action: 'send_message',
                        temp_mid: file_temp_mid,
                        target: {
                            id: selectedChat.id,
                            type: selectedChat.type
                        },
                        message: '',
                        files: [
                            {
                                name: files[i].name,
                                type: files[i].type,
                                size: files[i].size,
                            }
                        ]
                    });
                    
                    const fileNewFile = {
                        temp_mid: file_temp_mid,
                        file: files[i]
                    }
                    
                    setUploadFiles(prevFiles => [...prevFiles, fileNewFile]);
                    
                    // Создаем сообщение и добавляем его в чат
                    const fileType = files[i].type.startsWith('image/') ? 'image' : 'file';
                    let fileMessage: any = {
                        uid: accountData.id,
                        temp_mid: file_temp_mid,
                        status: 'not_sent',
                        is_decrypted: true,
                        is_uploaded: true,
                        decrypted: {
                            text: '',
                            type: fileType
                        },
                        date: new Date().toISOString()
                    }
                    
                    if (fileType === 'image') {
                        const base64 = await fileToB64(files[i]);
                        fileMessage.decrypted.preview = { base64: base64 };
                        fileMessage.decrypted.file = { base64: base64 };
                    } else {
                        fileMessage.decrypted.file = {
                            name: files[i].name,
                            type: files[i].type,
                            size: files[i].size
                        }
                    }
                    
                    dispatch(addMessage({
                        chat_id: selectedChat.id,
                        chat_type: selectedChat.type,
                        message: fileMessage
                    }));
                }
            } else {
                // Если нет файлов, отправляем обычное текстовое сообщение
                const temp_mid = createTempMesID(10);
                
                wsClient.send({
                    type: 'messenger',
                    action: 'send_message',
                    temp_mid: temp_mid,
                    target: {
                        id: selectedChat.id,
                        type: selectedChat.type
                    },
                    message: messageValue
                });
                
                let newMessage: any = {
                    uid: accountData.id,
                    temp_mid: temp_mid,
                    status: 'not_sent',
                    is_decrypted: true,
                    is_uploaded: true,
                    decrypted: {
                        text: messageValue,
                        type: 'text'
                    },
                    date: new Date().toISOString()
                }
                
                dispatch(addMessage({
                    chat_id: selectedChat.id,
                    chat_type: selectedChat.type,
                    message: newMessage
                }));
            }
            setMessageValue('');
               setFiles([]);
            
            // Очищаем все URL объекты после отправки
            fileURLs.current.forEach(url => {
                URL.revokeObjectURL(url);
            });
            fileURLs.current.clear();
            
            dispatch(updateChat({
                chat_id: selectedChat.id,
                chat_type: selectedChat.type,
                newData: {
                    last_message: messageValue || (files.length > 0 ? files[0].name : ''),
                    last_message_date: new Date().toISOString()
                }
            }));
            
            // Очищаем ввод и файлы
            setMessageValue('');
            
            // Очищаем все URL объекты после отправки
            fileURLs.current.forEach(url => {
                URL.revokeObjectURL(url);
            });
            fileURLs.current.clear();
            
            setFiles([]);
        }
    }

    const handleSendMessage = (data) => {
        // Если нет статуса, это может быть ответ на upload_file
        if (!data.status && data.action === 'upload_file') {
            return;
        }
        
        switch (data.status) {
            case 'awaiting_file':
                const currentFile = uploadFiles.find(file => file.temp_mid === data.temp_mid);

                if (currentFile) {
                    sendFile({
                        temp_mid: Number(data.temp_mid),
                        file: currentFile.file
                    });

                    dispatch(updateMessage({
                        temp_mid: Number(data.temp_mid),
                        chat_id: selectedChat.id,
                        chat_type: selectedChat.type,
                        newData: {
                            upload_progress: 0
                        }
                    }));
                }
                break;

            case 'sended':
                // Очищаем контроллер при успешной отправке
                uploadControllers.current.delete(Number(data.temp_mid));
                setUploadFiles(prevFiles => prevFiles.filter(file => file.temp_mid !== data.temp_mid));
                
                dispatch(updateMessage({
                    temp_mid: Number(data.temp_mid),
                    chat_id: selectedChat.id,
                    chat_type: selectedChat.type,
                    newData: {
                        mid: data.mid,
                        status: 'sended'
                    }
                }));
                break;

            case 'error':
                // Очищаем контроллер при ошибке
                uploadControllers.current.delete(Number(data.temp_mid));
                
                // Удаляем сообщение из состояния при ошибке
                dispatch(updateMessage({
                    temp_mid: Number(data.temp_mid),
                    chat_id: selectedChat.id,
                    chat_type: selectedChat.type,
                    newData: {
                        status: 'error'
                    }
                }));
                
                // Удаляем файл из очереди загрузки
                setUploadFiles(prevFiles => prevFiles.filter(file => file.temp_mid !== data.temp_mid));
                
                openModal({
                    type: 'alert',
                    props: {
                        title: 'Ошибка',
                        message: data.text
                    }
                });
                break
        }
    }

    useMessengerEvent('send_message', handleSendMessage);
    useMessengerEvent('upload_file', handleSendMessage);

    // Простая обработка отключения сокета - просто очищаем контроллеры
    useEffect(() => {
        const handleSocketDisconnect = () => {
            // Очищаем все контроллеры при отключении
            uploadControllers.current.forEach((controller) => {
                controller.abort();
            });
            uploadControllers.current.clear();
        };

        wsClient.on('socket_disconnect', handleSocketDisconnect);

        return () => {
            wsClient.off('socket_disconnect', handleSocketDisconnect);
        };
    }, []);

    useEffect(() => {
        return () => {
            fileURLs.current.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, []);

    const fileToB64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;

            if (file) {
                reader.readAsDataURL(file);
            }
        });
    };

    return (
        <div className="Chat-BottomBar">
            {files.length > 0 && (
                <div className="Chat-SelectedFiles">
                    {files.map((file, i) => {
                        const isImage = file.type.startsWith('image/');
                        let filePreview;
                        
                        if (isImage) {
                            if (!fileURLs.current.has(i)) {
                                const newURL = URL.createObjectURL(file);
                                fileURLs.current.set(i, newURL);
                                filePreview = newURL;
                            } else {
                                filePreview = fileURLs.current.get(i);
                            }
                        }
                        
                        return (
                            <div 
                                key={i} 
                                className={`File ${isImage ? 'ImageFile' : ''}`}
                                ref={el => {
                                    if (el) fileRefs.current.set(i, el);
                                    else fileRefs.current.delete(i);
                                }}
                            >
                                {isImage ? (
                                    <img src={filePreview} alt={file.name} className="ImagePreview" />
                                ) : (
                                    <HandleFileIcon fileName={file.name} />
                                )}
                                <div className="Metadata">
                                    <div className="Name">{file.name}</div>
                                    <div className="Size">
                                        <HandleFileSize bytes={file.size} />
                                    </div>
                                </div>
                                <button 
                                    className="RemoveFile" 
                                    onClick={() => handleRemoveFile(i)}
                                    aria-label="Удалить файл"
                                >
                                    <I_CLOSE />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            <input
                type="file"
                id="M-FileInput"
                ref={fileInputRef}
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
            />

            <DragDropArea
                className="Input"
                onFilesDrop={handleFilesDrop}
                data-text={t('drop_files_here')}
            >
                <button onClick={() => setActionPanelOpen(!actionPanelOpen)}>
                    <I_PLUS style={{}} />
                </button>

                <SocialInput
                    placeholder={t('chat_message_input')}
                    onChange={(e) => {
                        setMessageValue(e.target.value);
                    }}
                    value={messageValue}
                    ref={messageInputRef}
                    onEnter={sendMessage}
                />

                {!emojiSidebarOpen && (
                    <button
                        ref={emojiButtonRef}
                        onClick={() => { setEpIsOpen(true) }}
                        className="EmojiButton"
                    >
                        <I_SMILE />
                    </button>
                )}

                <button
                    onClick={sendMessage}
                    className="Send"
                >
                    <I_SEND />
                </button>
            </DragDropArea>

            {epIsOpen && (
                <EmojiPicker
                    isOpen={epIsOpen}
                    setIsOpen={setEpIsOpen}
                    buttonRef={emojiButtonRef}
                    inputRef={messageInputRef}
                    onEmojiSelect={(emoji: string) => {
                        setMessageValue(prevValue => prevValue + emoji);
                    }}
                    className="UI-EmojiPickerChat"
                />
            )}
        </div>
    )
}

export default BottomBar;