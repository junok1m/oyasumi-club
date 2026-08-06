type MyProfile = {
  id: string;
  email: string | null;
  role: string;
  display_name: string | null;
  work_category: string | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
};

export default function ProfileForm({
  profileLoading,
  profile,
  role,
  setRole,
  displayName,
  setDisplayName,
  location,
  setLocation,
  workCategory,
  setWorkCategory,
  bio,
  setBio,
  website,
  setWebsite,
  phone,
  setPhone,
  saving,
  onSave,
}: {
  profileLoading: boolean;
  profile: MyProfile | null;
  role: string;
  setRole: (value: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  workCategory: string;
  setWorkCategory: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <section className="space-y-4 border-b border-[#e4ddd4] pb-6">
      {profileLoading ? (
        <div className="py-6 text-sm text-[#948d85]">Loading profile...</div>
      ) : !profile ? (
        <div className="py-6 text-sm text-[#948d85]">
          Failed to load profile.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[96px_1fr] items-center gap-3">
            <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
              email
            </label>

            <div className="rounded-xl border border-[#d7cec3] bg-[#f8f4ee] px-3 py-2 text-[14px] text-[#57514b]">
              {profile.email || "-"}
            </div>
          </div>

          <div className="grid grid-cols-[96px_1fr] items-center gap-3">
            <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
              role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="min-w-0 rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
            >
              <option value="">Select role</option>
              <option value="client">Client</option>
              <option value="girl">Girl</option>
              <option value="shop">Shop</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[96px_1fr] items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                display name
              </label>

              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
                className="min-w-0 rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                placeholder="e.g. sakura"
              />
            </div>

            <div className="grid grid-cols-[96px_1fr] items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                location
              </label>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-w-0 rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                placeholder="e.g. Sydney"
              />
            </div>

            <div className="grid grid-cols-[96px_1fr] items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                website
              </label>

              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="min-w-0 rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-[96px_1fr] items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                phone
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="min-w-0 rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                placeholder="04xx xxx xxx"
              />
            </div>

            <div className="grid grid-cols-[96px_1fr] items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                work type
              </label>

              <select
                value={workCategory}
                onChange={(e) => setWorkCategory(e.target.value)}
                className="min-w-0 rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
              >
                <option value="">Select category</option>
                <option value="fuzoku">風俗</option>
                <option value="karaoke">カラオケ</option>
                <option value="massage">マッサージ</option>
                <option value="club">クラブ</option>
                <option value="restaurant">レストラン</option>
                <option value="bar">バー</option>
              </select>
            </div>

            <div className="grid grid-cols-[96px_1fr] items-start gap-3">
              <label className="pt-2 text-[10px] uppercase tracking-[0.16em] text-[#9a9187]">
                bio
              </label>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="min-w-0 resize-none rounded-xl border border-[#d7cec3] bg-white px-3 py-2 text-[14px] outline-none"
                placeholder="short intro..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-full border border-[#cdbba0] bg-[#f3e7d2] px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-[#6f5e44] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}