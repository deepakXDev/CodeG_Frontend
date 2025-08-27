import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SubmissionHistory from '../components/SubmissionHistory';
import AIReview from '../components/AIReview';

//==============================================================================
// 1. CONSTANTS & HELPERS (Moved outside the component for performance)
//==============================================================================

const LANGUAGE_CONFIG = {
  cpp: {
    label: "C++",
    monaco: "cpp",
    defaultCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
  },
  java: {
    label: "Java",
    monaco: "java",
    defaultCode: "public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
  },
  python: {
    label: "Python",
    monaco: "python",
    defaultCode: "# Your Python code here\n",
  },
  c: {
    label: "C",
    monaco: "c",
    defaultCode: "#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}",
  },
};

const getLanguageConfig = (langValue) => LANGUAGE_CONFIG[langValue] || LANGUAGE_CONFIG.cpp;

const DIFFICULTY_CLASSES = {
  Easy: "text-green-400 bg-green-900/50 border border-green-700",
  Medium: "text-yellow-400 bg-yellow-900/50 border border-yellow-700",
  Hard: "text-red-400 bg-red-900/50 border border-red-700",
  Extreme: "text-purple-400 bg-purple-900/50 border border-purple-700",
};

const VERDICT_CLASSES = {
  Accepted: "text-green-400",
  "Wrong Answer": "text-red-400",
  "Time Limit Exceeded": "text-yellow-400",
  "Compilation Error": "text-orange-400",
  "Runtime Error": "text-orange-400",
  Pending: "text-blue-400",
};


//==============================================================================
// 2. MAIN PAGE COMPONENT
//==============================================================================

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Grouped state for better organization and readability
  const [problem, setProblem] = useState(null);
  const [pageState, setPageState] = useState({ loading: true, error: null, showSubmissions: false });
  const [submission, setSubmission] = useState({ verdict: null, isSubmitting: false, hasSubmitted: false });
  const [editor, setEditor] = useState({
    code: getLanguageConfig("cpp").defaultCode,
    language: "cpp",
    customInput: "",
    output: "",
    isRunning: false,
    showAIReview: false,
  });

  const languageOptions = useMemo(() =>
    Object.entries(LANGUAGE_CONFIG).map(([value, { label }]) => ({ value, label })),
    []
  );

  const fetchProblemData = useCallback(async () => {
    if (!user?._id) return;
    try {
      setPageState({ loading: true, error: null, showSubmissions: false });
      
      const problemRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/id/${id}`, { credentials: "include" });
      if (!problemRes.ok) throw new Error((await problemRes.json()).message || 'Problem not found');
      const problemData = await problemRes.json();
      setProblem(problemData.data);

      const subRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/user/${user._id}`, { credentials: "include" });
      if (subRes.ok) {
        const subData = await subRes.json();
        const lastSubmission = subData.data?.submissions?.[0];
        if (lastSubmission) {
          setSubmission(s => ({ ...s, verdict: lastSubmission.verdict, hasSubmitted: true }));
        }
      }
    } catch (err) {
      setPageState(p => ({ ...p, loading: false, error: err.message }));
    } finally {
      setPageState(p => ({ ...p, loading: false }));
    }
  }, [id, user]);

  useEffect(() => {
    fetchProblemData();
  }, [fetchProblemData]);

  const handleLanguageChange = (langValue) => {
    setEditor(e => ({
      ...e,
      language: langValue,
      code: getLanguageConfig(langValue).defaultCode,
    }));
  };
  
  const runCode = async () => { /* ... Your existing runCode logic, using setEditor to update state ... */ };
  const submitCode = async () => { /* ... Your existing submitCode logic with polling, using setSubmission and window.showToast ... */ };

  // Conditional Rendering for page states
  if (pageState.loading) return <LoadingScreen />;
  if (pageState.error) return <ErrorScreen error={pageState.error} onRetry={fetchProblemData} />;
  if (!problem) return <NotFoundScreen />;

  // Main Render
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans p-4 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-[1800px] mx-auto h-[calc(100vh-6rem)]">
        <LeftColumn
          problem={problem}
          verdict={submission.verdict}
          showSubmissions={pageState.showSubmissions}
          setShowSubmissions={(show) => setPageState(p => ({ ...p, showSubmissions: show }))}
        />
        <RightColumn
          code={editor.code}
          language={editor.language}
          customInput={editor.customInput}
          output={editor.output}
          isRunning={editor.isRunning}
          isSubmitting={submission.isSubmitting}
          languageOptions={languageOptions}
          handleLanguageChange={handleLanguageChange}
          runCode={runCode}
          submitCode={submitCode}
          setCode={code => setEditor(e => ({ ...e, code }))}
          setCustomInput={customInput => setEditor(e => ({ ...e, customInput }))}
          setOutput={output => setEditor(e => ({ ...e, output }))}
          setShowAIReview={show => setEditor(e => ({ ...e, showAIReview: show }))}
        />
      </div>
      <AIReviewModal
        showAIReview={editor.showAIReview}
        setShowAIReview={show => setEditor(e => ({ ...e, showAIReview: show }))}
        code={editor.code}
        selectedLanguage={editor.language}
      />
    </div>
  );
}


