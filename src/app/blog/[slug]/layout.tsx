import type { Metadata } from 'next';
import { getPost } from '@/app/blog/data';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

function parseDateISO(date: string): string | undefined {
  if (date === 'Pinned' || !date) return undefined;
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: 'Article Not Found | Surya Jewellers' };
  }

  const title = `${post.title} | Surya Jewellers Journal`;
  const description = post.excerpt.slice(0, 160);
  const url = `https://suryajewellers.shop/blog/${slug}`;
  const dateISO = parseDateISO(post.date);

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
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: post.title }],
      publishedTime: dateISO,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}

export default async function BlogSlugLayout({ params, children }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return <>{children}</>;

  const url = `https://suryajewellers.shop/blog/${slug}`;
  const dateISO = parseDateISO(post.date);

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    ...(dateISO && { datePublished: dateISO, dateModified: dateISO }),
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
      worksFor: {
        '@type': 'Organization',
        name: 'Surya Jewellers',
        url: 'https://suryajewellers.shop',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Surya Jewellers',
      url: 'https://suryajewellers.shop',
      logo: {
        '@type': 'ImageObject',
        url: 'https://suryajewellers.shop/logo_sj.png',
      },
    },
    image: 'https://suryajewellers.shop/opengraph-image',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: post.category,
    inLanguage: 'en-IN',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {children}
    </>
  );
}
