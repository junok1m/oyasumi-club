/**
 * Central write permissions for board posts.
 *
 * Policy (v2):
 * - Anyone (incl. anonymous): qa, review — published immediately
 * - shop: jobs, promo (pending review)
 * - admin: all categories (approved)
 * - girl / client: legacy only; new signups should be shop-focused
 */

export type AppRole = "admin" | "shop" | "girl" | "client";

export type BoardCategory =
  | "news"
  | "blog"
  | "jobs"
  | "promo"
  | "qa"
  | "review";

/** Categories anyone can write without logging in */
export const OPEN_WRITE_CATEGORIES: readonly BoardCategory[] = [
  "qa",
  "review",
] as const;

const ALL_CATEGORIES: BoardCategory[] = [
  "news",
  "blog",
  "jobs",
  "promo",
  "qa",
  "review",
];

export function isOpenWriteCategory(
  category: string
): category is BoardCategory {
  return (OPEN_WRITE_CATEGORIES as readonly string[]).includes(category);
}

/**
 * Categories the current user may select on the write form.
 * `role === null` means anonymous / not logged in.
 */
export function getAllowedCategories(
  role: string | null | undefined
): BoardCategory[] {
  // Always include open categories for everyone (including anon)
  const open = [...OPEN_WRITE_CATEGORIES];

  if (!role) {
    return open;
  }

  switch (role) {
    case "admin":
      return [...ALL_CATEGORIES];
    case "shop":
      // jobs + promo + open community boards
      return ["jobs", "promo", ...open];
    case "girl":
      // legacy accounts: keep previous capabilities + open boards
      return ["blog", ...open];
    case "client":
    default:
      return open;
  }
}

export function canWriteCategory(
  role: string | null | undefined,
  category: string
): boolean {
  return getAllowedCategories(role).includes(category as BoardCategory);
}

/** True if this category requires a logged-in account */
export function requiresAuthToWrite(category: string): boolean {
  return !isOpenWriteCategory(category);
}

/**
 * Status to set on insert.
 * Open boards go live immediately; shop jobs/promo stay pending;
 * admin posts are approved.
 */
export function statusForNewPost(
  role: string | null | undefined,
  category: string
): "approved" | "pending" {
  if (isOpenWriteCategory(category)) {
    return "approved";
  }
  if (role === "admin") {
    return "approved";
  }
  return "pending";
}

export function categoryLabelJa(cat: string): string {
  switch (cat) {
    case "news":
      return "ニュース";
    case "blog":
      return "ブログ";
    case "jobs":
      return "求人";
    case "promo":
      return "プロモーション";
    case "qa":
      return "Q&A";
    case "review":
      return "口コミ";
    default:
      return cat;
  }
}
