import { Metadata } from 'next';
import AIDirectory from '@/components/AIDirectory';
import Navbar from '@/components/Navbar';
import aiTools from '@/data/ai-tools-flat.json';

export const metadata: Metadata = {
  title: 'AI Tools Directory — 1,500+ Best AI Tools & Software | AICalc',
  description: 'Discover 1,500+ AI tools for productivity, design, development, content creation, and more. Free and paid AI software directory with search and filters.',
  keywords: [
    'ai tools',
    'artificial intelligence tools',
    'ai software directory',
    'best ai tools',
    'ai productivity tools',
    'ai writing tools',
    'ai image generators',
    'ai coding assistants',
    'free ai tools',
    'ai automation'
  ],
  openGraph: {
    title: 'AI Tools Directory — 1,500+ Best AI Tools',
    description: 'Comprehensive directory of AI tools for every use case. Find the perfect AI software for your needs.',
    type: 'website',
    url: 'https://aicalc.tools/directory',
    siteName: 'AICalc Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools Directory — 1,500+ Best AI Tools',
    description: 'Comprehensive directory of AI tools for every use case.',
  },
  alternates: {
    canonical: 'https://aicalc.tools/directory'
  }
};

export default function DirectoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Navbar />

      <AIDirectory tools={aiTools} />

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} AICalc.tools — Discover the best AI tools and software</p>
        </div>
      </footer>
    </main>
  );
}
