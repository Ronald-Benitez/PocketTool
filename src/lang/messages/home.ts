import type { MessageShape } from './types';

export const homeEn = {
    "index": {
        "fixedsMessage": "Remember to confirm your fixed transactions",
        "obligations": "Pending commitments"
    },
    "greeting": {
        "morning": "Good morning!",
        "afternoon": "Good afternoon!",
        "night": "Good night!"
    }
} as const;

export const homeEs: MessageShape<typeof homeEn> = {
    "index": {
        "fixedsMessage": "Recuerda confirmar tus transacciones fijas",
        "obligations": "Compromisos pendientes"
    },
    "greeting": {
        "morning": "¡Buenos días!",
        "afternoon": "¡Buenas tardes!",
        "night": "¡Buenas noches!"
    }
};
