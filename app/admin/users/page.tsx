import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  makeAdminAction,
  makeShopAction,
  makeClientAction,
  makeGirlAction,
} from "./actions";

type AdminUser = {
  id: string;
  email: string | null;
  role: string;
  display_name: string | null;
  created_at: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-AU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function requireAdminPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return user;
}

async function getAdminUsers(queryText: string, roleFilter: string) {
  const admin = supabaseAdmin();

  let query = admin
    .from("profiles")
    .select("id, email, role, display_name, created_at")
    .order("created_at", { ascending: false });

  if (roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

  if (queryText.trim()) {
    query = query.or(
      `email.ilike.%${queryText.trim()}%,display_name.ilike.%${queryText.trim()}%`
    );
  }

  const { data, error } = await query.limit(200);

  if (error || !data) {
    console.error("admin users fetch error:", error);
    return [];
  }

  return data as AdminUser[];
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const me = await requireAdminPage();

  const params = await searchParams;
  const q = params.q?.trim() || "";
  const role =
    params.role && ["all", "admin", "shop", "client", "girl"].includes(params.role)
      ? params.role
      : "all";

  const users = await getAdminUsers(q, role);

  const tabs = [
    { label: "All", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Shop", value: "shop" },
    { label: "Client", value: "client" },
    { label: "Girl", value: "girl" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#5f5a54]">
      <div className="mx-auto w-[94%] max-w-6xl py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-medium text-[#4f4a45]">Admin / Users</h1>
            <p className="mt-1 text-[12px] text-[#948d85]">
              Search users and change roles.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            <Link href="/admin/posts" className="text-[#8e8a84] hover:underline">
              Posts
            </Link>
            <Link href="/profile" className="text-[#8e8a84] hover:underline">
              ← Back to profile
            </Link>
          </div>
        </div>

        <form className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search email or display name"
            className="min-w-60 border border-[#ddd6cc] bg-[#fbf8f3] px-3 py-2 text-[13px] outline-none"
          />
          <input type="hidden" name="role" value={role} />
          <button
            type="submit"
            className="border border-[#d8d1c8] px-3 py-2 text-[12px] text-[#4f4a45]"
          >
            search
          </button>
          {q && (
            <Link
              href={`/admin/users?role=${role}`}
              className="border border-[#e2dbd2] px-3 py-2 text-[12px] text-[#8e8a84]"
            >
              clear
            </Link>
          )}
        </form>

        <div className="mb-6 flex flex-wrap gap-2 text-[12px]">
          {tabs.map((tab) => {
            const active = role === tab.value;
            const href = q
              ? `/admin/users?role=${tab.value}&q=${encodeURIComponent(q)}`
              : `/admin/users?role=${tab.value}`;

            return (
              <Link
                key={tab.value}
                href={href}
                className={`border px-3 py-1.5 ${
                  active
                    ? "border-[#5f5a54] text-[#4f4a45]"
                    : "border-[#ddd6cc] text-[#8e8a84]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {users.length === 0 ? (
          <div className="py-20 text-sm text-[#948d85]">No users.</div>
        ) : (
          <div className="overflow-x-auto border border-[#e7e0d7] bg-[#fbf8f3]">
            <table className="w-full min-w-275 text-left text-[13px]">
              <thead className="border-b border-[#e7e0d7] text-[#8e8a84]">
                <tr>
                  <th className="px-3 py-3 font-normal">Display Name</th>
                  <th className="px-3 py-3 font-normal">Email</th>
                  <th className="px-3 py-3 font-normal">Role</th>
                  <th className="px-3 py-3 font-normal">Created</th>
                  <th className="px-3 py-3 font-normal">UUID</th>
                  <th className="px-3 py-3 font-normal">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === me.id;

                  return (
                    <tr key={user.id} className="border-b border-[#eee7de] align-top">
                      <td className="px-3 py-3 text-[#4f4a45]">
                        {user.display_name?.trim() || "Unnamed"}
                      </td>
                      <td className="px-3 py-3 text-[#5f5a54]">
                        {user.email || "-"}
                      </td>
                      <td className="px-3 py-3 text-[#948d85]">{user.role}</td>
                      <td className="px-3 py-3 text-[#948d85]">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#948d85]">
                        <div className="max-w-65 break-all">{user.id}</div>
                      </td>

                      <td className="px-3 py-3">
                        {isSelf ? (
                          <span className="text-[12px] text-[#a2988f]">
                            You cannot change your own role
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {user.role !== "admin" && (
                              <form action={makeAdminAction}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button
                                  type="submit"
                                  className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                                >
                                  make admin
                                </button>
                              </form>
                            )}

                            {user.role !== "shop" && (
                              <form action={makeShopAction}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button
                                  type="submit"
                                  className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                                >
                                  make shop
                                </button>
                              </form>
                            )}

                            {user.role !== "client" && (
                              <form action={makeClientAction}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button
                                  type="submit"
                                  className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                                >
                                  make client
                                </button>
                              </form>
                            )}

                            {user.role !== "girl" && (
                              <form action={makeGirlAction}>
                                <input type="hidden" name="userId" value={user.id} />
                                <button
                                  type="submit"
                                  className="border border-[#d8d1c8] px-2 py-1 text-[12px]"
                                >
                                  make girl
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}