import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import React, { useImperativeHandle, useState, forwardRef } from 'react';

// Import local components and hooks
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock';
import useDate from '@/src/hooks/useDate';
import useColorStore from '@/src/stores/ColorsStore';
import ColorText from '../ui/color-text'; // Assuming this component exists
import ModalButton from '../ui/modal-button'; // Assuming this component exists
import { useLanguage } from '@/src/lang/LanguageContext';

// Assuming this type is imported or defined
type RecordJoined = any; 

export interface RecordsModalRef {
    open: (filteredRecords: RecordJoined[] | []) => void;
    close: () => void;
}

export const RecordsModal = forwardRef<RecordsModalRef, {}>(
    ({ }, ref) => {
        const [records, setRecords] = useState<RecordJoined[] | []>([])
        const [isVisible, setIsVisible] = useState(false) 
        const { t } = useLanguage()
        const { colors } = useColorStore() 

        const handleClose = () => {
            setRecords([])
            setIsVisible(false);
        }

        const onOpen = (filteredRecords: RecordJoined[] | []) => {
            console.log("Opening Modal with records:", filteredRecords);
            setRecords(filteredRecords)
            setIsVisible(true);
        }

        useImperativeHandle(ref, () => ({
            open: onOpen,
            close: handleClose,
        }));

        if (!isVisible) return null;

        return (
            <View style={localStyles.simulatedModalContainer}>
                <View style={localStyles.modalBackdrop}>
                    <View style={localStyles.pressableContainer}>
                        <View style={localStyles.modalContainer}>
                            <View style={[localStyles.modalHeader, { backgroundColor: colors?.ModalHeaderColor }]}>
                                <ColorText backgroundColor={colors?.ModalHeaderColor || "#fff"} textAlign="center">
                                    {t("resume.recordsDetail")} 
                                </ColorText>
                            </View>
                            <View style={localStyles.modalContent}>
                                <ScrollView style={{ flex: 1 }}>
                                    <View style={localStyles.colContainer}>
                                        {records?.map((item, index) => (
                                            <BorderLeftBottomBlock
                                                key={item.record_id}
                                                bottomColor={item.payment_color}
                                                letfColor={item.record_color}
                                            >
                                                <View style={localStyles.rowContainer}>
                                                    <View style={localStyles.dateContainer}>
                                                        <Text style={localStyles.dateText}>
                                                            {useDate().getStringDay(String(item.date))}
                                                        </Text>
                                                        <Text style={localStyles.dateText}>
                                                            {useDate().getDay(String(item.date))}
                                                        </Text>
                                                        <Text style={localStyles.dateText}>
                                                            {useDate().getStringMonth(String(item.date))}
                                                        </Text>
                                                    </View>
                                                    <Text style={localStyles.nameText}>{item.record_name}</Text>
                                                    <Text style={localStyles.valueText}>${item.amount}</Text>
                                                </View>
                                            </BorderLeftBottomBlock>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={localStyles.modalFooter}>
                                <ModalButton onClick={handleClose} text={t("close")} type='base' />
                            </View>

                        </View>
                    </View>
                </View>
            </View>
        )
    }
)

export default RecordsModal;

const localStyles = StyleSheet.create({
    simulatedModalContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    pressableContainer: {
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: 380,
        height: 600,
        flexDirection: 'column',
    },
    modalHeader: {
        justifyContent: "center",
        height: 65
    },
    modalContent: {
        flex: 1,
    },
    modalFooter: {
        height: 65,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: 'center',
        gap: 20,
    },
    rowContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    colContainer: {
        flexDirection: "column",
        alignContent: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        gap: 10
    },
    dateContainer: {
        width: 50
    },
    dateText: {
        fontWeight: "100",
        fontSize: 8,
        textAlign: "center"
    },
    nameText: {
        fontSize: 12,
        textAlign: "left",
        maxWidth: 200
    },
    valueText: {
        fontSize: 12,
        textAlign: "center",
        fontWeight: "300",
    },
    balanceText: {
        width: "80%",
        borderTopWidth: 4,
        height: 60,
        paddingTop: 10,
        textAlign: "center",
        marginLeft: 5,
        fontWeight: "300",
        fontSize: 18
    }
})