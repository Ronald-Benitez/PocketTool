import { createContext, useContext } from 'react';

/**
 * Permite que los campos dentro de un `Modal` se desplacen a la vista cuando
 * reciben foco y el teclado ocupa parte de la pantalla.
 */
export type ModalScrollToInput = (nodeHandle: number) => void;

export const ModalBodyContext = createContext<ModalScrollToInput | null>(null);

export const useModalScrollToInput = () => useContext(ModalBodyContext);
