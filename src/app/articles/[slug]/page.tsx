"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Template from "../../../template";
import MarkdownRenderer from "../../../components/markdown-renderer";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface ArticleBlock {
  __component: string;
  id: number;
  body?: string;
}

interface FullArticle {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  slug: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt: string | Date;
  cover?: {
    url: string;
  } | null;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  blocks?: ArticleBlock[];
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<FullArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatFullDate = (date: string | Date) => {
    if (!date) return "";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "";

      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      return dateObj.toLocaleDateString("pt-BR", options);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          setError("Artigo não encontrado");
          setLoading(false);
          return;
        }

        setArticle(data.data[0]);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Erro ao carregar o artigo");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <Template>
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando artigo...</p>
          </div>
        </div>
      </Template>
    );
  }

  if (error || !article) {
    return (
      <Template>
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
              {error || "Artigo não encontrado"}
            </h1>
            <p className="text-gray-600 mb-6">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Voltar para o blog
            </Link>
          </div>
        </div>
      </Template>
    );
  }

  const getArticleBlocks = () => {
    if (!article?.blocks || article.blocks.length === 0) {
      return [];
    }

    return article.blocks.filter(
      (block) => block.__component === "shared.rich-text" && block.body
    );
  };

  const articleBlocks = getArticleBlocks();
  const imageUrl =
    article.cover && typeof article.cover === "object" && "url" in article.cover
      ? `${STRAPI_URL}/${article.cover.url}`
      : "/default-img.jpg";

  const createdAtDate =
    typeof article.createdAt === "string"
      ? new Date(article.createdAt)
      : article.createdAt;
  const updatedAtDate =
    typeof article.updatedAt === "string"
      ? new Date(article.updatedAt)
      : article.updatedAt;
  const wasUpdated = updatedAtDate.getTime() !== createdAtDate.getTime();

  return (
    <Template>
      <div className="w-full min-h-screen">
        <article className="w-full">
          {/* Botão voltar */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6 sm:mb-8"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar para o blog
            </Link>
          </div>

          {/* Imagem de capa */}
          {article.cover &&
            typeof article.cover === "object" &&
            "url" in article.cover &&
            article.cover.url && (
              <div className="w-full mb-6 sm:mb-8">
                <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                    unoptimized
                  />
                </div>
              </div>
            )}

          {/* Conteúdo do artigo */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
            {/* Cabeçalho */}
            <header className="mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
                {article.title}
              </h1>

              {/* Description */}
              {article.description && (
                <p className="text-lg sm:text-xl text-gray-600 mb-4 italic">
                  {article.description}
                </p>
              )}

              {/* Meta informações */}
              <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Publicado em:</span>
                  <time dateTime={article.createdAt.toString()}>
                    {formatFullDate(article.createdAt)}
                  </time>
                </div>
                {wasUpdated && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    Atualizado em {formatFullDate(article.updatedAt)}
                  </span>
                )}
                {article.author && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>Por {article.author.name}</span>
                  </>
                )}
                {article.category && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-md">
                      {article.category.name}
                    </span>
                  </>
                )}
              </div>
              <div className="w-full h-px bg-gray-300"></div>
            </header>

            {/* Conteúdo */}
            <div className="prose prose-lg max-w-none">
              {articleBlocks.length > 0 ? (
                articleBlocks.map((block, blockIndex) => (
                  <MarkdownRenderer
                    key={`block-${block.id || blockIndex}`}
                    content={block.body || ""}
                    strapiUrl={STRAPI_URL}
                  />
                ))
              ) : (
                <p className="text-gray-500 italic">Conteúdo não disponível.</p>
              )}
            </div>
          </div>
        </article>
      </div>
    </Template>
  );
}
