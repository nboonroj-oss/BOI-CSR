import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wallet, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl flex flex-col overflow-hidden transition-all shadow-[0_20px_40px_rgba(18,28,42,0.06)] h-full"
    >
      <div className="h-4 bg-primary-fixed" />
      <div className="p-8 flex flex-col h-full">
        <div className="mb-6 h-48 rounded-2xl overflow-hidden bg-surface-container-low">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover opacity-90 transition-transform hover:scale-105 duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <h3 className="font-headline text-3xl font-extrabold text-on-surface mb-6 line-clamp-2 min-h-[4.5rem]">
          {project.title}
        </h3>
        
        <div className="space-y-4 mb-10 flex-grow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg text-slate-500 font-label leading-none">จังหวัด</p>
              <p className="text-2xl font-bold font-body leading-tight">{project.province}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg text-slate-500 font-label leading-none">กิจการ/ผลผลิต</p>
              <p className="text-2xl font-bold font-body leading-tight line-clamp-1">{project.product}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg text-slate-500 font-label leading-none">งบประมาณ</p>
              <p className="text-3xl font-bold text-primary font-body leading-tight">
                {project.budget.toLocaleString()} บาท
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/project/${project.id}`}
          className="w-full h-16 bg-primary text-on-primary rounded-2xl font-bold text-2xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm active:scale-95"
        >
          View Details
          <ArrowRight className="w-6 h-6" />
        </Link>
      </div>
    </motion.div>
  );
};
