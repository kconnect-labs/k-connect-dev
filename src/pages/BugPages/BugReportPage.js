import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import styles from '../../uikit.module.css';

// Иконки из MUI (оставляем только иконки)
import BugReportIcon from '@mui/icons-material/BugReport';
import SendIcon from '@mui/icons-material/Send';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

const formatDate = dateString => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

const StatusBadge = React.memo(({ status }) => {
  if (!status || status === 'Неизвестно') {
    return (
      <span className={`${styles.chip} ${styles['chip-error']}`}>
        <ErrorIcon style={{ fontSize: 16 }} />
        Открыт
      </span>
    );
  }

  if (status === 'Решено') {
    return (
      <span className={`${styles.chip} ${styles['chip-success']}`}>
        <CheckCircleIcon style={{ fontSize: 16 }} />
        {status}
      </span>
    );
  } else if (status === 'В обработке') {
    return (
      <span className={`${styles.chip} ${styles['chip-primary']}`}>
        <PendingIcon style={{ fontSize: 16 }} />
        {status}
      </span>
    );
  } else if (status === 'Открыт') {
    return (
      <span className={`${styles.chip} ${styles['chip-error']}`}>
        <ErrorIcon style={{ fontSize: 16 }} />
        {status}
      </span>
    );
  }

  return (
    <span className={`${styles.chip} ${styles['chip-error']}`}>
      <PendingIcon style={{ fontSize: 16 }} />
      Открыт
    </span>
  );
});

const BugReportPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [bugs, setBugs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [newBug, setNewBug] = useState({
    subject: '',
    text: '',
    solver_type: 'moderator',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBugs();
  }, []);

  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bugs');
      setBugs(response.data.bugs || []);
    } catch (err) {
      console.error('Error loading bugs:', err);
      setError('Не удалось загрузить баг-репорты');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBugClick = useCallback(async bugId => {
    try {
      const response = await axios.get(`/api/bugs/${bugId}`);
      setSelectedBug(response.data.bug);
    } catch (err) {
      console.error('Error loading bug details:', err);
    }
  }, []);

  const handleInputChange = useCallback(e => {
    const { name, value } = e.target;
    setNewBug(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback(e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      setSubmitLoading(true);
      setError('');

      try {
        const formData = new FormData();
        formData.append('subject', newBug.subject);
        formData.append('text', newBug.text);
        formData.append('solver_type', newBug.solver_type);

        if (imageFile) {
          formData.append('image', imageFile);
        }

        const response = await axios.post('/api/bugs', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setNewBug({
            subject: '',
            text: '',
            solver_type: 'moderator',
          });
          setImageFile(null);
          setImagePreview('');
          loadBugs();
        }
      } catch (err) {
        console.error('Error submitting bug:', err);
        setError(
          err.response?.data?.error || 'Ошибка при отправке баг-репорта'
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [newBug, imageFile, loadBugs]
  );

  const handleCommentSubmit = useCallback(async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `/api/bugs/${selectedBug.id}/comments`,
        {
          comment_text: commentText,
        }
      );

      if (response.data.success) {
        setSelectedBug(prev => ({
          ...prev,
          comments: [...prev.comments, response.data.comment],
        }));
        setCommentText('');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  }, [commentText, selectedBug?.id]);

  const handleToggleLike = useCallback(
    async bugId => {
      if (!isAuthenticated) return;

      try {
        const response = await axios.post(`/api/bugs/${bugId}/reaction`);

        if (response.data.success) {
          setBugs(prev =>
            prev.map(bug => {
              if (bug.id === bugId) {
                return {
                  ...bug,
                  is_liked_by_user: response.data.reaction === 'added',
                  likes_count:
                    response.data.reaction === 'added'
                      ? bug.likes_count + 1
                      : bug.likes_count - 1,
                };
              }
              return bug;
            })
          );

          if (selectedBug && selectedBug.id === bugId) {
            setSelectedBug(prev => ({
              ...prev,
              is_liked_by_user: response.data.reaction === 'added',
              likes_count:
                response.data.reaction === 'added'
                  ? prev.likes_count + 1
                  : prev.likes_count - 1,
            }));
          }
        }
      } catch (err) {
        console.error('Error toggling reaction:', err);
      }
    },
    [isAuthenticated, selectedBug?.id]
  );

  const handleChangeStatus = useCallback(
    async (bugId, newStatus) => {
      if (!isAuthenticated || ![3, 54, 57].includes(user?.id)) return;

      try {
        const response = await axios.post(`/api/bugs/${bugId}/status`, {
          status: newStatus,
        });

        if (response.data.success) {
          setSelectedBug(prev => ({
            ...prev,
            status: response.data.status,
          }));

          setBugs(prev =>
            prev.map(bug => {
              if (bug.id === bugId) {
                return { ...bug, status: response.data.status };
              }
              return bug;
            })
          );
        }
      } catch (err) {
        console.error('Error changing status:', err);
      }
    },
    [isAuthenticated, user?.id]
  );

  const isAdmin = useMemo(
    () => isAuthenticated && user && [3, 54, 57].includes(user.id),
    [isAuthenticated, user]
  );

  // Мемоизированные компоненты для предотвращения ререндеров
  const BugForm = useMemo(
    () => (
      <div 
        className={`${styles.card} ${styles['mb-1']}`}
        style={{
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          marginBottom: '5px',
        }}
      >
        <h2
          className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-5']}`}
        >
          Сообщить о проблеме
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles['mb-5']}>
            <label
              className={styles.block}
              style={{ marginBottom: '8px', fontSize: '14px' }}
            >
              Заголовок
            </label>
            <input
              type='text'
              name='subject'
              className={styles.input}
              required
              value={newBug.subject}
              onChange={handleInputChange}
              maxLength={40}
              placeholder='Краткое описание проблемы'
              style={{
                background: 'var(--theme-background, rgba(0, 0, 0, 0.2))',
                border: '1px solid rgba(66, 66, 66, 0.5)',
                borderRadius: '18px',
              }}
            />
            <small
              className={styles['text-secondary']}
              style={{ fontSize: '12px' }}
            >
              До 40 символов
            </small>
          </div>

          <div className={styles['mb-5']}>
            <label
              className={styles.block}
              style={{ marginBottom: '8px', fontSize: '14px' }}
            >
              Описание
            </label>
            <textarea
              name='text'
              className={`${styles.input} ${styles.textarea}`}
              required
              value={newBug.text}
              onChange={handleInputChange}
              maxLength={700}
              placeholder='Подробное описание проблемы'
              style={{
                background: 'var(--theme-background, rgba(0, 0, 0, 0.2))',
                border: '1px solid rgba(66, 66, 66, 0.5)',
                borderRadius: '18px',
              }}
            />
            <small
              className={styles['text-secondary']}
              style={{ fontSize: '12px' }}
            >
              До 700 символов
            </small>
          </div>

          <div
            className={`${styles.flex} ${styles['gap-4']} ${styles['mb-5']}`}
          >
            <div style={{ flex: 1 }}>
              <label
                className={styles.block}
                style={{ marginBottom: '8px', fontSize: '14px' }}
              >
                Кто может решить проблему
              </label>
              <select
                name='solver_type'
                className={styles.input}
                value={newBug.solver_type}
                onChange={handleInputChange}
                style={{
                  background: 'var(--theme-background, rgba(0, 0, 0, 0.2))',
                  border: '1px solid rgba(66, 66, 66, 0.5)',
                  borderRadius: '18px',
                }}
              >
                <option value='moderator'>Модератор</option>
                <option value='developer'>Разработчик</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label
                className={styles.block}
                style={{ marginBottom: '8px', fontSize: '14px' }}
              >
                Фото
              </label>
              <label
                className={`${styles.btn} ${styles['btn-outline']} ${styles.flex} ${styles['items-center']} ${styles['justify-center']} ${styles['gap-2']}`}
                style={{ 
                  cursor: 'pointer',
                  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '18px',
                }}
              >
                <PhotoCamera style={{ fontSize: 20 }} />
                Загрузить фото
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {imagePreview && (
            <div className={styles['mb-5']}>
              <img
                src={imagePreview}
                alt='Preview'
                className={styles['img-preview']}
                style={{
                  borderRadius: '18px',
                  border: '1px solid rgba(66, 66, 66, 0.5)',
                }}
              />
            </div>
          )}

          {error && (
            <div className={`${styles['mb-5']} ${styles['text-error']}`}>
              {error}
            </div>
          )}

          <button
            type='submit'
            className={`${styles.btn} ${styles['btn-primary']} ${styles.flex} ${styles['items-center']} ${styles['gap-2']}`}
            disabled={submitLoading}
            style={{
              background: '#d0bcff',
              borderRadius: '18px',
              border: 'none',
            }}
          >
            {submitLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              <SendIcon style={{ fontSize: 20 }} />
            )}
            Отправить
          </button>
        </form>
      </div>
    ),
    [
      newBug,
      imagePreview,
      error,
      submitLoading,
      handleSubmit,
      handleInputChange,
      handleImageChange,
    ]
  );

  const BugList = useMemo(
    () => (
      <div>
        {bugs.map((bug, index) => (
          <div
            key={bug.id}
            className={`${styles.card} ${styles.pointer} ${styles['mb-4']}`}
            style={{ 
              marginBottom: '5px',
              background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
              backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            onClick={() => handleBugClick(bug.id)}
          >
            <div
              className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']} ${styles['mb-3']}`}
            >
              <h3
                className={`${styles['text-base']} ${styles['font-bold']}`}
                style={{
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {bug.subject}
              </h3>
              <StatusBadge status={bug.status} />
            </div>

            <p
              className={`${styles['text-secondary']} ${styles['mb-3']}`}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {bug.text}
            </p>

            <div
              className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']}`}
            >
              <div
                className={`${styles.flex} ${styles['items-center']} ${styles['gap-2']}`}
              >
                <span
                  className={styles['text-secondary']}
                  style={{ fontSize: '12px' }}
                >
                  {bug.user_name || 'Гость'} • {formatDate(bug.date)}
                </span>
                <span
                  className={`${styles.chip} ${styles['chip-primary']}`}
                  style={{ fontSize: '10px' }}
                >
                  {bug.solver_type === 'moderator' ? 'Модератор' : 'Разработчик'}
                </span>
              </div>

              <div
                className={`${styles.flex} ${styles['items-center']} ${styles['gap-2']}`}
              >
                <button
                  className={`${styles.btn} ${styles['bg-transparent']}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleToggleLike(bug.id);
                  }}
                  disabled={!isAuthenticated}
                  style={{
                    color: bug.is_liked_by_user ? '#d0bcff' : 'inherit',
                    padding: '4px',
                  }}
                >
                  {bug.is_liked_by_user ? (
                    <ThumbUpIcon style={{ fontSize: 20 }} />
                  ) : (
                    <ThumbUpOutlinedIcon style={{ fontSize: 20 }} />
                  )}
                </button>
                <span style={{ fontSize: '14px' }}>{bug.likes_count || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    [bugs, handleBugClick, handleToggleLike, isAuthenticated]
  );

  // Список баг-репортов
  if (!selectedBug) {
    return (
      <div style={{ maxWidth: '800px', marginRight: 'auto', paddingTop: '17px'}}>
        <div 
          className={`${styles.card} ${styles['mb-1']}`}
          style={{
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            marginBottom: '5px',
          }}
        >
          <div
            className={`${styles.flex} ${styles['items-center']} ${styles['gap-4']}`}
          >
            <BugReportIcon style={{ fontSize: 48, color: '#f44336' }} />
            <div>
              <h1
                className={`${styles['text-lg']} ${styles['font-bold']} ${styles['mb-2']}`}
                style={{ margin: '0 0 8px 0' }}
              >
                Баг-репорты
              </h1>
              <p className={styles['text-secondary']} style={{ margin: 0 }}>
                Сообщите о найденных ошибках и проблемах на сайте
              </p>
            </div>
          </div>
        </div>

        {BugForm}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
          </div>
        ) : bugs.length === 0 ? (
          <div
            className={`${styles['text-center']} ${styles['text-secondary']}`}
            style={{ padding: '48px 0' }}
          >
            Баг-репортов пока нет
          </div>
        ) : (
          BugList
        )}
      </div>
    );
  }

  // Детальный вид баг-репорта
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <button
        className={`${styles.btn} ${styles['btn-outline']} ${styles['mb-1']}`}
        onClick={() => setSelectedBug(null)}
        style={{
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '18px',
          marginBottom: '5px',
        }}
      >
        ← Назад к списку
      </button>

      <div 
        className={`${styles.card} ${styles['mb-1']}`}
        style={{
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          marginBottom: '5px',
        }}
      >
        <div
          className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']} ${styles['mb-5']}`}
        >
          <h1
            className={`${styles['text-lg']} ${styles['font-bold']}`}
            style={{ margin: 0 }}
          >
            {selectedBug.subject}
          </h1>
          <StatusBadge status={selectedBug.status} />
        </div>

        <p className={`${styles['mb-5']}`} style={{ lineHeight: '1.6' }}>
          {selectedBug.text}
        </p>

        {selectedBug.image_url && (
          <div className={styles['mb-5']}>
            <img
              src={`https://${window.location.hostname}${selectedBug.image_url}`}
              alt='Bug report'
              className={styles['img-detail']}
              onClick={() =>
                window.open(
                  `https://${window.location.hostname}${selectedBug.image_url}`,
                  '_blank'
                )
              }
              style={{
                borderRadius: '18px',
                border: '1px solid rgba(66, 66, 66, 0.5)',
              }}
            />
          </div>
        )}

        <div
          className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']}`}
        >
          <div>
            <div
              className={`${styles.flex} ${styles['items-center']} ${styles['mb-2']}`}
            >
              <img
                src={selectedBug.user_avatar}
                alt={selectedBug.user_name || 'Гость'}
                className={`${styles.avatar} ${styles['avatar-small']} ${styles['mr-2']}`}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className={`${styles.avatar} ${styles['avatar-small']} ${styles['mr-2']} ${styles.flex} ${styles['items-center']} ${styles['justify-center']}`}
                style={{
                  background: '#d0bcff',
                  color: 'white',
                  fontSize: '12px',
                  display: 'none',
                }}
              >
                {selectedBug.user_name ? selectedBug.user_name[0] : 'G'}
              </div>
              <span style={{ fontSize: '14px' }}>
                {selectedBug.user_name || 'Гость'}
              </span>
            </div>
            <span
              className={styles['text-secondary']}
              style={{ fontSize: '12px' }}
            >
              {formatDate(selectedBug.date)}
            </span>
          </div>

          <div
            className={`${styles.flex} ${styles['items-center']} ${styles['gap-2']}`}
          >
            <button
              className={`${styles.btn} ${styles['bg-transparent']}`}
              onClick={() => handleToggleLike(selectedBug.id)}
              disabled={!isAuthenticated}
              style={{
                color: selectedBug.is_liked_by_user ? '#d0bcff' : 'inherit',
                padding: '4px',
              }}
            >
              {selectedBug.is_liked_by_user ? (
                <ThumbUpIcon style={{ fontSize: 20 }} />
              ) : (
                <ThumbUpOutlinedIcon style={{ fontSize: 20 }} />
              )}
            </button>
            <span style={{ fontSize: '14px' }}>
              {selectedBug.likes_count || 0}
            </span>
          </div>
        </div>

        {isAdmin && (
          <>
            <div className={styles.divider}></div>
            <div className={`${styles.flex} ${styles['gap-2']}`}>
              <button
                className={`${styles.btn} ${styles['btn-small']} ${styles['btn-outline']}`}
                style={{ 
                  color: '#4caf50', 
                  borderColor: '#4caf50',
                  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                  borderRadius: '16px',
                }}
                onClick={() => handleChangeStatus(selectedBug.id, 'Решено')}
              >
                Решено
              </button>
              <button
                className={`${styles.btn} ${styles['btn-small']} ${styles['btn-outline']}`}
                style={{ 
                  color: '#2196f3', 
                  borderColor: '#2196f3',
                  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                  borderRadius: '16px',
                }}
                onClick={() =>
                  handleChangeStatus(selectedBug.id, 'В обработке')
                }
              >
                В обработке
              </button>
              <button
                className={`${styles.btn} ${styles['btn-small']} ${styles['btn-outline']}`}
                style={{ 
                  color: '#f44336', 
                  borderColor: '#f44336',
                  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                  borderRadius: '16px',
                }}
                onClick={() => handleChangeStatus(selectedBug.id, 'Открыт')}
              >
                Открыт
              </button>
            </div>
          </>
        )}
      </div>

      <h2
        className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-5']}`}
      >
        Комментарии ({selectedBug.comments?.length || 0})
      </h2>

      {/* Список комментариев */}
      {selectedBug.comments?.length > 0 ? (
        <div>
          {selectedBug.comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`${styles['comment-card']} ${styles['mb-3']}`}
              style={{
                marginBottom: '5px',
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <div
                className={`${styles.flex} ${styles['items-start']} ${styles['gap-3']}`}
              >
                <img
                  src={comment.user_avatar}
                  alt={comment.user_name || 'Гость'}
                  className={`${styles.avatar} ${styles['avatar-medium']}`}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  className={`${styles.avatar} ${styles['avatar-medium']} ${styles.flex} ${styles['items-center']} ${styles['justify-center']}`}
                  style={{
                    background: '#d0bcff',
                    color: 'white',
                    fontSize: '14px',
                    display: 'none',
                  }}
                >
                  {comment.user_name ? comment.user_name[0] : 'G'}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    className={`${styles.flex} ${styles['justify-between']} ${styles['mb-2']}`}
                  >
                    <span
                      className={styles['font-medium']}
                      style={{ fontSize: '14px' }}
                    >
                      {comment.user_name || 'Гость'}
                    </span>
                    <span
                      className={styles['text-secondary']}
                      style={{ fontSize: '12px' }}
                    >
                      {formatDate(comment.timestamp)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`${styles['text-center']} ${styles['text-secondary']}`}
          style={{ padding: '24px 0' }}
        >
          Комментариев пока нет
        </div>
      )}

      {/* Форма добавления комментария */}
      <div 
        className={`${styles.card} ${styles['mt-4']}`}
        style={{
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          placeholder='Добавить комментарий...'
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          maxLength={500}
          rows={2}
          style={{
            background: 'var(--theme-background, rgba(0, 0, 0, 0.2))',
            border: '1px solid rgba(66, 66, 66, 0.5)',
            borderRadius: '18px',
          }}
        />
        <div
          className={`${styles.flex} ${styles['justify-end']} ${styles['mt-2']}`}
        >
          <button
            className={`${styles.btn} ${styles['btn-primary']} ${styles.flex} ${styles['items-center']} ${styles['gap-2']}`}
            onClick={handleCommentSubmit}
            disabled={!commentText.trim()}
            style={{
              background: '#d0bcff',
              borderRadius: '18px',
              border: 'none',
            }}
          >
            Отправить
            <SendIcon style={{ fontSize: 20 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BugReportPage;
