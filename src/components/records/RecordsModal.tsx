import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import React, { useImperativeHandle, useState, forwardRef } from 'react';

// Import local components and hooks
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock';
import useDate from '@/src/hooks/useDate';
import useColorStore from '@/src/stores/ColorsStore';
import ColorText from '../ui/color-text'; // Assuming this component exists
import ModalButton from '../ui/modal-button'; // Assuming this component exists
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import type { RecordView } from '@/src/interfaces/schema';

export interface RecordsModalRef {
    open: (filteredRecords: RecordView[]) => void;
    close: () => void;
}

export const RecordsModal = forwardRef<RecordsModalRef, {}>(
    ({ }, ref) => {
        const [records, setRecords] = useState<RecordView[]>([])
        const [isVisible, setIsVisible] = useState(false) 
        const { t } = useLanguage()
        const { colors } = useColorStore() 
        const dateh = useDate()

        const handleClose = () => {
            setRecords([])
            setIsVisible(false);
        }

        const onOpen = (filteredRecords: RecordView[]) => {
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
                                                bottomColor={item.PaymentMethods?.PaymentTypes?.payment_color ?? undefined}
                                                letfColor={item.RecordTypes?.record_color ?? undefined}
                                            >
                                                <View style={localStyles.rowContainer}>
                                                    <View style={localStyles.dateContainer}>
                                                        <Text style={localStyles.dateText}>
                                                            {dateh.getStringDay(String(item.date))}
                                                        </Text>
                                                        <Text style={localStyles.dateText}>
                                                            {dateh.getDay(String(item.date))}
                                                        </Text>
                                                        <Text style={localStyles.dateText}>
                                                            {dateh.getStringMonth(String(item.date))}
                                                        </Text>
                                                    </View>
                                                    <Text style={localStyles.nameText}>{item.record_name}</Text>
                                                    <Text style={localStyles.valueText}>{formatMoneyWithSymbol(item.amount)}</Text>
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

RecordsModal.displayName = 'RecordsModal';

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