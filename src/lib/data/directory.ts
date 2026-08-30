// Healthcare Services Directory + Care Pathways (Phase 2, synthetic demo data).
// Organises the whole value chain as a searchable directory rather than a flat
// list of diseases (per next-stage brief §8).

export interface DirectoryProvider {
  id: string;
  name: string;
  category: string;
  specialty: string;
  facility: string;
  location: string;
  available: boolean;
}

export interface ServiceCategory {
  key: string;
  label: string;
  icon: string;
  services: string[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: "primary", label: "Primary Care", icon: "Stethoscope", services: ["General Practitioners", "Family Medicine", "Nurses", "Primary Care Clinics"] },
  { key: "specialist", label: "Medical Specialists", icon: "HeartPulse", services: ["Cardiology", "Paediatrics", "Gynaecology", "Dermatology", "Orthopaedics", "Neurology", "Oncology"] },
  { key: "diagnostics", label: "Diagnostics", icon: "FlaskConical", services: ["Laboratories", "Imaging Centres", "Radiology", "Ultrasound", "ECG Services"] },
  { key: "oral", label: "Oral Health", icon: "Cross", services: ["Dentists", "Dental Clinics", "Oral Health Specialists"] },
  { key: "pharmacy", label: "Pharmacy", icon: "Pill", services: ["Participating Pharmacies", "Pharmacists", "Medicine Access"] },
  { key: "allied", label: "Allied Health", icon: "Activity", services: ["Physiotherapists", "Nutritionists", "Psychologists", "Occupational Therapists", "Rehabilitation"] },
  { key: "maternal", label: "Maternal & Child Health", icon: "HeartHandshake", services: ["Midwives", "Antenatal Care", "Postnatal Care", "Child Health"] },
  { key: "community", label: "Community & Home Care", icon: "Home", services: ["Community Health Workers", "Home Nurses", "Elderly Care", "Home-Based Follow-Up"] },
  { key: "hospitals", label: "Hospitals & Clinics", icon: "Building2", services: ["Public Facilities", "Private Hospitals", "Clinics", "Specialist Centres"] },
];

export const DIRECTORY_PROVIDERS: DirectoryProvider[] = [
  { id: "SL-DR-000245", name: "Dr. Farai Chikowore", category: "primary", specialty: "Internal Medicine", facility: "Harare Central Hospital", location: "Harare", available: true },
  { id: "SL-DR-000312", name: "Dr. Nyasha Chirwa", category: "specialist", specialty: "Cardiology", facility: "Parirenyatwa Group", location: "Harare", available: true },
  { id: "SL-DR-000418", name: "Dr. Anesu Sibanda", category: "specialist", specialty: "Paediatrics", facility: "Chitungwiza Central", location: "Chitungwiza", available: false },
  { id: "SL-DR-000502", name: "Dr. Rumbidzai Moyo", category: "maternal", specialty: "Obstetrics & Gynaecology", facility: "Harare Central", location: "Harare", available: true },
  { id: "SL-NUR-000191", name: "Sister Tapiwa Mudimu", category: "primary", specialty: "Registered Nurse", facility: "Chitungwiza Clinic", location: "Chitungwiza", available: true },
  { id: "SL-LAB-000052", name: "MA360 Partner Laboratory", category: "diagnostics", specialty: "Diagnostic Laboratory", facility: "MA360 Lab", location: "Harare", available: true },
  { id: "SL-LAB-000063", name: "Cimas Radiology", category: "diagnostics", specialty: "Imaging & Radiology", facility: "Cimas", location: "Harare", available: true },
  { id: "SL-PH-000087", name: "Unity Pharmacy", category: "pharmacy", specialty: "Community Pharmacy", facility: "Unity", location: "Harare CBD", available: true },
  { id: "SL-PH-000091", name: "Greenwood Chemist", category: "pharmacy", specialty: "Community Pharmacy", facility: "Greenwood", location: "Chitungwiza", available: true },
  { id: "SL-DEN-000114", name: "Dr. Kudzai Zhou", category: "oral", specialty: "Dental Surgeon", facility: "SmileCare Dental", location: "Harare", available: true },
  { id: "SL-ALH-000203", name: "Tariro Nutrition Services", category: "allied", specialty: "Clinical Nutritionist", facility: "MA360 Allied", location: "Epworth", available: true },
  { id: "SL-ALH-000210", name: "Mind Wellness Clinic", category: "allied", specialty: "Clinical Psychology", facility: "Mind Wellness", location: "Harare", available: false },
  { id: "SL-CHW-000320", name: "Rutendo Nyathi", category: "community", specialty: "Community Health Worker", facility: "MA360 Field", location: "Epworth", available: true },
  { id: "SL-CHW-000341", name: "Blessing Chuma", category: "community", specialty: "Community Health Worker", facility: "MA360 Field", location: "Chitungwiza", available: true },
];

export interface CarePathway {
  key: string;
  name: string;
  icon: string;
  steps: string[];
}

export const CARE_PATHWAYS: CarePathway[] = [
  { key: "htn", name: "Hypertension Care Pathway", icon: "HeartPulse", steps: ["Screening", "Clinician", "Laboratory", "Prescription", "Pharmacy", "Review"] },
  { key: "dm", name: "Diabetes Care Pathway", icon: "Activity", steps: ["Screening", "Clinician", "HbA1c Lab", "Prescription", "Pharmacy", "Education", "Review"] },
  { key: "anc", name: "Pregnancy (ANC) Pathway", icon: "HeartHandshake", steps: ["Registration", "ANC Booking", "Screening", "Clinician / Midwife", "Referral", "Follow-up"] },
];
