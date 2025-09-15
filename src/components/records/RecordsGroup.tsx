import { View, Text, StyleSheet } from 'react-native'

import SwipeItem from '../ui/swipe-item'
import useDate from '@/src/hooks/useDate'
import useRecordsStore from '@/src/stores/RecordsStore';
import BorderLeftBottomBlock from '../ui/BorderLeftButtonBlock'

type RecordsGroupProps = {
    handleUpdate: (index: number) => void,
    handleDelete: (index: number) => void,
}

const RecordsGroup = ({ handleDelete, handleUpdate }: RecordsGroupProps) => {
    const dateh = useDate()
    const { records } = useRecordsStore()
    return (
        <>
            <View style={{ gap: 5, paddingHorizontal: 30, }}>
                {records?.map((item, index) => {
                    return (
                        <SwipeItem
                            handleDelete={() => handleDelete(index)}
                            handleUpdate={() => handleUpdate(index)}
                            key={item.id}
                        >
                            <BorderLeftBottomBlock
                                bottomColor={item.record_color}
                                letfColor={item.payment_color}
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
                                    <Text style={localStyles.valueText}>${item.amount}</Text>
                                </View>
                            </BorderLeftBottomBlock>
                        </SwipeItem>
                    )
                })}
            </View>
        </>
    )
}

const localStyles = StyleSheet.create({
    rowContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
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

export default RecordsGroup