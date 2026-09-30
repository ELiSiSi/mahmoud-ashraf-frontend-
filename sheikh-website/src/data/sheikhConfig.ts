import { SheikhConfig } from '../types';

export const sheikhConfig: SheikhConfig = {
  // نوع الشخص
  type: "sheikh",
  typeLabel: "الشيخ",

  // الهوية
  name: "محمود أشرف",
  title: "داعية إسلامي",
  bio:   "إِنَّنِي مِنَ ٱلۡمُسۡلِمِينَ",
  bioLong: "الشيخ محمود أشرف داعية إسلامي مصري، له العديد من الدروس والخطب والمحاضرات الدينية. بيسعى لنشر الوعي الديني وتصحيح المفاهيم الخاطئة، وله حضور واسع على منصات التواصل الاجتماعي. بيتابع معه الآلاف من محبيه في مصر والوطن العربي.",

  // الصور
  logo: "",
  heroImage: "https://p19-common-sign.tiktokcdn.com/tos-maliva-avt-0068/4832933357d6c45e50ff6b44f5eefb80~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=fa754232&x-expires=1790931600&x-signature=tMYH29DgZ4rWjNj88E8UJZbqAr8%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my",

  // معلومات تفصيلية
  yearsInField: 10,
  fieldLabel: "سنة في الدعوة",
  education: "كلية الشريعة - جامعة الأزهر",
  certificates: [
    "إجازة في القرآن الكريم",
    "شهادة في الفقه الإسلامي",
    "دبلومة في الدعوة"
  ],
  location: "مصر - القليوبية",

  // حقول إضافية مفتوحة
  customFields: [
    { label: "البريد الإلكتروني", value: "realmahmoudashraf@gmail.com" }
  ],

  // الألوان
  colors: {
    primary: "#0F2E5C",
    gold: "#C9A961",
    background: "#F8F6F1",
    text: "#0F172A"
  },

  // السوشيال ميديا
  social: {
    youtube: "https://www.youtube.com/@realmahmoudashraf",
    threads: "https://www.threads.com/@realmahmoudashraf",
    tiktok: "https://www.tiktok.com/@realmahmoudashraf",
    facebook: "https://www.facebook.com/realmahmoudashraf",
    instagram: "https://www.instagram.com/realmahmoudashraf",
    email: "mailto:realmahmoudashraf@gmail.com"
  },

  // رسالة المشاركة
  shareMessage: "ادخل استفيد مع {typeLabel} {name}",

  // الأذكار
  athkar: [
    "الحمد لله",
    "الله أكبر",
    "سبحان الله وبحمده",
    "لا إله إلا الله وحده لا شريك له",
    "اللهم صل وسلم على نبينا محمد",
    "استغفر الله العظيم",
    "سبحان الله وبحمده",
    "لا إله إلا الله وحده لا شريك له",
    "اللهم صل وسلم على نبينا محمد",
    "استغفر الله العظيم",
    "سبحان الله وبحمده",
    "لا إله إلا الله وحده لا شريك له",
    "اللهم صل وسلم على نبينا محمد",
  ],

  // الكاتوجري (4 كاتوجري، كل واحدة 5 فيديوهات)
  categories: [
    {
      id: "64654654",
      name: "#معلش_هتفرج",
      image: "https://yt3.googleusercontent.com/WIae_GBXquZyNZN2LiBEap41XLbzBJF2Jk3GY15f-7hONxYolzUpwobREE5_RRQeMyXb2G9g=s160-c-k-c0x00ffffff-no-rj",
      videos: [
        { id: "v1", url: "https://youtu.be/mzcKbyw9fTY?si=KqpTxe_o6xKzOhwI" },
        { id: "v2", url: "https://youtu.be/-chHzJ5bVf8?si=oNAhc0MABecIExbp" },
        { id: "v3", url: "https://youtu.be/k4vEEvrN5bc?si=YPXMzBdBK6XWwc88" },
        { id: "v4", url: "https://youtu.be/W-Zu1cUWvqg?si=kyESQBhutxKfQk6v" },
        { id: "v5", url: "https://youtu.be/1UtGH9X9pU8?si=T36XU2SMOIPgrjLp" },
        { id: "v6", url: "https://youtu.be/ogMJEl1pOjY?si=UxoOLFCZs6nESIxd" },
        { id: "v7", url: "https://youtu.be/Bo0bst4Q5Hw?si=bkNaZLfmuqaTVLJT" },
        { id: "v8", url: "https://youtu.be/uZyGmEi7dkA?si=6Gk5DPZvUOX3Zxoo" },
        { id: "v9", url: "https://youtu.be/F2591IIwvVg?si=0HfTu4oxMYHv8Oak" },
        { id: "v10", url: "https://youtu.be/zir4zNeEnjs?si=ihUz8q3Rl9T8Uu_g" },
        { id: "v11", url: "https://youtu.be/2q_IFpjbQVY?si=mwHBszGxwpF6fIjo" },
        { id: "v12", url: "https://youtu.be/n-BEgNYmibk?si=MSqb7AAPoQjcbQFO" },
        { id: "v13", url: "https://youtu.be/7qgmmCdiBdc?si=h5UmtE11P3yXJqOq" }
      ]
    }


  ],

  // إعدادات التوقيت
settings: {
  athkarInterval: 15000,
  athkarDuration: 5000,

  // تذكير الصلاة التي لم يؤكد المستخدم أنه صلاها
  prayerReminderInterval: 300000, // 5 دقائق

  // مدة ظهور الإشعار
  prayerReminderDuration: 6000,

  adDelay: 3000,
  city: "Cairo",
  country: "Egypt"
},
  // SEO
  seo: {
    siteUrl: "https://example.vercel.app",
    keywords: ["الشيخ محمود أشرف", "داعية إسلامي", "خطب", "دروس دينية"],
    defaultImage: "https://yt3.googleusercontent.com/WIae_GBXquZyNZN2LiBEap41XLbzBJF2Jk3GY15f-7hONxYolzUpwobREE5_RRQeMyXb2G9g=s160-c-k-c0x00ffffff-no-rj"
  }
};
