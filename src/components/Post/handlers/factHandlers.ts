import axios from 'axios';
import { useLanguage } from '../../../context/LanguageContext';
import { DialogState } from '../hooks/usePostState';

export const useFactHandlers = (
  post: any,
  dialogState: DialogState,
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>
) => {
  const { t } = useLanguage();

  const handleFactsClick = () => {
    setDialogState(prev => ({ ...prev, factModal: { ...prev.factModal, open: true } }));
  };

  const handleFactModalClose = () => {
    setDialogState(prev => ({ 
      ...prev, 
      factModal: { 
        ...prev.factModal, 
        open: false, 
        error: null 
      } 
    }));
  };

  const handleFactDelete = async () => {
    try {
      setDialogState(prev => ({ 
        ...prev, 
        factModal: { 
          ...prev.factModal, 
          loading: true, 
          error: null 
        } 
      }));

      // Отвязываем факт от поста
      await axios.delete(`/api/posts/${post.id}/detach-fact`);

      // Перезагружаем страницу для обновления данных
      window.location.reload();
    } catch (error) {
      console.error('Error deleting fact:', error);
      setDialogState(prev => ({
        ...prev,
        factModal: {
          ...prev.factModal,
          loading: false,
          error: error.response?.data?.error || 'Ошибка при удалении факта',
        },
      }));
    }
  };

  return {
    handleFactsClick,
    handleFactModalClose,
    handleFactDelete,
  };
}; 