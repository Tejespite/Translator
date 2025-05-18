import { useState } from "react";
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

  const handleHighlight = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText.length < 1 || selectedText === undefined) {
      return;
    }

    setHighlightedText(selectedText);
    handleSendMessage(selectedText); // Pass the selected text directly
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }), // Use the passed message
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

  return (
    <>
      <div id="texts_div">
        <div className="texts" onMouseUp={handleHighlight} onTouchEnd={handleHighlight} > {text} </div>
        <div className="texts"> {translation} </div>
      </div>
      <input type="button" value="Clear" onClick={()=> setText("")} />
    </>
  );
}

function App() {
  const [text, setText] = useState("");

  return text=="" ? (<NewText text={text} setText={setText} />) : (<Translating text={text} setText={setText} />)
}

export default App;