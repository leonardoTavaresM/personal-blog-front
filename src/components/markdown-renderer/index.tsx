"use client";
import Image from "next/image";
import { useMemo, useCallback, JSX } from "react";

interface MarkdownRendererProps {
  content: string;
  strapiUrl?: string;
}

export default function MarkdownRenderer({
  content,
  strapiUrl = "http://localhost:1337",
}: MarkdownRendererProps) {
  const processInlineText = useCallback(
    (text: string, keyOffset: number = 0): JSX.Element[] => {
      const parts: JSX.Element[] = [];
      let key = keyOffset;

      const youtubeRegex =
        /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+))/g;
      const youtubeMatches = Array.from(text.matchAll(youtubeRegex));

      if (youtubeMatches.length > 0) {
        let lastIndex = 0;
        youtubeMatches.forEach((match) => {
          if (match.index !== undefined && match.index > lastIndex) {
            const beforeText = text.substring(lastIndex, match.index);
            if (beforeText.trim()) {
              parts.push(<span key={`text-${key++}`}>{beforeText}</span>);
            }
          }

          const videoId = match[2];
          parts.push(
            <div key={`youtube-${key++}`} className="my-6">
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );

          lastIndex = (match.index || 0) + match[0].length;
        });

        if (lastIndex < text.length) {
          const remainingText = text.substring(lastIndex);
          if (remainingText.trim()) {
            parts.push(<span key={`text-${key++}`}>{remainingText}</span>);
          }
        }
      } else {
        parts.push(<span key={`text-${key++}`}>{text}</span>);
      }

      return parts;
    },
    []
  );

  const renderContent = useMemo(() => {
    if (!content) return null;

    const elements: JSX.Element[] = [];
    let key = 0;

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{
      type: "text" | "code";
      content: string;
      lang?: string;
    }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }

      parts.push({
        type: "code",
        content: match[2],
        lang: match[1] || "text",
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      });
    }

    parts.forEach((part) => {
      if (part.type === "code") {
        elements.push(
          <div key={`code-${key++}`} className="mb-6">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              {part.lang && (
                <div className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-mono">
                  {part.lang}
                </div>
              )}
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-gray-100 font-mono whitespace-pre">
                  {part.content}
                </code>
              </pre>
            </div>
          </div>
        );
      } else {
        const text = part.content;
        const paragraphs = text.split(/\n\n+/);

        paragraphs.forEach((paragraph) => {
          if (!paragraph.trim()) return;

          const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
          const imageMatches = Array.from(paragraph.matchAll(imageRegex));

          if (imageMatches.length > 0) {
            let textIndex = 0;
            imageMatches.forEach((imgMatch) => {
              if (imgMatch.index !== undefined && imgMatch.index > textIndex) {
                const beforeText = paragraph.substring(
                  textIndex,
                  imgMatch.index
                );
                if (beforeText.trim()) {
                  elements.push(
                    <p key={`p-${key++}`} className="mb-6">
                      {processInlineText(beforeText, key * 1000)}
                    </p>
                  );
                }
              }

              const alt = imgMatch[1];
              let imageUrl = imgMatch[2];
              if (
                imageUrl.startsWith("/uploads/") ||
                imageUrl.startsWith("http://localhost:1337/uploads/")
              ) {
                if (!imageUrl.startsWith("http")) {
                  imageUrl = `${strapiUrl}${imageUrl}`;
                }
              }

              elements.push(
                <div key={`img-${key++}`} className="my-6">
                  <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={alt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 768px"
                      unoptimized
                    />
                  </div>
                </div>
              );

              textIndex = (imgMatch.index || 0) + imgMatch[0].length;
            });

            if (textIndex < paragraph.length) {
              const remainingText = paragraph.substring(textIndex);
              if (remainingText.trim()) {
                elements.push(
                  <p key={`p-${key++}`} className="mb-6">
                    {processInlineText(remainingText, key * 1000)}
                  </p>
                );
              }
            }
          } else {
            elements.push(
              <p key={`p-${key++}`} className="mb-6">
                {processInlineText(paragraph, key * 1000)}
              </p>
            );
          }
        });
      }
    });

    return elements;
  }, [content, strapiUrl, processInlineText]);

  return (
    <div className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700">
      {renderContent}
    </div>
  );
}
