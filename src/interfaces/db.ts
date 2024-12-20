export interface Group {
  id: number; // Identificador del grupo
  group_name: string; // Nombre del grupo
  goal: number; // Meta del grupo
  total_income: number; // Total de ingresos del grupo
  total_expense: number; // Total de gastos del grupo
  year: string;
  month: string;
}

export interface PaymentMethod {
  id: number; // Identificador del método de pago
  method_name: string; // Nombre del método de pago
  payment_type: "credit" | "debit";
  closing_date: number
}
export interface Category {
  id: number; // Identificador de la categoría
  category_name: string; // Nombre de la categoría
}
export interface RecordI {
  payment_type: string;
  record_id: number;
  id: number; // Identificador del registro
  amount: number; // Valor del ingreso o gasto
  record_type: "income" | "expense" | "transfer"; // Tipo de registro (ingreso o gasto)
  group_id: number; // Identificador del grupo relacionado
  category_id: number; // Identificador de la categoría relacionada
  payment_method_id: number; // Identificador del método de pago relacionado
  date: string; // Fecha del registro (formato 'YYYY-MM-DD')
  record_name: string;
}

export interface GetGroupsResponse {
  groups: Group[]; // Array de grupos obtenidos
}

export interface CreateGroupRequest {
  group_name: string; // Nombre del grupo
  goal: number; // Meta del grupo
  year: string;
  month: string;
}

export interface GetPaymentMethodsResponse {
  paymentMethods: PaymentMethod[]; // Array de métodos de pago obtenidos
}

export interface CreatePaymentMethodRequest {
  method_name: string; // Nombre del método de pago
  payment_type: "credit" | "debit";
  closing_date: number
  
}
export interface GetCategoriesResponse {
  categories: Category[]; // Array de categorías obtenidas
}
export interface CreateCategoryRequest {
  category_name: string; // Nombre de la categoría
}
export interface GetRecordsRequest {
  groupId: number; // ID del grupo para filtrar los registros
  record_type?: "income" | "expense" | "transfer"; // Tipo de registro para filtrar (opcional)
  startDate?: string; // Fecha de inicio para el rango de fechas (opcional)
  endDate?: string; // Fecha de fin para el rango de fechas (opcional)
}

export interface GetRecordsResponse {
  records: (RecordI & {
    group_name: string; // Nombre del grupo asociado
    category_name: string; // Nombre de la categoría asociada
    method_name: string; // Nombre del método de pago asociado
  })[]; // Array de registros obtenidos con información adicional
}

export interface CreateRecordRequest {
  amount: number; // Valor del ingreso o gasto
  record_type: "income" | "expense" | "transfer"; // Tipo de registro (ingreso o gasto)
  group_id: number; // Identificador del grupo
  category_id: number; // Identificador de la categoría
  payment_method_id: number; // Identificador del método de pago
  date: string; // Fecha del registro (formato 'YYYY-MM-DD')
  record_name: string;
}

export interface Savings {
  id: number; // ID único para cada ahorro
  saving_name: string; // Nombre del ahorro
  amount: number; // Monto actual del ahorro
}

// Interface para la tabla SavingsHistory
export interface SavingsHistory {
  id: number; // ID único para cada historial de cambio
  saving_id: number; // ID de referencia al ahorro en la tabla Savings
  previous_amount: number | null; // Monto anterior (NULL si es la primera inserción)
  new_amount: number; // Monto actualizado
  change_date: string; // Fecha del cambio, almacenada como texto en formato ISO
}

export type AddSaving = Omit<Savings, "id">;

export interface Budget {
  id_budget: number,
  category_id: number,
  budget_type: "income" | "expense" | "transfer",
  group_id: number,
  amount: number,
  category_name: string
}

export type BudgetInsert = Omit<Budget, "id_budget" | "category_name" >
