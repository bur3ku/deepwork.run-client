import {EditorState, RichUtils, convertToRaw, convertFromRaw} from 'draft-js';
import DraftEditor from '@draft-js-plugins/editor';
import React, {ReactElement, useState, useRef, useMemo, useCallback} from 'react';

import 'draft-js/dist/Draft.css';
import createMentionPlugin from '@draft-js-plugins/mention';
import 'katex/dist/katex.min.css';
import 'draft-js-latex-plugin/lib/styles.css'
import 'katex/dist/katex.min.css'
import editorStyles from "./TaskListEditor.module.css";
import {Task,TimeBlock} from '../types/types';
import {User} from '../classes';
import "@draft-js-plugins/mention/lib/plugin.css";
import '@draft-js-plugins/inline-toolbar/lib/plugin.css'
import '@draft-js-plugins/static-toolbar/lib/plugin.css';

interface Props {
  tasks: Task[]
  id: number
  showDetails: Function
  user:User
  block:TimeBlock
  updateUser:Function
  setNameValidity:Function
}

export default function TaskListEditor(props:Props):ReactElement {
  const editorRef = useRef<any>();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Task[]> (props.tasks);
  const [editorState, setEditorState] = useState(props.block.name.length>0?EditorState.createWithContent(convertFromRaw(JSON.parse(props.block.name))):EditorState.createEmpty());

  const changeName = (state:EditorState, id:number) => {
    let newTasksListRaw = convertToRaw(state.getCurrentContent());
    let newTasksList=JSON.stringify(newTasksListRaw);
    let user:User = props.user.clone();
    let i = user.timeblocks.findIndex((block:TimeBlock) => block.id === id);
    user.timeblocks[i].name=newTasksList;
    props.updateUser(user);
    props.setNameValidity(props.block.id, state.getCurrentContent().getPlainText().length>0)
  }


  const [ MentionSuggestions, plugins ] = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      mentionTrigger: "@",
      mentionComponent: (mentionProps:any) => {
        return (
          <span
            className={`taskMention`}
            onClick={() => {
              props.showDetails(mentionProps.mention.id);
              setTimeout(() => {
                const curEditorState = EditorState.moveSelectionToEnd(editorState);
                onChange(EditorState.forceSelection(curEditorState, curEditorState.getSelection()));
                editorRef.current.focus();
              }, 0);
            }}
          >
            {mentionProps.children}
          </span>
        );
      }
    });
    
    // eslint-disable-next-line no-shadow
    const { MentionSuggestions } = mentionPlugin;
    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin];
    return [ MentionSuggestions, plugins ];
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
    console.log("onChange");
    setEditorState(newEditorState);
    changeName(newEditorState, props.block.id);
  }
  
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  }
  


  return (
    <div
      style={{backgroundColor:editorState.getCurrentContent().hasText()?"lightgreen":"indianred",color:"black"}}
      className={editorStyles.editor}
    >
      <DraftEditor
        placeholder="use '@' to reference tasks"
        editorKey={'TaskEditor'}
        editorState={editorState}
        onChange={onChange}
        plugins={plugins}
        ref={editorRef}
        handleKeyCommand={handleKeyCommand}
      />
      <MentionSuggestions
        open={open}
        onOpenChange={onOpenChange}
        suggestions={suggestions}
        onSearchChange={onSearchChange}
      />
      
    </div>
  )
}