# Firebase Yetki Hatası Çözümü

Kayıt olurken aldığınız `Missing or insufficient permissions` hatası, Firebase veritabanınızın "Güvenlik Kuralları"nın (Rules) dışarıdan veri yazılmasına izin vermemesinden kaynaklanıyor.

Bunu çözmek için aşağıdaki adımları uygulayın:

1.  **Firebase Console'a Gidin:**
    [https://console.firebase.google.com/](https://console.firebase.google.com/) adresine gidin ve projenizi açın.

2.  **Firestore Bölümünü Açın:**
    Sol menüden **"Firestore Database"** seçeneğine tıklayın.

3.  **Kurallar (Rules) Sekmesine Geçin:**
    Üstteki sekmelerden **"Kurallar" (veya "Rules")** sekmesine tıklayın.

4.  **Mevcut Kodları Silin ve Aşağıdakini Yapıştırın:**
    Editördeki her şeyi silin ve geliştirme aşamasında sorun yaşamamak için bu "Test Modu" kurallarını yapıştırın:

    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```

5.  **Yayımla (Publish) Butonuna Basın:**
    Sağ üstteki "Yayımla" butonuna basarak değişiklikleri kaydedin.

---

### Önemli Notlar:

*   **Eski Kayıtlar:** Hata aldığınız sırada oluşturduğunuz üyelikler veritabanına **kaydedilmemiştir** (sadece giriş sistemi oluşturulmuştur). Bu yüzden Admin panelinde görünmezler.
*   **Çözüm:** Yukarıdaki değişikleri yaptıktan sonra, **yeni bir e-posta adresi ile tekrar kayıt olun.** Yeni kaydınızın Admin panelindeki "Kullanıcılar" sayfasına anında düştüğünü göreceksiniz.
*   **Güvenlik:** Projeyi gerçek müşterilere açmadan önce bu kuralları tekrar sıkılaştırmak gerekecektir. Şimdilik geliştirme yaparken bu şekilde kullanmanız en doğrusudur.
