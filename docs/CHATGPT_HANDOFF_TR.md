# ChatGPT için proje özeti ve çalışma rotası

Aşağıdaki metin başka bir ChatGPT konuşmasına doğrudan aktarılabilir:

---

`interactive-3d-exhibition-walkthrough` adlı bağımsız bir web uygulaması
geliştiriyoruz. Amaç,
tek bir sanatçının eserlerini sergileyecek, tarayıcı tabanlı ve etkileşimli bir
3D sergi deneyimi oluşturmak. Mekân gerçek bir binanın dijital ikizi değil;
Sweet Home 3D ile tasarlanmış özgün bir sanal galeri.

## Aldığımız kararlar

- Uygulama Next.js App Router, TypeScript, React Three Fiber / Three.js ve Drei
  ile geliştirilecek.
- Paket yöneticisi npm olacak. Repository `package-lock.json` ve
  `packageManager: npm@10.9.3` ile sabitlendi. React Three Fiber'ın kullanılmayan
  Expo/React Native optional peer bağımlılıklarında npm 10'un yaşadığı Arborist
  hatasını önlemek için `.npmrc` içinde `legacy-peer-deps=true` kullanılıyor.
- WASD, pointer-lock veya fizik tabanlı FPS hareketi olmayacak. Ziyaretçi mouse
  ya da dokunmatik sürükleme ile yatayda 360° bakabilecek; kamera 1,65 m insan
  göz hizasında düz kalacak.
- On altı elle tanımlanmış önemli konumun güvenli yolları 2,4 metreden kısa
  adımlara bölünerek yoğun bir navigasyon ağı üretilecek. Zemin tıklaması gerçek
  hedef noktayı koruyacak; duvar açıklığı uygunsa doğrudan, değilse güvenli ağ
  bağlantıları üzerinden ağırlıklı en kısa rota kullanılacak.
- Navigasyon konfigürasyonu 3D modelden ayrı tutulacak.
- Galeri geometrisi, navigasyon, sanat eseri verileri ve kullanıcı arayüzü
  birbirinden bağımsız modüller olacak.
- İlk kilometre taşında geometri, gerçek ölçek, kamera ve navigasyon
  doğrulanacak. Noir ışıklandırma, gelişmiş malzemeler ve eser sunumu daha sonra
  ele alınacak.
- Başlangıç göz yüksekliği 1,65 metre.
- Kullanıcıya `Girişe Dön` ve `Sergiden Çık` eylemleri sunulacak.
- Reduced-motion tercihi desteklenmeli.

## Model hakkında bildiklerimiz

- Sweet Home 3D kaynak dosyası, OBJ, MTL, üst görünüm ve perspektif ekran
  görüntüleri mevcut.
- Duvar yüksekliği 2,438 m, giriş açıklığı 1,10 x 2,085 m.
- Giriş geçidi yaklaşık 4 m, uzun bağlantı koridoru yaklaşık 3,04 m genişliğinde.
- Dış dairesel duvar yaklaşık 13,85 m çapında; iç kavisli bölüm yaklaşık 7,09 m
  çapında.
- OBJ hafif: 668 vertex ve 1.174 face. Fakat UV veya texture içermiyor.
- Güncel v2 export'ta tek giriş kapı çerçevesi (`Montant_100`) bulunuyor.
- Güncel v2 export'ta zemin mekân sınırını takip eden `room_17_*` yüzeyleriyle
  birlikte geliyor.
- Üretim öncesinde Blender temizliği ve GLB dönüşümü yapılacak. İlk prototip,
  kamera rotalarını gerçek geometri üzerinde test etmek için OBJ/MTL'yi geçici
  olarak doğrudan yüklüyor.

## İlk navigasyon rotası

Giriş -> giriş koridoru -> ana galeri açılışı. Ana galeride ilk çapraz duvarın
iki tarafından seçilebilen rota bulunuyor; yollar merkez bölümde birleşiyor.
Buradan ikinci çapraz duvarın güvenli tarafından arka galeriye, yaklaşık 3,04 m
genişliğindeki uzun koridora ve dairesel final odasına geçiliyor. Dairesel odada
merkez, batı, arka ve doğu bakış noktaları bulunuyor.

## Uygulama sırası

1. Next.js/TypeScript iskeleti ve klasör sınırları.
2. Gerçek OBJ/MTL modelinin nötr malzemelerle yüklenmesi.
3. Giriş merkezli metre koordinat sistemi ve 1,65 m kamera.
4. Elle tanımlanmış dallanan navigasyon grafiği.
5. Kamera yollarının duvarlardan geçmediğinin gerçek modelde doğrulanması.
6. Tıklanabilir 3D hotspot'lar ve erişilebilir ekran kontrolleri.
7. Reduced-motion, girişe dönüş ve çıkış davranışları.
8. Daha sonra GLB temizliği, noir ışıklandırma ve sanat eseri sistemi.

## Güncel uygulama durumu

- Next.js iskeleti, klasör sınırları ve npm kurulumu hazır.
- Güncel v2 OBJ/MTL modeli tarayıcıda yükleniyor ve model santimetreden metreye
  çevrilerek giriş dünya merkezine taşınıyor.
- 16 önemli konumdan üretilen 50 düğümlü navigasyon grafiği, zemine tıklayarak
  tam seçilen güvenli konuma yürüme, mouse/touch ile göz hizasında 360° yatay
  bakış, sol/sağ ok tuşları,
  reduced-motion, `Girişe Dön` ve `Sergiden Çık` akışları uygulanmış durumda.
- Kamera yürürken tıklama anındaki yönünü koruyor; rota veya hedef kamerayı
  kendiliğinden çevirmiyor. Erişilemeyen zemin tıklamaları da başka bir düğüme
  otomatik yönlendirilmek yerine açıklayıcı bir mesajla reddediliyor.
- TypeScript kontrolü, navigasyon testleri, ESLint ve production build başarılı.
- WebGL önizlemesinde 22 ulaşılabilir rota konumu güncel v2 geometri içinde
  yakalanıp görsel olarak doğrulandı. Navigasyon testleri duvar kesişimlerini ve
  rota boyunca 0,35 m ziyaretçi açıklığını gerçek OBJ üzerinde denetliyor.
- Gerçek tarayıcı fare olaylarıyla drag sırasında bakış değişimi, drag'ın yanlış
  yürüme üretmemesi, zemin tıklaması ve önemli konum rotaları doğrulandı.
- OBJ/MTL değiştiğinde tarayıcıdaki Three.js loader önbelleğinin eski modeli
  tutmaması için runtime URL'lerinde sürüm anahtarı kullanılıyor.
- Bir sonraki teknik çalışma temiz GLB pipeline'ıdır; ardından sanat eseri veri
  ve sunum katmanına geçilebilir.
Yeni öneriler bu kapsamı korumalı; CMS, veritabanı, üyelik, ödeme, editör,
multiplayer veya serbest FPS navigasyonu eklenmemeli.

---
