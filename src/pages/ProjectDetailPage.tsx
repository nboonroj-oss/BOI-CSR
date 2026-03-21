import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudDownload, PlusCircle, CheckCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
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
  
  const project = projects.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setAiSummary(null);
  }, [id]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-3xl mb-4">ไม่พบโครงการ</h2>
        <Link to="/" className="text-primary font-bold text-2xl">กลับสู่หน้าหลัก</Link>
      </div>
    );
  }

  const handleAiSummarize = async () => {
    if (!project.expectedChanges) return;
    
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `สรุปการเปลี่ยนแปลงที่คาดหวังของโครงการนี้แบบสั้นๆ และน่าสนใจ เพื่อให้บริษัทอยากมาลงทุนในโครงการนี้:
        
        ชื่อโครงการ: ${project.title}
        จังหวัด: ${project.province}
        องค์กร: ${project.organization}
        ประเภทกิจกรรม: ${project.activityType}
        กิจการ/ผลผลิต: ${project.product}
        เนื้อหา: ${project.expectedChanges}
        
        ให้สรุปเป็นข้อๆ หรือย่อหน้าสั้นๆ ที่เน้นผลลัพธ์ (Impact) และความคุ้มค่าของการลงทุน`,
      });
      
      if (response.text) {
        setAiSummary(response.text);
      }
    } catch (error) {
      console.error("AI Summarization failed:", error);
      alert("ไม่สามารถสรุปข้อมูลด้วย AI ได้ในขณะนี้");
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
        <div className="aspect-[21/9] w-full bg-surface-container-highest relative">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
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
