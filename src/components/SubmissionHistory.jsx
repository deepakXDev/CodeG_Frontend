import React, { useState, useEffect, useCallback } from 'react';

// Import required shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

//==============================================================================
// 1. CONFIGURATION & HELPERS
//==============================================================================

const getVerdictColor = (verdict) => {
    switch (verdict) {
        case 'Accepted': return 'bg-green-900/50 text-green-300 border border-green-700';
        case 'Wrong Answer': return 'bg-red-900/50 text-red-300 border border-red-700';
        case 'Time Limit Exceeded': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
        case 'Memory Limit Exceeded': return 'bg-orange-900/50 text-orange-300 border border-orange-700';
        case 'Runtime Error': return 'bg-red-900/50 text-red-300 border border-red-700';
        case 'Compilation Error': return 'bg-purple-900/50 text-purple-300 border border-purple-700';
        default: return 'bg-gray-700 text-gray-300 border border-gray-600';
    }
};

const getLanguageColor = (language) => {
    switch (language?.toLowerCase()) {
        case 'cpp': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
        case 'c': return 'bg-gray-700 text-gray-300 border border-gray-600';
        case 'java': return 'bg-orange-900/50 text-orange-300 border border-orange-700';
        case 'python': return 'bg-green-900/50 text-green-300 border border-green-700';
        default: return 'bg-gray-700 text-gray-300 border border-gray-600';
    }
};

const LANGUAGE_CONFIG = {
    'cpp': { label: 'C++' },
    'c': { label: 'C' },
    'java': { label: 'Java' },
    'python': { label: 'Python' },
    'default': { label: 'Code' },
};
const getLanguageConfig = (lang) => LANGUAGE_CONFIG[lang?.toLowerCase()] || LANGUAGE_CONFIG.default;

const formatDate = (dateString) => new Date(dateString).toLocaleString();

//==============================================================================
// 2. MAIN COMPONENT
//==============================================================================

