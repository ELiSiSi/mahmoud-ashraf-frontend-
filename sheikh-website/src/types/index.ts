export interface Video {
  id: string;
  title?: string;
  url: string;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface Category {
  id: string;
  name: string;
  image: string;
  videos: Video[];
}

export interface CustomField {
  label: string;
  value: string;
}

export interface SheikhConfig {
  type: string;
  typeLabel: string;
  name: string;
  title: string;
  bio: string;
  bioLong: string;
  logo: string;
  heroImage: string;
  yearsInField: number;
  fieldLabel: string;
  education: string;
  certificates: string[];
  location: string;
  customFields: CustomField[];
  colors: {
    primary: string;
    gold: string;
    background: string;
    text: string;
  };
  social: {
    youtube?: string;
    threads?: string;
    tiktok?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    email?: string;
  };
  shareMessage: string;
  athkar: string[];
  categories: Category[];
  settings: {
    athkarInterval: number;
    athkarDuration: number;
    prayerReminderInterval: number;
    prayerReminderDuration: number;
    adDelay: number;
    city: string;
    country: string;
  };
  seo: {
    siteUrl: string;
    keywords: string[];
    defaultImage: string;
  };
}
