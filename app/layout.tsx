import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider } from '@/components/SidebarContext';
import { TopBar } from '@/components/TopBar';
import { GitHubIcon } from '@/components/Icons';
import { getAllChatMeta } from '@/lib/chats';
import { SITE_URL, SITE_NAME, SITE_KEYWORDS, OG_IMAGE } from '@/lib/site';

const description =
  'An unofficial fan archive of funny, weird, and occasionally useful conversations with Claude, Anthropic’s AI assistant.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chats = getAllChatMeta();
  return (
    <html lang="en">
      <body className="bg-paper text-ink">
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar chats={chats} />
            <main className="flex-1 min-w-0 flex flex-col">
              <TopBar />
              {children}
            </main>
          </div>
        </SidebarProvider>
        <a
          href="https://github.com/aames/mychatswithclaude"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          title="Source"
          className="fixed bottom-3 right-3 z-30 p-1.5 rounded-full text-ink/25 hover:text-ink/80 transition-colors"
        >
          <GitHubIcon className="w-5 h-5" />
        </a>
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "890de6d544cc4367a5f2ea55a69c65b7"}'
        />
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  );
}
