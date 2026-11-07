import type { ComponentPropsWithoutRef } from 'react';

export function PageContainer({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`page-width workspace-page ${className}`} {...props} />;
}

export function Section({ className = '', ...props }: ComponentPropsWithoutRef<'section'>) {
  return <section className={`workspace-section ${className}`} {...props} />;
}

export function SplitPane({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`workspace-split ${className}`} {...props} />;
}
