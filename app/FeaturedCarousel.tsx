"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FeaturedPost = {
  id: number;
  title: string;
  category: string;
  pretty_slug: string;
  thumbnail: string | null;
};

export default function FeaturedCarousel({
  posts,
}: {
  posts: FeaturedPost[];
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % posts.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [posts.length]);

  if (!posts.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-[18px] text-[#4f4a45]">Featured Posts</h2>

      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.pretty_slug}`}
              className="relative block min-w-full"
            >
              <div className="aspect-[3/2] w-full bg-[#e8e1d8]">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#8b847b]">
                    No image
                  </div>
                )}
              </div>

            </Link>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {posts.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`h-2.5 w-2.5 rounded-full ${
              idx === current ? "bg-[#8b847b]" : "bg-[#d8d1c8]"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}