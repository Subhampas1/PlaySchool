import React, { useState, useEffect } from "react";
// Images from project assets folder
import aboutImg1 from "../assets/IMG_20251122_085641.jpg";
import aboutImg2 from "../assets/IMG_20251122_085706.jpg";
import aboutImg3 from "../assets/IMG_20251122_085717.jpg";
import aboutImg4 from "../assets/IMG_20251122_085737.jpg";
import aboutImg5 from "../assets/IMG_20251122_085751.jpg";
import aboutImg6 from "../assets/IMG_20251122_085812.jpg";
import aboutImg7 from "../assets/IMG_20251122_085844.jpg";
import aboutImg8 from "../assets/IMG_20251122_085858.jpg";
import aboutImg9 from "../assets/IMG_20251122_085909.jpg";
import aboutImg10 from "../assets/IMG_20251122_090113.jpg";
import Card from "../components/Card";
import Modal from "../components/Modal";
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  BanknotesIcon,
} from "../components/icons";
import ThemeToggle from "../components/ThemeToggle";
import { api } from "../services/api";
import { LandingPageConfig, Batch } from "../types";

interface LandingPageProps {
  onLoginClick: () => void;
  onAdmissionClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onAdmissionClick,
}) => {
  const schoolLocationUrl =
    "https://www.google.com/maps/place/Tiny+Toddlers+Playschool+Giridih/@24.193383,86.3043113,17z/data=!3m1!4b1!4m6!3m5!1s0x39f15536f2602f99:0x1ac66ef918f8ca9a!8m2!3d24.193383!4d86.3043113!16s%2Fg%2F11fmb6ybqt?entry=ttu";

  const [config, setConfig] = useState<LandingPageConfig>({
    schoolName: "Tiny Toddlers",
    heroTitle: "Start Their Journey\nWith Wonder",
    heroSubtitle:
      "A magical place where learning meets adventure. We nurture curiosity in a safe, vibrant, and 3D interactive environment.",
    aboutTitle: "About Our School",
    aboutText:
      "Tiny Toddlers Playschool is dedicated to fostering a love for learning in a safe, nurturing, and fun environment. We believe every child is unique and deserves the best start in life.",
    contactEmail: "admin@tinytoddlers.com",
    contactPhone: "+91 98765 43210",
    address:
      "Ashram Rd, near Sri R K Mahila College, New Barganda, Giridih, Jharkhand 815302",
  });

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // About section assets and shuffle state (use all images from project `assets/`)
  const allAssets = [
    {
      src: aboutImg1,
      title: " ",
      desc: " ",
    },
    {
      src: aboutImg2,
      title: " ",
      desc: " ",
    },
    {
      src: aboutImg3,
      title: " ",
      desc: " ",
    },
    {
      src: aboutImg4,
      title: " ",
      desc: " ",
    },
    {
      src: aboutImg5,
      title: "",
      desc: "",
    },
    { src: aboutImg6, title: " ", desc: " " },
    { src: aboutImg7, title: " ", desc: " " },
    { src: aboutImg8, title: " ", desc: " " },
    { src: aboutImg9, title: " ", desc: " " },
    {
      src: aboutImg10,
      title: " ",
      desc: " ",
    },
  ];

  const sampleRandom = (arr: any[], k: number) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, k);
  };

  const [aboutCards, setAboutCards] = useState(() =>
    sampleRandom(allAssets, 4)
  );

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [data, batchesData] = await Promise.all([
          api.getLandingConfig(),
          api.getBatches(),
        ]);
        setConfig(data);
        setBatches(batchesData);
      } catch (e) {
        console.error("Using default landing config", e);
      }
    };
    fetchConfig();
  }, []);

  // Auto-shuffle about cards every 5 seconds (select 4 random images)
  useEffect(() => {
    const id = setInterval(() => {
      setAboutCards(sampleRandom(allAssets, 4));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-white/20 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-orange-400 rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:rotate-12 transition-transform">
              🧸
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {config.schoolName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={onLoginClick}
              className="px-6 py-2 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 sm:px-6">
        {/* Hero Section with 3D Touch */}
        <section className="max-w-7xl mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="flex-1 space-y-8 text-center md:text-left animate-enter">
            <div className="inline-block px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-sm font-bold uppercase tracking-wider mb-2">
              Admissions Open 2025-26
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {config.heroTitle}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
              {config.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <button
                onClick={onAdmissionClick}
                className="btn-3d px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-rose-500/30 border-b-4 border-rose-700 active:border-b-0"
              >
                Apply Now
              </button>
              <button
                onClick={onLoginClick}
                className="btn-3d px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-lg font-bold rounded-2xl shadow-lg border-b-4 border-slate-200 dark:border-slate-600 active:border-b-0 flex items-center justify-center gap-2"
              >
                Go to Portal <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Abstract 3D Illustration Placeholder */}
          <div className="flex-1 w-full flex justify-center relative animate-float-slow">
            <div className="relative w-72 h-72 md:w-[500px] md:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-300 to-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
              {/* "Glass" Card Stack Visual */}
              <div className="absolute inset-10 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl rotate-[-6deg] z-10 flex items-center justify-center"></div>
              <div className="absolute inset-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl rotate-[6deg] z-20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Learning
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">Made Fun</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section (Tiles) */}
        <section className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Curated Programs
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Designed for every stage of early development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {batches.length > 0 ? (
              batches.map((batch, idx) => (
                <Card
                  key={batch.id}
                  className="p-8 flex flex-col h-full group border-t-8 border-t-rose-400"
                >
                  <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl w-16 h-16 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {idx === 0 ? "🎨" : idx === 1 ? "📚" : "🧩"}
                  </div>
                  <h4 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                    {batch.name}
                  </h4>
                  <p className="text-sm font-bold text-rose-500 mb-4 uppercase tracking-wide">
                    {batch.ageGroup || "Various Ages"}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                    {batch.description || "A great program for your child."}
                  </p>

                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="w-full py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 group-hover:bg-rose-500 group-hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                Loading Programs...
              </div>
            )}
          </div>
        </section>

        {/* Statistics / Info Strip */}
        <section className="mb-32">
          <div className="bg-slate-900 dark:bg-white rounded-3xl p-12 shadow-2xl text-white dark:text-slate-900 grid md:grid-cols-3 gap-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="relative z-10">
              <div className="text-5xl font-black mb-2">15+</div>
              <div className="font-bold opacity-80">Years Experience</div>
            </div>
            <div className="relative z-10">
              <div className="text-5xl font-black mb-2">1:10</div>
              <div className="font-bold opacity-80">Teacher-Student Ratio</div>
            </div>
            <div className="relative z-10">
              <div className="text-5xl font-black mb-2">500+</div>
              <div className="font-bold opacity-80">Happy Graduates</div>
            </div>
          </div>
        </section>

        {/* About & Features */}
        <section className="max-w-7xl mx-auto mb-32 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              {config.aboutTitle}
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-loose">
              {config.aboutText}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/50 dark:border-slate-700 shadow-sm">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    Safe Environment
                  </h5>
                  <p className="text-sm text-slate-500">24/7 CCTV & Security</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white/50 dark:border-slate-700 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                  🧠
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    Smart Learning
                  </h5>
                  <p className="text-sm text-slate-500">
                    Interactive Digital Boards
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {aboutCards.map((card, idx) => (
              <Card
                key={card.src + idx}
                className={`h-64 relative overflow-hidden group ${
                  idx % 2 === 0 ? "translate-y-12" : ""
                }`}
              >
                <img
                  src={card.src}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <h4 className="text-xl font-bold text-white">{card.title}</h4>
                  <p className="text-sm text-white/90">{card.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="max-w-5xl mx-auto mb-20">
          <Card className="p-6 md:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                Visit Our Campus
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We'd love to show you around.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                  <MapPinIcon className="w-8 h-8" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                  Address
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 px-4">
                  {config.address}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center mb-4">
                  <PhoneIcon className="w-8 h-8" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                  Contact
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {config.contactPhone}
                </p>
                <p className="text-xs text-slate-500">{config.contactEmail}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <ClockIcon className="w-8 h-8" />
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                  Hours
                </h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Mon - Fri
                  <br />
                  9:00 AM - 1:00 PM
                </p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <a
                href={schoolLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d inline-flex items-center px-8 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl border-b-4 border-slate-700 dark:border-slate-300 active:border-b-0"
              >
                Open in Google Maps <ArrowRightIcon className="w-5 h-5 ml-2" />
              </a>
            </div>
          </Card>
        </section>
      </main>

      <footer className="text-center py-10 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <p className="font-bold text-slate-800 dark:text-slate-200">
          {config.schoolName}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          &copy; {new Date().getFullYear()} Tiny Toddlers. Crafted with ❤️
        </p>
      </footer>

      {/* Batch Details Modal */}
      <Modal
        isOpen={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        title={selectedBatch?.name || "Program Details"}
      >
        {selectedBatch && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl text-white shadow-lg transform rotate-1">
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">
                Annual Tuition
              </p>
              <div className="flex items-center gap-3">
                <BanknotesIcon className="w-8 h-8" />
                <p className="text-4xl font-black">
                  ₹{selectedBatch.feeAmount.toLocaleString()}
                </p>
              </div>
              <p className="text-xs opacity-70 mt-2">
                * Payable in Monthly or Quarterly installments.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Age Group
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedBatch.ageGroup}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Capacity
                </p>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedBatch.capacity} Seats
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                Highlights
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedBatch.description}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedBatch(null);
                onAdmissionClick();
              }}
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Apply for {selectedBatch.name}{" "}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LandingPage;
