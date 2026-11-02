import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { tags as t } from '@lezer/highlight';

// Colors come from the --code-* tokens in styles.css, so the editor follows the light/dark theme.
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: 'var(--code-keyword)', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: 'var(--code-string)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--code-number)' },
  { tag: t.comment, color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: [t.function(t.definition(t.variableName)), t.definition(t.className)], color: 'var(--code-def)', fontWeight: '600' },
  { tag: [t.self, t.atom], color: 'var(--code-number)' },
]);

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--surface)', color: 'var(--ink)', fontSize: '0.92rem' },
  '.cm-content': { fontFamily: 'var(--mono)', caretColor: 'var(--ink)' },
  '.cm-gutters': { backgroundColor: 'var(--soft)', color: 'var(--faint)', borderRight: '1px solid var(--line)' },
  '.cm-activeLine': { backgroundColor: 'var(--code-active)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--code-active)', color: 'var(--ink)' },
  '.cm-cursor': { borderLeftColor: 'var(--ink)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--code-selection) !important' },
  '.cm-matchingBracket': { backgroundColor: 'var(--code-selection)', outline: 'none' },
});

// Python editor. `value` is the initial text; later changes to it (e.g. Reset) replace
// the document as one undoable edit. Remount with a new `key` to start a fresh history.
export default function CodeEditor({ value, onChange, label }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const view = new EditorView({
      parent: hostRef.current,
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        indentUnit.of('    '),
        python(),
        syntaxHighlighting(highlight),
        theme,
        EditorView.contentAttributes.of({ 'aria-label': label }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });
    viewRef.current = view;
    return () => view.destroy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  return <div className="code-editor" ref={hostRef} />;
}
