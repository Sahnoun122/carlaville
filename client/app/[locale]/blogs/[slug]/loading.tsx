import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetailsLoading() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-4xl animate-pulse">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-gray-300 mb-8 px-4 py-2 bg-gray-50 rounded-xl pointer-events-none">
           <ChevronLeft className="w-4 h-4" /> Chargement...
        </Link>

        <article className="space-y-8">
           <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="h-4 w-24 bg-gray-200 rounded"></div>
                 <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
              <div className="h-12 w-3/4 bg-gray-200 rounded-lg"></div>
              <div className="h-6 w-full bg-gray-200 rounded mt-4"></div>
              <div className="h-6 w-5/6 bg-gray-200 rounded"></div>
           </div>

           <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 h-[400px]"></div>

           <div className="space-y-4 border-t pt-8">
              <div className="h-4 w-full bg-gray-200 rounded-sm"></div>
              <div className="h-4 w-full bg-gray-200 rounded-sm"></div>
              <div className="h-4 w-11/12 bg-gray-200 rounded-sm"></div>
              <div className="h-4 w-full bg-gray-200 rounded-sm mt-4"></div>
              <div className="h-4 w-10/12 bg-gray-200 rounded-sm"></div>
           </div>
        </article>
      </div>
    </div>
  );
}
