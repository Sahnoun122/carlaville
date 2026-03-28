import { useTranslations } from 'next-intl';

export default function BlogsLoading() {
  const t = useTranslations('blogs');

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md w-64 mx-auto mb-4"></div>
          <div className="h-5 bg-gray-200 rounded-md w-96 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 w-full"></div>
              <div className="p-6 space-y-4">
                <div className="h-3 bg-gray-200 w-24 rounded"></div>
                <div className="h-6 bg-gray-200 w-full rounded"></div>
                <div className="h-6 bg-gray-200 w-3/4 rounded"></div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-gray-200 w-full rounded"></div>
                  <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                  <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 w-20 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
