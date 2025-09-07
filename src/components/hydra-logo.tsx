'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface HydraLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function HydraLogo({ width = 32, height = 32, className = '' }: HydraLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show black logo during SSR and loading
  if (!mounted) {
    return (
      <Image
        src="/logo-hydra@124.png"
        alt="Hydra"
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // Use white logo for dark theme, black logo for light theme
  const logoSrc = resolvedTheme === 'dark' ? '/logo-hydra-white@128.png' : '/logo-hydra@124.png';

  return (
    <Image
      src={logoSrc}
      alt="Hydra"
      width={width}
      height={height}
      className={className}
    />
  );
}
