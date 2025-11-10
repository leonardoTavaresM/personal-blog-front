import Image from "next/image";
import Link from "next/link";

export interface Article {
  id: string;
  title: string;
  content: string;
  cover?: {
    url: string;
  };
  publishedAt: string | Date;
  documentId: string;
  slug: string;
}

export interface CardProps {
  article: Article;
  strapiUrl: string;
  formatDate: (date: string | Date) => string;
}

export default function Card({ article, strapiUrl, formatDate }: CardProps) {
  const imageUrl = article.cover?.url
    ? `${strapiUrl}${article.cover.url}`
    : "/default-img.jpg";
  console.log("imageUrl", imageUrl);
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block w-full h-full no-underline text-inherit"
    >
      <article className="w-full h-full p-2 sm:p-3 bg-white shadow-md rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
        <div className="w-full h-58 sm:h-58 relative flex-shrink-0">
          <Image
            className="object-cover rounded-t-lg"
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority
            unoptimized
          />
        </div>

        <div className="p-3 sm:p-4 flex-1 flex flex-col min-h-0">
          <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 flex-1 overflow-hidden line-clamp-3">
            {article.content}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-auto">
            Published: {formatDate(article.publishedAt)}
          </p>
        </div>
      </article>
    </Link>
  );
}
