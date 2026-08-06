type CommentActionVariant = "reply" | "edit" | "delete" | "cancel" | "save";

const styles: Record<CommentActionVariant, string> = {
  reply:
    "border-[#b9c8b5] text-[#687b63]",
  edit:
    "border-[#c9c1dc] text-[#70648a]",
  delete:
    "border-[#d7b8ad] text-[#a1644f]",
  cancel:
    "border-[#d6cec3] text-[#8f877f]",
  save:
    "border-[#cdbf95] text-[#8a7240]",
};

export default function CommentActionButton({
  variant,
  onClick,
  disabled,
  children,
}: {
  variant: CommentActionVariant;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        border border-dotted
        px-2.5 py-0.5
        text-[11px] leading-5
        transition
        disabled:opacity-40
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  );
}