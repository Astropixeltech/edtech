import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2, Bookmark, ArrowLeft, ArrowRight, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ExamPackage, Question } from '@/data/mockQuestionBanks';
import { ExamResult } from './ExamResultModal';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPackage | null;
  onComplete: (result: ExamResult) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>((exam?.durationMinutes || 0) * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize exam state
  useEffect(() => {
    if (isOpen && exam) {
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setTimeLeft(exam.durationMinutes * 60);
      setShowSubmitConfirm(false);
      setTabSwitchCount(0);
    }
  }, [isOpen, exam]);

  // Anti-cheat: tab switch detection
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          toast.warning(`সতর্কবার্তা (${next} বার): পরীক্ষার পৃষ্ঠা ত্যাগ করবেন না!`, {
            duration: 4000,
          });
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          toast.error('পরীক্ষার নির্ধারিত সময় শেষ! উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা হচ্ছে...');
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  // Calculate and submit results
  const handleSubmitExam = () => {
    if (!exam) return;
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let negativeDeduction = 0;

    exam.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected !== undefined) {
        if (selected === q.correctAnswer) {
          score += 1;
          correctCount += 1;
        } else {
          score -= exam.negativeMarking;
          wrongCount += 1;
          negativeDeduction += exam.negativeMarking;
        }
      }
    });

    const unansweredCount = exam.questions.length - (correctCount + wrongCount);
    const accuracy = correctCount + wrongCount > 0 
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
      : 0;

    const totalAttempted = correctCount + wrongCount;
    const finalScore = Math.max(0, score);
    const passThreshold = exam.totalMarks * (exam.passPercentage / 100);

    // Mock merit rank logic based on percentage score
    let rank = "শীর্ষ ২০%";
    if (finalScore >= exam.totalMarks * 0.9) rank = "১ম-৫ম (শীর্ষ ১%)";
    else if (finalScore >= exam.totalMarks * 0.8) rank = "৬ষ্ঠ-১৫তম (শীর্ষ ৫%)";
    else if (finalScore >= exam.totalMarks * 0.6) rank = "শীর্ষ ১০%";

    const result: ExamResult = {
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      score: finalScore,
      totalMarks: exam.totalMarks,
      correctCount,
      wrongCount,
      unansweredCount,
      negativeDeduction,
      accuracy,
      timeSpentSeconds: (exam.durationMinutes * 60) - timeLeft,
      submittedAt: new Date().toISOString(),
      userAnswers,
      rank,
      status: finalScore >= passThreshold ? 'passed' : 'failed',
    };

    // Save to localStorage
    try {
      const existingStr = localStorage.getItem('ap_student_exam_results');
      const existingList = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('ap_student_exam_results', JSON.stringify([result, ...existingList]));
    } catch (e) {
      console.error('Failed to save exam result:', e);
    }

    setShowSubmitConfirm(false);
    onComplete(result);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!exam) return null;

  const currentQ: Question = exam.questions[currentIndex];
  const isLastQuestion = currentIndex === exam.questions.length - 1;
  const answeredCount = Object.keys(userAnswers).length;
  const remainingCount = exam.questions.length - answeredCount;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setShowSubmitConfirm(true);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[95vh] p-0 border border-border/80 bg-background/95 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden">
          {/* Top Bar: Exam Title, Subject, Live Timer */}
          <div className="p-4 sm:p-5 border-b border-border/70 bg-secondary/30 flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-bold text-primary border-primary/30">
                  {exam.subject}
                </Badge>
                <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  নেগেটিভ মার্কিং: -{exam.negativeMarking}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate max-w-md">
                {exam.title}
              </h2>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-3 ml-auto">
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border shadow-xs ${
                timeLeft <= 60 
                  ? 'bg-rose-500/20 text-rose-600 border-rose-500/40 animate-pulse' 
                  : timeLeft <= 300 
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' 
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeft)}</span>
              </div>

              <Button 
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 h-8 px-4"
              >
                <Send className="w-3.5 h-3.5" />
                <span>জমা দিন</span>
              </Button>
            </div>
          </div>

          {/* Main Body: Question Area & Navigation Palette */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Question Box (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Question Info & Flag Toggle */}
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                      প্রশ্ন {currentIndex + 1} / {exam.questions.length}
                    </span>
                    {currentQ.topic && (
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        • {currentQ.topic}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setFlaggedQuestions(prev => ({
                        ...prev,
                        [currentQ.id]: !prev[currentQ.id]
                      }));
                    }}
                    className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      flaggedQuestions[currentQ.id]
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{flaggedQuestions[currentQ.id] ? 'রিভিউ তালিকায় চিহ্নিত' : 'রিভিউয়ের জন্য চিহ্নিত করুন'}</span>
                  </button>
                </div>

                {/* Question Statement */}
                <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
                  <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === optIdx;
                    const optLabel = ['(ক)', '(খ)', '(গ)', '(ঘ)'][optIdx];

                    return (
                      <div
                        key={optIdx}
                        onClick={() => {
                          setUserAnswers(prev => ({
                            ...prev,
                            [currentQ.id]: optIdx
                          }));
                        }}
                        className={`p-3.5 rounded-xl border text-sm flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40'
                            : 'border-border/70 bg-card hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-muted-foreground/40 text-muted-foreground'
                        }`}>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : optLabel}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Nav Buttons */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="rounded-xl text-xs gap-1.5 h-8"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  পূর্ববর্তী
                </Button>

                {userAnswers[currentQ.id] !== undefined && (
                  <button
                    onClick={() => {
                      setUserAnswers(prev => {
                        const copy = { ...prev };
                        delete copy[currentQ.id];
                        return copy;
                      });
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors underline cursor-pointer"
                  >
                    উত্তর মুছুন (Clear)
                  </button>
                )}

                {isLastQuestion ? (
                  <Button
                    size="sm"
                    onClick={() => setShowSubmitConfirm(true)}
                    className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 h-8 px-4"
                  >
                    সব জমা দিন
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 h-8 px-4"
                  >
                    পরবর্তী
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right Question Palette (1 col on lg) */}
            <div className="bg-card border border-border/70 rounded-2xl p-4 space-y-4 shadow-xs">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  প্রশ্ন প্যালেট
                </h4>
                <div className="flex items-center justify-between text-xs mt-2 font-medium">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> উত্তরকৃত: {answeredCount}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" /> বাকি: {remainingCount}
                  </span>
                </div>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-border/50">
                {exam.questions.map((q, qIdx) => {
                  const isCurrent = currentIndex === qIdx;
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions[q.id];

                  let btnColor = "bg-muted/40 text-muted-foreground border-border/60";
                  if (isCurrent) {
                    btnColor = "bg-primary text-white border-primary ring-2 ring-primary/40 font-bold";
                  } else if (isFlagged) {
                    btnColor = "bg-purple-500/20 text-purple-600 border-purple-500/40 font-bold";
                  } else if (isAnswered) {
                    btnColor = "bg-emerald-500/20 text-emerald-600 border-emerald-500/40 font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(qIdx)}
                      className={`h-9 w-full rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${btnColor}`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
                  <span>উত্তর দেওয়া হয়েছে</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-purple-500/20 border border-purple-500/40" />
                  <span>রিভিউয়ের জন্য মার্কড</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-muted/40 border border-border/60" />
                  <span>উত্তর দেওয়া হয়নি</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              পরীক্ষা সমাপ্ত করবেন?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              একবার জমা দিলে আপনি আর কোনো উত্তর পরিবর্তন করতে পারবেন না।
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">মোট প্রশ্ন:</span>
              <span className="font-bold text-foreground">{exam.questions.length}টি</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <span>উত্তর সম্পন্ন:</span>
              <span className="font-bold">{answeredCount}টি</span>
            </div>
            {remainingCount > 0 && (
              <div className="flex justify-between p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
                <span>উত্তর বাকি রয়েছে:</span>
                <span>{remainingCount}টি</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} className="rounded-xl text-xs">
              পরীক্ষায় ফেরত যান
            </Button>
            <Button onClick={handleSubmitExam} className="rounded-xl text-xs font-bold bg-primary text-white">
              হ্যাঁ, জমা দিন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
