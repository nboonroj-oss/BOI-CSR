import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Image as ImageIcon, MapPin, Wallet, Check, LogIn, LogOut, Mail, Calendar, User as UserIcon, Lock } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useProjects } from '../ProjectContext';

const ADMIN_EMAIL = "n.boonroj@gmail.com";
const ADMIN_PASSWORD = "BOI2569";

export const AdminPage: React.FC = () => {
  const { projects, updateProjectImage, isLoading, error } = useProjects();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Password gate state
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('admin_unlocked') === 'true';
  });
  const [passwordError, setPasswordError] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'inquiries'>('inquiries');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for inquiries
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInquiries(docs);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      sessionStorage.setItem('admin_unlocked', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogin = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError(`Domain นี้ยังไม่ได้รับอนุญาตใน Firebase Console: ${window.location.hostname}`);
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError('Pop-up ถูกบล็อก กรุณาอนุญาตให้เปิด Pop-up สำหรับเว็บไซต์นี้');
      } else {
        setLoginError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsUnlocked(false);
    sessionStorage.removeItem('admin_unlocked');
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-6">Admin Access</h1>
          <p className="text-xl text-on-surface-variant mb-10">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบหลังบ้าน</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`w-full h-16 px-6 text-2xl bg-slate-50 border-2 rounded-2xl outline-none transition-all ${
                  passwordError ? 'border-red-500' : 'border-slate-200 focus:border-primary'
                }`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 font-bold text-lg">รหัสผ่านไม่ถูกต้อง</p>
              )}
            </div>
            <button 
              type="submit"
              className="w-full bg-primary text-on-primary py-5 rounded-2xl font-bold text-2xl shadow-lg hover:brightness-95 transition-all active:scale-95"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-2xl font-bold text-primary text-center">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <h1 className="text-4xl font-headline font-bold text-primary mb-6">Security Verification</h1>
          <p className="text-xl text-on-surface-variant mb-10">เพื่อความปลอดภัยสูงสุด กรุณายืนยันตัวตนด้วย Google Account ของคุณอีกครั้ง</p>
          
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-lg border border-red-100">
              {loginError}
            </div>
          )}

          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-5 rounded-2xl font-bold text-2xl shadow-lg hover:brightness-95 transition-all active:scale-95"
          >
            <LogIn className="w-6 h-6" />
            Verify Identity
          </button>
        </div>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <h1 className="text-4xl font-headline font-bold text-red-600 mb-6">Access Denied</h1>
          <p className="text-xl text-on-surface-variant mb-10">บัญชี {user.email} ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-slate-200 text-slate-700 py-5 rounded-2xl font-bold text-2xl hover:bg-slate-300 transition-all"
          >
            <LogOut className="w-6 h-6" />
            Logout
          </button>
        </div>
      </div>
    );
  }

  const handleStartEdit = (id: string, currentUrl: string) => {
    setEditingId(id);
    setTempUrl(currentUrl);
    setSavedId(null);
  };

  const handleSave = async (id: string) => {
    try {
      await updateProjectImage(id, tempUrl);
      setEditingId(null);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12 border-b-4 border-primary pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl font-headline font-extrabold text-primary tracking-tighter">Admin Dashboard</h1>
          <p className="text-2xl text-on-surface-variant mt-2 font-body">จัดการข้อมูลโครงการและคำขอสนับสนุน</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`px-8 py-3 rounded-xl font-bold text-xl transition-all ${
              activeTab === 'inquiries' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            คำขอสนับสนุน ({inquiries.length})
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-8 py-3 rounded-xl font-bold text-xl transition-all ${
              activeTab === 'projects' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            จัดการรูปภาพ
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold text-xl transition-colors ml-4"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {activeTab === 'inquiries' ? (
        <div className="space-y-8">
          <h2 className="text-4xl font-headline font-bold text-on-surface mb-8">รายการคำขอสนับสนุนโครงการ</h2>
          {inquiries.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-slate-200">
              <p className="text-2xl text-slate-400">ยังไม่มีคำขอสนับสนุนในขณะนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {inquiries.map((inquiry) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 pb-8 border-b border-slate-100">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-primary">
                        <UserIcon className="w-6 h-6" />
                        <span className="text-3xl font-bold font-headline">{inquiry.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <Mail className="w-5 h-5" />
                        <a href={`mailto:${inquiry.email}`} className="text-2xl hover:underline">{inquiry.email}</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-6 py-3 rounded-2xl self-start">
                      <Calendar className="w-5 h-5" />
                      <span className="text-xl font-bold">
                        {inquiry.createdAt?.toDate().toLocaleString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-outline uppercase tracking-widest">โครงการที่สนใจ ({inquiry.projects.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inquiry.projects.map((p: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h5 className="text-2xl font-bold text-primary mb-2 leading-tight">{p.title}</h5>
                          <div className="flex gap-4 text-on-surface-variant text-lg">
                            <span>{p.province}</span>
                            <span className="text-slate-300">|</span>
                            <span>{p.product}</span>
                            <span className="font-bold text-primary">฿{p.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-headline font-bold text-on-surface">จัดการรูปภาพโครงการ ({projects.length})</h2>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-bold">
              <Check className="w-5 h-5" />
              <span>Connected to Cloud Database</span>
            </div>
          </div>
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
      )}
    </div>
  );
};
