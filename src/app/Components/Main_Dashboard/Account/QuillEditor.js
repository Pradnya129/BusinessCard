"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

export default function QuillEditor({ value, onChange }) {
  if (typeof window === "undefined") return null; // <-- prevents server render
  return <ReactQuill theme="snow" value={value} onChange={onChange} />;
}
