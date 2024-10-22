import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { ReactNode, useState } from 'react';
import useToast from '@/src/hooks/useToast';
import { useLanguage } from '@/src/lang/LanguageContext';
import ModalButton from './modal-button';

interface ConfirmModalProps {
  children: ReactNode;
  message?: string;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmModal = ({ children, message, title, onConfirm, onCancel }: ConfirmModalProps) => {
  const { ToastContainer, showToast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();

  const handleConfirm = () => {
    setModalVisible(false);
    if (onConfirm) {
      onConfirm();
      showToast(t('confirmed'));
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
        <Pressable onPress={handleCancel} style={localStyles.modalBackdrop}>
          <Pressable onPress={() => { }} style={localStyles.modalInner}>
            <View style={localStyles.modalContainer}>
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.modalHeaderText}>{title || t('confirmTitle')}</Text>
              </View>
              <View style={localStyles.modalContent}>
                <Text style={localStyles.modalMessage}>{message || t('confirmMessage')}</Text>
              </View>
              <View style={localStyles.modalFooter}>
                <ModalButton onClick={handleCancel} text={t('cancel')} type="base" />
                <ModalButton onClick={handleConfirm} text={t('confirm')} type="bg" />
              </View>
            </View>
          </Pressable>
        </Pressable>
        <ToastContainer />
      </Modal>
    </>
  );
};

const localStyles = StyleSheet.create({
  modalHeader: {
    backgroundColor: '#497679',
    justifyContent: 'center',
    height: 65,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: 350,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    color: '#333',
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
