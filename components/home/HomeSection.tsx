import Link from "next/link";
import {
  homeSectionTitle,
  homeMoreLink,
  homeSectionSpacing,
} from "@/lib/home-ui";

export function HomeSection({
  title,
  href,
  linkText = "もっと見る →",
  children,
}: {
  title: string;
  href?: string;
  linkText?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={homeSectionSpacing}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className={homeSectionTitle}>{title}</h2>

        {href && (
          <Link href={href} className={homeMoreLink}>
            {linkText}
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}