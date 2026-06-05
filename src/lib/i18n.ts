export type Lang = 'id' | 'en';

export const translations = {
  // ── NAVBAR ──
  nav_home: { id: 'Beranda', en: 'Home' },
  nav_generator: { id: 'Generator', en: 'Generator' },
  nav_pricing: { id: 'Harga', en: 'Pricing' },
  nav_faq: { id: 'FAQ', en: 'FAQ' },
  nav_cta: { id: 'Buat Logo', en: 'Create Logo' },

  // ── HERO ──
  hero_badge: { id: '✨ Gratis — Langsung Pakai', en: '✨ Free — Use Instantly' },
  hero_title_1: { id: 'Buat Logo Keren', en: 'Create Stunning' },
  hero_title_2: { id: 'Dalam Sekejap', en: 'Logos Instantly' },
  hero_desc: {
    id: 'Buat logo profesional untuk bisnis Anda dalam hitungan detik.',
    en: 'Create professional logos for your business in seconds.',
  },
  hero_desc_bold: {
    id: 'Gratis, tanpa perlu keahlian desain.',
    en: 'Free — no design skills needed.',
  },
  hero_cta: { id: 'Buat Logo — Gratis', en: 'Create Logo — Free' },
  hero_cta_2: { id: 'Lihat Cara Kerjanya', en: 'See How It Works' },

  // ── HOW IT WORKS ──
  hiw_label: { id: 'Cara Kerja', en: 'How It Works' },
  hiw_title: { id: 'Empat Langkah Menuju Logo Sempurna', en: 'Four Steps to Your Perfect Logo' },
  hiw_desc: {
    id: 'Pendekatan algoritmik kami menggabungkan teori desain dengan presisi matematis untuk menghasilkan logo yang unik dan profesional.',
    en: 'Our algorithmic approach combines design theory with mathematical precision to generate logos that are unique and professional.',
  },
  hiw_s1_title: { id: 'Pilih Gaya Anda', en: 'Choose Your Style' },
  hiw_s1_desc: {
    id: 'Pilih industri Anda, palet warna favorit, dan gaya desain. Sistem kami menyesuaikan pola dengan identitas merek Anda.',
    en: 'Select your industry, preferred color palette, and design style. Our system adapts the patterns to match your brand identity.',
  },
  hiw_s2_title: { id: 'Hasilkan Variasi', en: 'Generate Variants' },
  hiw_s2_desc: {
    id: 'Algoritma kami membuat beberapa variasi logo unik menggunakan titik-titik, bentuk geometris, garis, dan jaringan simpul.',
    en: 'Our algorithm creates multiple unique logo variants using dot matrices, geometric shapes, line systems, and node networks.',
  },
  hiw_s3_title: { id: 'Pratinjau & Sesuaikan', en: 'Preview & Customize' },
  hiw_s3_desc: {
    id: 'Lihat logo Anda secara langsung dalam berbagai tata letak: ikon saja, tulisan, tersusun, dan horizontal.',
    en: 'See your logo in real-time across multiple layouts: icon-only, wordmark, stacked, and horizontal arrangements.',
  },
  hiw_s4_title: { id: 'Ekspor & Unduh', en: 'Export & Download' },
  hiw_s4_desc: {
    id: 'Unduh logo Anda sebagai SVG (vektor, bisa diperbesar tanpa batas) atau PNG (1024x1024px, siap untuk web dan cetak).',
    en: 'Download your logo as SVG (vector, infinitely scalable) or PNG (1024x1024px, ready for web and print).',
  },

  // ── PRICING ──
  pricing_label: { id: 'Harga', en: 'Pricing' },
  pricing_title: { id: 'Harga Sederhana & Transparan', en: 'Simple, Transparent Pricing' },
  pricing_desc: {
    id: 'Mulai gratis, upgrade saat butuh lebih. Tanpa biaya tersembunyi.',
    en: 'Start free, upgrade when you need more. No hidden fees.',
  },
  pricing_free: { id: 'Gratis', en: 'Free' },
  pricing_free_desc: { id: 'Cocok untuk mencoba pembuatan logo', en: 'Perfect for trying out logo generation' },
  pricing_free_f1: { id: '5 pembuatan logo per hari', en: '5 logo generations per day' },
  pricing_free_f2: { id: '3 pola desain', en: '3 design patterns' },
  pricing_free_f3: { id: 'Unduh SVG', en: 'SVG download' },
  pricing_free_f4: { id: 'Palet warna dasar', en: 'Basic color palettes' },
  pricing_free_f5: { id: 'Varian ikon saja', en: 'Icon-only variant' },
  pricing_free_cta: { id: 'Mulai Gratis', en: 'Get Started Free' },

  pricing_pro: { id: 'Pro', en: 'Pro' },
  pricing_pro_desc: { id: 'Untuk freelancer dan bisnis kecil', en: 'For freelancers and small businesses' },
  pricing_pro_f1: { id: 'Pembuatan logo tanpa batas', en: 'Unlimited logo generations' },
  pricing_pro_f2: { id: 'Semua 7 pola desain', en: 'All 7 design patterns' },
  pricing_pro_f3: { id: 'Unduh SVG + PNG', en: 'SVG + PNG download' },
  pricing_pro_f4: { id: 'Semua palet warna', en: 'All color palettes' },
  pricing_pro_f5: { id: 'Semua 4 varian tata letak', en: 'All 4 layout variants' },
  pricing_pro_f6: { id: 'Input warna kustom', en: 'Custom color input' },
  pricing_pro_f7: { id: 'Prioritas pembuatan', en: 'Priority generation' },
  pricing_pro_cta: { id: 'Mulai Uji Coba Pro', en: 'Start Pro Trial' },
  pricing_popular: { id: 'Paling Populer', en: 'Most Popular' },

  pricing_ent: { id: 'Enterprise', en: 'Enterprise' },
  pricing_ent_desc: { id: 'Untuk agensi dan tim desain', en: 'For agencies and design teams' },
  pricing_ent_f1: { id: 'Semua fitur Pro', en: 'Everything in Pro' },
  pricing_ent_f2: { id: 'Manajemen kit merek', en: 'Brand kit management' },
  pricing_ent_f3: { id: 'Pembuatan massal (10+ logo)', en: 'Batch generation (10+ logos)' },
  pricing_ent_f4: { id: 'Ekspor white-label', en: 'White-label exports' },
  pricing_ent_f5: { id: 'Akses API', en: 'API access' },
  pricing_ent_f6: { id: 'Kolaborasi tim', en: 'Team collaboration' },
  pricing_ent_f7: { id: 'Dukungan khusus', en: 'Dedicated support' },
  pricing_ent_f8: { id: 'Pola desain kustom', en: 'Custom design patterns' },
  pricing_ent_cta: { id: 'Hubungi Sales', en: 'Contact Sales' },

  // ── FAQ ──
  faq_label: { id: 'FAQ', en: 'FAQ' },
  faq_title: { id: 'Pertanyaan yang Sering Diajukan', en: 'Frequently Asked Questions' },
  faq_desc: {
    id: 'Semua yang perlu Anda ketahui tentang LixStudio Logo Generator.',
    en: 'Everything you need to know about LixStudio Logo Generator.',
  },
  faq_q1: { id: 'Format file apa saja yang bisa diunduh?', en: 'What file formats can I download my logo in?' },
  faq_a1: {
    id: 'Anda bisa mengunduh logo dalam format SVG (vektor, bisa diperbesar tanpa batas) dan PNG (1024x1024px, dioptimalkan untuk web dan cetak). SVG direkomendasikan untuk penggunaan profesional.',
    en: 'You can download your logo in SVG (vector format, infinitely scalable) and PNG (1024x1024px, optimized for web and print). SVG is recommended for professional use.',
  },
  faq_q2: { id: 'Apakah logo-nya benar-benar unik?', en: 'Are the logos truly unique?' },
  faq_a2: {
    id: 'Ya! Setiap logo dibuat secara algoritmik berdasarkan input Anda — nama merek, industri, gaya, palet warna, dan pola. Kombinasi parameter ini memastikan hasil unik setiap saat.',
    en: 'Yes! Each logo is generated algorithmically based on your inputs — brand name, industry, style, color palette, and pattern. The combination of parameters ensures unique results every time.',
  },
  faq_q3: { id: 'Bisakah saya menggunakan logo untuk komersial?', en: 'Can I use the logos commercially?' },
  faq_a3: {
    id: 'Tentu saja! Semua logo yang dibuat oleh LixStudio adalah milik Anda untuk digunakan untuk tujuan apapun — komersial, pribadi, atau lainnya. Tidak perlu atribusi.',
    en: 'Absolutely! All logos generated by LixStudio are yours to use for any purpose — commercial, personal, or otherwise. No attribution required.',
  },
  faq_q4: { id: 'Bagaimana cara kerja mesin pembuat logo?', en: 'How does the SVG generation engine work?' },
  faq_a4: {
    id: 'Mesin kami menggunakan 7 pola desain inti: titik-titik, bentuk geometris, sistem garis, jaringan simpul, dan 3 pola kombinasi. Setiap pola memiliki parameter matematis yang menyesuaikan dengan gaya dan industri Anda.',
    en: 'Our engine uses 7 core design patterns: dot matrices, geometric shapes, line systems, node networks, and 3 combination patterns. Each pattern has mathematical parameters that adapt to your style and industry selection.',
  },
  faq_q5: { id: 'Bisakah saya menyesuaikan warna di luar palet yang tersedia?', en: 'Can I customize colors beyond the preset palettes?' },
  faq_a5: {
    id: 'Pengguna Pro bisa memasukkan kode warna hex kustom dan membuat palet sendiri. Pengguna gratis memiliki akses ke palet warna khusus industri kami.',
    en: 'Pro users can input custom hex colors and create their own palettes. Free users have access to our curated industry-specific color palettes.',
  },
  faq_q6: { id: 'Apa saja varian logo yang tersedia?', en: 'What are the logo variants?' },
  faq_a6: {
    id: 'Kami menghasilkan 4 varian: ikon saja (tanda mandiri), tulisan (ikon + nama berdampingan), tersusun (ikon di atas, nama di bawah), dan horizontal (nama dengan ikon). Masing-masing dioptimalkan untuk kegunaan berbeda.',
    en: 'We generate 4 variants: icon-only (standalone mark), wordmark (icon + name side by side), stacked (icon on top, name below), and horizontal (name with icon). Each is optimized for different use cases.',
  },

  // ── FOOTER ──
  footer_desc: {
    id: 'Pembuatan logo profesional bertenaga pola desain algoritmik.',
    en: 'Professional logo generation powered by algorithmic design patterns.',
  },
  footer_product: { id: 'Produk', en: 'Product' },
  footer_logo_gen: { id: 'Pembuat Logo', en: 'Logo Generator' },
  footer_resources: { id: 'Sumber Daya', en: 'Resources' },
  footer_design_guide: { id: 'Panduan Desain', en: 'Design Guide' },
  footer_api_docs: { id: 'Dokumentasi API', en: 'API Docs' },
  footer_company: { id: 'Perusahaan', en: 'Company' },
  footer_about: { id: 'Tentang', en: 'About' },
  footer_privacy: { id: 'Privasi', en: 'Privacy' },
  footer_terms: { id: 'Syarat & Ketentuan', en: 'Terms' },
  footer_copy: { id: 'Hak cipta dilindungi.', en: 'All rights reserved.' },

  // ── GENERATOR PAGE ──
  gen_title: { id: 'Generator Logo LixStudio', en: 'LixStudio Logo Generator' },
  gen_subtitle: {
    id: 'Pilih gaya, warna, dan pola — logo Anda siap dalam hitungan detik.',
    en: 'Choose style, color, and pattern — your logo is ready in seconds.',
  },
  gen_back: { id: '← Kembali ke Beranda', en: '← Back to Home' },

  // ── GENERATOR UI ──
  gen_logo_generator: { id: 'Generator Logo', en: 'Logo Generator' },
  gen_free_subtitle: { id: 'Buat logo gratis untuk bisnis Anda dalam hitungan detik', en: 'Create free logos for your business in seconds' },
  gen_free_badge: { id: 'Pembuat Logo Gratis', en: 'Free Logo Generator' },
  gen_free_tab: { id: '✨ Gratis — SVG', en: '✨ Free — SVG' },
  gen_premium_tab: { id: '🔥 Premium — AI', en: '🔥 Premium — AI' },
  gen_examples: { id: 'Contoh:', en: 'Examples:' },
  gen_settings: { id: 'Pengaturan Logo', en: 'Logo Settings' },
  gen_brand_name: { id: 'Nama Bisnis', en: 'Brand Name' },
  gen_brand_placeholder: { id: 'Contoh: Warung Kopi Senja', en: 'e.g. Sunset Coffee Shop' },
  gen_industry: { id: 'Jenis Bisnis', en: 'Industry' },
  gen_layout: { id: 'Tata Letak', en: 'Layout' },
  gen_style: { id: 'Gaya Desain', en: 'Design Style' },
  gen_color: { id: 'Warna', en: 'Color' },
  gen_primary_color: { id: 'Warna Utama', en: 'Primary Color' },
  gen_bg_color: { id: 'Warna Latar', en: 'Background Color' },
  gen_pattern: { id: 'Pola Desain', en: 'Design Pattern' },
  gen_desc_label: { id: 'Deskripsi Tambahan', en: 'Additional Description' },
  gen_optional: { id: 'opsional', en: 'optional' },
  gen_desc_placeholder: { id: 'Contoh: Gunakan ikon kopi, font yang elegan, kesan premium...', en: 'e.g. Use a coffee icon, elegant font, premium feel...' },
  gen_preview: { id: 'Pratinjau Logo', en: 'Logo Preview' },
  gen_download_svg: { id: 'Unduh SVG', en: 'Download SVG' },
  gen_download_png: { id: 'Unduh PNG', en: 'Download PNG' },
  gen_all_variants: { id: 'Semua Varian', en: 'All Variants' },
  gen_download_all_title: { id: 'Unduh Semua Varian', en: 'Download All Variants' },
  gen_download_all_desc: { id: 'Unduh 4 layout sekaligus dalam format SVG', en: 'Download all 4 layouts at once in SVG format' },
  gen_download_all_btn: { id: 'Unduh Semua SVG', en: 'Download All SVG' },

  // ── AI MODE ──
  gen_ai_logo: { id: 'Logo AI', en: 'AI Logo' },
  gen_ai_desc: { id: 'Dibuat oleh AI — desain unik dan profesional', en: 'Created by AI — unique and professional design' },
  gen_ai_download: { id: 'Unduh PNG (untuk WhatsApp)', en: 'Download PNG (for WhatsApp)' },
  gen_ai_btn: { id: '🔥 Buat Logo dengan AI', en: '🔥 Generate Logo with AI' },
  gen_ai_loading: { id: 'Sedang Membuat Logo...', en: 'Generating Logo...' },
  gen_ai_loading_title: { id: 'Sedang membuat logo Anda...', en: 'Creating your logo...' },
  gen_ai_loading_desc: { id: 'Proses ini membutuhkan waktu 10-20 detik', en: 'This process takes 10-20 seconds' },
  gen_ai_generating: { id: 'Membuat...', en: 'Generating...' },
  gen_ai_empty_title: { id: 'Atur pengaturan brand Anda, lalu klik', en: 'Set up your brand settings, then click' },
  gen_ai_empty_btn: { id: '"Buat Logo dengan AI"', en: '"Generate Logo with AI"' },
  gen_ai_retry: { id: 'Coba lagi', en: 'Try again' },

  // ── API KEYS ──
  gen_api_keys: { id: '🔑 API Keys', en: '🔑 API Keys' },
  gen_api_optional: { id: '(opsional — fallback gratis tersedia)', en: '(optional — free fallback available)' },
  gen_hf_label: { id: '🤗 Hugging Face', en: '🤗 Hugging Face' },
  gen_hf_free: { id: 'GRATIS', en: 'FREE' },
  gen_hf_placeholder: { id: 'hf_xxxxxxxx (token gratis)', en: 'hf_xxxxxxxx (free token)' },
  gen_hf_help: { id: 'Dapatkan token gratis di', en: 'Get your free token at' },
  gen_together_label: { id: '⚡ Together AI', en: '⚡ Together AI' },
  gen_together_free: { id: '$5 GRATIS', en: '$5 FREE' },
  gen_together_help: { id: 'Dapatkan $5 kredit gratis di', en: 'Get $5 free credit at' },
  gen_google_label: { id: '🔵 Google AI Studio', en: '🔵 Google AI Studio' },
  gen_google_free: { id: 'GRATIS', en: 'FREE' },
  gen_google_help: { id: 'Dapatkan kunci gratis di', en: 'Get your free key at' },

  // ── VARIANT LABELS ──
  var_icon: { id: 'Ikon', en: 'Icon' },
  var_icon_desc: { id: 'Tanda mandiri', en: 'Standalone mark' },
  var_wordmark: { id: 'Tulisan', en: 'Wordmark' },
  var_wordmark_desc: { id: 'Ikon + nama', en: 'Icon + name' },
  var_stacked: { id: 'Tersusun', en: 'Stacked' },
  var_stacked_desc: { id: 'Tata letak vertikal', en: 'Vertical layout' },
  var_horizontal: { id: 'Horizontal', en: 'Horizontal' },
  var_horizontal_desc: { id: 'Berdampingan', en: 'Side by side' },

  // ── SVG STYLE LABELS ──
  style_minimal: { id: 'Minimalis', en: 'Minimal' },
  style_modern: { id: 'Modern', en: 'Modern' },
  style_playful: { id: 'Fun', en: 'Playful' },
  style_elegant: { id: 'Elegan', en: 'Elegant' },
  style_bold: { id: 'Tegas', en: 'Bold' },

  // ── AI STYLE LABELS ──
  ai_tech: { id: 'Teknologi', en: 'Tech' },
  ai_tech_desc: { id: 'Bersih, elegan, netral', en: 'Clean, sleek, neutral' },
  ai_flashy: { id: 'Mencolok', en: 'Flashy' },
  ai_flashy_desc: { id: 'Tebal, neon, metalik', en: 'Bold, neon, metallic' },
  ai_modern: { id: 'Modern', en: 'Modern' },
  ai_modern_desc: { id: 'Geometris, datar, strategis', en: 'Geometric, flat, strategic' },
  ai_playful: { id: 'Fun', en: 'Playful' },
  ai_playful_desc: { id: 'Cerah, bulat, hidup', en: 'Bright, rounded, lively' },
  ai_abstract: { id: 'Abstrak', en: 'Abstract' },
  ai_abstract_desc: { id: 'Artistik, unik, liar', en: 'Artistic, unique, wild' },
  ai_minimal: { id: 'Minimalis', en: 'Minimal' },
  ai_minimal_desc: { id: 'Sederhana, abadi, datar', en: 'Simple, timeless, flat' },

  // ── PATTERN LABELS ──
  pat_dot_matrix: { id: 'Titik-Titik', en: 'Dots' },
  pat_geometric: { id: 'Bentuk Geometris', en: 'Geometric Shapes' },
  pat_line_system: { id: 'Garis-Garis', en: 'Lines' },
  pat_node_network: { id: 'Titik & Garis', en: 'Dots & Lines' },
  pat_dots_shapes: { id: 'Titik dalam Bentuk', en: 'Dots in Shapes' },
  pat_dots_lines: { id: 'Titik & Koneksi', en: 'Dots & Connections' },
  pat_shapes_lines: { id: 'Bentuk & Garis', en: 'Shapes & Lines' },

  // ── LANGUAGE SWITCHER ──
  lang_label: { id: 'Bahasa', en: 'Language' },
  lang_id: { id: 'Indonesia', en: 'Indonesian' },
  lang_en: { id: 'Inggris', en: 'English' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
