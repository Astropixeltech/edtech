import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, Search, Trash2, Edit3, Globe, BookOpen, 
  Send, AlertCircle, CheckCircle2, Clock, Megaphone,
  Pin, Sparkles, Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  course_id: string | null;
  teacher_id?: string | null;
  is_global: boolean;
  created_at: string;
  course?: {
    title: string;
  } | null;
}

interface AdminNoticeManagementProps {
  language: 'en' | 'bn';
  courses?: Array<{ id: string; title: string }>;
}

export default function AdminNoticeManagement({ language, courses = [] }: AdminNoticeManagementProps) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'global' | 'course'>('all');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: 'all',
  });

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select(`
          id,
          title,
          content,
          course_id,
          teacher_id,
          is_global,
          created_at,
          course:courses(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices((data as unknown as NoticeItem[]) || []);
    } catch (err: any) {
      console.error('Error fetching admin notices:', err);
      toast.error(language === 'bn' ? 'নোটিশ লোড করতে সমস্যা হয়েছে' : 'Failed to load notices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin-notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => {
        fetchNotices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openCreateDialog = () => {
    setEditingNotice(null);
    setFormData({ title: '', content: '', courseId: 'all' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      courseId: notice.course_id || 'all',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error(language === 'bn' ? 'শিরোনাম ও বিস্তারিত আবশ্যক' : 'Title and content are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const isGlobal = formData.courseId === 'all';
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        course_id: isGlobal ? null : formData.courseId,
        is_global: isGlobal,
        teacher_id: profile?.id || null,
      };

      if (editingNotice) {
        const { error } = await supabase
          .from('notices')
          .update(payload)
          .eq('id', editingNotice.id);

        if (error) throw error;
        toast.success(language === 'bn' ? 'নোটিশ সফলভাবে আপডেট হয়েছে' : 'Notice updated successfully');
      } else {
        const { error } = await supabase
          .from('notices')
          .insert(payload);

        if (error) throw error;
        toast.success(language === 'bn' ? 'নতুন নোটিশ সফলভাবে পাবলিশ হয়েছে' : 'Notice published successfully');
      }

      setIsDialogOpen(false);
      fetchNotices();
    } catch (err: any) {
      console.error('Error saving notice:', err);
      toast.error(err.message || (language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save notice'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      toast.success(language === 'bn' ? 'নোটিশ মুছে ফেলা হয়েছে' : 'Notice deleted');
      setDeleteId(null);
      fetchNotices();
    } catch (err: any) {
      console.error('Error deleting notice:', err);
      toast.error(language === 'bn' ? 'মুছে ফেলতে ব্যর্থ' : 'Failed to delete');
    }
  };

  // Filter notices
  const filteredNotices = notices.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.course?.title && n.course.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'global') return n.is_global;
    if (filterType === 'course') return !n.is_global;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border border-primary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-white shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {language === 'bn' ? 'কেন্দ্রীয় নোটিশ ও ঘোষণা বোর্ড' : 'Central Notice & Announcement Board'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'bn' 
              ? 'প্ল্যাটফর্মের সকল শিক্ষার্থী ও শিক্ষককে জরুরি নোটিশ, পরীক্ষার রুটিন এবং অফার জানান' 
              : 'Broadcast urgent announcements, exam routines, and system updates to all users'}
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-md bg-primary hover:bg-primary/90 text-white shrink-0">
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন নোটিশ দিন' : 'Broadcast Notice'}</span>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'মোট নোটিশ' : 'Total Notices'}</p>
              <p className="text-2xl font-bold">{notices.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'গ্লোবাল নোটিশ (সবার জন্য)' : 'Global Broadcasts'}</p>
              <p className="text-2xl font-bold">{notices.filter(n => n.is_global).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{language === 'bn' ? 'কোর্স নির্দিষ্ট নোটিশ' : 'Course-Specific'}</p>
              <p className="text-2xl font-bold">{notices.filter(n => !n.is_global).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={language === 'bn' ? 'নোটিশ খুঁজুন...' : 'Search notices...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className="text-xs"
          >
            {language === 'bn' ? 'সব নোটিশ' : 'All'}
          </Button>
          <Button
            variant={filterType === 'global' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('global')}
            className="text-xs"
          >
            {language === 'bn' ? 'গ্লোবাল' : 'Global'}
          </Button>
          <Button
            variant={filterType === 'course' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('course')}
            className="text-xs"
          >
            {language === 'bn' ? 'কোর্স নির্দিষ্ট' : 'Course-Specific'}
          </Button>
        </div>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground">
              {language === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি' : 'No notices found'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {language === 'bn' 
                ? 'এখনো কোনো নোটিশ পোস্ট করা হয়নি অথবা সার্চ রেজাল্টের সাথে মেলেনি।'
                : 'No announcements published yet. Click "Broadcast Notice" to post one.'}
            </p>
            <Button onClick={openCreateDialog} variant="outline" size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-1.5" />
              {language === 'bn' ? 'প্রথম নোটিশ দিন' : 'Create First Notice'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNotices.map((notice) => (
            <Card 
              key={notice.id} 
              className={`border transition-all duration-200 hover:shadow-md ${
                notice.is_global ? 'border-blue-500/30 bg-blue-500/[0.02]' : 'border-emerald-500/30 bg-emerald-500/[0.02]'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.is_global ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 text-xs">
                        <Globe className="w-3 h-3" />
                        {language === 'bn' ? 'সবার জন্য (গ্লোবাল)' : 'Global Broadcast'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-xs">
                        <BookOpen className="w-3 h-3" />
                        {notice.course?.title || (language === 'bn' ? 'কোর্স নির্দিষ্ট' : 'Course')}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notice.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(notice)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(notice.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardTitle className="text-base font-bold text-foreground mt-1">
                  {notice.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {notice.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                {editingNotice 
                  ? (language === 'bn' ? 'নোটিশ সম্পাদনা করুন' : 'Edit Notice')
                  : (language === 'bn' ? 'নতুন নোটিশ পাবলিশ করুন' : 'Broadcast New Notice')}
              </DialogTitle>
              <DialogDescription>
                {language === 'bn'
                  ? 'শিক্ষার্থী ও শিক্ষকদের ড্যাশবোর্ডে তাৎক্ষণিক নোটিফিকেশন পাঠাতে এই ফর্মটি পূরণ করুন।'
                  : 'Broadcast platform notices and important updates to all registered users.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notice-title">
                  {language === 'bn' ? 'নোটিশের শিরোনাম' : 'Notice Title'} *
                </Label>
                <Input
                  id="notice-title"
                  placeholder={language === 'bn' ? 'যেমন: আগামীকালের লাইভ ক্লাসের সময় পরিবর্তন' : 'e.g., Live Class Schedule Updated'}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notice-course">
                  {language === 'bn' ? 'টার্গেট অডিয়েন্স / কোর্স' : 'Target Audience / Course'}
                </Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, courseId: val }))}
                >
                  <SelectTrigger id="notice-course">
                    <SelectValue placeholder={language === 'bn' ? 'কোর্স নির্বাচন করুন' : 'Select course'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      🌐 {language === 'bn' ? 'সকলের জন্য (গ্লোবাল ব্রডকাস্ট)' : 'All Users (Global Broadcast)'}
                    </SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        📚 {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notice-content">
                  {language === 'bn' ? 'নোটিশের বিস্তারিত বার্তা' : 'Notice Details'} *
                </Label>
                <Textarea
                  id="notice-content"
                  rows={5}
                  placeholder={language === 'bn' ? 'বিস্তারিত নোটিশ ও নির্দেশনা লিখুন...' : 'Write detailed announcement message...'}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {editingNotice 
                    ? (language === 'bn' ? 'আপডেট করুন' : 'Update Notice')
                    : (language === 'bn' ? 'ব্রডকাস্ট করুন' : 'Publish Notice')}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {language === 'bn' ? 'নোটিশ মুছে ফেলা নিশ্চিত করুন' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn'
                ? 'আপনি কি নিশ্চিত যে এই নোটিশটি চিরতরে মুছে ফেলতে চান? এটি শিক্ষার্থীদের ড্যাশবোর্ড থেকেও মুছে যাবে।'
                : 'Are you sure you want to permanently delete this notice? Students will no longer see it.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
