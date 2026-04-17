import type { Metadata } from 'next';
import { getPost } from '@/app/blog/data';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: 'Article Not Found | Surya Jewellers' };
  }

  const title = `${post.title} | Surya Jewellers Journal`;
  const description = post.excerpt.slice(0, 160);
  const url = `https://suryajewellers.shop/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'Surya Jewellers',
      images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: post.title }],
      publishedTime: post.date === 'Pinned' ? undefined : new Date(post.date + ' 2025').toISOString(),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/logo_sj.png'],
    },
  };
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
