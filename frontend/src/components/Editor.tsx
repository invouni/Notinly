import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Paragraph from "@tiptap/extension-paragraph"
import { mergeAttributes } from "@tiptap/core"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textColor: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) =>
          attributes.textColor
            ? { style: `color: ${attributes.textColor}` }
            : {},
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) =>
          attributes.backgroundColor
            ? { style: `background-color: ${attributes.backgroundColor}` }
            : {},
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes), 0]
  },
})

interface EditorProps {
  title: string
  content?: string
  onChange?: (content: string) => void
  onTitleChange?: (title: string) => void
}

export default function Editor({
  title,
  content = "",
  onChange,
  onTitleChange,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      Underline,
      CustomParagraph,
    ],

    content,

    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },

    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[60vh] max-w-4xl mx-auto px-8 py-6 outline-none text-foreground leading-8",
      },
    },
  })

  if (!editor) return null

  const toolButton = (
    label: string,
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode
  ) => (
    <Button
      key={label}
      type="button"
      size="icon"
      variant="ghost"
      title={label}
      className={active ? "bg-accent text-primary" : ""}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Editable note title */}
      <div className="mx-auto w-full max-w-4xl px-8 pt-8 pb-4">
        <input
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-y border-border px-4 py-2">
        {toolButton(
          "Bold",
          editor.isActive("bold"),
          () => editor.chain().focus().toggleBold().run(),
          <Bold size={17} />
        )}

        {toolButton(
          "Italic",
          editor.isActive("italic"),
          () => editor.chain().focus().toggleItalic().run(),
          <Italic size={17} />
        )}

        {toolButton(
          "Underline",
          editor.isActive("underline"),
          () => editor.chain().focus().toggleUnderline().run(),
          <UnderlineIcon size={17} />
        )}

        {toolButton(
          "Bullet list",
          editor.isActive("bulletList"),
          () => editor.chain().focus().toggleBulletList().run(),
          <List size={17} />
        )}

        {toolButton(
          "Numbered list",
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run(),
          <ListOrdered size={17} />
        )}

        <div className="mx-2 h-6 w-px bg-border" />

        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
          Text
          <input
            type="color"
            title="Text colour"
            className="h-6 w-6 cursor-pointer border-0 bg-transparent"
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .updateAttributes("paragraph", {
                  textColor: e.target.value,
                })
                .run()
            }
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
          Background
          <input
            type="color"
            title="Paragraph background colour"
            className="h-6 w-6 cursor-pointer border-0 bg-transparent"
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .updateAttributes("paragraph", {
                  backgroundColor: e.target.value,
                })
                .run()
            }
          />
        </label>
      </div>

      {/* Writing area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