export default function SubmissionHistory({ problemId = null }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [verdictFilter, setVerdictFilter] = useState('');
    const [verdictBreakdown, setVerdictBreakdown] = useState([]);

    const verdictOptions = [
        { value: 'all', label: 'All Verdicts' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Wrong Answer', label: 'Wrong Answer' },
        { value: 'Time Limit Exceeded', label: 'Time Limit Exceeded' },
        { value: 'Memory Limit Exceeded', label: 'Memory Limit Exceeded' },
        { value: 'Runtime Error', label: 'Runtime Error' },
        { value: 'Compilation Error', label: 'Compilation Error' }
    ];

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            let url = new URL(`${import.meta.env.VITE_BACKEND_URL}/submission`);
            if (problemId) {
                url = new URL(`${import.meta.env.VITE_BACKEND_URL}/submission/problem/${problemId}`);
            }
            url.searchParams.append('page', currentPage);
            url.searchParams.append('limit', 10);
            
            if (verdictFilter && verdictFilter !== 'all') {
                url.searchParams.append('verdict', verdictFilter);
            }

            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();
            
            if (data.success) {
                setSubmissions(data.data.submissions.docs);
                setTotalPages(data.data.totalPages);
                // Assuming the API returns breakdown data with the submissions
                if (data.data.verdictBreakdown) {
                    setVerdictBreakdown(data.data.verdictBreakdown);
                }
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, verdictFilter, problemId]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

     const handleViewDetails = async (submissionId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/${submissionId}`, {
                credentials: 'include'
            });

            const data = await response.json();
            
            if (data.success) {
                setSelectedSubmission(data.data);
                console.log(data.data);
            }
        } catch (error) {
            console.error('Error fetching submission details:', error);
        }
    };

    return (
        <div className="space-y-6">
            <VerdictBreakdown verdicts={verdictBreakdown} />
            <Card className="bg-[#282828] border-gray-700 text-gray-300">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-white">
                            {problemId ? 'Problem Submissions' : 'Global Submission History'}
                        </CardTitle>
                        <CardDescription>Review and analyze all recent submissions.</CardDescription>
                    </div>
                    <Select
                        onValueChange={(value) => {
                            setVerdictFilter(value === 'all' ? '' : value);
                            setCurrentPage(1);
                        }}
                        defaultValue="all"
                    >
                        <SelectTrigger className="w-full sm:w-[180px] bg-[#1A1A1A] border-gray-600">
                            <SelectValue placeholder="Filter by verdict..." />
                        </SelectTrigger>
                        <SelectContent>
                            {verdictOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <LoadingSkeleton />
                    ) : submissions.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <SubmissionTable submissions={submissions} onViewDetails={handleViewDetails} />
                    )}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </CardContent>
            </Card>
            <SubmissionDetailModal
                submission={selectedSubmission}
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
            />
        </div>
    );
}

//==============================================================================
// 3. UI & LAYOUT SUB-COMPONENTS
//==============================================================================

const VerdictBreakdown = ({ verdicts }) => {
    if (!verdicts || verdicts.length === 0) {
      return null; // Don't render anything if there's no data
    }
    return (
      <Card className="bg-[#282828] border-gray-700 text-gray-300">
        <CardHeader>
          <CardTitle className="text-white text-lg">Verdict Analysis</CardTitle>
          <CardDescription>A summary of your submission outcomes for this problem.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {verdicts.map((v) => (
            <div key={v._id} className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg border border-gray-600">
              <Badge className={`font-semibold text-xs ${getVerdictColor(v._id)}`}>{v._id}</Badge>
              <span className="font-bold text-lg text-white">{v.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
};

const SubmissionTable = ({ submissions, onViewDetails }) => (
    <Table>
        <TableHeader>
            <TableRow className="border-gray-700 hover:bg-transparent">
                {submissions[0] && !submissions[0].problemId?.title && <TableHead className="text-white font-semibold">Problem</TableHead>}
                <TableHead className="text-white font-semibold">Verdict</TableHead>
                <TableHead className="text-white font-semibold">Language</TableHead>
                <TableHead className="text-white font-semibold text-right">Execution</TableHead>
                <TableHead className="text-white font-semibold text-right">Memory</TableHead>
                <TableHead className="text-white font-semibold">Timestamp</TableHead>
                <TableHead className="text-white font-semibold text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {submissions.map(sub => (
                <TableRow key={sub._id} className="border-gray-700">
                    {!sub.problemId?.title && <TableCell className="font-medium text-white">{sub.problemId?.title || 'Unknown'}</TableCell>}
                    <TableCell>
                        <Badge className={`font-semibold ${getVerdictColor(sub.verdict)}`}>{sub.verdict}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge className={`font-semibold ${getLanguageColor(sub.language)}`}>{sub.language.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{sub.executionTime || 'N/A'} ms</TableCell>
                    <TableCell className="text-right font-mono text-sm">{sub.memoryUsed || 'N/A'} MB</TableCell>
                    <TableCell className="text-sm text-gray-400">{formatDate(sub.createdAt)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => onViewDetails(sub._id)}>View</Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const SubmissionDetailModal = ({ submission, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[60%] bg-[#282828] border-gray-700 text-gray-300">
            <DialogHeader>
                <DialogTitle className="text-white">Submission Details</DialogTitle>
                <DialogDescription>
                    Analysis of submission for <span className="font-bold text-white">{submission?.problem?.title || 'a problem'}</span>
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <h4 className="font-semibold text-white">Source Code ({getLanguageConfig(submission?.language).label})</h4>
                <pre className="bg-[#1A1A1A] p-4 rounded-md text-sm font-mono border border-gray-700">
                    <code>{submission?.sourceCode}</code>
                </pre>
                {submission?.errorMessage && (
                    <>
                        <h4 className="font-semibold text-red-400">Error Details</h4>
                        <pre className="bg-red-900/20 p-4 rounded-md text-sm font-mono border border-red-700 text-red-300">
                            <code>{submission.errorMessage}</code>
                        </pre>
                    </>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

const LoadingSkeleton = () => (
    <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-gray-700" />)}
    </div>
);

const EmptyState = () => (
    <div className="text-center py-12">
        <h3 className="text-xl font-medium text-white">No Submissions Found</h3>
        <p className="text-gray-400 mt-2">Try adjusting your filters or solve a problem to see your history.</p>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
            <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
        </div>
    );
};
