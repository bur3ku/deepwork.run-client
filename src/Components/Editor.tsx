import {EditorState, RichUtils} from 'draft-js';
import DraftEditor from '@draft-js-plugins/editor';
import React, {ReactElement, useState, useRef, useMemo, useCallback} from 'react';
import 'draft-js/dist/Draft.css';
import createMentionPlugin from '@draft-js-plugins/mention';
import createMarkdownPlugin from 'draft-js-markdown-shortcuts-plugin';
import 'katex/dist/katex.min.css';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import { getLaTeXPlugin } from 'draft-js-latex-plugin'
import 'draft-js-latex-plugin/lib/styles.css'
import 'katex/dist/katex.min.css'
import useKeypress from 'react-use-keypress';

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from '@draft-js-plugins/buttons';

import editorStyles from "./Editor.module.css";
import {Task} from '../types/types'

import "@draft-js-plugins/mention/lib/plugin.css";
import '@draft-js-plugins/inline-toolbar/lib/plugin.css'
import '@draft-js-plugins/static-toolbar/lib/plugin.css';

const LaTeXPlugin = getLaTeXPlugin();

interface Props {
  onChange: Function
  hideDetails: Function,
  tasks: Task[]
  id: number
  showDetails: Function
  editorState: EditorState
  setEditorState: Function
}

export default function Editor(props:Props):ReactElement {
  const editorRef = useRef<any>();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Task[]> (props.tasks);
  const [LaTeXBlockOpen, setLaTeXBlockOpen] = useState(false);
  
  useKeypress('Escape', () => {
    if(LaTeXBlockOpen) setLaTeXBlockOpen(false);
    else {
      setLaTeXBlockOpen(true);
      props.hideDetails();
    }
  })

  const [ MentionSuggestions, StaticToolbar, plugins ] = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      mentionTrigger: "@",
      mentionComponent: (mentionProps:any) => {
        return (
          <span
            className={`taskMention`}
            onClick={() => {
              props.showDetails(mentionProps.mention.id);
            }}
          >
            {mentionProps.children}
          </span>
        );
      }
    });
    
    const toolbarPlugin = createToolbarPlugin();
    const markdownPlugin = createMarkdownPlugin();
    // eslint-disable-next-line no-shadow
    const { MentionSuggestions } = mentionPlugin;
    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin, toolbarPlugin, LaTeXPlugin, markdownPlugin];
    return [ MentionSuggestions, toolbarPlugin.Toolbar, plugins ];
    //eslint-disable-next-line
  },[]);

  const onOpenChange = useCallback((_open: boolean) => {
    setOpen(_open);
  }, []);

  const tasksSuggestionsFilter = (value:string) => {
    return props.tasks.filter((task:Task)=>task.name.startsWith(value));
  }
  const onSearchChange = useCallback(({ value }: { value: string }) => {
    setSuggestions(tasksSuggestionsFilter(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (newEditorState:EditorState) => {
    props.setEditorState(newEditorState);
    props.onChange(newEditorState, props.id);
  }
  
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    if(command==="insert-texblock") setLaTeXBlockOpen(true);
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  }
  return (
    <div
      className={editorStyles.editor}
      onClick={() => {
        editorRef.current.focus();
      }}
    >
      <StaticToolbar>
      {
        // may be use React.Fragment instead of div to improve perfomance after React 16
        (externalProps) => (
          <React.Fragment>
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <UnderlineButton {...externalProps} />
            <CodeButton {...externalProps} />
            <UnorderedListButton {...externalProps} />
            <OrderedListButton {...externalProps} />
            <BlockquoteButton {...externalProps} />
            <CodeBlockButton {...externalProps} />
            <HeadlineOneButton {...externalProps} />
            <HeadlineTwoButton {...externalProps} />
            <HeadlineThreeButton {...externalProps} />
          </React.Fragment>
        )
      }
      </StaticToolbar>
      <DraftEditor
        editorState={props.editorState}
        onChange={onChange}
        plugins={plugins}
        ref={editorRef}
        handleKeyCommand={handleKeyCommand}
        placeholder="Tasks reference: '@'. Inline equation: '$'. Block equation: ctrl+M."
      />
      <button type="button" style={{backgroundColor:"lightblue"}} onClick={()=>props.hideDetails()}>Hide Details</button>
      <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
      />
      
    </div>
  )
}