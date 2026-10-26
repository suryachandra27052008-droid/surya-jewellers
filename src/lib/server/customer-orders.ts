import { currentUser } from '@clerk/nextjs/server';

export async function checkoutOwner() {
  const user = await currentUser();
  return user?.id;
}

export function verifiedOrderEmails(user: { emailAddresses: { emailAddress: string; verification?: { status: string } | null }[] }) {
  return user.emailAddresses.filter(email => email.verification?.status === 'verified')
    .map(email => email.emailAddress.trim().toLowerCase());
}

export function ownsOrder(order: { ownerUserId?: string; customer?: { email?: string } }, userId: string, verifiedEmails: string[]) {
  if (order.ownerUserId) return order.ownerUserId === userId;
  return verifiedEmails.includes(order.customer?.email?.trim().toLowerCase() || '');
}
