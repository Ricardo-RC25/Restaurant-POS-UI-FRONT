import { Coffee, Heart, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Estado para la información del negocio
  const [businessInfo, setBusinessInfo] = useState({
    name: localStorage.getItem('restaurantName') || 'Taquería POS',
    address: localStorage.getItem('restaurantAddress') || 'Calle Principal #123, Col. Centro',
    phone: localStorage.getItem('restaurantPhone') || '+52 55 1234 5678',
    email: localStorage.getItem('restaurantEmail') || 'contacto@taqueria.com',
    website: localStorage.getItem('restaurantWebsite') || 'www.taqueria.com',
  });

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setBusinessInfo({
        name: localStorage.getItem('restaurantName') || 'Taquería POS',
        address: localStorage.getItem('restaurantAddress') || 'Calle Principal #123, Col. Centro',
        phone: localStorage.getItem('restaurantPhone') || '+52 55 1234 5678',
        email: localStorage.getItem('restaurantEmail') || 'contacto@taqueria.com',
        website: localStorage.getItem('restaurantWebsite') || 'www.taqueria.com',
      });
    };

    // Escuchar evento de storage (funciona entre pestañas)
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar evento personalizado para cambios en la misma pestaña
    window.addEventListener('businessInfoUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('businessInfoUpdated', handleStorageChange);
    };
  }, []);

  return (
    <footer className="bg-gradient-to-r from-accent to-secondary text-white border-t border-primary/20 flex-shrink-0" style={{ height: '64px' }}>
      <div className="max-w-full mx-auto px-3 h-full flex items-center">
        <div className="flex items-center justify-between gap-2 sm:gap-4 text-xs w-full">
          {/* Brand + Copyright */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <Coffee className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-200 leading-tight text-[10px] sm:text-xs whitespace-nowrap">
              © {currentYear} <span className="font-semibold text-white">{businessInfo.name}</span>
            </span>
          </div>

          {/* Contact Info - Compacto y responsivo */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] overflow-hidden flex-1 justify-center">
            <div className="flex items-center gap-0.5 text-gray-200 flex-shrink-0">
              <MapPin className="w-2.5 h-2.5 lg:w-3 lg:h-3 flex-shrink-0" />
              <span className="truncate max-w-[120px] lg:max-w-[180px]">{businessInfo.address}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-0.5 text-gray-200 flex-shrink-0">
              <Phone className="w-2.5 h-2.5 lg:w-3 lg:h-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{businessInfo.phone}</span>
            </div>
            <span className="text-gray-400 hidden lg:inline">•</span>
            <div className="hidden lg:flex items-center gap-0.5 text-gray-200 flex-shrink-0">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px] xl:max-w-[140px]">{businessInfo.email}</span>
            </div>
            <span className="text-gray-400 hidden xl:inline">•</span>
            <div className="hidden xl:flex items-center gap-0.5 text-gray-200 flex-shrink-0">
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">{businessInfo.website}</span>
            </div>
          </div>

          {/* Version + Made with love */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-full">
              <span className="text-gray-300 text-[9px]">v</span>
              <span className="font-medium text-white text-[9px]">1.0.0</span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-gray-200 leading-tight text-[9px] whitespace-nowrap">
              Hecho con <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400 animate-pulse flex-shrink-0" /> para tu negocio
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}