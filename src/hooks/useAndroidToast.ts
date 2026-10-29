import { useLanguage } from '../lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';

/**
 * Adaptador legacy de los avisos Android sobre el sistema global de toasts.
 */
const useAndroidToast = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const emptyMessage = () => {
    showToast({ message: t('toast.empty'), type: 'warning' });
  };

  const addedMessage = () => {
    showToast({ message: t('toast.added'), type: 'success' });
  };

  const editedMessage = () => {
    showToast({ message: t('toast.edited'), type: 'success' });
  };

  const deletedMessage = () => {
    showToast({ message: t('toast.deleted'), type: 'success' });
  };

  const errorMessage = () => {
    showToast({ message: t('toast.error'), type: 'error' });
  };

  const withMessage = (message: string) => {
    showToast({ message, type: 'info' });
  };

  return {
    addedMessage,
    deletedMessage,
    editedMessage,
    emptyMessage,
    errorMessage,
    withMessage,
  };
};

export default useAndroidToast;
