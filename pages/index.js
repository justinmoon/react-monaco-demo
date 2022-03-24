import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

async function saveFile(path, content) {
  fetch(`/api/files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, content }),
  })
    .then(console.log)
    .catch(console.error);
}

function Tree({ paths, selectFile }) {
  return paths.map((path, index) => (
    <div key={index} onClick={() => selectFile(path)}>
      {path}
    </div>
  ));
}

function App() {
  const [files, setFiles] = useState(null);
  const [path, setPath] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    fetch(`/api/files`)
      .then((r) => r.json())
      .then((json) => {
        setFiles(json.content);
      })
      .catch(console.error);
  }, []);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  // Save after 1 second without changes
  const [saveTask, setSaveTask] = useState(null);
  function handleEditorChange(value, event) {
    if (saveTask) {
      clearTimeout(saveTask);
    }
    const timeout = setTimeout(() => {
      saveFile(path, value);
      setSaveTask(null);
    }, 1000);
    setSaveTask(timeout);
  }

  if (!files) {
    return <div />;
  }

  return (
    <>
      <Tree
        paths={Object.keys(files)}
        selectFile={(path) => {
          setPath(path);
        }}
      />
      {path && files && (
        <Editor
          ref={editorRef}
          height="90vh"
          path={files[path].name}
          defaultLanguage={files[path].language}
          defaultValue={files[path].value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
        />
      )}
    </>
  );
}

export default App;