//==============================================================================
// 3. UI & LAYOUT COMPONENTS
//==============================================================================

const LeftColumn = ({ problem, verdict, showSubmissions, setShowSubmissions }) => (
  <div className="flex flex-col gap-4 overflow-y-auto pr-2">
    {showSubmissions ? (
      <SubmissionsView setShowSubmissions={setShowSubmissions} problemId={problem._id} />
    ) : (
      <>
        <ProblemHeader problem={problem} verdict={verdict} setShowSubmissions={setShowSubmissions} />
        <ProblemDescription description={problem.descriptionMarkdown} />
        <SampleTestCases testCases={problem.testcases} />
      </>
    )}
  </div>
);

const RightColumn = (props) => (
  <div className="flex flex-col gap-4 h-full">
    <div className="flex-grow min-h-0">
      <CodeEditorPanel {...props} />
    </div>
    <div className="flex-shrink-0 grid grid-cols-2 gap-4 h-[35%]">
      <CustomInputPanel customInput={props.customInput} setCustomInput={props.setCustomInput} />
      <OutputPanel output={props.output} />
    </div>
  </div>
);

// --- Sub-components with dark mode styling ---

const ProblemHeader = ({ problem, verdict, setShowSubmissions }) => (
  <div className="bg-[#282828] rounded-lg p-4 border border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <h1 className="text-2xl font-medium text-white">{problem.title}</h1>
      <button
        onClick={() => setShowSubmissions(true)}
        className="text-sm text-gray-400 hover:text-white bg-[#3c3c3c] hover:bg-[#4a4a4a] px-3 py-1.5 rounded-md transition-colors"
      >
        Submissions
      </button>
    </div>
    <div className="flex items-center gap-4 text-sm mb-4">
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_CLASSES[problem.difficulty] || 'bg-gray-700 text-gray-300'}`}>
        {problem.difficulty}
      </span>
      {verdict && <span className={`font-bold ${VERDICT_CLASSES[verdict]}`}>{verdict}</span>}
    </div>
    <div className="flex flex-wrap gap-2">
      {problem.tags?.map(tag => (
        <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{tag}</span>
      ))}
    </div>
  </div>
);

const ProblemDescription = ({ description }) => (
  <div className="bg-[#282828] rounded-lg p-4 border border-gray-700">
    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
    </div>
  </div>
);

const SampleTestCases = ({ testCases }) => {
  const samples = testCases?.filter(tc => tc.isSample);
  if (!samples || samples.length === 0) return null;

  return (
    <div className="bg-[#282828] rounded-lg p-4 border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-3">Sample Cases</h2>
      {samples.map((tc, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Example {index + 1}:</h3>
          <p className="text-sm font-semibold text-white mb-1">Input:</p>
          <pre className="bg-[#1A1A1A] p-2 rounded-md text-gray-300 font-mono text-xs border border-gray-700">{tc.input}</pre>
          <p className="text-sm font-semibold text-white mt-2 mb-1">Output:</p>
          <pre className="bg-[#1A1A1A] p-2 rounded-md text-gray-300 font-mono text-xs border border-gray-700">{tc.output}</pre>
        </div>
      ))}
    </div>
  );
};

const SubmissionsView = ({ problemId, setShowSubmissions }) => (
  <div className="bg-[#282828] rounded-lg p-4 border border-gray-700 h-full flex flex-col">
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <h2 className="text-xl font-bold text-white">My Submissions</h2>
      <button
        onClick={() => setShowSubmissions(false)}
        className="text-sm text-gray-400 hover:text-white bg-[#3c3c3c] hover:bg-[#4a4a4a] px-3 py-1.5 rounded-md transition-colors"
      >
        Back to Problem
      </button>
    </div>
    <div className="flex-grow overflow-y-auto">
      <SubmissionHistory problemId={problemId} />
    </div>
  </div>
);


const CodeEditorPanel = (props) => (
  <div className="bg-[#282828] rounded-lg border border-gray-700 flex flex-col h-full">
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 flex-shrink-0">
      <select
        value={props.language}
        onChange={e => props.handleLanguageChange(e.target.value)}
        className="bg-transparent text-white border-none focus:ring-0 text-sm p-1 rounded hover:bg-[#3c3c3c]"
      >
        {props.languageOptions.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#282828]">{opt.label}</option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <button onClick={props.runCode} disabled={props.isRunning} className="text-sm bg-[#3c3c3c] hover:bg-[#4a4a4a] disabled:bg-gray-800 disabled:text-gray-500 px-3 py-1 rounded-md transition">
          {props.isRunning ? 'Running...' : 'Run'}
        </button>
        <button onClick={props.submitCode} disabled={props.isSubmitting} className="text-sm bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-gray-400 text-white font-semibold px-3 py-1 rounded-md transition">
          {props.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button onClick={() => props.setShowAIReview(true)} className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md transition">
          AI Review
        </button>
      </div>
    </div>
    <div className="flex-grow min-h-0">
      <Editor
        theme="vs-dark"
        language={getLanguageConfig(props.language).monaco}
        value={props.code}
        onChange={props.setCode}
        options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
      />
    </div>
  </div>
);

const CustomInputPanel = ({ customInput, setCustomInput }) => (
  <div className="bg-[#282828] rounded-lg border border-gray-700 flex flex-col h-full">
    <h3 className="text-sm font-medium text-white px-3 py-2 border-b border-gray-700">Custom Input</h3>
    <textarea
      value={customInput}
      onChange={e => setCustomInput(e.target.value)}
      placeholder="Enter custom input for 'Run'..."
      className="w-full h-full bg-transparent text-gray-300 p-3 resize-none focus:outline-none font-mono text-sm"
    />
  </div>
);

const OutputPanel = ({ output }) => (
  <div className="bg-[#282828] rounded-lg border border-gray-700 flex flex-col h-full">
    <h3 className="text-sm font-medium text-white px-3 py-2 border-b border-gray-700">Output</h3>
    <pre className="text-sm text-gray-300 p-3 overflow-y-auto font-mono h-full whitespace-pre-wrap">
      {output || "> Run code to see output..."}
    </pre>
  </div>
);

// --- Modals and Loading/Error Screens ---

const LoadingScreen = () => <div className="h-screen bg-[#1A1A1A] flex items-center justify-center text-white text-lg">Loading Problem...</div>;
const ErrorScreen = ({ error, onRetry }) => (
    <div className="h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-red-400">
        <p className="text-lg mb-4">Error: {error}</p>
        <button onClick={onRetry} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Try Again
        </button>
    </div>
);
const NotFoundScreen = () => <div className="h-screen bg-[#1A1A1A] flex items-center justify-center text-white text-lg">Problem Not Found</div>;
// const AIReviewModal = ({ showAIReview, setShowAIReview, code, selectedLanguage }) => {
//     if (!showAIReview) return null;
//     return (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
//             <div className="bg-[#282828] rounded-lg w-full max-w-4xl h-[80vh] border border-gray-700 flex flex-col">
//                 <div className="flex justify-between items-center p-4 border-b border-gray-700">
//                     <h2 className="text-xl font-bold text-white">AI Code Review</h2>
//                     <button onClick={() => setShowAIReview(false)} className="text-gray-400 hover:text-white">&times;</button>
//                 </div>
//                 <div className="flex-grow p-4 overflow-y-auto">
//                     <AIReview code={code} language={selectedLanguage} onClose={() => setShowAIReview(false)} />
//                 </div>
//             </div>
//         </div>
//     );
// };
const AIReviewModal = ({ showAIReview, setShowAIReview, code, selectedLanguage }) => {
  if (!showAIReview) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 h-[80vh] border-2 border-black shadow-xl flex flex-col">
        <ModalHeader setShowAIReview={setShowAIReview} />
        <ModalContent
          code={code}
          language={selectedLanguage}
          onClose={() => setShowAIReview(false)}
        />
        <ModalFooter
          selectedLanguage={selectedLanguage}
          setShowAIReview={setShowAIReview}
        />
      </div>
    </div>
  );
};

const ModalHeader = ({ setShowAIReview }) => (
  <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 bg-gray-50 rounded-t-lg">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-black">AI Code Review</h3>
        <p className="text-gray-600 text-sm">
          Get intelligent feedback on your code
        </p>
      </div>
    </div>
    <button
      onClick={() => setShowAIReview(false)}
      className="text-gray-600 hover:text-black transition-colors"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

const ModalContent = ({ code, language, onClose }) => (
  <div className="flex-1 bg-white text-black overflow-hidden">
    <AIReview
      code={code}
      language={language}
      onClose={onClose}
    />
  </div>
);

const ModalFooter = ({ selectedLanguage, setShowAIReview }) => (
  <div className="p-4 border-t-2 border-gray-200 bg-gray-50 rounded-b-lg">
    <div className="flex justify-between items-center">
      <p className="text-gray-600 text-sm">
        Language:{" "}
        <span className="font-medium text-black">
          {selectedLanguage.toUpperCase()}
        </span>
      </p>
      <button
        onClick={() => setShowAIReview(false)}
        className="px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
      >
        Close
      </button>
    </div>
  </div>
);