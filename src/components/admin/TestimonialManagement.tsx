import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Star, Plus, Trash2, Edit3, CheckCircle2, MessageSquareQuote, Search, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ReviewItem {
  id: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  quoteBn: string;
  quoteEn: string;
  rating: number;
  isVerified: boolean;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "1",
    nameBn: "তানভীর আহমেদ",
    nameEn: "Tanvir Ahmed",
    roleBn: "বুয়েট সিএসই (র‍্যাংক ১৫)",
    roleEn: "BUET CSE (Rank 15)",
    quoteBn: "Astropixel-এর ফিজিক্স আর হায়ার ম্যাথ ক্লাসগুলো কনসেপ্ট ক্লিয়ারিংয়ে সবচেয়ে বেশি সাহায্য করেছে। প্রবলেম সলভিং অ্যাপ্রোচ অতুলনীয়।",
    quoteEn: "Astropixel's Physics & Higher Math classes gave me unmatched concept clarity and speed for BUET admission.",
    rating: 5,
    isVerified: true,
  },
  {
    id: "2",
    nameBn: "ফারিয়া মেহজাবিন",
    nameEn: "Faria Mehzabin",
    roleBn: "ডিএমসি (মেডিকেল মেরিট ২২)",
    roleEn: "DMC (Medical Merit 22)",
    quoteBn: "বায়োলজি আর কেমিস্ট্রির প্রতিটি খুঁটিনাটি লাইন দাগিয়ে পড়ানোর পদ্ধতি মেডিকেল পরীক্ষায় হুবহু কমন পেতে সাহায্য করেছে।",
    quoteEn: "Every high-yield line in Biology and Chemistry was thoroughly explained, making medical prep effortless.",
    rating: 5,
    isVerified: true,
  },
  {
    id: "3",
    nameBn: "রাকিবুল হাসান",
    nameEn: "Rakibul Hasan",
    roleBn: "ঢাবি 'ক' ইউনিট (র‍্যাংক ৮)",
    roleEn: "DU 'A' Unit (Rank 8)",
    quoteBn: "মডেল টেস্টগুলোর স্ট্যান্ডার্ড প্রশ্ন এবং তাৎক্ষণিক সমাধান আমাকে ভর্তি পরীক্ষার ভয় কাটিয়ে আত্মবিশ্বাস এনে দিয়েছিল।",
    quoteEn: "High-standard model tests and step-by-step solutions gave me complete confidence to top the DU admission.",
    rating: 5,
    isVerified: true,
  }
];

