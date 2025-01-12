import "./App.css";
import ExcelEditor from "./Page1";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <ExcelEditor />
      </div>
    </Router>
  );
}

export default App;
