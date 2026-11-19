import React, { useState } from 'react';
import {
  Sun, BatteryCharging, Package, Wind, Battery, Power, Video,
  Briefcase, Zap, Activity, Cpu, Server, Camera, ShieldCheck,
  Bot, Radio, Printer, Wrench, Laptop, Tv, Layers, Folder,
  Image as ImageIcon
} from 'lucide-react';

export const CATEGORY_ICON_PRESETS = [
  { name: 'Sun', label: 'Solar / Sun', icon: Sun },
  { name: 'BatteryCharging', label: 'Battery Charging', icon: BatteryCharging },
  { name: 'Wind', label: 'Wind Energy', icon: Wind },
  { name: 'Package', label: 'Solar Package', icon: Package },
  { name: 'Battery', label: 'Battery Storage', icon: Battery },
  { name: 'Power', label: 'Power Station', icon: Power },
  { name: 'Zap', label: 'Inverter / UPS', icon: Zap },
  { name: 'Cpu', label: 'MCU / Chip', icon: Cpu },
  { name: 'Server', label: 'Server / Network', icon: Server },
  { name: 'Camera', label: 'Security Camera', icon: Camera },
  { name: 'Video', label: 'Video Surveillance', icon: Video },
  { name: 'Briefcase', label: 'Office / Business', icon: Briefcase },
  { name: 'Activity', label: 'Sensor / Meter', icon: Activity },
  { name: 'Wrench', label: 'Tools / Hardware', icon: Wrench },
  { name: 'Radio', label: 'Wireless / Drone', icon: Radio },
  { name: 'Bot', label: 'Robotics / Automation', icon: Bot },
  { name: 'Printer', label: '3D Printer', icon: Printer },
  { name: 'Laptop', label: 'Computer / PC', icon: Laptop },
  { name: 'Tv', label: 'Display / Screen', icon: Tv },
  { name: 'ShieldCheck', label: 'Protection / IoT', icon: ShieldCheck },
  { name: 'Layers', label: 'Modules', icon: Layers },
  { name: 'Folder', label: 'General Category', icon: Folder }
];

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
  Sun,
  BatteryCharging,
  Package,
  Wind,
  Battery,
  Power,
  Video,
  Briefcase,
  Zap,
  Activity,
  Cpu,
  Server,
  Camera,
  ShieldCheck,
  Bot,
  Radio,
  Printer,
  Wrench,
  Laptop,
  Tv,
  Layers,
  Folder
};

export const CategoryIconDisplay: React.FC<{ icon?: string; name: string; size?: number }> = ({ icon, name, size = 18 }) => {
  const [imgError, setImgError] = useState(false);

  const isUrl = icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.startsWith('data:'));

  if (isUrl && !imgError) {
    return (
      <img
        src={icon}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          objectFit: 'contain',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '2px'
        }}
      />
    );
  }

  const IconComp = (icon && CATEGORY_ICON_MAP[icon]) || Folder;

  return (
    <div
      title={icon || name}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        background: '#fff7ed',
        border: '1px solid #ffedd5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff6600',
        flexShrink: 0
      }}
    >
      <IconComp size={size} />
    </div>
  );
};

export const CategoryCoverDisplay: React.FC<{ image?: string; name: string }> = ({ image, name }) => {
  const [imgError, setImgError] = useState(false);

  if (!image || imgError) {
    return (
      <div
        title={name}
        style={{
          width: '60px',
          height: '36px',
          borderRadius: '6px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          flexShrink: 0
        }}
      >
        <ImageIcon size={16} />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      style={{
        width: '60px',
        height: '36px',
        borderRadius: '6px',
        objectFit: 'cover',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        flexShrink: 0
      }}
    />
  );
};
