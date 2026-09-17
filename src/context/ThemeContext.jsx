import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  tema: 'dark',
  alternarTema: () => {}
});

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('syscor_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // 1. Alterna a classe .dark necessária pelo CSS
    if (tema === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }

    // 2. Atualiza os data-attributes para compatibilidade
    root.setAttribute('data-theme', tema);
    body.setAttribute('data-theme', tema);

    // 3. Salva no localStorage
    localStorage.setItem('syscor_theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTema = () => useContext(ThemeContext);