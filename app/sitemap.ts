import type { MetadataRoute } from 'next';
import { getAllChatMeta } from '@/lib/chats';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const chats = getAllChatMeta().map((c) => ({
    url: absoluteUrl(`chats/${c.slug}`),
    lastModified: c.date || undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: absoluteUrl(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('chats'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...chats,
  ];
}
