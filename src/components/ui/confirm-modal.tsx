import { Pressable } from 'react-native';
import { ReactNode, useState } from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { Dialog } from '@/src/ui/overlays/Dialog';

interface ConfirmModalProps {
  children: ReactNode;
  message?: string;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  tone?: 'default' | 'danger';
}

const ConfirmModal = ({
  children,
  message,
  title,
  onConfirm,
  onCancel,
  tone = 'default',
}: ConfirmModalProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleConfirm = () => {
    setModalVisible(false);
    if (onConfirm) {
      onConfirm();
      showToast({ message: t('confirmed'), type: 'success' });
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        {children}
      </Pressable>
      <Dialog
        visible={modalVisible}
        title={title || t('confirmTitle')}
        message={message || t('confirmMessage')}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        closeLabel={t('cancel')}
        tone={tone}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ConfirmModal;
