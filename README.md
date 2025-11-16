vibraxx-website/
│
├── .next/                      # Next.js derleme ve cache klasörü (otomatik)
├── data/
│   └── questions/
│       └── 2025-10-27/         # Dinamik olarak kaydedilen veri dosyaları
│
├── node_modules/               # Proje bağımlılıkları (npm/yarn/pnpm)
│
├── public/                     # Statik dosyalar (görseller, favicon, manifest)
│
└── src/                        # Tüm kaynak kodları
    ├── app/                    # Next.js 15 App Router yapısı
    │   ├── (landing)/          # Açılış veya ana sayfa
    │   ├── (legal)/            # Yasal sayfalar
    │   │   ├── privacy/        # Gizlilik politikası
    │   │   ├── rules/          # Kullanım kuralları
    │   │   └── terms/          # Şartlar ve koşullar
    │   ├── api/                # Sunucu tarafı API route’ları
    │   │   └── webhook/        # Webhook endpoint
    │   ├── dashboard/          # Yönetim paneli veya kullanıcı paneli
    │   └── overlay/            # Özel arayüz bileşenleri (modallar vb.)
    │
    ├── components/             # Tekrar kullanılabilir React bileşenleri
    ├── hooks/                  # Custom React hook’lar
    ├── lib/                    # Yardımcı kütüphaneler ve servisler
    ├── styles/                 # Global CSS/Tailwind stilleri
    └── utils/                  # Küçük yardımcı fonksiyonlar
