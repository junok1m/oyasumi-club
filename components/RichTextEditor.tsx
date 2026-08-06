"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  function normalizeUrl(url: string) {
    const trimmed = url.trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("mailto:")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "board-editor-image",
        },
      }),

      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "underline text-[#7f776f]",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] px-3 py-3 text-sm leading-7 outline-none " +
          "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold " +
          "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold " +
          "[&_p]:my-3 " +
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 " +
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_li]:my-1 " +
          "[&_a]:text-[#7f776f] [&_a]:underline [&_a]:underline-offset-2 " +
          "[&_hr]:my-6 [&_hr]:border-[#e7e1d8] " +
          "[&_strong]:font-semibold " +
          "[&_img]:my-4 [&_img]:block [&_img]:w-full [&_img]:h-auto " +
          "[&_img]:border [&_img]:border-dotted [&_img]:border-[#d8d1c7] " +
          "[&_img]:bg-[#f7f4ee]",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  function setLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URLを入力してください", previousUrl || "");

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalizedUrl })
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .insertContent(
        `<a href="${normalizedUrl}" target="_blank" rel="noopener noreferrer">${normalizedUrl}</a>`
      )
      .run();
  }

  function setImage() {
    if (!editor) return;

    const url = window.prompt("画像URLを入力してください");

    if (url === null) return;

    const trimmed = url.trim();

    if (!trimmed) return;

    const normalizedUrl = normalizeUrl(trimmed);

    editor.chain().focus().setImage({ src: normalizedUrl, alt: "" }).run();
  }

  return (
    <div className="border border-[#e7e1d8] bg-white">
      <div className="sticky top-0 z-20 flex flex-wrap gap-1 border-b border-[#eee8df] bg-[#fbf8f2] px-2 py-2 text-xs text-[#5f5a54]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 ${
            editor.isActive("bold") ? "bg-[#e7e1d8]" : "hover:bg-[#f0ebe3]"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 italic ${
            editor.isActive("italic") ? "bg-[#e7e1d8]" : "hover:bg-[#f0ebe3]"
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#e7e1d8]"
              : "hover:bg-[#f0ebe3]"
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 ${
            editor.isActive("bulletList") ? "bg-[#e7e1d8]" : "hover:bg-[#f0ebe3]"
          }`}
        >
          List
        </button>

        <button
          type="button"
          disabled={!editor}
          onClick={setLink}
          className={`rounded px-2 py-1 disabled:opacity-40 ${
            editor.isActive("link") ? "bg-[#e7e1d8]" : "hover:bg-[#f0ebe3]"
          }`}
        >
          Link
        </button>

        <button
          type="button"
          onClick={setImage}
          className="rounded px-2 py-1 hover:bg-[#f0ebe3]"
        >
          Image
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="rounded px-2 py-1 hover:bg-[#f0ebe3]"
        >
          ―
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}