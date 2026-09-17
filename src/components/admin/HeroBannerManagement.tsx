import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Image, Plus, Trash2, Pencil, Save, Sparkles, MoveUp, MoveDown, Layers, Link as LinkIcon, RefreshCw, Eye } from "lucide-react";
import { HeroSlide, DEFAULT_HERO_SLIDES } from "@/types/banners";
import ImageUploader from "./ImageUploader";

export default function HeroBannerManagement() {
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  const [formData, setFormData] = useState<HeroSlide>({
    id: "",
    image: "",
    eyebrowBn: "",
    eyebrowEn: "",
    title1Bn: "",
    title1En: "",
    title2Bn: "",
    title2En: "",
    title3Bn: "",
    title3En: "",
    subtitleBn: "",
    subtitleEn: "",
    ctaBn: "",
    ctaEn: "",
    ctaHref: "#courses"
  });

  // Fetch from DB or LocalStorage
  const { data: dbContent, isLoading } = useQuery({
    queryKey: ['page-content-hero-banners'],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('page_content')
          .select('content_en')
          .eq('content_key', 'hero_banners_json')
          .maybeSingle();

        if (data?.content_en) {
          const parsed = JSON.parse(data.content_en);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed as HeroSlide[];
        }
      } catch (e) {
        console.warn('Error reading DB banners:', e);
      }
      const local = typeof window !== 'undefined' ? localStorage.getItem('hero_banners_json') : null;
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed as HeroSlide[];
        } catch {}
      }
      return DEFAULT_HERO_SLIDES;
    }
  });

  useEffect(() => {
    if (dbContent && dbContent.length > 0) {
      setSlides(dbContent);
    } else if (!isLoading && slides.length === 0) {
      setSlides(DEFAULT_HERO_SLIDES);
      saveMutation.mutate(DEFAULT_HERO_SLIDES);
    }
  }, [dbContent, isLoading]);

  const handleRestoreDefaults = () => {
    if (confirm("আপনি কি ডিফল্ট হিরো ব্যানারগুলো রিস্টোর করতে চান? এতে বর্তমান ব্যানারগুলো ডিফল্ট ২ টি ব্যানারে পরিবর্তিত হবে।")) {
      setSlides(DEFAULT_HERO_SLIDES);
      saveMutation.mutate(DEFAULT_HERO_SLIDES);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (updatedSlides: HeroSlide[]) => {
      const jsonStr = JSON.stringify(updatedSlides);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hero_banners_json', jsonStr);
      }

      // Save for both 'home' and 'courses' page scopes to guarantee seamless sync
      const targetPages = ['home', 'courses'];
      for (const pName of targetPages) {
        const { data: existing } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_name', pName)
          .eq('content_key', 'hero_banners_json')
          .maybeSingle();

        if (existing?.id) {
          await supabase
            .from('page_content')
            .update({ content_en: jsonStr, is_active: true })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('page_content')
            .insert({
              page_name: pName,
              content_key: 'hero_banners_json',
              content_en: jsonStr,
              site_scope: 'learn',
              is_active: true
            });
        }
      }

      // Broadcast real-time update event so CoursesPage updates instantaneously
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hero-banners-updated', { detail: updatedSlides }));
        window.dispatchEvent(new Event('storage'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content-hero-banners'] });
      queryClient.invalidateQueries({ queryKey: ['page-content-public'] });
      toast.success("হিরো ব্যানার সফলভাবে সেভ করা হয়েছে!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "সেভ করতে সমস্যা হয়েছে");
    }
  });

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      id: Date.now().toString(),
      image: "https://nid.edu.bd/wp-content/uploads/2024/05/BBA-web-slider-01-01-01-scaled-e1753431207269.jpg",
      eyebrowBn: "ডিজিটাল স্কিল একাডেমি",
      eyebrowEn: "Digital Skill Academy",
      title1Bn: "নতুন ব্যানার শিরোনাম ১",
      title1En: "New Banner Line 1",
      title2Bn: "শিরোনাম ২",
      title2En: "Line 2 Text",
      title3Bn: "শিরোনাম ৩",
      title3En: "Line 3 Text",
      subtitleBn: "কোর্সের সুন্দর বর্ণনা এখানে লিখুন",
      subtitleEn: "Course subtitle description text here",
      ctaBn: "কোর্স দেখুন",
      ctaEn: "View Course",
      ctaHref: "#courses"
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({ ...slide });
    setIsDialogOpen(true);
  };

  const handleSaveSlide = () => {
    if (!formData.image.trim()) {
      toast.error("ব্যানার ইমেজের URL লিখুন");
      return;
    }

    let nextSlides = [...slides];
    if (editingSlide) {
      nextSlides = nextSlides.map(s => (s.id === editingSlide.id ? formData : s));
    } else {
      nextSlides.push(formData);
    }

    setSlides(nextSlides);
    saveMutation.mutate(nextSlides);
    setIsDialogOpen(false);
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই ব্যানারটি ডিলিট করতে চান?")) {
      const nextSlides = slides.filter(s => s.id !== id);
      setSlides(nextSlides);
      saveMutation.mutate(nextSlides);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const nextSlides = [...slides];
    const temp = nextSlides[index];
    nextSlides[index] = nextSlides[targetIndex];
    nextSlides[targetIndex] = temp;

    setSlides(nextSlides);
    saveMutation.mutate(nextSlides);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Hero Banner Management</h2>
            <p className="text-sm text-muted-foreground">
              হোম পেজের হিরো ব্যানার স্লাইড যোগ, পরিবর্তন, আপলোড ও রিমুভ করুন (ফুল কন্ট্রোল)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRestoreDefaults} className="gap-1.5 text-xs sm:text-sm">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            ডিফল্ট ব্যানার রিস্টোর
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-xs sm:text-sm">
            <Plus className="w-4 h-4" />
            নতুন ব্যানার যোগ করুন
          </Button>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {slides.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-border/70 rounded-2xl bg-muted/20 space-y-3">
          <Image className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-foreground text-base">বর্তমানে কোনো হিরো ব্যানার নেই</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              নতুন ব্যানার যোগ করুন অথবা নিচের বাটনে ক্লিক করে ডিফল্ট ব্যানারগুলো চালু করুন।
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={handleRestoreDefaults} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              ডিফল্ট ব্যানার লোড করুন
            </Button>
            <Button onClick={handleOpenAdd} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              নতুন ব্যানার তৈরি করুন
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slides.map((slide, idx) => (
            <Card key={slide.id || idx} className="overflow-hidden border border-border/60 hover:border-violet-500/50 transition-all duration-200 shadow-xs flex flex-col group">
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                <img 
                  src={slide.image} 
                  alt={slide.title1Bn || "Banner"} 
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://res.cloudinary.com/de348sqlb/image/upload/v1784725007/alphazero-assets/courses-hero-bg.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-4">
                  <div className="text-white text-xs space-y-1">
                    {slide.eyebrowBn && (
                      <span className="inline-block px-2 py-0.5 rounded bg-violet-600 text-white text-[10px] font-bold shadow-xs">
                        {slide.eyebrowBn}
                      </span>
                    )}
                    <div className="font-bold text-sm sm:text-base line-clamp-1">{slide.title1Bn || slide.title1En || "শিরোনামহীন ব্যানার"}</div>
                    <div className="text-white/80 text-xs line-clamp-1">{slide.subtitleBn || slide.subtitleEn || ""}</div>
                  </div>
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge className="bg-black/70 text-white backdrop-blur-md border border-white/20 text-xs">
                    স্লাইড #{idx + 1}
                  </Badge>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-lg p-1 border border-white/20">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-white hover:text-amber-400" 
                    onClick={() => handleMove(idx, 'up')} 
                    disabled={idx === 0}
                    title="উপরে নিন"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-white hover:text-amber-400" 
                    onClick={() => handleMove(idx, 'down')} 
                    disabled={idx === slides.length - 1}
                    title="নিচে নিন"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                    <LinkIcon className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                    <span>লিংক: </span>
                    <span className="font-medium text-foreground truncate">{slide.ctaHref || "#courses"}</span>
                  </div>
                  {slide.ctaBn && (
                    <div className="text-xs text-muted-foreground">
                      বাটন: <span className="text-foreground font-medium">{slide.ctaBn}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <a
                    href={slide.ctaHref || "#courses"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    প্রিভিউ
                  </a>

                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => handleOpenEdit(slide)}>
                      <Pencil className="w-3.5 h-3.5" /> এডিট
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs" onClick={() => handleDeleteSlide(slide.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              {editingSlide ? "হিরো ব্যানার এডিট করুন" : "নতুন হিরো ব্যানার যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image Uploader */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">ব্যানার ছবি (আপলোড করুন বা URL দিন)</Label>
              <ImageUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="hero-banners"
                label="হিরো ব্যানার ইমেজ"
                placeholder="ইমেজ ড্র্যাগ & ড্রপ করুন, ডিভাইস থেকে আপলোড করুন বা লিংক দিন"
                aspectRatio="auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>আইব্রো ট্যাগ (বাংলা)</Label>
                <Input
                  value={formData.eyebrowBn}
                  onChange={(e) => setFormData({ ...formData, eyebrowBn: e.target.value })}
                  placeholder="ডিজিটাল স্কিল একাডেমি"
                />
              </div>
              <div className="space-y-2">
                <Label>Eyebrow Tag (English)</Label>
                <Input
                  value={formData.eyebrowEn}
                  onChange={(e) => setFormData({ ...formData, eyebrowEn: e.target.value })}
                  placeholder="Digital Skill Academy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম লাইন ১ (বাংলা)</Label>
                <Input
                  value={formData.title1Bn}
                  onChange={(e) => setFormData({ ...formData, title1Bn: e.target.value })}
                  placeholder="এক প্ল্যাটফর্ম।"
                />
              </div>
              <div className="space-y-2">
                <Label>Title Line 1 (English)</Label>
                <Input
                  value={formData.title1En}
                  onChange={(e) => setFormData({ ...formData, title1En: e.target.value })}
                  placeholder="One platform."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>শিরোনাম লাইন ২ (বাংলা)</Label>
                <Input
                  value={formData.title2Bn}
                  onChange={(e) => setFormData({ ...formData, title2Bn: e.target.value })}
                  placeholder="প্রতিটি ডিজিটাল স্কিল।"
                />
              </div>
              <div className="space-y-2">
                <Label>Title Line 2 (English)</Label>
                <Input
                  value={formData.title2En}
                  onChange={(e) => setFormData({ ...formData, title2En: e.target.value })}
                  placeholder="every digital skill."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>উপশিরোনাম / ডেসক্রিপশন (বাংলা)</Label>
                <Textarea
                  value={formData.subtitleBn}
                  onChange={(e) => setFormData({ ...formData, subtitleBn: e.target.value })}
                  rows={2}
                  placeholder="কোর্সের বিস্তারিত বর্ণনা"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle / Description (English)</Label>
                <Textarea
                  value={formData.subtitleEn}
                  onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                  rows={2}
                  placeholder="Detailed subtitle description"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>বাটন টেক্সট (বাংলা)</Label>
                <Input
                  value={formData.ctaBn}
                  onChange={(e) => setFormData({ ...formData, ctaBn: e.target.value })}
                  placeholder="কোর্স দেখুন"
                />
              </div>
              <div className="space-y-2">
                <Label>Button Text (English)</Label>
                <Input
                  value={formData.ctaEn}
                  onChange={(e) => setFormData({ ...formData, ctaEn: e.target.value })}
                  placeholder="Browse Courses"
                />
              </div>
              <div className="space-y-2">
                <Label>বাটন লিংক URL</Label>
                <Input
                  value={formData.ctaHref}
                  onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
                  placeholder="#courses বা /courses/course-id"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleSaveSlide} disabled={saveMutation.isPending} className="gap-2 bg-violet-600 hover:bg-violet-700">
              <Save className="w-4 h-4" /> সেভ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
