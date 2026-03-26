export interface Project {
  id: string;
  status: string; // สถานะโครงการ
  title: string; // ชื่อโครงการ
  province: string; // จังหวัด
  organization: string; // องค์กรท้องถิ่นที่ขอรับการสนับสนุน
  groupType: string; // ประเภทกลุ่ม
  activityType: string; // ประเภทกิจกรรม
  product: string; // กิจการ/ผลผลิต
  budget: number; // มูลค่าโครงการ ก่อน vat
  partners: string; // ภาคีผู้ส่งเสริม
  sponsors: string; // บริษัทผู้สนับสนุน
  expectedChanges: string; // การเปลี่ยนแปลงที่คาดหวัง
  grade: string; // Grade
  oneDriveLink: string; // Link OneDrive
  mou: string; // ตลาดและช่องทางจำหน่าย (MOU)
  images: string[]; // Added for UI, supports up to 5 images
}

export interface InquiryItem {
  project: Project;
}
