'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { catalogImageLoader } from '@/lib/sanity/catalog-image-loader';

export type SearchSuggestion = { id: string; name: string; href: string; image: string; price: string; originalPrice?: string; sku?: string | number };

export default function ProductSearch({ query, onChange, onSubmit, suggestions, onNavigate }: {
  query: string; onChange: (query: string) => void; onSubmit: () => void;
  suggestions: SearchSuggestion[]; onNavigate: () => void;
}) {
  const router = useRouter();
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const expanded = open && query.trim().length >= 2;
  const selected = active >= 0 && active < suggestions.length ? suggestions[active] : undefined;

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  useEffect(() => {
    if (expanded && selected) document.getElementById(`${listId}-${selected.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [expanded, selected, listId]);

  return (
    <form ref={root} role="search" className="relative mb-5 max-w-xl" onSubmit={event => {
      event.preventDefault(); setOpen(false); onSubmit();
    }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" />
        <input id="product-search" type="search" role="combobox" aria-label="Search jewellery" value={query}
          aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
          aria-activedescendant={expanded && selected ? `${listId}-${selected.id}` : undefined}
          autoComplete="off" maxLength={100} placeholder="Search jewellery, gemstone or SKU"
          onFocus={() => { setOpen(true); setActive(-1); }}
          onChange={event => { onChange(event.target.value.slice(0, 100)); setOpen(true); setActive(-1); }}
          onKeyDown={event => {
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && suggestions.length) {
              event.preventDefault(); setOpen(true);
              setActive(index => event.key === 'ArrowDown' ? (index + 1) % suggestions.length : (index <= 0 ? suggestions.length : index) - 1);
            } else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1); }
            else if (event.key === 'Enter' && expanded && selected) {
              event.preventDefault(); setOpen(false); onNavigate(); router.push(selected.href);
            }
          }}
          style={{ paddingLeft: 40, paddingRight: 48 }}
          className="input-field min-h-[44px] [&::-webkit-search-cancel-button]:appearance-none" />
        {query && <button type="button" aria-label="Clear search" title="Clear search" onClick={() => {
          onChange(''); setActive(-1); setOpen(false); root.current?.querySelector('input')?.focus();
        }} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-charcoal-muted"><X size={17} /></button>}
      </div>
      {expanded && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-[45vh] overflow-y-auto rounded border border-cream-dark bg-white shadow-lg">
          {suggestions.length ? <ul id={listId} role="listbox" aria-label="Product suggestions">
            {suggestions.map((item, index) => (
              <li key={item.id} role="presentation">
                <Link id={`${listId}-${item.id}`} href={item.href} role="option" aria-selected={active === index} tabIndex={-1}
                  onMouseDown={event => event.preventDefault()} onClick={() => { setOpen(false); onNavigate(); }}
                  className={`flex min-h-[68px] items-center gap-3 p-3 focus:outline-none ${active === index ? 'bg-cream' : 'hover:bg-cream/60'}`}>
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                    {item.image && <Image src={item.image} loader={catalogImageLoader} alt="" fill sizes="48px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-charcoal">{item.name}</span>
                    {item.sku !== undefined && <span className="block text-[11px] text-charcoal-muted">SKU {item.sku}</span>}
                  </span>
                  <span className="shrink-0 text-right text-xs font-semibold text-gold-ink">
                    {item.price}{item.originalPrice && <span className="mt-0.5 block text-[10px] font-normal text-charcoal-muted line-through">{item.originalPrice}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul> : <p id={listId} role="status" className="p-4 text-sm text-charcoal-muted">No matching pieces.</p>}
        </div>
      )}
      <span className="sr-only" role="status" aria-live="polite">{expanded ? `${suggestions.length} product suggestions` : ''}</span>
    </form>
  );
}
