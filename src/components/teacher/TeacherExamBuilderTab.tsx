import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Plus, Trash2, Edit3, BookOpen, Clock, AlertCircle, 
  CheckCircle2, HelpCircle, Eye, Sparkles, Check, FileText, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { ExamPackage, Question } from '@/data/mockQuestionBanks';

interface TeacherExamBuilderTabProps {
  courses: Array<{ id: string; title: string }>;
  language: 'en' | 'bn';
}

const STORAGE_KEY = 'ap_custom_exams';

export default function TeacherExamBuilderTab({ courses, language }: TeacherExamBuilderTabProps) {
  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'builder'>('list');

  // Exam Builder State
  const [examTitle, setExamTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [paperName, setPaperName] = useState('১ম পত্র');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  const [passPercentage, setPassPercentage] = useState(40);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      topic: '',
    },
  ]);

  // Preview dialog
  const [previewExam, setPreviewExam] = useState<ExamPackage | null>(null);

  // Load custom exams on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExams(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load custom exams:', e);
    }
  }, []);

  const saveExamsToStorage = (updated: ExamPackage[]) => {
    setExams(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom exams:', e);
    }
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: questions.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      topic: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error(language === 'bn' ? 'কমপক্ষে একটি প্রশ্ন থাকতে হবে' : 'At least one question is required');
      return;
    }
    const updated = questions.filter((_, i) => i !== index).map((q, idx) => ({ ...q, id: idx + 1 }));
    setQuestions(updated);
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[optIndex] = text;
    updated[qIndex].options = newOptions;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, correctIdx: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = correctIdx;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = text;
    setQuestions(updated);
  };

  const handleTopicChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].topic = text;
    setQuestions(updated);
  };

  const resetBuilderForm = () => {
    setExamTitle('');
    setSelectedCourseId('');
    setSubjectName('');
    setPaperName('১ম পত্র');
    setDurationMinutes(15);
    setNegativeMarking(0.25);
    setPassPercentage(40);
    setQuestions([
      {
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        topic: '',
      },
    ]);
  };

  const handlePublishExam = () => {
    if (!examTitle.trim()) {
      toast.error(language === 'bn' ? 'পরীক্ষার শিরোনাম আবশ্যক' : 'Exam title is required');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(language === 'bn' ? `প্রশ্ন #${i + 1}-এর বিবরণ ফাঁকা রয়েছে` : `Question #${i + 1} text is empty`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(language === 'bn' ? `প্রশ্ন #${i + 1}-এর অপশন ${j + 1} পূরণ করুন` : `Fill option ${j + 1} in question #${i + 1}`);
          return;
        }
      }
    }

    const newExam: ExamPackage = {
      id: `teacher-exam-${Date.now()}`,
      title: examTitle.trim(),
      subject: subjectName.trim() || 'মডেল টেস্ট',
      paper: paperName,
      totalQuestions: questions.length,
      durationMinutes: Number(durationMinutes) || 15,
      totalMarks: questions.length,
      negativeMarking: Number(negativeMarking) || 0,
      passPercentage: Number(passPercentage) || 40,
      questions,
    };

    const updatedList = [newExam, ...exams];
    saveExamsToStorage(updatedList);
    toast.success(language === 'bn' ? 'মডেল টেস্ট সফলভাবে পাবলিশ হয়েছে! শিক্ষার্থীরা এখন ড্যাশবোর্ডে পরীক্ষা দিতে পারবে।' : 'Exam published successfully! Students can now take this test.');
    resetBuilderForm();
    setActiveSubTab('list');
  };

  const handleDeleteExam = (examId: string) => {
    const updated = exams.filter(e => e.id !== examId);
    saveExamsToStorage(updated);
    toast.success(language === 'bn' ? 'মডেল টেস্ট মুছে ফেলা হয়েছে' : 'Exam deleted');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-primary/5 to-transparent border border-violet-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {language === 'bn' ? 'মডেল টেস্ট ও কুইজ নির্মাতা' : 'Model Test & MCQ Quiz Builder'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'bn' 
              ? 'আপনার কোর্সের শিক্ষার্থীদের জন্য নেগেটিভ মার্কিংসহ পূর্ণাঙ্গ অনলাইন MCQ মডেল টেস্ট তৈরি ও প্রকাশ করুন'
              : 'Build and publish full-scale MCQ model tests with live timer and negative marking for your students'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeSubTab === 'list' ? 'default' : 'outline'}
            onClick={() => setActiveSubTab('list')}
            size="sm"
            className="text-xs"
          >
            {language === 'bn' ? 'তৈরিকৃত পরীক্ষাসমূহ' : 'All Tests'} ({exams.length})
          </Button>
          <Button
            variant={activeSubTab === 'builder' ? 'default' : 'outline'}
            onClick={() => setActiveSubTab('builder')}
            size="sm"
            className="text-xs gap-1.5 bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন টেস্ট বানান' : 'Create New'}</span>
          </Button>
        </div>
      </div>

      {/* SUB-TAB 1: EXAMS LIST */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-bold text-lg text-foreground">
                    {language === 'bn' ? 'এখনো কোনো মডেল টেস্ট তৈরি করেননি' : 'No tests created yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn'
                      ? 'MCQ প্রশ্ন, টাইমার এবং নেগেটিভ মার্কিং যুক্ত করে প্রথম অনলাইন মডেল টেস্ট তৈরি করুন।'
                      : 'Create your first interactive online model test with timers, options, and negative markings.'}
                  </p>
                </div>
                <Button onClick={() => setActiveSubTab('builder')} className="gap-2 bg-primary hover:bg-primary/90 text-white">
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? 'প্রথম টেস্ট তৈরি করুন' : 'Create First Test'}</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {exams.map((exam) => (
                <Card key={exam.id} className="border-border/70 hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          {exam.subject} • {exam.paper}
                        </Badge>
                        <CardTitle className="text-base font-bold text-foreground line-clamp-2">
                          {exam.title}
                        </CardTitle>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewExam(exam)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExam(exam.id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-muted/40 border border-border/50 text-xs">
                      <div>
                        <p className="text-muted-foreground">{language === 'bn' ? 'মোট প্রশ্ন' : 'Questions'}</p>
                        <p className="font-bold text-foreground mt-0.5">{exam.totalQuestions}টি</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'bn' ? 'সময় সীমা' : 'Duration'}</p>
                        <p className="font-bold text-foreground mt-0.5">{exam.durationMinutes} মিনিট</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{language === 'bn' ? 'নেগেটিভ মার্ক' : 'Negative'}</p>
                        <p className="font-bold text-red-500 mt-0.5">-{exam.negativeMarking}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'শিক্ষার্থীদের জন্য লাইভ' : 'Live for Students'}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setPreviewExam(exam)}
                        className="h-auto p-0 text-xs text-primary font-semibold"
                      >
                        {language === 'bn' ? 'প্রশ্নসমূহ দেখুন' : 'View Questions'} →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: EXAM BUILDER */}
      {activeSubTab === 'builder' && (
        <div className="space-y-6">
          {/* Exam Configuration Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {language === 'bn' ? 'পরীক্ষার সাধারণ তথ্য ও নিয়মাবলি' : 'Exam Details & Rules'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam-title">{language === 'bn' ? 'মডেল টেস্টের নাম / শিরোনাম' : 'Exam Title'} *</Label>
                  <Input 
                    id="exam-title"
                    placeholder={language === 'bn' ? 'যেমন: HSC পদার্থবিজ্ঞান ১ম পত্র: গতিবিদ্যা মডেল টেস্ট' : 'e.g., HSC Physics 1st Paper Model Test'}
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-course">{language === 'bn' ? 'কোর্স নির্বাচন করুন' : 'Assign to Course'}</Label>
                  <Select value={selectedCourseId} onValueChange={(val) => {
                    setSelectedCourseId(val);
                    const matched = courses.find(c => c.id === val);
                    if (matched) setSubjectName(matched.title);
                  }}>
                    <SelectTrigger id="exam-course">
                      <SelectValue placeholder={language === 'bn' ? 'কোর্স বেছে নিন' : 'Select course'} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subject-name" className="text-xs">{language === 'bn' ? 'বিষয়' : 'Subject'}</Label>
                  <Input 
                    id="subject-name" 
                    placeholder="পদার্থবিজ্ঞান" 
                    value={subjectName} 
                    onChange={(e) => setSubjectName(e.target.value)} 
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paper-name" className="text-xs">{language === 'bn' ? 'পত্র / অধ্যায়' : 'Paper / Part'}</Label>
                  <Input 
                    id="paper-name" 
                    placeholder="১ম পত্র" 
                    value={paperName} 
                    onChange={(e) => setPaperName(e.target.value)} 
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="duration" className="text-xs">{language === 'bn' ? 'সময় (মিনিট)' : 'Duration (mins)'}</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    min="1" 
                    max="180" 
                    value={durationMinutes} 
                    onChange={(e) => setDurationMinutes(Number(e.target.value))} 
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="negative" className="text-xs">{language === 'bn' ? 'নেগেটিভ মার্কিং' : 'Negative Mark'}</Label>
                  <Select value={String(negativeMarking)} onValueChange={(val) => setNegativeMarking(Number(val))}>
                    <SelectTrigger id="negative" className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (নেই)</SelectItem>
                      <SelectItem value="0.25">-0.25 (স্ট্যান্ডার্ড)</SelectItem>
                      <SelectItem value="0.50">-0.50 (কঠিন)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Question List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>{language === 'bn' ? `MCQ প্রশ্নমালা (${questions.length}টি প্রশ্ন)` : `MCQ Questions (${questions.length})`}</span>
              </h3>

              <Button onClick={handleAddQuestion} size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'প্রশ্ন যুক্ত করুন' : 'Add Question'}</span>
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <Card key={qIndex} className="border-border/70 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
                <CardHeader className="py-3 px-5 bg-muted/20 border-b border-border/40 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-bold text-xs">
                      {language === 'bn' ? `প্রশ্ন #${qIndex + 1}` : `Question #${qIndex + 1}`}
                    </Badge>
                    <Input
                      placeholder={language === 'bn' ? 'টপিক / অধ্যায় (ঐচ্ছিক)' : 'Topic (optional)'}
                      value={q.topic || ''}
                      onChange={(e) => handleTopicChange(qIndex, e.target.value)}
                      className="h-7 text-xs w-44"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মুছুন' : 'Remove'}</span>
                  </Button>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">{language === 'bn' ? 'প্রশ্নের বিবরণ' : 'Question Statement'} *</Label>
                    <Textarea
                      rows={2}
                      placeholder={language === 'bn' ? 'প্রশ্নের মূল টেক্সট বা গণিতের সমীকরণ লিখুন...' : 'Write question statement...'}
                      value={q.question}
                      onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* 4 Options */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>{language === 'bn' ? '৪টি অপশন ও সঠিক উত্তর সিলেক্ট করুন' : '4 Options & Correct Answer'} *</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {language === 'bn' ? 'সঠিক উত্তরের পাশের রেডিও বাটনে টিক দিন' : 'Select the radio button for correct option'}
                      </span>
                    </Label>

                    <RadioGroup 
                      value={String(q.correctAnswer)} 
                      onValueChange={(val) => handleCorrectAnswerChange(qIndex, Number(val))}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      {['ক / A', 'খ / B', 'গ / C', 'ঘ / D'].map((label, optIdx) => (
                        <div 
                          key={optIdx} 
                          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                            q.correctAnswer === optIdx 
                              ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500' 
                              : 'border-border/60 hover:bg-muted/40'
                          }`}
                        >
                          <RadioGroupItem value={String(optIdx)} id={`q-${qIndex}-opt-${optIdx}`} />
                          <span className="text-xs font-bold text-muted-foreground w-10 shrink-0">{label}:</span>
                          <Input
                            placeholder={`Option ${label}`}
                            value={q.options[optIdx]}
                            onChange={(e) => handleOptionChange(qIndex, optIdx, e.target.value)}
                            className="h-8 text-xs flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none px-1"
                          />
                          {q.correctAnswer === optIdx && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{language === 'bn' ? 'সমাধান ও ব্যাখ্যা (পরীক্ষার পর শিক্ষার্থীরা দেখতে পাবে)' : 'Solution & Explanation (shown after exam)'}</span>
                    </Label>
                    <Input
                      placeholder={language === 'bn' ? 'যেমন: সূত্র R = (v² · sin 2θ) / g অনুযায়ী উত্তর...' : 'Formula, rationale, and working steps...'}
                      value={q.explanation}
                      onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button onClick={handleAddQuestion} variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? 'আরও একটি প্রশ্ন যোগ করুন' : 'Add Another Question'}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetBuilderForm}
                  size="sm"
                  className="text-xs"
                >
                  {language === 'bn' ? 'রিসেট' : 'Reset'}
                </Button>
                <Button 
                  onClick={handlePublishExam} 
                  size="sm"
                  className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'মডেল টেস্ট পাবলিশ করুন' : 'Publish Model Test'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewExam} onOpenChange={(open) => !open && setPreviewExam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {previewExam && (
            <div className="space-y-5">
              <DialogHeader>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 w-fit mb-1 text-xs">
                  {previewExam.subject} • {previewExam.paper}
                </Badge>
                <DialogTitle className="text-lg font-bold">
                  {previewExam.title}
                </DialogTitle>
                <DialogDescription>
                  {language === 'bn' 
                    ? `সময়: ${previewExam.durationMinutes} মিনিট | মোট প্রশ্ন: ${previewExam.totalQuestions}টি | নেগেটিভ মার্কিং: -${previewExam.negativeMarking}`
                    : `Duration: ${previewExam.durationMinutes} mins | Total: ${previewExam.totalQuestions} Questions | Negative: -${previewExam.negativeMarking}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 divide-y divide-border/60">
                {previewExam.questions.map((q, idx) => (
                  <div key={idx} className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-sm text-primary">Q{idx + 1}.</span>
                      <p className="font-semibold text-sm text-foreground">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`p-2 rounded-lg text-xs border ${
                            q.correctAnswer === oIdx 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold' 
                              : 'bg-muted/20 border-border/40 text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                          {q.correctAnswer === oIdx && ' ✓'}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-muted-foreground pl-6 italic">
                        💡 ব্যাখ্যা: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button onClick={() => setPreviewExam(null)} className="w-full sm:w-auto">
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