export default function TestimonialManagement({ language = 'bn' }: { language?: string }) {
  const isBn = language === 'bn';
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('ap_homepage_testimonials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_REVIEWS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  // Form state
  const [formNameBn, setFormNameBn] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formRoleBn, setFormRoleBn] = useState('');
  const [formRoleEn, setFormRoleEn] = useState('');
  const [formQuoteBn, setFormQuoteBn] = useState('');
  const [formQuoteEn, setFormQuoteEn] = useState('');
  const [formRating, setFormRating] = useState(5);

  const saveReviews = (items: ReviewItem[]) => {
    setReviews(items);
    localStorage.setItem('ap_homepage_testimonials', JSON.stringify(items));
    toast.success(isBn ? 'টেস্টিমোনিয়াল সফলভাবে সংরক্ষিত হয়েছে' : 'Testimonial saved');
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormNameBn('');
    setFormNameEn('');
    setFormRoleBn('');
    setFormRoleEn('');
    setFormQuoteBn('');
    setFormQuoteEn('');
    setFormRating(5);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: ReviewItem) => {
    setEditingReview(item);
    setFormNameBn(item.nameBn);
    setFormNameEn(item.nameEn);
    setFormRoleBn(item.roleBn);
    setFormRoleEn(item.roleEn);
    setFormQuoteBn(item.quoteBn);
    setFormQuoteEn(item.quoteEn);
    setFormRating(item.rating);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(isBn ? 'আপনি কি এই রিভিউটি মুছে ফেলতে চান?' : 'Delete this testimonial?')) {
      const updated = reviews.filter(r => r.id !== id);
      saveReviews(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameBn || !formQuoteBn) {
      toast.error(isBn ? 'শিক্ষার্থীর নাম এবং মন্তব্য আবশ্যক' : 'Name and quote are required');
      return;
    }

    if (editingReview) {
      const updated = reviews.map(r => r.id === editingReview.id ? {
        ...r,
        nameBn: formNameBn,
        nameEn: formNameEn || formNameBn,
        roleBn: formRoleBn,
        roleEn: formRoleEn || formRoleBn,
        quoteBn: formQuoteBn,
        quoteEn: formQuoteEn || formQuoteBn,
        rating: formRating,
      } : r);
      saveReviews(updated);
    } else {
      const newItem: ReviewItem = {
        id: Date.now().toString(),
        nameBn: formNameBn,
        nameEn: formNameEn || formNameBn,
        roleBn: formRoleBn,
        roleEn: formRoleEn || formRoleBn,
        quoteBn: formQuoteBn,
        quoteEn: formQuoteEn || formQuoteBn,
        rating: formRating,
        isVerified: true,
      };
      saveReviews([newItem, ...reviews]);
    }
    setIsDialogOpen(false);
  };

  const filtered = reviews.filter(r => 
    r.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.roleBn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/70 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {isBn ? 'শিক্ষার্থী রিভিউ ও টেস্টিমোনিয়াল ম্যানেজমেন্ট' : 'Student Testimonials & Reviews'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isBn ? 'হোমপেজ ও ল্যান্ডিং পেজে প্রদর্শিত সফল শিক্ষার্থীদের মন্তব্য ও রিভিউ নিয়ন্ত্রণ করুন' : 'Manage student success stories shown on homepage & courses'}
            </p>
          </div>
        </div>

        <Button onClick={handleOpenAdd} className="gap-1.5 h-9 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs">
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন রিভিউ যোগ করুন' : 'Add Testimonial'}</span>
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={isBn ? "শিক্ষার্থীর নাম বা রোল সার্চ করুন..." : "Search by student name or role..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {filtered.length} {isBn ? 'টি রিভিউ পাওয়া গেছে' : 'reviews found'}
        </span>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rev) => (
          <div key={rev.id} className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                    {rev.nameBn.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{rev.nameBn}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{rev.roleBn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-foreground/85 italic leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40">
                "{rev.quoteBn}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isBn ? 'ভেরিফাইড' : 'Verified'}
              </span>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(rev)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(rev.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? (isBn ? 'রিভিউ এডিট করুন' : 'Edit Testimonial') : (isBn ? 'নতুন রিভিউ যুক্ত করুন' : 'Add Testimonial')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isBn ? 'শিক্ষার্থীর নাম (বাংলা)' : 'Student Name (Bangla)'}</Label>
              <Input
                value={formNameBn}
                onChange={(e) => setFormNameBn(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
                className="h-10 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isBn ? 'পরিচয় / বিশ্ববিদ্যালয় ও র‍্যাংক (বাংলা)' : 'Identity / University (Bangla)'}</Label>
              <Input
                value={formRoleBn}
                onChange={(e) => setFormRoleBn(e.target.value)}
                placeholder="যেমন: বুয়েট সিএসই (র‍্যাংক ১৫)"
                className="h-10 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isBn ? 'শিক্ষার্থীর রিভিউ / বক্তব্য (বাংলা)' : 'Student Quote (Bangla)'}</Label>
              <Textarea
                value={formQuoteBn}
                onChange={(e) => setFormQuoteBn(e.target.value)}
                placeholder="কোর্স ও প্ল্যাটফর্ম সম্পর্কে বিস্তারিত অনুভূতি..."
                className="rounded-xl text-sm min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isBn ? 'স্টার রেটিং (১-৫)' : 'Star Rating (1-5)'}</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={formRating}
                onChange={(e) => setFormRating(Number(e.target.value))}
                className="h-10 rounded-xl text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl text-xs">
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white">
                {isBn ? 'সংরক্ষণ করুন' : 'Save Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
