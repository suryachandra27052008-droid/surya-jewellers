import { permanentRedirect } from 'next/navigation';

export default function CollectionsPage() {
  permanentRedirect('/products');
}
