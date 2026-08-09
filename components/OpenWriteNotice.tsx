import Link from "next/link";

export default function OpenWriteNotice({
  kind = "qa",
}: {
  kind?: "qa" | "review";
}) {
  const title =
    kind === "review" ? "匿名で口コミを書く" : "匿名で質問する";

  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-2xl font-semibold text-[#4f3a4f]">{title}</h1>

      <div className="rounded-2xl border border-pink-100 bg-[#fff0f5] px-4 py-4 text-[13px] leading-6 text-[#6b5568]">
        <p className="font-bold text-pink-500">匿名投稿について</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>ログインなしで投稿・返信できます。</li>
          <li>表示名はランダム（コアラ・ラクーンなど）になります。</li>
          <li>
            <span className="font-semibold text-[#4f3a4f]">
              投稿後の編集・削除はできません。
            </span>
          </li>
        </ul>
        <p className="mt-3 text-[12px] text-[#9b7892]">
          いいね・保存や、自分の投稿の管理をしたい方は{" "}
          <Link href="/signup" className="font-bold text-pink-500 underline">
            会員登録
          </Link>
          がおすすめです。
        </p>
      </div>
    </div>
  );
}
