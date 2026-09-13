import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Award, BookOpen, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { ExamPackage } from '@/data/mockQuestionBanks';

export interface ExamResult {
  examId: string;
  examTitle: string;
  subject: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  negativeDeduction: number;
  accuracy: number;
  timeSpentSeconds: number;
  submittedAt: string;
  userAnswers: Record<number, number>; // questionId -> selectedOption (0..3)
  rank?: string;
  status: 'passed' | 'failed';
}

interface ExamResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamResult | null;
  exam: ExamPackage | null;
  onRetake?: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  isOpen,
  onClose,
  result,
  exam,
  onRetake,
}) => {
  if (!result || !exam) return null;

  const isPassed = result.score >= (exam.totalMarks * (exam.passPercentage / 100));
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins} মি. ${remainingSecs < 10 ? '0' : ''}${remainingSecs} সে.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-border/80 bg-background/95 backdrop-blur-xl rounded-2xl">
        {/* Header Banner */}
        <div className={`p-6 border-b border-border/60 ${isPassed ? 'bg-gradient-to-br from-emerald-500/15 via-primary/10 to-transparent' : 'bg-gradient-to-br from-red-500/15 via-destructive/10 to-transparent'}`}>
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-primary border border-border">
                {exam.subject} • {exam.paper}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                ব্যয়িত সময়: {formatTime(result.timeSpentSeconds)}
              </span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold mt-2 text-foreground">
              {exam.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              মূল্যায়ন সম্পন্ন হয়েছে: {new Date(result.submittedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}, {new Date(result.submittedAt).toLocaleDateString('bn-BD')}
            </DialogDescription>
          </DialogHeader>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-card/90 border border-border/70 rounded-xl p-3 text-center shadow-xs">
              <span className="text-xs text-muted-foreground block mb-0.5">অর্জিত নম্বর</span>
              <p className={`text-2xl font-extrabold ${isPassed ? 'text-primary' : 'text-destructive'}`}>
                {result.score.toFixed(2)} <span className="text-xs text-muted-foreground">/ {exam.totalMarks}</span>
              </p>
              <Badge variant={isPassed ? "default" : "destructive"} className="text-[10px] mt-1">
                {isPassed ? "উত্তীর্ণ (Passed)" : "অনুত্তীর্ণ (Try Again)"}
              </Badge>
            </div>

            <div className="bg-card/90 border border-border/70 rounded-xl p-3 text-center shadow-xs">
              <span className="text-xs text-muted-foreground block mb-0.5">সঠিক উত্তর</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {result.correctCount}
              </p>
              <span className="text-[10px] text-muted-foreground block mt-1">
                +{result.correctCount} নম্বর
              </span>
            </div>

            <div className="bg-card/90 border border-border/70 rounded-xl p-3 text-center shadow-xs">
              <span className="text-xs text-muted-foreground block mb-0.5">ভুল উত্তর (-০.২৫)</span>
              <p className="text-2xl font-extrabold text-rose-500">
                {result.wrongCount}
              </p>
              <span className="text-[10px] text-destructive block mt-1">
                -{result.negativeDeduction.toFixed(2)} কর্তন
              </span>
            </div>

            <div className="bg-card/90 border border-border/70 rounded-xl p-3 text-center shadow-xs">
              <span className="text-xs text-muted-foreground block mb-0.5">মেধা অবস্থান</span>
              <p className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                <Award className="w-5 h-5 text-amber-500" />
                {result.rank || 'শীর্ষ ৫%'}
              </p>
              <span className="text-[10px] text-muted-foreground block mt-1">
                নির্ভুলতা: {result.accuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              প্রশ্নোত্তর বিশ্লেষণ ও সঠিক ব্যাখ্যা (Solution Sheet)
            </h3>
            <span className="text-xs text-muted-foreground">
              মোট প্রশ্ন: {exam.questions.length}টি
            </span>
          </div>

          <div className="space-y-4">
            {exam.questions.map((q, idx) => {
              const selectedOpt = result.userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctAnswer;
              const isWrong = isAnswered && selectedOpt !== q.correctAnswer;

              return (
                <div 
                  key={q.id} 
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    isCorrect 
                      ? 'border-emerald-500/30 bg-emerald-500/5' 
                      : isWrong 
                      ? 'border-rose-500/30 bg-rose-500/5' 
                      : 'border-border/70 bg-card/60'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                          {q.question}
                        </p>
                        {q.topic && (
                          <span className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md mt-1 inline-block">
                            টপিক: {q.topic}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCorrect && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> সঠিক (+১)
                        </span>
                      )}
                      {isWrong && (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" /> ভুল (-০.২৫)
                        </span>
                      )}
                      {!isAnswered && (
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          উত্তর দেননি (০)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt, optIdx) => {
                      const optLabel = ['(ক)', '(খ)', '(গ)', '(ঘ)'][optIdx];
                      const isThisCorrect = optIdx === q.correctAnswer;
                      const isThisSelected = selectedOpt === optIdx;

                      let optClass = "border-border/60 bg-background/50 text-foreground";
                      if (isThisCorrect) {
                        optClass = "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/30";
                      } else if (isThisSelected && !isThisCorrect) {
                        optClass = "border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through ring-1 ring-rose-500/30";
                      }

                      return (
                        <div 
                          key={optIdx} 
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${optClass}`}
                        >
                          <span className="font-bold shrink-0">{optLabel}</span>
                          <span className="flex-1">{opt}</span>
                          {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Note */}
                  {q.explanation && (
                    <div className="mt-3.5 p-3 rounded-xl bg-secondary/70 border border-border/60 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" />
                        <span>ব্যাখ্যা ও সূত্র:</span>
                      </div>
                      <p className="leading-relaxed pl-5">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
            {onRetake && (
              <Button 
                variant="outline" 
                onClick={onRetake}
                className="gap-2 rounded-xl text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                পুনরায় পরীক্ষা দিন
              </Button>
            )}

            <Button 
              onClick={onClose}
              className="ml-auto rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-2 px-5"
            >
              ড্যাশবোর্ডে ফিরে যান
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
