import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function IconRenderer({ name, className = 'w-8 h-8', size }) {
  const IconComponent = LucideIcons[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} size={size} />;
}
