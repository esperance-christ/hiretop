import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Editor } from '@tiptap/core'
import type { Transaction } from 'prosemirror-state'
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
  value: string | null | undefined
  onChange?: (html: string) => void
  editable?: boolean
}

type TiptapUpdatePayload = {
  editor: Editor
  transaction: Transaction
  appendedTransactions: Transaction[]
}

export default function RichTextEditor({ value, onChange, editable = true }: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const updateHandler: ((payload: TiptapUpdatePayload) => void) | undefined =
    editable && onChange
      ? (payload) => {
          onChange(payload.editor.getHTML())
        }
      : undefined

  // Toujours appeler useEditor
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: updateHandler,
    editable,
    editorProps: {
      attributes: {
        class: `prose focus:outline-none min-h-[150px] ${!editable ? 'cursor-default' : ''}`,
      },
    },
    immediatelyRender: false,
  })

  if (!isClient || !editor) {
    return <div className="p-4 rounded-xl">Chargement...</div>
  }

  const containerClasses = editable
    ? 'rounded-xl p-3 shadow-sm'
    : 'border border-gray-100 rounded-xl p-3 bg-gray-50'

  return (
    <div className={containerClasses}>
      <EditorContent editor={editor} />
    </div>
  )
}
