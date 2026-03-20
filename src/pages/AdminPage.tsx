import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Image as ImageIcon, MapPin, Wallet, Check } from 'lucide-react';
import { useProjects } from '../ProjectContext';

export const AdminPage: React.FC = () => {
  const { projects, updateProjectImage, isLoading, error } = useProjects();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-2xl font-bold text-primary text-center">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-2xl font-bold text-red-500 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const handleStartEdit = (id: string, currentUrl: string) => {
    setEditingId(id);
    setTempUrl(currentUrl);
    setSavedId(null);
  };

  const handleSave = (id: string) => {
    updateProjectImage(id, tempUrl);
    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-12 border-b-4 border-primary pb-8">
        <h1 className="text-6xl font-headline font-extrabold text-primary tracking-tighter">Admin Dashboard</h1>
        <p className="text-2xl text-on-surface-variant mt-2 font-body">แก้ไขรูปภาพประกอบโครงการ (ห้ามเพิ่มหรือลบโครงการ)</p>
      </header>

      <div className="space-y-8">
        <h2 className="text-4xl font-headline font-bold text-on-surface mb-8">รายการโครงการทั้งหมด ({projects.length})</h2>
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-8 flex-grow">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                  <img 
                    src={editingId === project.id ? tempUrl : project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=2029&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl font-bold font-headline text-on-surface leading-tight">{project.title}</h3>
                  <div className="flex gap-6 mt-3 text-on-surface-variant font-body text-xl">
                    <span className="flex items-center gap-2"><MapPin className="w-5 h-5" /> {project.province}</span>
                    <span className="flex items-center gap-2"><Wallet className="w-5 h-5" /> {project.budget.toLocaleString()} บาท</span>
                  </div>
                  
                  {editingId === project.id ? (
                    <div className="mt-6 flex flex-col gap-2">
                      <label className="text-lg font-bold text-primary">URL รูปภาพใหม่:</label>
                      <div className="flex gap-3">
                        <input
                          className="flex-grow h-14 px-6 text-xl bg-slate-50 border-2 border-primary rounded-xl focus:ring-0 outline-none transition-all"
                          value={tempUrl}
                          onChange={(e) => setTempUrl(e.target.value)}
                          placeholder="วางลิงก์รูปภาพที่นี่..."
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(project.id)}
                          className="bg-primary text-on-primary px-8 rounded-xl font-bold text-xl flex items-center gap-2 shadow-md hover:brightness-90 transition-all"
                        >
                          <Save className="w-5 h-5" />
                          บันทึก
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-slate-200 text-slate-600 px-6 rounded-xl font-bold text-xl hover:bg-slate-300 transition-all"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => handleStartEdit(project.id, project.image)}
                        className="text-primary font-bold text-xl flex items-center gap-2 hover:underline"
                      >
                        <ImageIcon className="w-5 h-5" />
                        เปลี่ยนรูปภาพ
                      </button>
                      {savedId === project.id && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-green-600 font-bold flex items-center gap-1 text-lg"
                        >
                          <Check className="w-5 h-5" /> บันทึกแล้ว
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
