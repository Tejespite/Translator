import { useState, useRef, useEffect } from "react";
import "./style.css";

function NewText({ text, setText }) {
  // Handler for Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setText(e.target.value);
    }
  };

  return (
    <div>
      <textarea
        className="texts"
        id="text_input"
        onKeyDown={handleKeyDown}
      ></textarea>
      <br/>
      <input
        type="button"
        value="Load"
        onClick={() =>
          setText(document.getElementById("text_input").value)
        }
      />
    </div>
  );
}

function Translating({text, setText}) {
  const [highlightedText, setHighlightedText] = useState("");
  const [translation, setTranslation] = useState("");
  const [highlightLine, setHighlightLine] = useState(null);

  const handleHighlight = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (!selectedText) return;

    // Find the line number of the highlighted text
    const lines = text.split('\n');
    let charCount = 0;
    let foundLine = null;
    for (let i = 0; i < lines.length; i++) {
      if (
        charCount <= text.indexOf(selectedText) &&
        text.indexOf(selectedText) < charCount + lines[i].length + 1
      ) {
        foundLine = i;
        break;
      }
      charCount += lines[i].length + 1;
    }

    setHighlightedText(selectedText);
    setHighlightLine(foundLine);
    handleSendMessage(selectedText);
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await fetch('https://translator-wyiz.onrender.com/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (response.ok) {
        setTranslation(data.response);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Split text and translation by lines
  const textLines = text.split('\n');
  const translationLines = textLines.map((_, idx) =>
    highlightLine === idx && translation
      ? translation
      : ""
  );

  return (
    <>
      <div id="texts_div" style={{ display: "flex", gap: "1em" }}>
        <pre
          className="texts"
          onMouseUp={handleHighlight}
          onTouchEnd={handleHighlight}
          style={{ whiteSpace: "pre-wrap", flex: 1, margin: 0 }}
        >
          {text}
        </pre>
        <pre
          className="texts"
          style={{ whiteSpace: "pre-wrap", flex: 1, margin: 0 }}
        >
          {translationLines.join('\n')}
        </pre>
      </div>
      <input type="button" value="Clear" onClick={() => setText("")} />
    </>
  );
}

function Dictionary() {
  const [display, setDisplay] = useState(false);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [word, setWord] = useState("");
  const dictRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const dict = dictRef.current;
    const drag = dragRef.current;
    if (!dict || !drag) return;
    let isDragging = false, offsetX = 0, offsetY = 0;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - dict.getBoundingClientRect().left;
      offsetY = e.clientY - dict.getBoundingClientRect().top;
      dict.style.cursor = "grabbing";
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      dict.style.left = (e.clientX - offsetX) + "px";
      dict.style.top = (e.clientY - offsetY) + "px";
      dict.style.right = "auto";
      dict.style.bottom = "auto";
    };
    const onMouseUp = () => {
      isDragging = false;
      dict.style.cursor = "default";
    };

    drag.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      drag.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [display]);

  const handleSearch = async () => {
    const s = document.querySelector("#dictionary_div input[type='text']");
    const searchedWord = s.value.trim();
    setWord(searchedWord);
    s.value = "";
    if (!searchedWord) return;

    setLoading(true);
    setError("");
    setDefinitions([]);

    try {
      const response = await fetch(
        `https://translator-wyiz.onrender.com/api/vocabulary/search/?query=${encodeURIComponent(searchedWord)}&forms_only=false`,
        {
          headers: {
            "accept": "application/json"
          }
        }
      );
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setDefinitions(data);
    } catch (err) {
      setError("Failed to fetch definitions.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };


  if (!display) {
    return (
      <input
        id="show_dictionary_btn"
        type="button"
        value="Show dictionary"
        onClick={() => setDisplay(true)}
      />
    );
  } else {
    return (
      <>
        <div id="dictionary_div" onKeyDown={handleKeyDown} ref={dictRef}>
          <div id="drag_div" ref={dragRef}>. . .</div>
          <h1>Dictionary</h1>
          <input
            id="hide_dictionary_btn"
            type="button"
            value="Hide dictionary"
            onClick={() => setDisplay(false)}
          />
          Search: <input type="text" />{" "}
          <input type="button" value="search" onClick={handleSearch} />
          
          <br />
          definitions of <p style={{ display: "inline", fontWeight: "bold", color: "blue" }}> {word}:</p>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <ul>
            {definitions.map((entry) => (
              <li key={entry.id}>
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  {entry.full_name}
                </a>
                <br />
                <b>Type:</b> {entry.type.label}
                <br />
                <b>EN:</b> {entry.translations_unstructured?.en}
                <br />
                <b>DE:</b> {entry.translations_unstructured?.de}
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }
}

function App() {
  const [text, setText] = useState("");

  if (text=="") {
    return <NewText text={text} setText={setText} />
  }
  else {
    return (
      <>
        <Translating text={text} setText={setText} />
        <Dictionary />
      </>
    );
  }
}

export default App;