"use client";
import { useState, useEffect, useMemo } from "react";
import Template from "../template";
import Card, { Article } from "../components/card";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface ArticleBlock {
  __component: string;
  id: number;
  body?: string;
}

interface ApiArticle {
  id: number;
  title: string;
  description?: string;
  slug: string;
  createdAt: string | Date;
  publishedAt: string | Date;
  documentId: string;
  cover?: {
    url: string;
  } | null;
  blocks?: ArticleBlock[];
}

console.log(
  "process.env.NEXT_PUBLIC_STRAPI_URL",
  process.env.NEXT_PUBLIC_STRAPI_URL
);

console.log("existe uma env:", process.env.NEXT_PUBLIC_STRAPI_URL);

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);

  const formatDate = (date: string | Date) => {
    if (!date) return "";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "";

      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");

      return `${month}/${day}/${year}`;
    } catch {
      return "";
    }
  };

  const getYearFromDate = (date: string | Date): number => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return new Date().getFullYear();
      return dateObj.getUTCFullYear();
    } catch {
      return new Date().getFullYear();
    }
  };

  const articlesByYear = useMemo(() => {
    const grouped: Record<number, Article[]> = {};

    articles.forEach((article) => {
      const year = getYearFromDate(article.publishedAt);
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(article);
    });

    const sortedYears = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);

    const result: Array<{ year: number; articles: Article[] }> = [];

    sortedYears.forEach((year) => {
      const sortedArticles = grouped[year].sort((a, b) => {
        const dateA =
          typeof a.publishedAt === "string"
            ? new Date(a.publishedAt)
            : a.publishedAt;
        const dateB =
          typeof b.publishedAt === "string"
            ? new Date(b.publishedAt)
            : b.publishedAt;
        return dateA.getTime() - dateB.getTime();
      });

      result.push({ year, articles: sortedArticles });
    });

    return result;
  }, [articles]);

  const extractContent = (article: ApiArticle): string => {
    if (article.blocks && Array.isArray(article.blocks)) {
      const richTextBlock = article.blocks.find(
        (block) => block.__component === "shared.rich-text" && block.body
      );
      if (richTextBlock?.body) {
        const preview = richTextBlock.body.split("\n\n")[0];
        return preview.length > 150
          ? preview.substring(0, 150) + "..."
          : preview;
      }
    }

    return article.description || "Sem descrição disponível";
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${STRAPI_URL}/api/articles?populate=*`);
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data = await response.json();

        const transformedArticles: Article[] = (data.data || []).map(
          (article: ApiArticle) => ({
            id: String(article.id),
            title: article.title,
            content: extractContent(article),
            cover: article.cover || undefined,
            publishedAt: article.createdAt,
            documentId: article.documentId,
            slug: article.slug,
          })
        );

        setArticles(transformedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Template>
      <div className="w-full min-h-screen">
        <div className="p-4 sm:p-6 w-full flex items-center flex-col">
          <div className="w-full max-w-7xl flex items-center flex-col">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center">
              Dev Notes
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-8 text-center max-w-3xl px-4">
              Compartilhando o que aprendo, estudo e descubro no mundo do
              desenvolvimento de software
            </p>

            <div className="w-full">
              {articlesByYear.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Nenhum artigo encontrado ainda.
                  </p>
                </div>
              ) : (
                articlesByYear.map(({ year, articles: yearArticles }) => (
                  <div key={year} className="mb-12 sm:mb-16">
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                        {year}
                      </h2>
                      <div className="w-full h-px bg-gray-300"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
                      {yearArticles.map((article) => (
                        <div
                          key={article.id}
                          className="w-full h-auto min-h-[400px] sm:min-h-[400px]"
                        >
                          <Card
                            article={article}
                            strapiUrl={STRAPI_URL}
                            formatDate={formatDate}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}
