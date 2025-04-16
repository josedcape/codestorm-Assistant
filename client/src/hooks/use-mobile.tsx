import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Comprobar inicialmente
    checkIfMobile();

    // Configurar oyente para cambios de tamaño de ventana
    window.addEventListener('resize', checkIfMobile);

    // Limpiar oyente en desmontaje
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Comprobar inicialmente
    updateMatches();
    
    // Configurar oyente para cambios en media query
    mediaQuery.addEventListener('change', updateMatches);
    
    // Limpiar oyente en desmontaje
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}