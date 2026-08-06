import Link from "next/link";
import {
    categoryLabel,
    categoryColor,
} from "@/lib/category-style";

import {
    industryLabel,
    industryStyle,
} from "@/lib/industry-style";
import {
    homeListTitle,
    homeListItem,
    homeMeta,
    homeChip,
} from "@/lib/home-ui";
import { HomeSection } from "@/components/home/HomeSection";

type PopularPost = {
    id: number;
    title: string;
    category: string;
    industry: string | null;
    pretty_slug: string;
    thumbnail_url: string | null;
    thumbnail_small_url: string | null;
    views: number | null;
    views_boost: number | null;
    comments?: {
        count: number;
    }[];
};

export default function PopularPosts({ posts }: { posts: PopularPost[] }) {
    if (!posts.length) return null;

    return (
        <HomeSection
            title="人気記事ランキング"
            href="/board?sort=views"
        >

            <div className="border-t border-[#e7e1d8]">
                {posts.map((post) => {
                    const thumbnail = post.thumbnail_small_url || post.thumbnail_url;
                    const views = (post.views ?? 0) + (post.views_boost ?? 0);

                    return (
                        <Link
                            key={post.id}
                            href={`/board/${post.pretty_slug}`}
                            className={`flex items-start gap-3 ${homeListItem}`}
                        >
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className={categoryColor(post.category)}>
                                        {categoryLabel(post.category)}
                                    </span>

                                    {post.industry && (
                                        <span className={industryStyle(post.industry)}>
                                            {industryLabel(post.industry)}
                                        </span>
                                    )}

                                    <span className={homeMeta}>{views}閲覧</span>
                                </div>

                                <h3 className={homeListTitle}>{post.title}</h3>
                            </div>

                            {thumbnail && (
                                <div className="h-[74px] w-[100px] shrink-0 bg-[#e8e1d8]">
                                    <img
                                        src={thumbnail}
                                        alt=""
                                        loading="lazy"
                                        className="block h-full w-full object-cover"
                                    />
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </HomeSection>
    );
}