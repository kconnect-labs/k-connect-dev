import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/dateUtils';
import VerificationBadgeComponent from '../VerificationBadge';
import Badge from '../Badge/Badge';
import { useLanguage } from '../../context/LanguageContext';
import ReplyInput from '../ReplyInput/ReplyInput';
import './Comment.css';

// Type declaration for VerificationBadge
const VerificationBadge = VerificationBadgeComponent as React.ComponentType<{
  status: number | string;
  size?: string;
  onClick?: (status: any, title: string, description: string) => void;
}>;

interface User {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
  photo?: string;
  verification?: {
    status: number;
  };
  verification_status?: string | number;
  subscription?: {
    type: string;
  };
  subscription_type?: string;
  achievement?: {
    image_path: string;
    bage: string;
    upgrade?: string;
    color_upgrade?: string;
  };
}

interface CommentData {
  id: number;
  content: string;
  image?: string;
  timestamp: string;
  user_id: number;
  user_liked: boolean;
  likes_count: number;
  replies_count?: number;
  user: User;
  replies?: ReplyData[];
}

interface ReplyData {
  id: number;
  content: string;
  image?: string;
  timestamp: string;
  user_id: number;
  user_liked: boolean;
  likes_count: number;
  parent_reply_id?: number;
  parent_reply?: ReplyData;
  user: User;
}

