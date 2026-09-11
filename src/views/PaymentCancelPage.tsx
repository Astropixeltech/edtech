import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RotateCcw, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id') || searchParams.get('courseId');

  const handleRetry = () => {
    if (courseId) {
      navigate(`/checkout/${courseId}`);
    } else {
      navigate('/catalog');
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6 bg-card/60 border border-border/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground font-serif">পেমেন্ট বাতিল করা হয়েছে</h1>
            <p className="text-xs text-muted-foreground">
              আপনার লেনদেনটি সম্পন্ন হয়নি। কোনো টাকা কর্তন করা হয়নি।
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            কোনো প্রযুক্তিগত সমস্যার সম্মুখীন হলে বা পেমেন্ট গেটওয়েতে ত্রুটি থাকলে আপনি পুনরায় চেষ্টা করতে পারেন অথবা আমাদের ২৪/৭ সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন।
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Button onClick={handleRetry} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <RotateCcw className="w-4 h-4" />
              আবার চেষ্টা করুন
            </Button>
            <Button onClick={() => navigate('/catalog')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              সকল কোর্স
            </Button>
            <Button onClick={() => navigate('/contact')} variant="ghost" className="gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              সাহায্য
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancelPage;
