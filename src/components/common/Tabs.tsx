import { useId, type ReactNode } from 'react';
export function Tabs({ label, items, value, onChange, children }: { label: string; items: { id: string; label: string }[]; value: string; onChange: (id: string) => void; children: ReactNode }) {
  const id = useId();
  return <div className="space-y-5"><div role="tablist" aria-label={label} className="tabs-list">{items.map((item, index) => <button key={item.id} id={id + item.id} role="tab" aria-selected={item.id === value} aria-controls={id + '-panel'} tabIndex={item.id === value ? 0 : -1} onClick={() => onChange(item.id)} onKeyDown={event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = items.length - 1; else return;
    event.preventDefault(); onChange(items[next].id); document.getElementById(id + items[next].id)?.focus();
  }}>{item.label}</button>)}</div><div role="tabpanel" tabIndex={0} id={id + '-panel'} aria-labelledby={id + value}>{children}</div></div>;
}
