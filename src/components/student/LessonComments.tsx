import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MessageCircle, Send, Reply, Loader2, ThumbsUp, Trash2, CheckCircle2 } from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  video_id: string;
  course_id: string;
  parent_id: string | null;
  message: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  is_instructor?: boolean;
  replies?: Comment[];
}

interface LessonCommentsProps {
  videoId: string;
  courseId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export default function LessonComments({
  videoId,
  courseId = 'default-course',
  userId = 'demo-student-001',
  userName = 'Student',
  userAvatar = ''
}: LessonCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`ap_comment_likes_${videoId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleLike = (commentId: string) => {
    setLikedMap((prev) => {
      const updated = { ...prev, [commentId]: !prev[commentId] };
      try {
        localStorage.setItem(`ap_comment_likes_${videoId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from('lesson_comments').delete().eq('id', commentId);
    if (!error) {
      toast.success('কমেন্ট মুছে ফেলা হয়েছে');
      fetchComments();
    } else {
      toast.error('Failed to delete comment');
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lesson_comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      // Fetch user profiles for comments
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, role')
        .in('user_id', userIds);

      const profileMap = new Map<string, { name: string; avatar: string; role?: string }>(
        (profiles || []).map((p: any) => [
          p.user_id,
          { name: p.full_name || 'User', avatar: p.avatar_url || '', role: p.role }
        ])
      );

      // Build threaded comments
      const topLevel: Comment[] = [];
      const replyMap = new Map<string, Comment[]>();

      data.forEach((c: any) => {
        const profile = profileMap.get(c.user_id);
        const comment: Comment = {
          ...c,
          user_name: profile?.name || 'Student',
          user_avatar: profile?.avatar || '',
          is_instructor: profile?.role === 'teacher' || profile?.role === 'admin',
          replies: [],
        };
        if (c.parent_id) {
          if (!replyMap.has(c.parent_id)) replyMap.set(c.parent_id, []);
          replyMap.get(c.parent_id)!.push(comment);
        } else {
          topLevel.push(comment);
        }
      });

      topLevel.forEach(c => {
        c.replies = replyMap.get(c.id) || [];
      });

      setComments(topLevel);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    // Realtime subscription
    const channel = supabase
      .channel(`comments-${videoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_comments', filter: `video_id=eq.${videoId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [videoId]);

  const postComment = async (parentId: string | null, text: string) => {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await supabase.from('lesson_comments').insert({
      user_id: userId,
      video_id: videoId,
      course_id: courseId,
      parent_id: parentId,
      message: text.trim(),
    });

    if (error) {
      toast.error('Failed to post comment');
    } else {
      if (parentId) { setReplyText(''); setReplyTo(null); }
      else setNewComment('');
      fetchComments();
    }
    setSending(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isLiked = !!likedMap[comment.id];
    const isMine = comment.user_id === userId;

    return (
      <div className={`flex gap-3 ${isReply ? 'ml-8 sm:ml-10 mt-2' : ''}`}>
        <Avatar className="w-7 h-7 shrink-0 border border-white/10">
          <AvatarImage src={comment.user_avatar} />
          <AvatarFallback className="text-[10px] bg-white/10 text-white/60">
            {comment.user_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white">{comment.user_name}</span>
            {comment.is_instructor && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-2.5 h-2.5" /> Instructor
              </span>
            )}
            <span className="text-[10px] text-white/40">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-white/90 mt-1 whitespace-pre-wrap">{comment.message}</p>
          
          {/* Action Row */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => toggleLike(comment.id)}
              className={`text-[11px] flex items-center gap-1 transition-colors ${
                isLiked ? 'text-emerald-400 font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{isLiked ? 1 : ''}</span>
            </button>

            {!isReply && (
              <button
                className="text-[11px] text-primary/80 hover:text-primary flex items-center gap-1"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
            )}

            {isMine && (
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-[11px] text-white/40 hover:text-rose-400 flex items-center gap-1 transition-colors ml-auto"
                title="Delete comment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyTo === comment.id && (
            <div className="flex gap-2 mt-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply..."
                className="bg-white/5 border-white/10 text-white text-xs min-h-[40px] resize-none"
                rows={1}
              />
              <Button size="icon" className="shrink-0 h-10 w-10" disabled={sending || !replyText.trim()} onClick={() => postComment(comment.id, replyText)}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
          {/* Replies */}
          {comment.replies?.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">Q&A / Comments</h3>
        <span className="text-[10px] text-white/40">({comments.length})</span>
      </div>

      {/* New comment */}
      <div className="p-4 border-b border-white/10">
        <div className="flex gap-3">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{userName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or leave a comment..."
              className="bg-white/5 border-white/10 text-white text-sm min-h-[44px] resize-none"
              rows={1}
            />
            <Button size="icon" className="shrink-0 h-11 w-11" disabled={sending || !newComment.trim()} onClick={() => postComment(null, newComment)}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-white/30 py-6">No comments yet. Be the first!</p>
        ) : (
          comments.map(c => <CommentItem key={c.id} comment={c} />)
        )}
      </div>
    </div>
  );
}
