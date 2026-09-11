import { useState } from "react";
import { Mail, Phone, MessageCircle, Send, MapPin, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFooterContent } from "@/hooks/useFooterData";
import { usePageContent } from "@/hooks/usePageContent";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LearnContactPage = () => {
  const { language } = useLanguage();
  const { data: footerContents } = useFooterContent();
  const { getContent: getPageContent } = usePageContent("learn-contact", "learn");
  const [formData, setFormData] = useState({ name: "", email: "", topic: "general", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBn = language === "bn";
  const t = (bn: string, en: string) => (isBn ? bn : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("অনুগ্রহ করে সব তথ্য দিন", "Please fill in all required fields"));
      return;
    }
    setIsSubmitting(true);
    try {
      // Insert into support_tickets table
      const { error } = await supabase.from("support_tickets" as any).insert({
        name: formData.name,
        email: formData.email,
        subject: formData.topic,
        message: formData.message,
        status: "open",
      });

      if (error) {
        // Fallback: try sending via edge function
        const { data: fnData, error: fnError } = await supabase.functions.invoke("send-custom-email", {
          body: {
            to: "hello@astropixel.tech",
            subject: `[Contact Form] ${formData.topic} — ${formData.name}`,
            body: `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.topic}\n\nMessage:\n${formData.message}`,
          },
        });
        if (fnError) throw fnError;
      }

      toast.success(t("আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই উত্তর দেব।", "Your message has been sent successfully! We'll respond shortly."));
      setFormData({ name: "", email: "", topic: "general", message: "" });
    } catch {
      toast.error(t("ত্রুটি ঘটেছে। আবার চেষ্টা করুন।", "Failed to send message. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const phone = "+880 1776-965533";
  const email = "hello@astropixel.tech";

  return (
    <Layout>
      <Helmet>
        <title>{t("যোগাযোগ করুন — Astropixel Learn", "Contact Us — Astropixel Learn")}</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        {/* 1. HERO HEADER */}
        <section className="relative py-12 md:py-16 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent dark:from-brand-950/20 border-b border-border/40">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("২৪/৭ সার্বক্ষণিক সহায়তা", "Always Here to Help")}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              {t("আমরা আপনাকে সাহায্য করতে প্রস্তুত", "Get in Touch with Our Team")}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              {t(
                "কোর্স, এনরোলমেন্ট বা যেকোনো পরামর্শে আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন।",
                "Have questions about courses, admissions, or payments? We respond promptly."
              )}
            </p>
          </div>
        </section>

        {/* 2. CONTACT CHANNELS GRID */}
        <section className="container max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Phone */}
            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("হটলাইন নম্বর", "Call Helpline")}</h3>
              <p className="text-xs text-gray-500">{t("সকাল ৯টা থেকে রাত ১০টা", "9:00 AM - 10:00 PM")}</p>
              <a href={`tel:${phone}`} className="inline-block text-sm font-bold text-brand-600 hover:underline">
                {phone}
              </a>
            </div>

            {/* WhatsApp */}
            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("সরাসরি WhatsApp", "Live WhatsApp")}</h3>
              <p className="text-xs text-gray-500">{t("ইনস্ট্যান্ট চ্যাট সাপোর্ট", "Instant live chat support")}</p>
              <a
                href="https://wa.me/8801776965533"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-bold text-emerald-600 hover:underline"
              >
                +880 1776-965533
              </a>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("অফিসিয়াল ইমেইল", "Official Email")}</h3>
              <p className="text-xs text-gray-500">{t("২৪ ঘন্টার মধ্যে রিপ্লাই", "Response within 24h")}</p>
              <a href={`mailto:${email}`} className="inline-block text-sm font-bold text-blue-600 hover:underline">
                {email}
              </a>
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("প্রধান কার্যালয়", "Head Office")}</h3>
              <p className="text-xs text-gray-500">{t("ঢাকা, বাংলাদেশ", "Dhaka, Bangladesh")}</p>
              <span className="inline-block text-xs font-semibold text-foreground">
                Astropixel Academy
              </span>
            </div>

          </div>
        </section>

        {/* 3. MESSAGE FORM & FAQ SECTION */}
        <section className="container max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Form */}
            <div className="lg:col-span-7 rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {t("আমাদের বার্তা পাঠান", "Send Us a Message")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t("যেকোনো প্রশ্ন বা পরামর্শ লিখে পাঠালে আমরা শীঘ্রই যোগাযোগ করব।", "Fill out the form and our team will get back to you.")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {t("আপনার নাম", "Your Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("আপনার নাম লিখুন", "Full name")}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-sm focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {t("ইমেইল অ্যাড্রেস", "Email Address")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-sm focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {t("বিষয় নির্বাচন করুন", "Topic")}
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground focus:outline-none focus:border-brand-500"
                  >
                    <option value="general">{t("সাধারণ প্রশ্ন", "General Inquiry")}</option>
                    <option value="enrollment">{t("কোর্স ভর্তি সম্পর্কিত", "Course Enrollment")}</option>
                    <option value="payment">{t("পেমেন্ট ও রিফান্ড", "Payment & Refund")}</option>
                    <option value="technical">{t("কারিগরি সহায়তা", "Technical Support")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    {t("বার্তা", "Your Message")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("আপনার বার্তাটি বিস্তারিত লিখুন...", "Type your message here...")}
                    className="w-full p-3.5 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-sm focus:outline-none focus:border-brand-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? t("পাঠানো হচ্ছে...", "Sending...") : t("বার্তা পাঠান", "Send Message")}</span>
                </button>
              </form>
            </div>

            {/* Quick Assistance Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-foreground">
                  {t("দ্রুত সহায়তা প্রয়োজন?", "Need Quick Assistance?")}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t(
                    "আপনি যদি কোনো কোর্সে দ্রুত ভর্তি হতে চান বা পেমেন্টে সাহায্য প্রয়োজন হয়, সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপে টেক্সট দিন।",
                    "For instant enrollment and payment confirmation support, reach out to our official WhatsApp channel."
                  )}
                </p>
                <a
                  href="https://wa.me/8801776965533"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t("WhatsApp-এ কথা বলুন", "Chat on WhatsApp")}</span>
                </a>
              </div>

              <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-foreground">
                  {t("আমাদের প্রতিশ্রুতি", "Our Commitment")}
                </h4>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span>{t("১০০% সুরক্ষিত পেমেন্ট গেটওয়ে", "100% Secure payment gateways")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span>{t("কোর্স সম্পর্কিত সব প্রশ্নের দ্রুত উত্তর", "Fast query resolution for students")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    <span>{t("লাইফটাইম সাপোর্ট ও আপডেট সুবিধা", "Lifetime community access and updates")}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
};

export default LearnContactPage;
