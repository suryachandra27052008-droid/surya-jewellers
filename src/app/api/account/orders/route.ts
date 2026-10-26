import { currentUser } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity/client';
import { verifiedOrderEmails } from '@/lib/server/customer-orders';

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: 'Sign in to view your orders.' }, { status: 401 });
  const emails = verifiedOrderEmails(user);
  const orders = await writeClient.fetch(
    `*[_type == "order" && (ownerUserId == $userId ||
      (!defined(ownerUserId) && lower(customer.email) in $emails))]
      | order(_createdAt desc)[0...100]{
        "reference": razorpayOrderId, status, _createdAt, items[]{name, quantity, price, ringSize},
        subtotal, discount, shipping, total, paymentCurrency, paymentAmount,
        courier, trackingNumber, trackingUrl, fulfillmentBlocked
      }`, { userId: user.id, emails }, { cache: 'no-store' },
  );
  return Response.json({ orders }, { headers: { 'Cache-Control': 'private, no-store' } });
}
