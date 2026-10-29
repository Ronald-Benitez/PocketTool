import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { ReactNode, useState } from 'react';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import ModalButton from './modal-button';

interface ConfirmModalProps {
  children: ReactNode;
  message?: string;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmModal = ({ children, message, title, onConfirm, onCancel }: ConfirmModalProps) => {
  const { showToast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();
  const { colors } = useTheme();

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
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <Pressable
          onPress={handleCancel}
          style={[localStyles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <Pressable onPress={() => { }} style={localStyles.modalInner}>
            <View style={[localStyles.modalContainer, { backgroundColor: colors.surface }]}>
              <View style={[localStyles.modalHeader, { backgroundColor: colors.modalHeaderBg }]}>
                <Text style={[localStyles.modalHeaderText, { color: colors.modalHeaderText }]}>
                  {title || t('confirmTitle')}
                </Text>
              </View>
              <View style={localStyles.modalContent}>
                <Text style={[localStyles.modalMessage, { color: colors.text }]}>
                  {message || t('confirmMessage')}
                </Text>
              </View>
              <View style={localStyles.modalFooter}>
                <ModalButton onClick={handleCancel} text={t('cancel')} type="base" />
                <ModalButton onClick={handleConfirm} text={t('confirm')} type="bg" />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const localStyles = StyleSheet.create({
  modalHeader: {
    justifyContent: 'center',
    height: 65,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    width: 350,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInner: {
    backgroundColor: 'transparent',
  },
  modalContent: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalFooter: {
    height: 65,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 10,
  },
});

export default ConfirmModal;
