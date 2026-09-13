import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ImageUploader from '@/components/admin/ImageUploader';

export type EditorCourse = {
  id: string;
  title: string;
  title_en: string | null;
  landing_slug: string | null;
  thumbnail_url: string | null;
  banner_url?: string | null;
  description: string | null;
  description_en: string | null;
  short_description: string | null;
  short_description_en: string | null;
  trainer_bio: string | null;
  trainer_bio_en: string | null;
  start_date: string | null;
  class_time: string | null;
  total_classes: string | null;
  duration: string | null;
  learning_outcomes: string[] | null;
  why_learn: string[] | null;
  intro_video_url: string | null;
  faqs: { question: string; answer: string }[] | null;
};

type TeamMember = { id: string; name: string; role: string | null; image_url: string | null };
type CourseInstructor = { instructor_id: string; role: 'owner' | 'co_instructor'; order_index: number };
type ModuleRow = { id?: string; title: string; description: string | null; order_index: number };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

interface Props {
  courses: EditorCourse[];
  /** If true, hide course picker (single-course mode). */
  singleCourse?: boolean;
  /** Restrict team member picker to learn scope. */
  learnScopeOnly?: boolean;
}

export default function CourseLandingEditor({ courses, singleCourse, learnScopeOnly = true }: Props) {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const [selectedId, setSelectedId] = useState<string>(courses[0]?.id ?? '');
  const [form, setForm] = useState<EditorCourse | null>(null);
  const [saving, setSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [instructors, setInstructors] = useState<CourseInstructor[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [addPick, setAddPick] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('team_members')
        .select('id,name,role,image_url,site_scope,is_active')
        .eq('is_active', true)
        .order('order_index');
      const tm = ((data ?? []) as any[]).filter((t) =>
        !learnScopeOnly ? true : !t.site_scope || t.site_scope === 'learn' || t.site_scope === 'both',
      );
      setTeamMembers(tm);
    })();
  }, [learnScopeOnly]);

  useEffect(() => {
    if (!selectedId) { setForm(null); return; }
    const c = courses.find((x) => x.id === selectedId);
    if (c) {
      setForm({
        ...c,
        banner_url: c.banner_url || (typeof window !== 'undefined' ? localStorage.getItem('course_banner_' + c.id) : null) || null,
        learning_outcomes: Array.isArray(c.learning_outcomes) ? c.learning_outcomes : [],
        why_learn: Array.isArray(c.why_learn) ? c.why_learn : [],
        faqs: Array.isArray(c.faqs) ? c.faqs : [],
      });
    }
    (async () => {
      const [{ data: ci }, { data: mods }] = await Promise.all([
        supabase
          .from('course_instructors')
          .select('instructor_id,role,order_index')
          .eq('course_id', selectedId)
          .order('order_index'),
        supabase
          .from('course_modules')
          .select('id,title,description,order_index')
          .eq('course_id', selectedId)
          .order('order_index'),
      ]);
      setInstructors((ci ?? []) as any);
      setModules((mods ?? []) as any);
    })();
  }, [selectedId, courses]);

  const update = (patch: Partial<EditorCourse>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const save = async () => {
    if (!form) return;
    if (!form.title || !form.title.trim()) {
      toast.error(isBn ? 'Title আবশ্যক' : 'Title is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: form.title,
          title_en: form.title_en || null,
          landing_slug: form.landing_slug || null,
          thumbnail_url: form.thumbnail_url || null,
          banner_url: form.banner_url || null,
          intro_video_url: form.intro_video_url || null,
          description: form.description,
          description_en: form.description_en,
          short_description: form.short_description,
          short_description_en: form.short_description_en,
          trainer_bio: form.trainer_bio,
          trainer_bio_en: form.trainer_bio_en,
          start_date: form.start_date,
          class_time: form.class_time,
          total_classes: form.total_classes,
          duration: form.duration,
          learning_outcomes: form.learning_outcomes ?? [],
          why_learn: form.why_learn ?? [],
          faqs: form.faqs ?? [],
        } as any)
        .eq('id', form.id);
      if (error) throw error;

      // Replace instructors
      const del = await supabase.from('course_instructors').delete().eq('course_id', form.id);
      if (del.error) throw del.error;
      if (instructors.length) {
        const ins = await supabase.from('course_instructors').insert(
          instructors.map((r, idx) => ({
            course_id: form.id,
            instructor_id: r.instructor_id,
            role: r.role,
            order_index: idx,
          })),
        );
        if (ins.error) throw ins.error;
      }

      // Replace modules (delete-all + insert-all)
      const delMods = await supabase.from('course_modules').delete().eq('course_id', form.id);
      if (delMods.error) throw delMods.error;
      const cleanMods = modules.filter((m) => m.title.trim().length > 0);
      if (cleanMods.length) {
        const insMods = await supabase.from('course_modules').insert(
          cleanMods.map((m, idx) => ({
            course_id: form.id,
            title: m.title,
            description: m.description,
            order_index: idx,
          })),
        );
        if (insMods.error) throw insMods.error;
      }

      if (typeof window !== 'undefined') {
        if (form.banner_url) {
          localStorage.setItem('course_banner_' + form.id, form.banner_url);
        } else {
          localStorage.removeItem('course_banner_' + form.id);
        }
      }

      toast.success(isBn ? 'সেভ হয়েছে' : 'Saved');
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addInstructor = () => {
    if (!addPick) return;
    if (instructors.some((i) => i.instructor_id === addPick)) {
      toast.error(isBn ? 'ইতিমধ্যে যোগ করা' : 'Already added');
      return;
    }
    const nextRole: 'owner' | 'co_instructor' = instructors.length === 0 ? 'owner' : 'co_instructor';
    setInstructors([...instructors, { instructor_id: addPick, role: nextRole, order_index: instructors.length }]);
    setAddPick('');
  };

  const moveIns = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= instructors.length) return;
    const next = [...instructors];
    [next[idx], next[j]] = [next[j], next[idx]];
    setInstructors(next);
  };

  const moveMod = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= modules.length) return;
    const next = [...modules];
    [next[idx], next[j]] = [next[j], next[idx]];
    setModules(next);
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {isBn ? 'কোনো কোর্স নেই যেটির ল্যান্ডিং পেজ এডিট করা যায়।' : 'No courses available to edit.'}
        </CardContent>
      </Card>
    );
  }

  if (!form) return <div className="text-muted-foreground">Loading...</div>;

  const outcomes = form.learning_outcomes ?? [];
  const whyList = form.why_learn ?? [];
  const faqs = form.faqs ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'ল্যান্ডিং পেজ কনটেন্ট' : 'Landing Page Content'}</CardTitle>
          <CardDescription>
            {isBn ? 'Public URL: /courses/<slug>' : 'Public URL: /courses/<slug>'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!singleCourse && (
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[240px]">
                <Label>{isBn ? 'কোর্স' : 'Course'}</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title_en || c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.landing_slug && (
                <Button variant="outline" asChild>
                  <a href={`/courses/${form.landing_slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> /courses/{form.landing_slug}
                  </a>
                </Button>
              )}
            </div>
          )}
          {singleCourse && form.landing_slug && (
            <Button variant="outline" asChild size="sm">
              <a href={`/courses/${form.landing_slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> {isBn ? 'লাইভ পেজ দেখুন' : 'View live page'}
              </a>
            </Button>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isBn ? 'কোর্স টাইটেল (বাংলা)' : 'Course Title (Bangla)'} *</Label>
              <Input
                value={form.title ?? ''}
                onChange={(e) => update({ title: e.target.value })}
                placeholder={isBn ? 'যেমন: গ্রাফিক ডিজাইন মাস্টারক্লাস' : 'e.g. Graphic Design Masterclass'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isBn ? 'কোর্স ম্যানেজমেন্ট আর ল্যান্ডিং পেজ — দুই জায়গাতেই একসাথে আপডেট হবে।' : 'Syncs with Course Management and the landing page.'}
              </p>
            </div>
            <div>
              <Label>Course Title (English)</Label>
              <Input
                value={form.title_en ?? ''}
                onChange={(e) => update({ title_en: e.target.value })}
                placeholder="e.g. Graphic Design Masterclass"
              />
            </div>
          </div>

          <div>

            <Label>{isBn ? 'URL Slug' : 'URL Slug'} *</Label>
            <div className="flex gap-2">
              <Input
                value={form.landing_slug ?? ''}
                onChange={(e) => update({ landing_slug: e.target.value.trim() })}
                placeholder="graphic-design-masterclass"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => update({ landing_slug: slugify(form.title_en || form.title) })}
              >
                Auto
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              /courses/{form.landing_slug || 'your-slug'}
            </p>
          </div>

          <div>
            <Label>{isBn ? 'কোর্স থাম্বনেইল (কার্ড প্রিভিউ)' : 'Course Thumbnail (Card Preview)'}</Label>
            <ImageUploader
              value={form.thumbnail_url ?? ''}
              onChange={(url) => update({ thumbnail_url: url })}
              folder="course-thumbnails"
              aspectRatio="video"
            />
          </div>

          {/* Course Hero Banner Editor Section */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{isBn ? 'কোর্স হিরো ব্যানার (Course Hero Banner)' : 'Course Hero Banner'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {isBn ? 'হেডার ব্যানার' : 'Header Banner'}
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn 
                    ? 'কোর্স ডিটেইলস পেজের শীর্ষে বড় প্রিমিয়াম ব্যানার ইমেজ হিসেবে প্রদর্শিত হবে।' 
                    : 'Displays prominently at the very top of the course details page.'}
                </p>
              </div>
              {form.banner_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => update({ banner_url: null })}
                  className="text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {isBn ? 'রিমুভ' : 'Remove'}
                </Button>
              )}
            </div>

            <ImageUploader
              value={form.banner_url ?? ''}
              onChange={(url) => update({ banner_url: url })}
              folder="course-banners"
              aspectRatio="video"
            />

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs text-slate-700 dark:text-slate-300">
                {isBn ? 'অথবা সরাসরি ব্যানার ইমেজ URL দিন' : 'Or input direct Image URL'}
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={form.banner_url ?? ''}
                  onChange={(e) => update({ banner_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="text-xs font-mono flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => update({ 
                    banner_url: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=1600&auto=format&fit=crop" 
                  })}
                  className="text-xs shrink-0 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {isBn ? 'রসায়ন ব্যানার প্রিসেট' : 'Chemistry Preset'}
                </Button>
              </div>
            </div>

            {form.banner_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-700/60 shadow-md relative aspect-[21/8] bg-slate-900">
                <img
                  src={form.banner_url}
                  alt="Hero Banner Preview"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="font-semibold truncate max-w-[70%]">{form.title || 'Course Title'}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                    {isBn ? 'লাইভ ব্যানার প্রিভিউ' : 'Live Banner Preview'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>{isBn ? 'YouTube ইন্ট্রো ভিডিও URL' : 'YouTube Intro Video URL'}</Label>
            <Input
              value={form.intro_video_url ?? ''}
              onChange={(e) => update({ intro_video_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isBn ? 'About this Course (বাংলা)' : 'About (Bangla)'}</Label>
              <Textarea rows={5} value={form.description ?? ''} onChange={(e) => update({ description: e.target.value })} />
            </div>
            <div>
              <Label>About (English)</Label>
              <Textarea rows={5} value={form.description_en ?? ''} onChange={(e) => update({ description_en: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isBn ? 'শর্ট ডেসক্রিপশন (বাংলা)' : 'Short Description (Bangla)'}</Label>
              <Textarea rows={3} value={form.short_description ?? ''} onChange={(e) => update({ short_description: e.target.value })} />
            </div>
            <div>
              <Label>Short Description (English)</Label>
              <Textarea rows={3} value={form.short_description_en ?? ''} onChange={(e) => update({ short_description_en: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isBn ? 'ট্রেইনার বায়ো (বাংলা)' : 'Trainer Bio (Bangla)'}</Label>
              <Textarea rows={4} value={form.trainer_bio ?? ''} onChange={(e) => update({ trainer_bio: e.target.value })} />
            </div>
            <div>
              <Label>Trainer Bio (English)</Label>
              <Textarea rows={4} value={form.trainer_bio_en ?? ''} onChange={(e) => update({ trainer_bio_en: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label>{isBn ? 'শুরুর তারিখ' : 'Start Date'}</Label>
              <Input value={form.start_date ?? ''} onChange={(e) => update({ start_date: e.target.value })} placeholder='1 Jan 2026' />
            </div>
            <div>
              <Label>{isBn ? 'ক্লাসের সময়' : 'Class Time'}</Label>
              <Input value={form.class_time ?? ''} onChange={(e) => update({ class_time: e.target.value })} placeholder='9 PM' />
            </div>
            <div>
              <Label>{isBn ? 'মোট ক্লাস' : 'Total Classes'}</Label>
              <Input value={form.total_classes ?? ''} onChange={(e) => update({ total_classes: e.target.value })} placeholder='24' />
            </div>
            <div>
              <Label>{isBn ? 'সময়কাল' : 'Duration'}</Label>
              <Input value={form.duration ?? ''} onChange={(e) => update({ duration: e.target.value })} placeholder='3 months' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Modules / Syllabus */}
      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'কোর্স মডিউল / সিলেবাস' : 'Course Modules / Syllabus'}</CardTitle>
          <CardDescription>
            {isBn ? 'ল্যান্ডিং পেজে accordion আকারে দেখাবে।' : 'Shown as accordion sections on the landing page.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.map((m, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-6">{String(i + 1).padStart(2, '0')}</span>
                <Input
                  placeholder={isBn ? 'মডিউল টাইটেল' : 'Module title'}
                  value={m.title}
                  onChange={(e) => {
                    const next = [...modules];
                    next[i] = { ...next[i], title: e.target.value };
                    setModules(next);
                  }}
                />
                <Button variant="ghost" size="icon" onClick={() => moveMod(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => moveMod(i, 1)} disabled={i === modules.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setModules(modules.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                rows={3}
                placeholder={isBn ? 'বর্ণনা / ক্লাস তালিকা (প্রতি লাইনে একটি)' : 'Description / class list (one per line)'}
                value={m.description ?? ''}
                onChange={(e) => {
                  const next = [...modules];
                  next[i] = { ...next[i], description: e.target.value };
                  setModules(next);
                }}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModules([...modules, { title: '', description: '', order_index: modules.length }])}
          >
            <Plus className="h-4 w-4 mr-1" /> {isBn ? 'মডিউল যোগ' : 'Add Module'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? "যা শিখবেন" : "What You'll Learn"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {outcomes.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={o}
                onChange={(e) => {
                  const next = [...outcomes];
                  next[i] = e.target.value;
                  update({ learning_outcomes: next });
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => update({ learning_outcomes: outcomes.filter((_, j) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant='outline' size='sm' onClick={() => update({ learning_outcomes: [...outcomes, ''] })}>
            <Plus className='h-4 w-4 mr-1' /> Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'কেন শিখবেন (Why Learn)' : 'Why Learn'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {whyList.map((w, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={w}
                onChange={(e) => {
                  const next = [...whyList];
                  next[i] = e.target.value;
                  update({ why_learn: next });
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => update({ why_learn: whyList.filter((_, j) => j !== i) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant='outline' size='sm' onClick={() => update({ why_learn: [...whyList, ''] })}>
            <Plus className='h-4 w-4 mr-1' /> Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'ইন্সট্রাক্টররা' : 'Instructors'}</CardTitle>
          <CardDescription>
            {isBn
              ? 'প্রথম জন Owner হবে; co-instructor-ও কোর্সের full teacher access পাবেন।'
              : 'The first entry is Owner; co-instructors also get full teacher access.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructors.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {isBn ? 'এখনো কোনো instructor assign করা হয়নি।' : 'No instructors assigned yet.'}
            </p>
          )}
          {instructors.map((ci, idx) => {
            const tm = teamMembers.find((t) => t.id === ci.instructor_id);
            return (
              <div key={ci.instructor_id} className="flex items-center gap-2 p-2 border rounded-lg">
                {tm?.image_url ? (
                  <img src={tm.image_url} alt={tm.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tm?.name ?? ci.instructor_id}</div>
                  <div className="text-xs text-muted-foreground truncate">{tm?.role ?? ''}</div>
                </div>
                <Select
                  value={ci.role}
                  onValueChange={(v) => {
                    const next = [...instructors];
                    next[idx] = { ...next[idx], role: v as 'owner' | 'co_instructor' };
                    setInstructors(next);
                  }}
                >
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="co_instructor">Co-instructor</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => moveIns(idx, -1)} disabled={idx === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => moveIns(idx, 1)} disabled={idx === instructors.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setInstructors(instructors.filter((_, j) => j !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <div className="flex gap-2">
            <Select value={addPick} onValueChange={setAddPick}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={isBn ? 'Team member বাছাই করুন' : 'Select a team member'} />
              </SelectTrigger>
              <SelectContent>
                {teamMembers
                  .filter((t) => !instructors.some((i) => i.instructor_id === t.id))
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}{t.role ? ` — ${t.role}` : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={addInstructor} disabled={!addPick}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="space-y-2 p-3 border rounded-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Question"
                  value={f.question}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[i] = { ...next[i], question: e.target.value };
                    update({ faqs: next });
                  }}
                />
                <Button variant="ghost" size="icon" onClick={() => update({ faqs: faqs.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="Answer"
                value={f.answer}
                onChange={(e) => {
                  const next = [...faqs];
                  next[i] = { ...next[i], answer: e.target.value };
                  update({ faqs: next });
                }}
              />
            </div>
          ))}
          <Button variant='outline' size='sm' onClick={() => update({ faqs: [...faqs, { question: '', answer: '' }] })}>
            <Plus className='h-4 w-4 mr-1' /> Add FAQ
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-4 z-10">
        <Button onClick={save} disabled={saving} size="lg" className="shadow-xl">
          {saving ? (isBn ? 'সেভ হচ্ছে...' : 'Saving...') : (isBn ? 'সব সেভ করুন' : 'Save Changes')}
        </Button>
      </div>
    </div>
  );
}
