import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, PlayCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

type PaymentStatus = 'verifying' | 'success' | 'failed';

interface PaymentReceiptDetails {
  invoiceId?: string;
  amount?: string | number;
  transactionId?: string;
  paymentMethod?: string;
  courseName?: string;
  date?: string;
}

const PaymentCallbackPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [message, setMessage] = useState('পেমেন্ট ভেরিফাই করা হচ্ছে...');
  const [paymentDetails, setPaymentDetails] = useState<PaymentReceiptDetails | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const invoiceId = searchParams.get('invoice_id');
      const paymentType = searchParams.get('type');

      if (!invoiceId) {
        setStatus('failed');
        setMessage('পেমেন্ট তথ্য পাওয়া যায়নি।');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('uddoktapay-verify', {
          body: { invoice_id: invoiceId },
        });

        if (error || !data?.success) {
          setStatus('failed');
          setMessage('পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে।');
          return;
        }

        if (data.status === 'COMPLETED') {
          if (paymentType === 'course') {
            const metadata = data.metadata || {};
            const courseId = metadata.course_id;
            const userId = metadata.user_id;
            const studentName = metadata.student_name;
            const studentEmail = metadata.student_email;

            if (courseId && userId) {
              // Directly assign course to the student (auto-approve)
              const { data: existing } = await supabase
                .from('student_courses')
                .select('id')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .maybeSingle();

              if (!existing) {
                await supabase.from('student_courses').insert({
                  user_id: userId,
                  course_id: courseId,
                  is_active: true,
                });
              }

              // Send notification
              try {
                await supabase.functions.invoke('student-enrollment-notify', {
                  body: {
                    studentName: studentName || 'Student',
                    studentEmail: studentEmail || '',
                    courseName: metadata.course_name || 'Course',
                    coursePrice: data.amount,
                    paymentMethod: 'uddoktapay',
                    transactionId: data.transaction_id || invoiceId,
                  },
                });
              } catch {}
            }
          }

          setPaymentDetails({
            invoiceId: invoiceId || data.invoice_id,
            amount: data.amount,
            transactionId: data.transaction_id || invoiceId,
            paymentMethod: data.payment_method || 'bKash / Nagad',
            courseName: (data.metadata && data.metadata.course_name) || 'Astropixel Course',
            date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          });

          setStatus('success');
          setMessage('পেমেন্ট সফল হয়েছে! আপনার কোর্স এখন অ্যাক্সেসযোগ্য।');
          toast.success('পেমেন্ট সফল!');
        } else {
          setStatus('failed');
          setMessage(`পেমেন্ট ${data.status === 'PENDING' ? 'পেন্ডিং আছে' : 'ব্যর্থ হয়েছে'}।`);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('failed');
        setMessage('পেমেন্ট ভেরিফিকেশনে সমস্যা হয়েছে।');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12" aria-live="polite">
        <div className="max-w-md w-full text-center space-y-5">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
              <h1 className="text-2xl font-bold font-serif">{message}</h1>
              <p className="text-muted-foreground text-sm">অনুগ্রহ করে অপেক্ষা করুন...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">পেমেন্ট সফল হয়েছে!</h1>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>

              {/* Receipt Card */}
              {paymentDetails && (
                <div className="bg-card/80 border border-emerald-500/25 rounded-2xl p-5 text-left space-y-2.5 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <span className="text-xs text-muted-foreground">কোর্স</span>
                    <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{paymentDetails.courseName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ইনভয়েস আইডি</span>
                    <span className="font-mono text-foreground font-semibold">{paymentDetails.invoiceId}</span>
                  </div>
                  {paymentDetails.transactionId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ট্রানজেকশন আইডি</span>
                      <span className="font-mono text-foreground">{paymentDetails.transactionId}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">পেমেন্ট মেথড</span>
                    <span className="capitalize text-foreground font-medium">{paymentDetails.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">তারিখ ও সময়</span>
                    <span className="text-foreground">{paymentDetails.date}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm font-bold">
                    <span>পরিশোধিত মূল্য</span>
                    <span className="text-emerald-500 text-base">৳{paymentDetails.amount}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <Button onClick={() => navigate('/student')} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
                  <PlayCircle className="w-4 h-4" />
                  ক্লাস শুরু করুন
                </Button>
                <Button onClick={() => navigate('/catalog')} variant="outline">
                  সকল কোর্স
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">পেমেন্ট ব্যর্থ</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate('/courses')} variant="outline">
                  আবার চেষ্টা করুন
                </Button>
                <Button onClick={() => navigate('/contact')}>
                  যোগাযোগ করুন
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCallbackPage;
