import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Editor } from '@tiptap/core'
import type { Transaction } from 'prosemirror-state'
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
  value: string | null | undefined
  onChange?: (html: string) => void
  editable?: boolean
  truncateLength?: number
}

type TiptapUpdatePayload = {
  editor: Editor
  transaction: Transaction
  appendedTransactions: Transaction[]
}

function truncateHtml (html: string, maxLength: number) {
  if (!html) return ''

  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.textContent || div.innerText || ''

  if (text.length <= maxLength) return html

  const truncated = text.slice(0, maxLength).trim() + '…'
  return truncated
}

export default function RichTextEditor({
  value,
  onChange,
  editable = true,
  truncateLength = 150,
}: RichTextEditorProps) {
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

  const content =
    !editable && truncateLength ? truncateHtml(value || '', truncateLength) : value || ''

  const editor = useEditor({
    extensions: [StarterKit],
    content,
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
