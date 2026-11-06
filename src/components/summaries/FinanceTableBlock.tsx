import { View } from "react-native";

import { useLanguage } from "@/src/lang/LanguageContext";
import {
    pickSummaryAmount,
    useSummaryMode,
    type SummaryMode,
} from "@/src/hooks/useSummaryMode";
import useResumesStore, { Resumes } from "@/src/stores/ResumesStore";
import useFixedsResumesStore from "@/src/stores/FixedsResumesStore";
import { SummaryModeToggle } from "./SummaryModeToggle";
import {
    SummaryGroup,
    type SummaryGroupItem,
} from "@/src/ui/data-display/SummaryGroup";
import { AppText } from "@/src/ui/primitives/AppText";
import { Stack } from "@/src/ui/primitives/Stack";

type SummaryValue =
    Resumes['balanceByPaymentMethod'][number]
    | Resumes['balanceByCategory'][number]
    | Resumes['balanceByPaymentType'][number]

interface props {
    render: "categories" | "payments" | "types",
    fixed?: boolean
    onSummarySelected: (id: number | undefined, idRecordType: number | undefined) => void
}

const toGroupItems = (
    value: SummaryValue,
    mode: SummaryMode,
    onSummarySelected: props['onSummarySelected']
): SummaryGroupItem[] =>
    (value.totalPerRecordType ?? [])
        .map((item) => ({
            item,
            amount: pickSummaryAmount(mode, item),
        }))
        .filter(({ amount }) => amount > 0)
        .map(({ item, amount }) => ({
            key: item.id ?? item.type_name,
            label: item.type_name,
            cents: amount,
            color: item.record_color,
            onPress: () => onSummarySelected(value.id, item.id),
        }))

const SummaryList = ({
    title,
    values,
    mode,
    onSummarySelected,
}: {
    title: string,
    values: SummaryValue[],
    mode: SummaryMode,
    onSummarySelected: props['onSummarySelected'],
}) => (
    <Stack gap='md'>
        <AppText variant='title'>{title}</AppText>
        <SummaryModeToggle />
        {values.map((value, index) => (
            <SummaryGroup
                key={value.id ?? index}
                title={
                    'category_name' in value
                        ? value.category_name
                        : 'method_name' in value
                            ? value.method_name
                            : value.payment_type_name ?? ''
                }
                totalCents={pickSummaryAmount(mode, value)}
                items={toGroupItems(value, mode, onSummarySelected)}
                onPress={() => onSummarySelected(value.id, undefined)}
            />
        ))}
    </Stack>
)

const FinnanceTableBlock = ({ render, fixed, onSummarySelected }: props) => {
    const { t } = useLanguage()
    const resumes = useResumesStore()
    const fixedsResumes = useFixedsResumesStore()
    const { mode } = useSummaryMode()
    const { balanceByCategory, balanceByPaymentMethod, balanceByPaymentType } = fixed ? fixedsResumes : resumes

    if (render === 'categories') {
        return (
            <SummaryList
                title={t("resume.summaryByCategories")}
                values={balanceByCategory ?? []}
                mode={mode}
                onSummarySelected={onSummarySelected}
            />
        )
    }

    if (render === 'payments') {
        return (
            <SummaryList
                title={t("resume.summaryByPayments")}
                values={balanceByPaymentMethod ?? []}
                mode={mode}
                onSummarySelected={onSummarySelected}
            />
        )
    }

    if (render === 'types') {
        return (
            <SummaryList
                title={t("resume.summaryByTypes")}
                values={balanceByPaymentType ?? []}
                mode={mode}
                onSummarySelected={onSummarySelected}
            />
        )
    }

    return (
        <View>
            <AppText color='muted'>{t("resume.noData")}</AppText>
        </View>
    )
}

export default FinnanceTableBlock
