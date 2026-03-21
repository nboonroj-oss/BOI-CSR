import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Project } from './types';
import { projects as initialProjects } from './data';

interface ProjectContextType {
  projects: Project[];
  updateProjectImage: (id: string, imageUrl: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/12NCJM4W23nw9Rj1XjiSYmqHb8JaK5EdKUl0qkIJZ6zM/export?format=csv&gid=0';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firestore overrides for images
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});

  // Listen for image overrides from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'imageOverrides'), (snapshot) => {
      const overrides: Record<string, string> = {};
      snapshot.forEach((doc) => {
        overrides[doc.id] = doc.data().imageUrl;
      });
      setImageOverrides(overrides);
    }, (err) => {
      console.error('Firestore Error:', err);
    });

    return () => unsubscribe();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(SHEET_URL);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.replace(/[\u200B-\u200D\uFEFF]/g, '').trim(),
        complete: (results) => {
          const keys = results.meta.fields || [];
          
          // Find ID key flexibly
          const idKey = keys.find(k => {
            const key = k.trim();
            return key === 'ลำดับ' || key === 'ที่' || key === 'ID' || key === 'No' || key === 'No.';
          }) || keys[0];

          const parsedProjects = results.data
            .map((row: any) => {
              // Generate a stable ID
              const id = (row[idKey] || '').trim() || 
                         `${row['ชื่อโครงการ']}-${row['จังหวัด']}`.replace(/\s+/g, '-').substr(0, 50);
              
              // Find budget key flexibly with prioritized matching
              const budgetKey = keys.find(k => {
                const key = k.toLowerCase().replace(/[\s_]/g, '');
                return key.includes('มูลค่าโครงการก่อนvat') || key.includes('budget') || key === 'งบประมาณ';
              }) || keys.find(k => {
                const key = k.toLowerCase().replace(/[\s_]/g, '');
                return key.includes('งบประมาณ') || key.includes('มูลค่าโครงการ') || key.includes('เงินทุน');
              }) || keys.find(k => {
                const key = k.toLowerCase();
                return key.includes('มูลค่า') || key.includes('งบ');
              }) || 'มูลค่าโครงการ ก่อน vat';
              
              const rawBudgetValue = String(row[budgetKey] || '0');
              // Clean the value: remove commas, currency symbols, and any non-numeric characters except decimal point
              const cleanedBudget = rawBudgetValue.replace(/,/g, '').replace(/[^\d.]/g, '');
              const budget = Number(cleanedBudget) || 0;
              
              // Find OneDrive link key flexibly
              const oneDriveKey = keys.find(k => {
                const key = k.toLowerCase().replace(/[\s_]/g, '');
                return key.includes('onedrive') || key.includes('เอกสารแนบ') || key.includes('ลิงก์') || key.includes('link');
              }) || 'Link OneDrive';

              let oneDriveLink = (row[oneDriveKey] || '').trim();
              if (oneDriveLink && !oneDriveLink.startsWith('http')) {
                oneDriveLink = `https://${oneDriveLink}`;
              }

              // Find activity type key flexibly, prioritizing "ประเภทกิจกรรม" as per user request (Column G)
              const activityTypeKey = keys.find(k => {
                const key = k.trim();
                return key === 'ประเภทกิจกรรม' || key === 'ประเภทธุรกิจ' || key.toLowerCase().includes('activity');
              }) || keys[6] || 'ประเภทกิจกรรม';

              // Find product key flexibly, prioritizing "กิจการ/ผลผลิต" as per user request (Column H)
              const productKey = keys.find(k => {
                const key = k.trim();
                return key === 'กิจการ/ผลผลิต' || key.toLowerCase().includes('product');
              }) || keys[7] || 'กิจการ/ผลผลิต';

              // Find expected changes key flexibly, prioritizing "การเปลี่ยนแปลงที่คาดหวัง" (Column L)
              const expectedChangesKey = keys.find(k => {
                const key = k.trim();
                return key === 'การเปลี่ยนแปลงที่คาดหวัง' || key.toLowerCase().includes('expected');
              }) || keys[11] || 'การเปลี่ยนแปลงที่คาดหวัง';

              // Find brief content key flexibly, prioritizing "เนื้อหาโดยย่อ" (Column N)
              const briefContentKey = keys.find(k => {
                const key = k.trim();
                return key === 'เนื้อหาโดยย่อ' || key.toLowerCase().includes('brief');
              }) || keys[13] || 'เนื้อหาโดยย่อ';

              return {
                id,
                status: row['สถานะโครงการ'] || row['สถานะครงการ'] || '',
                title: row['ชื่อโครงการ'] || '',
                province: row['จังหวัด'] || '',
                organization: row['องค์กรท้องถิ่นที่ขอรับการสนับสนุน'] || '',
                groupType: row['ประเภทกลุ่ม'] || '',
                activityType: row[activityTypeKey] || '',
                product: row[productKey] || '',
                budget,
                partners: row['ภาคีผู้ส่งเสริม'] || '',
                sponsors: row['บริษัทผู้สนับสนุน'] || '',
                expectedChanges: (row[expectedChangesKey] || row[briefContentKey] || '').trim(),
                grade: row['Grade'] || '',
                oneDriveLink,
                image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070&auto=format&fit=crop',
              };
            })
            .filter((p: any) => p.status === 'พร้อมเสนอบริษัท');
          
          if (parsedProjects.length > 0) {
            // Apply current overrides immediately when setting projects
            setProjects(parsedProjects.map(p => ({
              ...p,
              image: imageOverrides[p.id] || p.image
            })));
          }
          setIsLoading(false);
        },
        error: (err: any) => {
          console.error('CSV Parsing Error:', err);
          setError('Failed to parse Google Sheet data.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to connect to Google Sheets.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Re-apply overrides when projects or overrides change
  useEffect(() => {
    setProjects(prev => prev.map(p => ({
      ...p,
      image: imageOverrides[p.id] || p.image
    })));
  }, [imageOverrides]);

  const updateProjectImage = async (id: string, imageUrl: string) => {
    try {
      await setDoc(doc(db, 'imageOverrides', id), {
        projectId: id,
        imageUrl,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating image override:', err);
      throw err;
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, updateProjectImage, isLoading, error }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
