import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Filter, X } from 'lucide-react';
import { useProjects } from '../ProjectContext';
import { ProjectCard } from '../components/ProjectCard';

export const CatalogPage: React.FC = () => {
  const { projects, isLoading, error } = useProjects();
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');

  const provinces = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.province))).filter(Boolean).sort();
  }, [projects]);

  const businessTypes = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.businessType))).filter(Boolean).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchProvince = selectedProvince === '' || p.province === selectedProvince;
      const matchBusinessType = selectedBusinessType === '' || p.businessType === selectedBusinessType;
      return matchProvince && matchBusinessType;
    });
  }, [projects, selectedProvince, selectedBusinessType]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-2xl font-bold text-primary">กำลังโหลดข้อมูลโครงการ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-2xl font-bold text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const clearFilters = () => {
    setSelectedProvince('');
    setSelectedBusinessType('');
  };

  return (
    <div className="paper-texture min-h-screen">
      <header className="mb-12 ml-4 md:ml-12 border-l-4 border-primary pl-8">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-headline text-6xl md:text-7xl font-extrabold text-on-surface tracking-tight mb-4"
        >
          สารบัญโครงการนวัตกรรม
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl text-on-surface-variant max-w-2xl font-body leading-relaxed"
        >
          แหล่งรวมโครงการที่พร้อมสำหรับการสนับสนุน เพื่อสร้างคุณภาพชีวิตที่ดีขึ้นให้แก่สังคมและผู้สูงวัย
        </motion.p>
      </header>

      {/* Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12 mx-4 md:mx-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="flex items-center gap-3 text-primary font-bold text-2xl shrink-0">
            <Filter className="w-6 h-6" />
            <span>ตัวกรองโครงการ:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow w-full">
            <div className="space-y-2">
              <label className="text-lg font-bold text-outline uppercase tracking-wider">จังหวัด</label>
              <select 
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full h-16 px-6 text-xl bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary-fixed transition-all font-body appearance-none cursor-pointer"
              >
                <option value="">ทั้งหมดทุกจังหวัด</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-bold text-outline uppercase tracking-wider">ประเภทธุรกิจ</label>
              <select 
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="w-full h-16 px-6 text-xl bg-surface-container-low border-none rounded-2xl focus:ring-4 focus:ring-primary-fixed transition-all font-body appearance-none cursor-pointer"
              >
                <option value="">ทั้งหมดทุกประเภทธุรกิจ</option>
                {businessTypes.map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
          </div>

          {(selectedProvince || selectedBusinessType) && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 text-red-500 font-bold text-xl hover:underline transition-all shrink-0"
            >
              <X className="w-5 h-5" />
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </motion.div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-3xl font-bold text-slate-400 mb-4">ไม่พบโครงการที่ตรงตามเงื่อนไข</p>
          <button 
            onClick={clearFilters}
            className="text-primary font-bold text-2xl hover:underline"
          >
            แสดงโครงการทั้งหมด
          </button>
        </div>
      )}

      {filteredProjects.length > 0 && (
        <div className="mt-20 flex justify-center">
          <button className="px-12 py-5 bg-secondary-container text-on-secondary-container rounded-full font-bold text-3xl shadow-md hover:brightness-95 transition-all active:scale-95">
            แสดงโครงการเพิ่มเติม
          </button>
        </div>
      )}
    </div>
  );
};
