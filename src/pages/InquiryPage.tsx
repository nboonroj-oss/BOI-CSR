import React, { useState } from 'react';
import { Trash2, Send, ShieldCheck, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

export const InquiryPage: React.FC = () => {
  const { cart, removeFromCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          projects: cart.map(p => ({
            title: p.title,
            province: p.province,
            budget: p.budget,
            organization: p.organization,
          })),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSending(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-20"
      >
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">ส่งข้อมูลเรียบร้อยแล้ว</h1>
        <p className="text-2xl text-on-surface-variant mb-12">ข้อมูลของคุณถูกส่งไปยัง Nattakarm@sif.or.th เรียบร้อยแล้ว เจ้าหน้าที่ SIF จะติดต่อกลับหาคุณโดยเร็วที่สุด</p>
        <Link to="/" className="bg-primary text-white px-12 py-4 rounded-2xl font-bold text-2xl">
          กลับสู่หน้าหลัก
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 md:ml-12">
        <h1 className="text-6xl font-headline font-extrabold text-primary tracking-tighter mb-6">สรุปรายการที่สนใจ</h1>
        <p className="text-2xl text-on-surface-variant max-w-2xl leading-relaxed font-body">
          ตรวจสอบรายการโครงการที่คุณเลือกไว้ และกรอกข้อมูลด้านล่างเพื่อให้เจ้าหน้าที่ SIF ติดต่อกลับเพื่อพูดคุยและให้คำแนะนำเพิ่มเติม
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <h2 className="text-3xl font-headline font-bold text-primary px-4 border-l-4 border-secondary-container">รายการโครงการ</h2>
          
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200"
                >
                  <p className="text-2xl text-slate-400 mb-8">ยังไม่มีโครงการในรายการที่คุณสนใจ</p>
                  <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
                    <PlusCircle className="w-6 h-6" />
                    ไปเลือกโครงการ
                  </Link>
                </motion.div>
              ) : (
                cart.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(18,28,42,0.06)] flex items-start justify-between group"
                  >
                    <div className="flex gap-6">
                      <div className="h-24 w-24 rounded-2xl bg-surface-container-high flex-shrink-0 overflow-hidden">
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-2xl font-bold font-headline mb-2 leading-tight">{project.title}</h3>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="text-xl">จังหวัด{project.province}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(project.id)}
                      className="p-2 text-outline hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {cart.length > 0 && (
            <div className="pt-4 px-4">
              <Link to="/" className="flex items-center gap-3 text-primary font-bold text-xl hover:underline transition-all">
                <PlusCircle className="w-6 h-6" />
                ค้นหาโครงการเพิ่ม
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-surface-container-low p-10 rounded-3xl">
            <div className="mb-8">
              <h2 className="text-3xl font-headline font-bold text-primary mb-3">ข้อมูลการติดต่อ</h2>
              <p className="text-on-surface-variant text-xl leading-snug">กรอกข้อมูลเพื่อให้เจ้าหน้าที่ติดต่อกลับ</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-xl font-bold text-on-surface" htmlFor="full-name">
                  ชื่อ-นามสกุล
                </label>
                <input
                  required
                  className="w-full h-20 px-6 text-xl bg-white border-none rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-fixed transition-all font-body"
                  id="full-name"
                  placeholder="เช่น คุณสมศักดิ์ รักดี"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-xl font-bold text-on-surface" htmlFor="email">
                  อีเมล
                </label>
                <input
                  required
                  className="w-full h-20 px-6 text-xl bg-white border-none rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-fixed transition-all font-body"
                  id="email"
                  placeholder="example@email.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="pt-6">
                <button
                  disabled={cart.length === 0 || isSending}
                  className="w-full h-24 bg-primary text-on-primary rounded-2xl text-3xl font-bold flex items-center justify-center gap-4 shadow-lg hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                >
                  {isSending ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-8 h-8" />
                  )}
                  <span>{isSending ? 'กำลังส่งข้อมูล...' : 'ส่งคำร้องข้อมูล (Send Inquiry)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-on-secondary-container p-4 bg-secondary-container/20 rounded-2xl mt-4">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <span className="text-lg font-medium">ข้อมูลของคุณจะถูกเก็บเป็นความลับตามนโยบายความเป็นส่วนตัว</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
