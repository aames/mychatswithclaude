import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
};

export type Chat = ChatMeta & {
  messages: ChatMessage[];
};

const CHATS_DIR = path.join(process.cwd(), 'chats');

function parseMessages(body: string): ChatMessage[] {
  // Messages are delimited by lines starting with `## User` or `## Assistant`.
  const lines = body.split('\n');
  const messages: ChatMessage[] = [];
  let current: ChatMessage | null = null;

  for (const line of lines) {
    const header = line.match(/^##\s+(User|Assistant)\s*$/i);
    if (header) {
      if (current) messages.push({ ...current, content: current.content.trim() });
      current = {
        role: header[1].toLowerCase() === 'user' ? 'user' : 'assistant',
        content: '',
      };
      continue;
    }
    if (current) current.content += line + '\n';
  }
  if (current) messages.push({ ...current, content: current.content.trim() });
  return messages;
}

export function getAllChatMeta(): ChatMeta[] {
  if (!fs.existsSync(CHATS_DIR)) return [];
  const files = fs.readdirSync(CHATS_DIR).filter((f) => f.endsWith('.md'));
  const metas = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(CHATS_DIR, file), 'utf8');
    const { data } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? '',
      summary: data.summary as string | undefined,
    };
  });
  return metas.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getChat(slug: string): Chat | null {
  const file = path.join(CHATS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? '',
    summary: data.summary as string | undefined,
    messages: parseMessages(content),
  };
}
