import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

//==============================================================================
// 1. CONSTANTS & HELPERS (Moved outside the component for performance)
//==============================================================================

const DIFFICULTY_CLASSES = {
  Easy: "text-green-400 bg-green-900/50 border border-green-700",
  Medium: "text-yellow-400 bg-yellow-900/50 border border-yellow-700",
  Hard: "text-red-400 bg-red-900/50 border border-red-700",
  Extreme: "text-purple-400 bg-purple-900/50 border border-purple-700",
  default: "text-gray-400 bg-gray-700/50 border border-gray-600",
};

const getDifficultyClass = (difficulty) => DIFFICULTY_CLASSES[difficulty] || DIFFICULTY_CLASSES.default;

//==============================================================================
// 2. MAIN PAGE COMPONENT
//==============================================================================

export default function Problems() {
  const navigate = useNavigate();

  // Grouped state for better management
  const [pageState, setPageState] = useState({
    problems: [],
    pagination: {},
    loading: true, // For initial full-page load
    searchLoading: false, // For subsequent filter/page changes
    error: null,
  });
  const [filters, setFilters] = useState({ difficulty: '', tags: '', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchProblems = useCallback(async () => {
    const isInitialLoad = currentPage === 1 && !filters.search && !filters.difficulty && !filters.tags;
    setPageState(p => ({ ...p, loading: isInitialLoad, searchLoading: !isInitialLoad, error: null }));

    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems?${queryParams}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch problems');

      const result = await response.json();
      setPageState(p => ({
        ...p,
        problems: result.data.docs,
        pagination: {
          totalPages: result.data.totalPages,
          currentPage: result.data.page,
          hasNext: result.data.hasNextPage,
          hasPrev: result.data.hasPrevPage,
          totalProblems: result.data.totalDocs,
        },
      }));
    } catch (error) {
      setPageState(p => ({ ...p, error: error.message }));
    } finally {
      setPageState(p => ({ ...p, loading: false, searchLoading: false }));
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };
  
  if (pageState.loading) {
    return <LoadingScreen message="Loading Problem Set..." />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <PageHeader />
        <FilterBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          filters={filters}
          handleFilterChange={handleFilterChange}
        />
        <ProblemList 
          problems={pageState.problems}
          isLoading={pageState.searchLoading}
          navigate={navigate}
        />
        <Pagination 
          pagination={pageState.pagination}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

//==============================================================================
// 3. UI & LAYOUT SUB-COMPONENTS
//==============================================================================

const PageHeader = () => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">Problem Set</h1>
    <p className="text-gray-400 mt-1">Sharpen your skills with our curated collection of algorithmic challenges.</p>
  </div>
);

const FilterBar = ({ searchInput, setSearchInput, filters, handleFilterChange }) => (
  <div className="bg-[#282828] rounded-xl p-4 mb-6 border border-gray-700">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by title or content..."
        className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
      />
      <select
        value={filters.difficulty}
        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
      >
        <option value="">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
        <option value="Extreme">Extreme</option>
      </select>
      <input
        type="text"
        value={filters.tags}
        onChange={(e) => handleFilterChange('tags', e.target.value)}
        placeholder="Filter by tags (e.g., array,dp)"
        className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
      />
    </div>
  </div>
);

const ProblemList = ({ problems, isLoading, navigate }) => {
  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Searching...</div>;
  }
  if (problems.length === 0) {
    return (
      <div className="text-center py-12 bg-[#282828] rounded-xl border border-gray-700">
        <h3 className="text-xl font-medium text-white">No Problems Found</h3>
        <p className="text-gray-400 mt-2">Try adjusting your search filters or check back later.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {problems.map(problem => <ProblemItem key={problem._id} problem={problem} navigate={navigate} />)}
    </div>
  );
};

const ProblemItem = ({ problem, navigate }) => (
  <div
    className="bg-[#282828] rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
    onClick={() => navigate(`/problem/${problem._id}`)}
  >
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white hover:text-purple-300 transition-colors">{problem.title}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-400">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${getDifficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.tags?.map(tag => (
            <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0">
        <button className="text-purple-400 font-semibold hover:text-purple-300 transition-colors text-sm">
          View Challenge &rarr;
        </button>
      </div>
    </div>
  </div>
);


const Pagination = ({ pagination, setCurrentPage }) => {
  if (!pagination.totalPages || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <button
        onClick={() => setCurrentPage(pagination.currentPage - 1)}
        disabled={!pagination.hasPrev}
        className="px-4 py-2 bg-[#282828] hover:bg-[#3c3c3c] disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white border border-gray-700"
      >
        Previous
      </button>
      <div className="flex space-x-1">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg transition-colors border text-sm font-medium ${
              page === pagination.currentPage
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-[#282828] text-white border-gray-700 hover:bg-[#3c3c3c]'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCurrentPage(pagination.currentPage + 1)}
        disabled={!pagination.hasNext}
        className="px-4 py-2 bg-[#282828] hover:bg-[#3c3c3c] disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white border border-gray-700"
      >
        Next
      </button>
    </div>
  );
};
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
      <p className="text-white font-medium">{message}</p>
    </div>
  </div>
);