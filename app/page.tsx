"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, CheckCircle, XCircle, Lightbulb, Send, RotateCcw } from "lucide-react";

interface InterviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggested_answer: string;
}

export default function Home() {
  const [question, setQuestion] = useState("Tell me about a time you faced a significant challenge at work and how you overcame it.");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze response");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">AI Interview Coach</h1>
          </div>
          <p className="text-slate-500 text-lg">Master your interview responses with instant, AI-powered feedback.</p>
        </div>

        {/* Question & Answer Card */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Interview Session</CardTitle>
            <CardDescription>Review the question and provide your best answer below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Question
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type the interview question here..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Your Answer</label>
              <Textarea
                className="min-h-[200px] text-lg resize-y"
                placeholder="I faced a challenge when..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full text-lg h-12 bg-blue-600 hover:bg-blue-700 transition-all"
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
            >
              {loading ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span> Analyzing your response...
                </>
              ) : (
                <>
                  Submit Answer <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleSubmit}>Retry</Button>
          </Alert>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="flex flex-col md:flex-row gap-6">
              {/* Score Card */}
              <Card className="flex-1 border-none shadow-md bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 uppercase">Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${result.score >= 8 ? 'text-green-600' : result.score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.score}/10
                    </div>
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreColor(result.score)} transition-all duration-1000 ease-out`}
                        style={{ width: `${result.score * 10}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="shadow-md border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-slate-700">
                        <span className="text-green-500 mt-1">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="shadow-md border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" /> Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-slate-700">
                        <span className="text-red-500 mt-1">•</span> {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Suggested Answer */}
            <Card className="shadow-lg bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lightbulb className="h-5 w-5" /> Suggested Answer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose text-slate-700">
                <p>{result.suggested_answer}</p>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-8">
              <Button variant="outline" onClick={() => { setResult(null); setAnswer(""); }} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Start New Session
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
