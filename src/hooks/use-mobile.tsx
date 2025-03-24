
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// New function to detect if we're running in a mobile application environment
export function isMobileApp(): boolean {
  if (typeof navigator === 'undefined') return false
  
  // Check for Capacitor/Cordova or other app wrapper environments
  const userAgent = navigator.userAgent || '';
  const isCapacitor = window.hasOwnProperty('Capacitor');
  const isCordova = window.hasOwnProperty('cordova');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Also detect mobile devices by user agent as fallback
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return !!(isCapacitor || isCordova || isStandalone || isMobileDevice);
}
