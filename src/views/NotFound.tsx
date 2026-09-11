import { Link } from "react-router-dom";
import { ArrowLeft, Home, BookOpen, Info, Mail } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 p-10 sm:p-12 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-black font-playfair text-transparent bg-clip-text bg-gradient-to-br from-brand-400 to-emerald-400">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white font-playfair">
            Page Not Found
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
          <Link
            to="/"
            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="p-3 rounded-full bg-brand-500/10 text-brand-400 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-lg">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Home</span>
          </Link>
          <Link
            to="/courses"
            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Courses</span>
          </Link>
          <Link
            to="/about"
            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="p-3 rounded-full bg-brand-500/10 text-brand-400 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-lg">
              <Info className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">About</span>
          </Link>
          <Link
            to="/contact"
            className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Contact</span>
          </Link>
        </div>

        {/* Back Button */}
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all hover:scale-105 border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back Home
          </Link>
        </div>
      </div>
      
      {/* Brand footer */}
      <div className="absolute bottom-8 text-gray-500/80 text-sm font-medium tracking-wide">
        Astropixel Learn
      </div>
    </div>
  );
};

export default NotFound;
