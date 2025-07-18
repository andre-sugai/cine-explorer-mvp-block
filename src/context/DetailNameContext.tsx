import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DetailNameContextType {
  detailName: string;
  setDetailName: (name: string) => void;
}

const DetailNameContext = createContext<DetailNameContextType | undefined>(
  undefined
);

export const DetailNameProvider = ({ children }: { children: ReactNode }) => {
  const [detailName, setDetailName] = useState('');
  return (
    <DetailNameContext.Provider value={{ detailName, setDetailName }}>
      {children}
    </DetailNameContext.Provider>
  );
};

export function useDetailNameContext(): DetailNameContextType {
  const context = useContext(DetailNameContext);
  if (!context) {
    throw new Error(
      'useDetailNameContext deve ser usado dentro de um DetailNameProvider'
    );
  }
  return context;
}

/**
 * Contexto global para compartilhar o nome do detalhe atual (filme, série ou pessoa) entre páginas e breadcrumbs.
 */
