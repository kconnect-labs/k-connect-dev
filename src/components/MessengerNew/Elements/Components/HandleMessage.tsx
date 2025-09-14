import {useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../../../System/Context/WebSocket';
import { AnimatePresence, motion } from 'framer-motion';
import { HandleFileIcon, HandleFileSize, HandleText } from '../../../../System/Elements/Handlers';
import { I_CLOCK, I_CLOSE, I_DOWNLOAD } from '../../../../System/UI/IconPack';
import classNames from 'classnames';
import { useAuth } from '../../../../System/Hooks/useAuth';
import { useDatabase } from '../../../../System/Context/Database';
import { useImageView } from '../../../../System/Hooks/useImageView';
import { useSelector } from 'react-redux';
import { createExplosionEffect } from '../../../../System/Elements/ExplosionEffect';
import { ProgressRing } from '../../../../UIKit';

const HandleMessageImage = ({ message, decrypted }) => {
    const { wsClient } = useWebSocket();
    const { openImage } = useImageView();
    const db = useDatabase();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [fileSrc, setFileSrc] = useState<any>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const loadFile = async () => {
        if (message.mid) {
            const file = await db.files.where('mid').equals(message.mid).first();

            if (file) {
                setFileSrc(URL.createObjectURL(file.blob));
                setIsDownloaded(true);
                return true;
            } else {
                return false;
            }
        }
    }

    useEffect(() => {
        if (decrypted?.file?.download_progress === 100) {
            loadFile();
        }
    }, [decrypted.file?.download_progress]);


    useEffect(() => {
        loadFile();
        if (message?.is_uploaded) {
            setIsDownloaded(true);
            setFileSrc(decrypted.file.base64)
        }
    }, [message?.is_uploaded]);

    const download = async () => {
        const file = await loadFile();

        if (!file) {
            // Отправляем запрос на целый файл
            wsClient.send({
                type: 'messenger',
                action: 'download_file',
                mid: message.mid,
                file_map: decrypted.file.file_map,
                file_name: decrypted.file.name,
                file_type: decrypted.file.type
            });
        }
    }

    const handleOpenImage = () => {
        if (fileSrc) {
            openImage({
                file_path: fileSrc,
                metadata: {
                    file_name: decrypted.file.name
                }
            })
        }
    }

    const cancelDownload = () => {
        if (imageRef.current) {
            createExplosionEffect(imageRef.current, 40);
        }
        
        setIsDownloaded(false);
        setFileSrc(null);
    }

    return (
        <div className="Image">
            {
                message.status === 'not_sent' ? (
                    <button className="Loader" onClick={() => {
                        if (message.stopUpload) {
                            message.stopUpload();
                            if (imageRef.current) {
                                createExplosionEffect(imageRef.current, 40);
                            }
                        }
                    }}>
                        <ProgressRing progress={message.upload_progress} />
                        <I_CLOSE />
                    </button>
                ) : (
                    <>
                        <div
                            className={classNames('Bum', { 'BumBum': isDownloaded })}
                        ></div>
                        <AnimatePresence>
                            {
                                !isDownloaded && (
                                    <motion.button
                                        className="Loader"
                                        onClick={download}
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {
                                            decrypted.file?.download_progress ? (
                                                <>
                                                    <ProgressRing progress={decrypted.file.download_progress} />
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cancelDownload();
                                                        }} 
                                                        className="CancelButton"
                                                    >
                                                        <I_CLOSE />
                                                    </div>
                                                </>
                                            ) : (
                                                <I_DOWNLOAD />
                                            )
                                        }
                                    </motion.button>
                                )
                            }
                        </AnimatePresence>
                    </>
                )
            }
            <motion.img
                ref={imageRef}
                className={!isDownloaded ? 'NotLoaded' : ''}
                style={{ width: decrypted?.preview?.width }}
                src={fileSrc ? fileSrc : decrypted.preview.base64}
                onClick={handleOpenImage}
            />
        </div>
    );
}

const HandleMessage = ({ message, stopSendingFile, hasTail }) => {
    const handleMessageContent = (message) => {
        try {
            switch (message.version) {
                case 0:
                    return { text: message.decrypted };
                case 1:
                    return message.decrypted ? message.decrypted : { text: 'Сообщение повреждено', error: true };
            }
        } catch (error) {
            return { text: 'Сообщение повреждено', error: true };
        }
    }

    const { accountData } = useAuth();
    const selectedChat = useSelector((state: any) => state.messenger.selectedChat);
    const messageTime = new Date(message.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const decrypted = message?.is_decrypted ? message.decrypted : handleMessageContent(message);
    const [isNew, setIsNew] = useState(true);
    const fileRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsNew(false);
        }, 500);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={classNames(
            message.uid === accountData.id ? 'Chat-M_Me' : 'Chat-M_URS',
            { 'Chat-M_HasTail': hasTail },
            { 'message-new': isNew }
        )}>
            {
                (selectedChat.type === 1 && message.uid !== accountData.id) && (
                    <div className="Header">
                        <div className="Name">{message?.author?.name}</div>
                    </div>
                )
            }
            <>
                {decrypted?.type === 'file' && (
                    <div className="File" ref={fileRef}>
                        {message.status === 'not_sent' ? (
                            <button 
                                onClick={() => { 
                                    if (fileRef.current) {
                                        createExplosionEffect(fileRef.current, 40);
                                        setTimeout(() => {
                                            stopSendingFile(message.temp_mid);
                                        }, 200);
                                    } else {
                                        stopSendingFile(message.temp_mid);
                                    }
                                }} 
                                className="Loader"
                            >
                                <ProgressRing
                                    progress={message.upload_progress ? message.upload_progress : 1}
                                />
                                <I_CLOSE />
                            </button>
                        ) : (
                            <div className="Icon">
                                <HandleFileIcon fileName={decrypted.file.name} />
                            </div>
                        )}
                        <div className="Metadata">
                            <div className="Name">{decrypted.file.name}</div>
                            <div className="Size">
                                <HandleFileSize bytes={decrypted.file.size} />
                            </div>
                        </div>
                    </div>
                )}
                {decrypted?.type === 'image' && (
                    <HandleMessageImage
                        message={message}
                        decrypted={decrypted}
                    />
                )}
            </>
            <div className="TextAndStatus">
                <div className={classNames('Text', (decrypted?.error && 'ErrorText'))}>
                    <HandleText text={decrypted?.text || ''} />
                </div>
                <div className="Status">
                    <div className="Time">{messageTime}</div>
                    {
                        message.status === 'not_sent' && (
                            <I_CLOCK />
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default HandleMessage;