import React, { useState, useEffect, useMemo, useCallback,useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import AIFeatureModal from "../components/AIFeatureModal";
import { LayoutBackground } from "@/components/MainLayout";
// import TweakWrapper from "../utils/TweakWrapper";

//==============================================================================
// 1. CONSTANTS & HELPERS (Moved outside the component for performance)
//==============================================================================

const LANGUAGE_CONFIG = {
  cpp: {
    label: "C++",
    monaco: "cpp",
    defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  },
  java: {
    label: "Java",
    monaco: "java",
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  },
  py: {
    label: "Python",
    monaco: "python",
    defaultCode: 'print("Hello, World!")',
  },
  c: {
    label: "C",
    monaco: "c",
    defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  },
};

const FEATURES_LIST = [
  {
    title: "Deep Dive into Data Structures",
    description: "Go beyond theory. Solidify your understanding of core algorithms and data structures with our expansive library of curated problems.",
  },
  {
    title: "High-Performance Web IDE",
    description: "Experience a seamless coding environment. Our powerful, multi-language IDE is designed for rapid development and testing.",
  },
  {
    title: "AI-Powered Interview Prep",
    description: "Gain a competitive advantage. Leverage AI-driven feedback and analysis to refine your solutions and master interview patterns.",
  },
];

const getLanguageConfig = (langValue) => LANGUAGE_CONFIG[langValue] || LANGUAGE_CONFIG.cpp;

//==============================================================================
// 2. MAIN HOME COMPONENT
//==============================================================================

export default function Home() {
  const navigate = useNavigate();
   const compilerRef = useRef(null);

  // Grouped state for better readability and management
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });
  const [editor, setEditor] = useState({
    code: getLanguageConfig("cpp").defaultCode,
    language: "cpp",
    customInput: "",
    output: "",
    isRunning: false,
  });
  const [modals, setModals] = useState({
    showLogin: false,
    showAI: false,
    selectedFeature: "",
    activeTab: "Input",
    problemDescription: "",
    constraints: "",
  });

  // Memoize language options to prevent recalculation on re-renders
  const languageOptions = useMemo(() =>
    Object.entries(LANGUAGE_CONFIG).map(([value, { label }]) => ({ value, label })),
    []
  );

  // Check authentication status on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/profile`, { credentials: "include" });
        if (response.ok) {
          const result = await response.json();
          console.log(result);
          if (result.success && result.user) {
            setAuth({ isAuthenticated: true, user: result.user });
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, []);

  // Handlers using useCallback to maintain stable function references
  const handleLanguageChange = useCallback((langValue) => {
    setEditor(e => ({
      ...e,
      language: langValue,
      code: getLanguageConfig(langValue).defaultCode,
      output: "",
    }));
  }, []);


const runCode = useCallback(async () => {
  if (!editor.code.trim()) {
    setEditor(prev => ({ ...prev, output: "Please write some code first!" }));
    return;
  }

  // Update multiple keys in the editor state
  setEditor(prev => ({ ...prev, isRunning: true, output: "> Running code..." }));

  try {
    const compilerUrl = import.meta.env.VITE_COMPILER_URL;
    if (!compilerUrl) {
      throw new Error("Compiler URL is not defined in environment variables");
    }

    const response = await fetch(`${compilerUrl}/submission/run-sample`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Read values from the editor state
        language: editor.language,
        sourceCode: editor.code,
        customInput:
          editor.customInput.trim() === "" ? "Hello, If no input.." : editor.customInput,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      const newOutput = result.output !== undefined ? result.output : "Execution finished, but no output was produced.";
      setEditor(prev => ({ ...prev, output: newOutput }));
    } else {
      const errorMessage = result.error || result.stderr || "An unknown error occurred";
      setEditor(prev => ({ ...prev, output: `Error: ${errorMessage}` }));
    }
  } catch (error) {
    setEditor(prev => ({ ...prev, output: `Error: ${error.message}` }));
  } finally {
    setEditor(prev => ({ ...prev, isRunning: false }));
  }
}, [editor.code, editor.language, editor.customInput, setEditor]); // The dependency array now includes setEditor

  const handleGetStarted = useCallback(() => {
    navigate(auth.isAuthenticated ? "/dashboard" : "/auth");
  }, [auth.isAuthenticated, navigate]);

  const handleScrollToCompiler = useCallback(() => {
        compilerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

  const handleAIFeatureClick = (feature) => {
    if (auth.isAuthenticated) {
        setModals(m => ({ ...m, selectedFeature: feature, showAI: true }));
    } else {
        setModals(m => ({ ...m, selectedFeature: feature, showLogin: true }));
    }
  };

  return (
    <div className="bg-[#1A1A1A] text-gray-300 font-sans relative overflow-hidden">
        <LayoutBackground />
      <HeroSection
        isAuthenticated={auth.isAuthenticated}
        handleGetStarted={handleGetStarted}
        onScrollToCompiler={handleScrollToCompiler}
      />
      <FeaturesSection features={FEATURES_LIST} />
      <OnlineCompilerSection
        ref={compilerRef} 
        isAuthenticated={auth.isAuthenticated}
        editorState={editor}
        setEditor={setEditor}
        languageOptions={languageOptions}
        handleLanguageChange={handleLanguageChange}
        runCode={runCode}
        onAIFeatureClick={handleAIFeatureClick}
      />
      {!auth.isAuthenticated && <CommunityStatsSection />}
      <CallToActionSection
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        handleGetStarted={handleGetStarted}
      />
      <LoginModal
        isOpen={modals.showLogin}
        onClose={() => setModals(m => ({ ...m, showLogin: false }))}
        feature={modals.selectedFeature}
        navigate={navigate}
      />
      <AIFeatureModal
        isOpen={modals.showAI}
        onClose={() => setModals(m => ({ ...m, showAI: false }))}
        feature={modals.selectedFeature}
        code={editor.code}
        language={editor.language}
        // Pass other necessary props...
      />
    </div>
  );
}

//==============================================================================
// 3. UI & LAYOUT SUB-COMPONENTS
//==============================================================================

const HeroSection = ({ isAuthenticated, handleGetStarted, onScrollToCompiler }) => (
  <div className="relative text-center py-20 sm:py-32 px-4 overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
      Build Your Edge. <span className="block text-gray-400">Ace the Interview.</span>
    </h1>
    <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
      Level up with a suite of powerful tools designed for elite software engineers. Tackle complex problems, receive instant AI-driven insights, and demonstrate the skills that define top-tier talent.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button onClick={handleGetStarted} className="bg-white text-black font-semibold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors shadow-lg">
        {isAuthenticated ? "Continue to Dashboard" : "Start for Free"}
      </button>
      {/* <button onClick={() => document.getElementById("compiler").scrollIntoView({ behavior: "smooth" })} className="bg-[#282828] text-white font-semibold py-3 px-8 rounded-lg border border-gray-700 hover:bg-[#3c3c3c] transition-colors"> */}
      <button onClick={onScrollToCompiler} className="bg-[#282828] text-white font-semibold py-3 px-8 rounded-lg border border-gray-700 hover:bg-[#3c3c3c] transition-colors">
        Launch Web IDE
      </button>
    </div>
  </div>
);

const FeaturesSection = ({ features }) => (
  <div className="py-20 px-4">
    <div className="container mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
        An Arsenal for the Ambitious Developer
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="bg-[#282828] p-8 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OnlineCompilerSection = React.forwardRef(({ isAuthenticated, editorState, setEditor, languageOptions, handleLanguageChange, runCode, onAIFeatureClick },ref) => (
    <div id="compiler" ref={ref} className="py-20 px-4">
        <div className="container mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Instant Execution, Seamless Workflow</h2>
            <p className="text-lg text-gray-400">
              Our integrated development environment is ready for your most complex solutions. Write, test, and iterate in a frictionless environment.
            </p>
        </div>
        <div className="max-w-7xl mx-auto bg-[#282828] rounded-lg border border-gray-700 shadow-2xl">
            <CompilerHeader
                language={editorState.language}
                handleLanguageChange={handleLanguageChange}
                languageOptions={languageOptions}
                runCode={runCode}
                isRunning={editorState.isRunning}
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4">
                <div className="lg:col-span-3 h-[60vh]">
                    <Editor
                        theme="vs-dark"
                        language={getLanguageConfig(editorState.language).monaco}
                        value={editorState.code}
                        onChange={(value) => setEditor(e => ({ ...e, code: value || "" }))}
                        options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
                    />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-sm font-medium text-white px-3 py-2 bg-[#1A1A1A] rounded-t-md">Custom Input</h3>
                        <textarea
                            value={editorState.customInput}
                            onChange={(e) => setEditor(es => ({ ...es, customInput: e.target.value }))}
                            placeholder="Enter input..."
                            className="w-full flex-grow bg-[#282828] text-gray-300 p-3 rounded-b-md resize-none focus:outline-none font-mono text-sm border-t-0 border border-gray-700"
                        />
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-sm font-medium text-white px-3 py-2 bg-[#1A1A1A] rounded-t-md">Output</h3>
                        <pre className="text-sm text-gray-300 p-3 overflow-y-auto font-mono h-full bg-[#282828] rounded-b-md border-t-0 border border-gray-700">
                            {editorState.output || "> Output will appear here..."}
                        </pre>
                    </div>
                    {!isAuthenticated && (
                        <div className="bg-[#282828] p-4 rounded-lg border border-gray-700 text-center">
                            <h4 className="font-semibold text-white mb-2">Unlock AI Features</h4>
                            <p className="text-sm text-gray-400 mb-4">Sign in to get hints, feedback, and code explanations.</p>
                            <button onClick={() => onAIFeatureClick('Login')} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg w-full hover:bg-purple-500 transition-colors">
                                Sign In to Use AI
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
));

const CompilerHeader = ({ language, handleLanguageChange, languageOptions, runCode, isRunning }) => (
    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
        <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="bg-transparent text-white border-none focus:ring-0 text-sm p-1 rounded hover:bg-[#3c3c3c]">
            {languageOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#282828]">{opt.label}</option>)}
        </select>
        <button onClick={runCode} disabled={isRunning} className="text-sm bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-gray-400 text-white font-semibold px-4 py-2 rounded-md transition">
            {isRunning ? 'Running...' : 'Run'}
        </button>
    </div>
);

const CommunityStatsSection = () => (
  <div className="py-20 px-4 bg-[#1A1A1A]">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-white">
        Join a Thriving Developer Community
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatItem count="1,000+" label="Curated Problems" />
        <StatItem count="50,000+" label="Solutions Submitted" />
        <StatItem count="10,000+" label="Active Developers" />
      </div>
    </div>
  </div>
);

const StatItem = ({ count, label }) => (
  <div>
    <div className="text-4xl font-bold text-white mb-2">{count}</div>
    <div className="text-gray-400 font-medium">{label}</div>
  </div>
);

const CallToActionSection = ({ isAuthenticated, user, handleGetStarted }) => (
  <div className="py-20 bg-[#282828] text-white text-center px-4">
    <div className="relative container mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">
        Ready to Elevate Your Career?
      </h2>
      <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
        {isAuthenticated
          ? `Keep up the great work, ${user?.name || "Developer"}! Your next challenge awaits.`
          : "Start building the skills that land offers from top tech companies. Your journey begins here."}
      </p>
      <button
        onClick={handleGetStarted}
        className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold shadow-lg"
      >
        {isAuthenticated ? "Explore More Problems" : "Create Your Free Account"}
      </button>
    </div>
  </div>
);


const LoginModal = ({ isOpen, onClose, feature, navigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#282828] rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700 shadow-xl text-center">
        <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-600">
          {/* Lock Icon SVG */}
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Unlock Premium Features
        </h3>
        <p className="text-gray-400 mb-6">
          To access the **{feature}** tool and get a personalized coding experience, please sign in to your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              navigate("/auth");
            }}
            className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Sign In or Sign Up
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#3c3c3c] text-white rounded-lg hover:bg-[#4a4a4a] transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};