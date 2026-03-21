import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudDownload, PlusCircle, CheckCircle, ArrowRight, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProjects } from '../ProjectContext';
import { useCart } from '../CartContext';
import { GoogleGenAI } from "@google/genai";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const { projects } = useProjects();
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setAiSummary(null);
    setCurrentImageIndex(0);
  }, [id]);

  // Slideshow effect
  useEffect(() => {
    if (project && project.images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-3xl mb-4">ไม่พบโครงการ</h2>
        <Link to="/" className="text-primary font-bold text-2xl">กลับสู่หน้าหลัก</Link>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const handleAiSummarize = async () => {
    if (!project.expectedChanges) return;
    
    setIsSummarizing(true);
    setAiSummary(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      // If no API key is found, we'll try to proceed but catch the specific error
      // This allows the platform's auto-injected key to work if available
      const ai = new GoogleGenAI({ apiKey: apiKey || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `คุณเป็นผู้เชี่ยวชาญด้าน CSR และการพัฒนาชุมชน 
        กรุณาสรุป "การเปลี่ยนแปลงที่คาดหวัง" ของโครงการนี้ให้กระชับ น่าสนใจ และดึงดูดใจบริษัทที่ต้องการสนับสนุนโครงการเพื่อสังคม
        
        ข้อมูลโครงการ:
        ชื่อโครงการ: ${project.title}
        จังหวัด: ${project.province}
        กิจการ/ผลผลิต: ${project.product}
        รายละเอียดเดิม: ${project.expectedChanges}
        
        ให้สรุปเป็นข้อๆ (Bullet points) ประมาณ 3-4 ข้อ โดยเน้นที่ผลกระทบ (Impact) ที่จะเกิดขึ้นจริง`,
      });
      
      if (response.text) {
        setAiSummary(response.text);
      } else {
        throw new Error("AI returned an empty response.");
      }
    } catch (error: any) {
      console.error("AI Summarization failed:", error);
      
      const isVercel = window.location.hostname.includes('vercel.app');
      let message = "ไม่สามารถสรุปข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
      
      // Check for missing key or auth errors
      if (!process.env.GEMINI_API_KEY || error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
        if (isVercel) {
          message = "แอปบน Vercel จำเป็นต้องตั้งค่า GEMINI_API_KEY ในหน้า Environment Variables ของ Vercel ก่อนครับ";
        } else {
          message = "ระบบยังไม่ได้เชื่อมต่อกับ AI (GEMINI_API_KEY) กรุณาตรวจสอบการตั้งค่าในหน้า Settings ของแอปครับ";
        }
      } else if (error.message?.includes("quota") || error.message?.includes("429")) {
        message = "ขออภัย โควตาการใช้งาน AI ฟรีเต็มแล้วในขณะนี้ กรุณาลองใหม่ภายหลัง";
      }
      
      alert(message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const isInCart = cart.find(p => p.id === project.id);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary font-bold mb-8 hover:opacity-80 transition-transform active:scale-95 text-2xl"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Back to Catalog</span>
        </button>
        
        <div className="flex flex-col gap-6">
          <div className="h-1.5 w-24 bg-primary rounded-full" />
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-on-surface leading-tight tracking-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap gap-4">
            <span className="bg-surface-container-high px-6 py-1 rounded-full text-primary font-bold text-2xl">
              จังหวัด: {project.province}
            </span>
            <span className="bg-surface-container-high px-6 py-1 rounded-full text-primary font-bold text-2xl">
              ประเภทกลุ่ม: {project.groupType}
            </span>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-3xl overflow-hidden shadow-xl mb-12">
        <div className="aspect-[21/9] w-full bg-surface-container-highest relative group">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={project.images[currentImageIndex]} 
              alt={`${project.title} - ${currentImageIndex + 1}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {project.images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.preventDefault(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {project.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            <div className="space-y-2">
              <label className="font-headline text-xl font-bold text-outline uppercase tracking-wider">องค์กรท้องถิ่นที่ขอรับการสนับสนุน</label>
              <p className="text-3xl font-bold text-on-surface">{project.organization}</p>
            </div>
            <div className="space-y-2">
              <label className="font-headline text-xl font-bold text-outline uppercase tracking-wider">ประเภทกิจกรรม</label>
              <p className="text-3xl font-bold text-on-surface">{project.activityType}</p>
            </div>
            <div className="space-y-2">
              <label className="font-headline text-xl font-bold text-outline uppercase tracking-wider">กิจการ/ผลผลิต</label>
              <p className="text-3xl font-bold text-on-surface">{project.product}</p>
            </div>
            <div className="space-y-2">
              <label className="font-headline text-xl font-bold text-outline uppercase tracking-wider">มูลค่าโครงการก่อน VAT</label>
              <p className="text-5xl font-bold text-primary">฿{project.budget.toLocaleString()}</p>
            </div>
            {project.oneDriveLink && (
              <div className="space-y-2">
                <label className="font-headline text-xl font-bold text-outline uppercase tracking-wider">เอกสารแนบ</label>
                <div>
                  <a 
                    href={project.oneDriveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-surface-container-low px-6 py-4 rounded-2xl text-primary font-bold hover:bg-primary-fixed transition-colors text-2xl"
                  >
                    <CloudDownload className="w-6 h-6" />
                    <span>OneDrive Project Folder</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 pt-10 border-t border-surface-container-highest">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-4xl font-bold text-on-surface">การเปลี่ยนแปลงที่คาดหวัง</h2>
              <button 
                onClick={handleAiSummarize}
                disabled={isSummarizing || !project.expectedChanges}
                className="flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-2xl font-bold hover:bg-primary/20 transition-all disabled:opacity-50 text-xl"
              >
                {isSummarizing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                สรุปด้วย AI
              </button>
            </div>

            {aiSummary ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 p-8 rounded-3xl border border-primary/20 relative"
              >
                <div className="absolute top-4 right-4 text-primary/30">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                  AI Summary
                </h3>
                <div className="text-on-surface-variant text-2xl leading-relaxed whitespace-pre-line italic">
                  {aiSummary}
                </div>
                <button 
                  onClick={() => setAiSummary(null)}
                  className="mt-6 text-lg text-primary hover:underline font-bold"
                >
                  ดูเนื้อหาเต็ม
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6 text-on-surface-variant text-2xl leading-relaxed max-w-4xl whitespace-pre-line">
                {project.expectedChanges || 'ไม่มีข้อมูลการเปลี่ยนแปลงที่คาดหวัง'}
              </div>
            )}
          </div>
        </div>
      </section>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-surface-container-low p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 border-l-8 border-primary shadow-sm"
      >
        <div className="space-y-2">
          <h3 className="text-4xl font-bold text-primary">สนใจร่วมสนับสนุนโครงการนี้?</h3>
          <p className="text-2xl text-on-surface-variant">บันทึกโครงการเพื่อรวบรวมข้อมูลสำหรับยื่นคำขอรับการสนับสนุน</p>
        </div>
          {isInCart ? (
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="bg-green-600 text-white px-12 py-5 rounded-2xl font-bold text-3xl shadow-lg flex items-center justify-center gap-4">
                <CheckCircle className="w-8 h-8" />
                Added to List
              </div>
              <Link 
                to="/inquiry"
                className="bg-secondary-container text-on-secondary-container px-12 py-5 rounded-2xl font-bold text-3xl shadow-lg flex items-center justify-center gap-4 hover:brightness-95 transition-all"
              >
                Go to Inquiry List
                <ArrowRight className="w-8 h-8" />
              </Link>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(project)}
              className="w-full md:w-auto min-h-[4.5rem] px-12 py-5 rounded-2xl font-bold text-3xl shadow-lg transition-all flex items-center justify-center gap-4 active:scale-95 bg-primary text-on-primary hover:opacity-90"
            >
              <PlusCircle className="w-8 h-8" />
              Add to Inquiry List
            </button>
          )}
      </motion.div>
    </motion.div>
  );
};
