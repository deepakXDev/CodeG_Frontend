import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../utils';
import { PlusCircle, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PageHeader = () => {
    const navigate = useNavigate();
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Problems</h1>
                <p className="text-gray-400">Manage the challenges you've created.</p>
            </div>
            <Button onClick={() => navigate('/create-problem')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Problem
            </Button>
        </div>
    );
};

const ProblemTable = ({ problems, onEdit, onDelete }) => {
    const getDifficultyBadge = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return <Badge variant="outline" className="text-green-400 border-green-400">Easy</Badge>;
            case 'Medium': return <Badge variant="outline" className="text-yellow-400 border-yellow-400">Medium</Badge>;
            case 'Hard': return <Badge variant="outline" className="text-red-400 border-red-400">Hard</Badge>;
            default: return <Badge variant="secondary">{difficulty}</Badge>;
        }
    };

    return (
        <Card className="bg-[#282828] border-gray-700">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-700 hover:bg-transparent">
                            <TableHead className="text-white">Title</TableHead>
                            <TableHead className="text-white">Difficulty</TableHead>
                            <TableHead className="text-white">Created</TableHead>
                            <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {problems.map((problem) => (
                            <TableRow key={problem._id} className="border-gray-700">
                                <TableCell className="font-medium text-gray-300">{problem.title}</TableCell>
                                <TableCell>{getDifficultyBadge(problem.difficulty)}</TableCell>
                                <TableCell className="text-gray-400">{new Date(problem.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(problem._id)}>
                                        <Edit className="h-4 w-4 text-gray-400" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-[#1A1A1A] border-gray-700 text-white">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-gray-400">
                                                    This action cannot be undone. This will permanently delete the problem "{problem.title}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="border-gray-600 hover:bg-gray-800">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(problem._id, problem.title)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const Pagination = ({ pagination, onPageChange }) => (
    <div className="flex justify-center items-center mt-8 space-x-2">
        <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="border-gray-600 hover:bg-gray-800"
        >
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="border-gray-600 hover:bg-gray-800"
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
    </div>
);

const MyProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyProblems = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/my-problems?page=${currentPage}&limit=10`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setProblems(data.data.problems);
                    setPagination(data.data.pagination);
                } else if (response.status === 403) {
                    handleError('Access denied. Only Problem Setters and Admins can view this page.');
                    navigate('/dashboard');
                } else {
                    handleError('Failed to fetch your problems.');
                }
            } catch (error) {
                handleError('An error occurred while fetching your problems.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyProblems();
    }, [currentPage, navigate]);

    const handleDelete = async (problemId, title) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/problems/${problemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                handleSuccess(`Problem "${title}" deleted successfully.`);
                setCurrentPage(1); 
            } else {
                const data = await response.json();
                handleError(data.message || 'Failed to delete problem.');
            }
        } catch (error) {
            handleError('An error occurred while deleting the problem.');
        }
    };
    
    const handleEdit = (problemId) => navigate(`/edit-problem/${problemId}`);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <PageHeader />
            {problems.length > 0 ? (
                <>
                    <ProblemTable problems={problems} onEdit={handleEdit} onDelete={handleDelete} />
                    {pagination.totalPages > 1 && <Pagination pagination={pagination} onPageChange={setCurrentPage} />}
                </>
            ) : (
                <Card className="bg-[#282828] border-gray-700 text-center py-12">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">No Problems Found</CardTitle>
                        <CardDescription>You haven't created any problems yet. Let's change that!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/create-problem')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Problem
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MyProblems;
