import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CourseLandingEditor, { type EditorCourse } from '@/components/shared/CourseLandingEditor';

const SELECT_COLS =
  'id,title,title_en,landing_slug,thumbnail_url,banner_url,description,description_en,short_description,short_description_en,trainer_bio,trainer_bio_en,start_date,class_time,total_classes,duration,learning_outcomes,why_learn,intro_video_url,faqs';

export default function LandingPageManagement() {
  const [courses, setCourses] = useState<EditorCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('courses')
        .select(SELECT_COLS)
        .order('created_at', { ascending: false });
      setCourses((data ?? []) as any as EditorCourse[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  return <CourseLandingEditor courses={courses} learnScopeOnly />;
}
