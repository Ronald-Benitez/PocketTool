import insertDefault from "./InsertDefaults"
import AlterRecordsAddPaidCredit from "./AlterRecordsAddPaidCredit"
import AlterAllTablesAddDeletedAt from "./AlterAllTablesAddDeletedAt"
import AlterPaymentMethodsAddPaymentDate from "./AlterPaymentMethodsAddPaymentDate"

export const migrations = {
    insertDefault,
    AlterRecordsAddPaidCredit,
    AlterAllTablesAddDeletedAt,
    AlterPaymentMethodsAddPaymentDate,
}