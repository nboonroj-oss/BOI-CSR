import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudDownload, PlusCircle, CheckCircle, ArrowRight, Sparkles, Loader2, ChevronLeft, ChevronRight, AlertCircle, TrendingUp, Package, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProjects } from '../ProjectContext';
import { useCart } from '../CartContext';
import { GoogleGenAI, Type } from "@google/genai";

interface AiSummaryData {
  introduction: string;
  painPoints: string[];
  socialImpact: string[];
  supportItems: string[];
  mou: string;
  reasonToSupport: string;
}

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const { projects } = useProjects();
  const [aiSummary, setAiSummary] = React.useState<AiSummaryData | null>(null);
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
    if (!project.expectedChanges && !project.oneDriveLink) return;
    
    setIsSummarizing(true);
    setAiSummary(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      const ai = new GoogleGenAI({ apiKey: apiKey || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `คุณเป็นผู้เชี่ยวชาญด้าน CSR และการพัฒนาชุมชน 
        กรุณาสรุปข้อมูลโครงการโดยใช้ข้อมูลจาก "ความคาดหวังของโครงการ" และข้อมูลจากลิงก์ OneDrive (ถ้ามี) 
        ให้สรุปด้วยเนื้อหาที่ smooth และต่อเนื่อง อ่านง่าย กระชับ ได้ใจความ ตามรูปแบบ JSON ที่กำหนด
        
        ข้อมูลโครงการ:
        ชื่อโครงการ: ${project.title}
        องค์กร: ${project.organization}
        จังหวัด: ${project.province}
        กิจการ/ผลผลิต: ${project.product}
        ตลาดและช่องทางจำหน่าย (MOU): ${project.mou || 'ไม่มี'}
        ความคาดหวังของโครงการ (เดิม): ${project.expectedChanges}
        ลิงก์ข้อมูลเพิ่มเติม (OneDrive): ${project.oneDriveLink || 'ไม่มี'}
        
        เน้นการเขียนที่ดึงดูดใจบริษัทที่ต้องการสนับสนุนโครงการเพื่อสังคม (CSR)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              introduction: {
                type: Type.STRING,
                description: "แนะนำกลุ่มวิสาหกิจชุมชนสั้นๆ (ไม่เกิน 3 บรรทัด) ให้ดูน่าเชื่อถือและมีศักยภาพ"
              },
              painPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "ปัญหาและความต้องการของชุมชน (Pain Points) สรุปเป็นข้อๆ"
              },
              socialImpact: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "ผลลัพธ์และความคาดหวังในการเปลี่ยนแปลง (Social Impact) สรุปเป็นข้อๆ"
              },
              supportItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "รายการที่ขอรับการสนับสนุน (เช่น เครื่องจักร, โรงเรือน, อุปกรณ์ต่างๆ)"
              },
              mou: {
                type: Type.STRING,
                description: "สรุปข้อมูลตลาดและช่องทางจำหน่าย (MOU) ให้ดูมีความมั่นคงและยั่งยืน"
              },
              reasonToSupport: {
                type: Type.STRING,
                description: "เหตุผลสั้นๆ ที่บริษัทควรสนับสนุนโครงการนี้เพื่อสร้างความยั่งยืน"
              }
            },
            required: ["introduction", "painPoints", "socialImpact", "supportItems", "mou", "reasonToSupport"]
          },
          tools: project.oneDriveLink ? [{ urlContext: {} }] : []
        }
      });
      
      if (response.text) {
        const data = JSON.parse(response.text);
        setAiSummary(data);
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
              <label className="font-headline text-xl font-bold text-outline uppercase tracking-wider">ตลาดและช่องทางจำหน่าย (MOU)</label>
              <p className="text-3xl font-bold text-on-surface">{project.mou || '-'}</p>
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
              <h2 className="font-headline text-4xl font-bold text-on-surface">ความคาดหวังของโครงการ</h2>
              <button 
                onClick={handleAiSummarize}
                disabled={isSummarizing || (!project.expectedChanges && !project.oneDriveLink)}
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
                className="bg-white p-10 rounded-[3rem] border-2 border-primary/10 shadow-2xl relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

                <div className="relative space-y-10">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full font-bold text-sm uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      AI Generated Infographic
                    </div>
                    <h3 className="text-4xl font-bold text-on-surface leading-tight">
                      "{project.title}"
                    </h3>
                    <p className="text-xl text-primary font-bold italic">
                      {project.organization}
                    </p>
                  </div>

                  {/* Introduction */}
                  <div className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary space-y-4">
                    <p className="text-2xl text-on-surface-variant leading-relaxed">
                      {aiSummary.introduction}
                    </p>
                    {aiSummary.mou && (
                      <div className="flex items-center gap-2 text-primary font-bold text-xl">
                        <TrendingUp className="w-5 h-5" />
                        <span>ช่องทางจำหน่าย (MOU): {aiSummary.mou}</span>
                      </div>
                    )}
                  </div>

                  {/* Main Grid: Pain Points & Social Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pain Points */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-orange-600">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold uppercase tracking-wide">Pain Points</h4>
                      </div>
                      <ul className="space-y-3">
                        {aiSummary.painPoints.map((point, idx) => (
                          <li key={idx} className="flex gap-3 text-xl text-on-surface-variant">
                            <span className="text-orange-400 mt-1.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Social Impact */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-green-600">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <h4 className="text-2xl font-bold uppercase tracking-wide">ผลลัพธ์ทางสังคม</h4>
                      </div>
                      <ul className="space-y-3">
                        {aiSummary.socialImpact.map((impact, idx) => (
                          <li key={idx} className="flex gap-3 text-xl text-on-surface-variant">
                            <span className="text-green-400 mt-1.5">•</span>
                            <span>{impact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Section: Support Items & Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-surface-container-highest">
                    {/* Support Items */}
                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 space-y-4">
                      <div className="flex items-center gap-3 text-yellow-700">
                        <Package className="w-6 h-6" />
                        <h4 className="text-2xl font-bold">รายการที่ขอรับการสนับสนุน</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiSummary.supportItems.map((item, idx) => (
                          <span key={idx} className="bg-white px-3 py-1 rounded-lg text-lg text-yellow-800 border border-yellow-200 shadow-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Budget & Reason */}
                    <div className="space-y-6 flex flex-col justify-center">
                      <div className="text-right">
                        <p className="text-lg text-outline font-bold uppercase tracking-widest">งบประมาณที่ขอรับการสนับสนุน</p>
                        <p className="text-5xl font-bold text-primary">฿{project.budget.toLocaleString()}</p>
                        <p className="text-sm text-outline">(มูลค่าก่อน VAT)</p>
                      </div>
                      <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl italic text-primary">
                        <Info className="w-5 h-5 mt-1 flex-shrink-0" />
                        <p className="text-lg leading-snug">{aiSummary.reasonToSupport}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => setAiSummary(null)}
                      className="text-lg text-outline hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      กลับไปดูรายละเอียดเดิม
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 text-on-surface-variant text-2xl leading-relaxed max-w-4xl whitespace-pre-line">
                {project.expectedChanges || 'ไม่มีข้อมูลความคาดหวังของโครงการ'}
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
