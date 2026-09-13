import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('ap_pwa_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('ap_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary/95 via-emerald-800/90 to-primary/95 text-white px-4 py-2.5 rounded-2xl shadow-lg border border-emerald-400/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold leading-tight">
            ফোনে Astropixel অ্যাপটি ইনস্টল করুন
          </p>
          <p className="text-[10px] text-emerald-200/90 leading-tight">
            ব্রাউজার ছাড়াই দ্রুত ক্লাস ও মডেল টেস্ট দিতে পারবেন
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={handleInstallClick}
          className="h-7 px-3 rounded-lg bg-white hover:bg-white/90 text-primary text-[11px] font-bold shadow-xs gap-1"
        >
          <Download className="w-3 h-3" />
          <span>ইনস্টল</span>
        </Button>
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-emerald-200 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
