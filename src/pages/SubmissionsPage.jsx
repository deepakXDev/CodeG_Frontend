import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SubmissionHistory from '../components/SubmissionHistory';

// Import required shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//==============================================================================
// 1. CONFIGURATION & HELPERS
//==============================================================================

const VERDICT_CONFIG = {
  'Accepted': { variant: 'success' },
  'Wrong Answer': { variant: 'destructive' },
  'Time Limit Exceeded': { variant: 'warning' },
  'Memory Limit Exceeded': { variant: 'warning' },
  'Runtime Error': { variant: 'destructive' },
  'Compilation Error': { variant: 'secondary' },
  'default': { variant: 'outline' },
};

const getVerdictVariant = (verdict) => (VERDICT_CONFIG[verdict] || VERDICT_CONFIG.default).variant;

//==============================================================================
// 2. MAIN PAGE COMPONENT
//==============================================================================

export default function SubmissionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubmissionStats = useCallback(async () => {
    // A guard clause to prevent running the fetch if the user isn't loaded yet.
    if (!user) {
      setLoading(false); // Stop loading if there's no user
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else if (response.status === 401) {
        navigate('/auth');
      } else {
        // It's good practice to handle other non-ok statuses
        console.error('Failed to fetch submission stats:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching submission stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]); // Dependencies: The function will only be recreated if `user` or `navigate` changes.

  useEffect(() => {
    fetchSubmissionStats();
  }, [fetchSubmissionStats]);

  if (loading || !stats) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-300 font-sans pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <PageHeader navigate={navigate} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Submissions" value={stats.totalSubmissions} description="All attempts made" />
          <StatCard title="Problems Solved" value={stats.solvedProblems} description="Unique problems accepted" />
          <AcceptanceRateCard rate={stats.acceptanceRate} />
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="history">Submission History</TabsTrigger>
            <TabsTrigger value="analysis">Verdict Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <Card className="bg-[#282828] border-gray-700 text-gray-300">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>A log of your most recent code submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionHistory />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analysis">
            <VerdictBreakdown verdicts={stats.verdictBreakdown} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

//==============================================================================
// 3. UI & LAYOUT SUB-COMPONENTS
//==============================================================================

const PageHeader = ({ navigate }) => (
  <div className="text-center mb-10">
    <h1 className="text-4xl font-bold text-white mb-2">Performance Dashboard</h1>
    <p className="text-gray-400 text-lg">Analyze your submission metrics and identify areas for improvement.</p>
  </div>
);

const StatCard = ({ title, value, description }) => (
  <Card className="bg-[#282828] border-gray-700 text-gray-300">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold text-white">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </CardContent>
  </Card>
);

const AcceptanceRateCard = ({ rate }) => (
    <Card className="bg-[#282828] border-gray-700 text-gray-300">
        <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Acceptance Rate</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{rate}%</div>
            <Progress value={rate} className="w-full h-2" />
        </CardContent>
    </Card>
);

const VerdictBreakdown = ({ verdicts }) => {
  if (!verdicts || verdicts.length === 0) {
    return (
      <Card className="bg-[#282828] border-gray-700 text-gray-300">
        <CardHeader>
          <CardTitle className="text-white">Verdict Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No submission data available to analyze.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-[#282828] border-gray-700 text-gray-300">
      <CardHeader>
        <CardTitle className="text-white">Verdict Analysis</CardTitle>
        <CardDescription>A breakdown of your submission outcomes.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {verdicts.map((v) => (
          <div key={v._id} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-gray-600">
            <Badge variant={getVerdictVariant(v._id)}>{v._id}</Badge>
            <span className="font-semibold text-white">{v.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
      <p className="text-white font-medium">Analyzing Submission Data...</p>
    </div>
  </div>
);