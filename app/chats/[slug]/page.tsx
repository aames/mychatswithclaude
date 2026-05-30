import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChatView } from '@/components/ChatView';
import { Footer } from '@/components/Footer';
import { getAllChatMeta, getChat } from '@/lib/chats';
import { absoluteUrl, SITE_NAME, SITE_KEYWORDS, OG_IMAGE } from '@/lib/site';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllChatMeta().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const chat = getChat(slug);
  if (!chat) return {};

  const url = absoluteUrl(`chats/${chat.slug}`);
  const description =
    chat.summary ??
    `A conversation with Claude, Anthropic’s AI assistant: ${chat.title}.`;
  const title = `${chat.title} — My Chats With Claude`;

  return {
    title,
    description,
    keywords: [chat.title, ...SITE_KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: SITE_NAME,
      publishedTime: chat.date || undefined,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function ChatPage({ params }: { params: Params }) {
  const { slug } = await params;
  const chat = getChat(slug);
  if (!chat) notFound();

  const url = absoluteUrl(`chats/${chat.slug}`);
  const description =
    chat.summary ??
    `A conversation with Claude, Anthropic’s AI assistant: ${chat.title}.`;

  // Structured data: present the chat as a Q&A with Claude so search engines
  // can surface it as a rich result for Claude-related queries.
  const firstUser = chat.messages.find((m) => m.role === 'user');
  const firstAnswer = chat.messages.find((m) => m.role === 'assistant');

  const qaLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: (firstUser?.content ?? chat.title).slice(0, 300),
      text: firstUser?.content ?? chat.title,
      ...(chat.date ? { datePublished: chat.date } : {}),
      answerCount: chat.messages.filter((m) => m.role === 'assistant').length,
      ...(firstAnswer
        ? {
            acceptedAnswer: {
              '@type': 'Answer',
              text: firstAnswer.content,
              url,
              author: { '@type': 'Organization', name: 'Claude (Anthropic)' },
            },
          }
        : {}),
    },
  };

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chat.title,
    description,
    url,
    ...(chat.date ? { datePublished: chat.date } : {}),
    author: { '@type': 'Organization', name: 'Claude (Anthropic)' },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <ChatView chat={chat} />
      <Footer />
    </>
  );
}
