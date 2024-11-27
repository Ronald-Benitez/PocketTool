import { ToastAndroid } from "react-native";
import { useLanguage } from "../lang/LanguageContext";

const useAndroidToast = () => {
  const { t } = useLanguage();

    const emptyMessage = ()=> {
        ToastAndroid.show(t('toast.empty'), ToastAndroid.SHORT);
    }

    const addedMessage = () =>{
        ToastAndroid.show(t('toast.added'), ToastAndroid.SHORT);
    }

    const editedMessage = () =>{
        ToastAndroid.show(t('toast.edited'), ToastAndroid.SHORT);
    }

    const deletedMessage = () =>{
        ToastAndroid.show(t('toast.deleted'), ToastAndroid.SHORT);
    }

    const errorMessage = () =>{
        ToastAndroid.show(t('toast.error'), ToastAndroid.SHORT);
    }

    const withMessage = (message: string) =>{
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }

    return {
        addedMessage,
        deletedMessage,
        editedMessage,
        emptyMessage,
        errorMessage,
        withMessage
    }
};

export default useAndroidToast;
