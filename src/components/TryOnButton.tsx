'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TryOnButtonProps {
  itemId: string;
  itemName: string;
}

export default function TryOnButton({ itemId, itemName }: TryOnButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tryOnUrl, setTryOnUrl] = useState('');

  useEffect(() => {
    setTryOnUrl(`${window.location.origin}/try-on/${encodeURIComponent(itemId)}`);
  }, [itemId]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 text-center font-semibold tracking-[0.15em] uppercase text-sm border border-gold text-gold hover:bg-gold hover:text-white transition-all duration-300"
      >
        💍 Try On Virtually
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl text-charcoal mb-2">Virtual Try-On</h3>
            <p className="text-sm text-charcoal-muted mb-6">
              Scan this QR code with your phone to try on <br />
              <span className="font-semibold text-charcoal">{itemName}</span>
            </p>

            <div className="flex justify-center mb-6">
              {tryOnUrl ? (
                <QRCodeSVG
                  value={tryOnUrl}
                  size={200}
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                  level="M"
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-cream animate-pulse rounded" />
              )}
            </div>

            <p className="text-xs text-charcoal-muted mb-6 break-all">{tryOnUrl}</p>

            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-charcoal-muted hover:text-charcoal transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