interface CommentProps {
  comment: CommentData;
  onLike: (commentId: number) => void;
  onLikeReply: (replyId: number) => void;
  onReply: (commentId: number, replyId?: number) => void;
  onDelete: (commentId: number) => void;
  onDeleteReply: (commentId: number, replyId: number) => void;
  currentUserId?: number;
  isAdmin?: boolean;
  onImageClick?: (imageUrl: string) => void;
  onSubmitReply?: (
    commentId: number,
    content: string,
    image?: File,
    parentReplyId?: number
  ) => void;
  isSubmittingReply?: boolean;
  currentUser?: any;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  onLike,
  onLikeReply,
  onReply,
  onDelete,
  onDeleteReply,
  currentUserId,
  isAdmin,
  onImageClick,
  onSubmitReply,
  isSubmittingReply = false,
  currentUser,
}) => {
  const { t } = useLanguage();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    name: string;
    id?: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === comment.user_id || isAdmin;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const visibleReplies = hasReplies ? comment.replies!.slice(0, 2) : [];
  const hiddenRepliesCount = hasReplies
    ? Math.max(0, comment.replies!.length - 2)
    : 0;

  const handleLike = () => {
    onLike(comment.id);
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
    setReplyingTo({ name: comment.user.name });
    onReply(comment.id);
  };

  const handleReplyToReply = (reply: ReplyData) => {
    setShowReplyForm(true);
    setReplyingTo({ name: reply.user.name, id: reply.id });
    onReply(comment.id, reply.id);
  };

  const handleSubmitReply = (
    content: string,
    image?: File,
    parentReplyId?: number
  ) => {
    if (onSubmitReply) {
      onSubmitReply(comment.id, content, image, parentReplyId);
      setShowReplyForm(false);
      setReplyingTo(null);
    }
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  const handleDelete = () => {
    onDelete(comment.id);
    setShowMenu(false);
  };

  const handleImageClick = (imageUrl: string) => {
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  const getAvatarUrl = (user: User) => {
    if (user.avatar_url) return user.avatar_url;
    if (user.photo && user.photo !== 'avatar.png') {
      return `https://s3.k-connect.ru/static/uploads/avatar/${user.id}/${user.photo}`;
    }
    return 'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
  };

  const sanitizeImagePath = (imagePath: string) => {
    if (!imagePath) return null;
    if (
      imagePath.includes('/static/uploads/') &&
      imagePath.indexOf('/static/uploads/') !==
        imagePath.lastIndexOf('/static/uploads/')
    ) {
      return imagePath.substring(imagePath.lastIndexOf('/static/uploads/'));
    }
    return imagePath;
  };

  return (
    <div className='comment'>
      <div className='comment-header'>
        <Link
          to={`/profile/${comment.user.username}`}
          className='comment-avatar-link'
        >
          <img
            src={getAvatarUrl(comment.user)}
            alt={comment.user.name}
            className='comment-avatar'
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
            }}
          />
        </Link>

        <div className='comment-content'>
          <div className='comment-user-info'>
            <Link
              to={`/profile/${comment.user.username}`}
              className='comment-user-name'
            >
              {comment.user.name}
              {((comment.user.verification?.status &&
                comment.user.verification.status > 0) ||
                comment.user.verification_status === 'verified' ||
                (typeof comment.user.verification_status === 'number' &&
                  comment.user.verification_status > 0)) && (
                <VerificationBadge
                  status={Number(
                    comment.user.verification?.status ||
                      comment.user.verification_status ||
                      0
                  )}
                  size='small'
                />
              )}
              {comment.user.achievement && (
                <Badge
                  achievement={{
                    ...comment.user.achievement,
                    upgrade: comment.user.achievement.upgrade || '0',
                    color_upgrade:
                      comment.user.achievement.color_upgrade || '#FFD700',
                  }}
                  size='small'
                  className='comment-achievement'
                  onError={() => {}}
                  showTooltip={false}
                  tooltipText=''
                  onClick={() => {}}
                />
              )}
            </Link>
            <span className='comment-time'>
              {formatTimeAgo(comment.timestamp)}
            </span>
          </div>

          <div className='comment-text'>{comment.content}</div>

          {comment.image && (
            <div className='comment-image-container'>
              <img
                src={sanitizeImagePath(comment.image) || comment.image}
                alt='Comment'
                className='comment-image'
                onClick={() => handleImageClick(comment.image!)}
              />
            </div>
          )}

          <div className='comment-actions'>
            <button
              className={`comment-action ${comment.user_liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <svg className='comment-action-icon' viewBox='0 0 24 24'>
                <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
              </svg>
              <span>{comment.likes_count}</span>
            </button>

            <button className='comment-action' onClick={handleReply}>
              <svg
                className='comment-action-icon reply-icon'
                viewBox='0 0 24 24'
              >
                <path d='M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z' />
              </svg>
              <span>{t('comment.menu.reply')}</span>
            </button>

            {isOwner && (
              <div className='comment-menu' ref={menuRef}>
                <button
                  className='comment-menu-trigger'
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <svg viewBox='0 0 24 24'>
                    <path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
                  </svg>
                </button>

                {showMenu && (
                  <div className='comment-menu-dropdown'>
                    <button
                      className='comment-menu-item delete'
                      onClick={handleDelete}
                    >
                      <svg viewBox='0 0 24 24'>
                        <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
                      </svg>
                      {t('comment.menu.delete')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className='comment-replies'>
          {/* Always show first 2 replies */}
          <div className='comment-replies-list'>
            {visibleReplies.map(reply => (
              <Reply
                key={reply.id}
                reply={reply}
                onLike={onLikeReply}
                onDelete={replyId => onDeleteReply(comment.id, replyId)}
                onReply={handleReplyToReply}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onImageClick={onImageClick}
              />
            ))}
          </div>

          {/* Show additional replies when expanded */}
          {showReplies && hiddenRepliesCount > 0 && (
            <div className='comment-replies-list additional-replies'>
              {comment.replies!.slice(2).map(reply => (
                <Reply
                  key={reply.id}
                  reply={reply}
                  onLike={onLikeReply}
                  onDelete={replyId => onDeleteReply(comment.id, replyId)}
                  onReply={handleReplyToReply}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onImageClick={onImageClick}
                />
              ))}
            </div>
          )}

          {/* Show toggle button at bottom center if more than 2 replies */}
          {comment.replies!.length > 2 && (
            <div className='comment-replies-toggle-container'>
              <button
                className='comment-replies-toggle'
                onClick={() => setShowReplies(!showReplies)}
              >
                <svg
                  className={`comment-replies-icon ${showReplies ? 'expanded' : ''}`}
                  viewBox='0 0 24 24'
                >
                  <path d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z' />
                </svg>
                {showReplies
                  ? 'Скрыть'
                  : `Показать ${hiddenRepliesCount} ответов`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reply Input */}
      {showReplyForm && currentUser && (
        <ReplyInput
          user={currentUser}
          onSubmit={handleSubmitReply}
          onCancel={handleCancelReply}
          disabled={isSubmittingReply}
          isSubmitting={isSubmittingReply}
          replyingTo={replyingTo || undefined}
          maxLength={1000}
        />
      )}
    </div>
  );
};

interface ReplyProps {
  reply: ReplyData;
  onLike: (replyId: number) => void;
  onDelete: (replyId: number) => void;
  onReply?: (reply: ReplyData) => void;
  currentUserId?: number;
  isAdmin?: boolean;
  onImageClick?: (imageUrl: string) => void;
}

const Reply: React.FC<ReplyProps> = ({
  reply,
  onLike,
  onDelete,
  onReply,
  currentUserId,
  isAdmin,
  onImageClick,
}) => {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === reply.user_id || isAdmin;

  const handleLike = () => {
    onLike(reply.id);
  };

  const handleDelete = () => {
    onDelete(reply.id);
    setShowMenu(false);
  };

  const handleImageClick = (imageUrl: string) => {
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  const getAvatarUrl = (user: User) => {
    if (user.avatar_url) return user.avatar_url;
    if (user.photo && user.photo !== 'avatar.png') {
      return `https://s3.k-connect.ru/static/uploads/avatar/${user.id}/${user.photo}`;
    }
    return 'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
  };

  const sanitizeImagePath = (imagePath: string) => {
    if (!imagePath) return null;
    if (
      imagePath.includes('/static/uploads/') &&
      imagePath.indexOf('/static/uploads/') !==
        imagePath.lastIndexOf('/static/uploads/')
    ) {
      return imagePath.substring(imagePath.lastIndexOf('/static/uploads/'));
    }
    return imagePath;
  };

  return (
    <div className='reply'>
      <div className='reply-header'>
        <Link
          to={`/profile/${reply.user.username}`}
          className='reply-avatar-link'
        >
          <img
            src={getAvatarUrl(reply.user)}
            alt={reply.user.name}
            className='reply-avatar'
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
            }}
          />
        </Link>

        <div className='reply-content'>
          <div className='reply-user-info'>
            <Link
              to={`/profile/${reply.user.username}`}
              className='reply-user-name'
            >
              {reply.user.name}
              {((reply.user.verification?.status &&
                reply.user.verification.status > 0) ||
                reply.user.verification_status === 'verified' ||
                (typeof reply.user.verification_status === 'number' &&
                  reply.user.verification_status > 0) ||
                (typeof reply.user.verification === 'number' &&
                  reply.user.verification > 0)) && (
                <VerificationBadge
                  status={Number(
                    reply.user.verification?.status ||
                      reply.user.verification_status ||
                      reply.user.verification ||
                      0
                  )}
                  size='small'
                />
              )}
            </Link>
            {reply.parent_reply && (
              <div className='reply-to-indicator'>
                <svg viewBox='0 0 24 24' className='reply-to-icon'>
                  <path d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z' />
                </svg>
                <span className='reply-to-text'>
                  ответ для {reply.parent_reply.user.name}
                </span>
              </div>
            )}
            <span className='reply-time'>{formatTimeAgo(reply.timestamp)}</span>
          </div>

          {reply.parent_reply && (
            <div className='reply-parent-message'>
              <div className='reply-parent-content'>
                <span className='reply-parent-text'>
                  {reply.parent_reply.content}
                </span>
              </div>
            </div>
          )}

          <div className='reply-text'>{reply.content}</div>

          {reply.image && (
            <div className='reply-image-container'>
              <img
                src={sanitizeImagePath(reply.image) || reply.image}
                alt='Reply'
                className='reply-image'
                onClick={() => handleImageClick(reply.image!)}
              />
            </div>
          )}

          <div className='reply-actions'>
            <button
              className={`reply-action ${reply.user_liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <svg className='reply-action-icon' viewBox='0 0 24 24'>
                <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
              </svg>
              <span>{reply.likes_count}</span>
            </button>

            {onReply && (
              <button className='reply-action' onClick={() => onReply(reply)}>
                <svg
                  className='reply-action-icon reply-icon'
                  viewBox='0 0 24 24'
                >
                  <path d='M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z' />
                </svg>
                <span>{t('comment.menu.reply')}</span>
              </button>
            )}

            {isOwner && (
              <div className='reply-menu' ref={menuRef}>
                <button
                  className='reply-menu-trigger'
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <svg viewBox='0 0 24 24'>
                    <path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
                  </svg>
                </button>

                {showMenu && (
                  <div className='reply-menu-dropdown'>
                    <button
                      className='reply-menu-item delete'
                      onClick={handleDelete}
                    >
                      <svg viewBox='0 0 24 24'>
                        <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
                      </svg>
                      {t('comment.menu.delete')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
