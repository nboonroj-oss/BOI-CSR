export interface Project {
  id: string;
  status: string; // สถานะโครงการ
  title: string; // ชื่อโครงการ
  province: string; // จังหวัด
  organization: string; // องค์กรท้องถิ่นที่ขอรับการสนับสนุน
  groupType: string; // ประเภทกลุ่ม
  businessType: string; // ประเภทธุรกิจ
  product: string; // กิจการ/ผลผลิต
  budget: number; // มูลค่าโครงการ ก่อน vat
  partners: string; // ภาคีผู้ส่งเสริม
  sponsors: string; // บริษัทผู้สนับสนุน
  description: string; // เนื้อหาโดยย่อ
  grade: string; // Grade
  oneDriveLink: string; // Link OneDrive
  image: string; // Added for UI
}

export interface InquiryItem {
  project: Project;
}
