import axios from 'axios';
import { useLanguage } from '../../../context/LanguageContext';
import { DialogState } from '../hooks/usePostState';
import { getReportReasons } from '../constants/postConstants';

export const useReportHandlers = (
  post: any,
  dialogState: DialogState,
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>
) => {
  const { t } = useLanguage();

  const reportReasons = getReportReasons(t);

  const handleReportClick = () => {
    setDialogState(prev => ({ 
      ...prev, 
      reportDialog: { 
        ...prev.reportDialog, 
        open: true,
        reason: '',
        customReason: '',
        error: null
      } 
    }));
  };

  const handleReportSubmit = async () => {
    try {
      setDialogState(prev => ({ 
        ...prev, 
        reportDialog: { 
          ...prev.reportDialog, 
          submitting: true, 
          error: null 
        } 
      }));

      const reportData = {
        reason: dialogState.reportDialog.reason,
        custom_reason: dialogState.reportDialog.customReason,
      };

      const response = await axios.post(`/api/posts/${post.id}/report`, reportData);

      if (response.data.success) {
        setDialogState(prev => ({
          ...prev,
          reportDialog: {
            ...prev.reportDialog,
            submitted: true,
            submitting: false,
          },
        }));
      } else {
        throw new Error(response.data.error || 'Ошибка при отправке жалобы');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setDialogState(prev => ({
        ...prev,
        reportDialog: {
          ...prev.reportDialog,
          submitting: false,
          error: error.response?.data?.error || error.message || 'Ошибка при отправке жалобы',
        },
      }));
    }
  };

  return {
    reportReasons,
    handleReportClick,
    handleReportSubmit,
  };
}; 