export interface LanguageContent {
    groups: {
        header: string;
        groupName: string;
        goal: string;
        year: string;
        month: string;
        addGroup: string;
        updateGroup: string;
        delete: string;
        edit: string;
        error: {
            emptyFields: string;
        };
    };
    months: string[];
    settings: {
        header: string;
        selectLanguage: string;
        languages: {
            english: string;
            spanish: string;
        };
    };
    paymentMethods: {
        header: string;
        methodName: string;
        addMethod: string;
        updateMethod: string;
        delete: string;
        edit: string;
        error: {
            emptyFields: string;
        };
    };
    categories: {
        header: string;
        categoryName: string;
        addCategory: string;
        updateCategory: string;
        delete: string;
        edit: string;
        error: {
            emptyFields: string;
        };
    };
}
