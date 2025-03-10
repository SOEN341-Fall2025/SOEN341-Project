import React from 'react';
import * as icons from 'lucide-react';


export const AppContext = React.createContext();

export function HexToRGBA(hex, alpha = 1) {
    let r = 0, g = 0, b = 0;    
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
export function RGBA(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
export function RGB_A(rgba, a) {
    return `rgba(rgb, ${a})`;
}
export const UpdateStyle = (styleProperty, newValue) => document.documentElement.style.setProperty(styleProperty, newValue);
export const GetStyle = (styleProperty) => getComputedStyle(document.documentElement).getPropertyValue(styleProperty);
export function ToVW(px){ return (100 * (px / window.innerWidth)); }
export function ToPX(vw){ return Math.ceil((window.innerWidth * vw / 100)); }
export const Icon = ({ name, ...props }) => {
    const iconName = name || FindClosestIcon(props.alt || '');
    const LucideIcon = icons[iconName];
    return LucideIcon ? <LucideIcon {...props} /> : null;
  };
export const FindClosestIcon = (name) => {
    const iconNames = Object.keys(icons);
    const words = name.toLowerCase().split(' ');

    for (const word of words) {
      const match = iconNames.find(iconName =>
        iconName.toLowerCase().includes(word)
      );
      if (match) return match;
    }
    
    return 'Hash'; // Default icon if no match found
  };
