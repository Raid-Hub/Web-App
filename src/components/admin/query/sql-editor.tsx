"use client"

import { sql } from "@codemirror/lang-sql"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { vscodeLight } from "@uiw/codemirror-theme-vscode"
import { useEffect, useRef } from "react"

interface SqlEditorProps {
    value: string
    onChange: (value: string) => void
}

export function SqlEditor({ value, onChange }: SqlEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)

    useEffect(() => {
        if (!editorRef.current) return

        const startState = EditorState.create({
            doc: value,
            extensions: [
                basicSetup,
                sql(),
                vscodeLight,
                EditorView.updateListener.of(update => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString())
                    }
                }),
                EditorView.theme({
                    "&": {
                        backgroundColor: "rgb(26, 26, 26)",
                        color: "#d4d4d4",
                        fontSize: "14px"
                    },
                    ".cm-content": {
                        fontFamily: '"Courier New", monospace',
                        padding: "10px"
                    },
                    ".cm-gutters": {
                        backgroundColor: "rgb(20, 20, 20)",
                        color: "#858585",
                        border: "none"
                    },
                    ".cm-activeLineGutter": {
                        backgroundColor: "rgb(30, 30, 30)"
                    },
                    ".cm-activeLine": {
                        backgroundColor: "rgb(30, 30, 30)"
                    },
                    ".cm-cursor": {
                        borderLeftColor: "#d4d4d4"
                    },
                    ".cm-selectionBackground": {
                        backgroundColor: "rgba(100, 100, 100, 0.4) !important"
                    },
                    "&.cm-focused .cm-selectionBackground": {
                        backgroundColor: "rgba(100, 100, 100, 0.4) !important"
                    }
                }),
                EditorView.lineWrapping
            ]
        })

        const view = new EditorView({
            state: startState,
            parent: editorRef.current
        })

        viewRef.current = view

        return () => {
            view.destroy()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: value
                }
            })
        }
    }, [value])

    return (
        <div
            ref={editorRef}
            className="w-full overflow-hidden rounded-md border border-white/10"
        />
    )
}
