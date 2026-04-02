'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isStudio = pathname.startsWith('/studio');

  // Admin and Studio routes get no storefront chrome
  if (isAdmin || isStudio) {
    return <>{children}</>;
  }

  // Storefront pages get the full navbar + footer
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <a
        href="https://wa.me/919983939306"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
        style={{ backgroundColor: '#25D366' }}
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="30" height="30" fill="white">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.773L0 32l8.476-2.004A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.747-1.836l-.484-.287-5.027 1.188 1.21-4.893-.316-.502A13.267 13.267 0 0 1 2.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.273-9.874c-.398-.199-2.352-1.161-2.717-1.293-.365-.133-.631-.199-.897.199-.266.398-1.029 1.293-1.262 1.559-.232.266-.465.299-.863.1-.398-.2-1.681-.619-3.2-1.974-1.183-1.054-1.981-2.355-2.213-2.753-.232-.398-.025-.614.175-.812.179-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.897-2.163-1.229-2.96-.324-.778-.653-.672-.897-.685l-.764-.013c-.266 0-.697.1-.1.063 1.062-.398 1.727-.398 2.593-.398.866 0 2.261.033 2.593 1.095.332 1.063.033 2.76-.033 3.258-.066.498.033.731.299.963.266.232 1.03.697 1.562 1.062.531.365 1.062.498 1.461.299.398-.199.631-.731.763-1.062.133-.332.1-.598-.033-.797z" />
        </svg>
      </a>
    </>
  );
}
