
# 🚗 Project SlicerCar

---

## 🛠 วิธีเริ่มต้นใช้งาน

### 🧱 1. ติดตั้ง Android Studio (สำหรับรันแอป Android)

#### ✅ ขั้นตอน:
1. ดาวน์โหลด Android Studio:  
   👉 [https://developer.android.com/studio](https://developer.android.com/studio)

2. ติดตั้ง Android Studio ด้วยค่าพื้นฐานทั้งหมด

3. เมื่อติดตั้งเสร็จ ให้ติดตั้ง:
   - Android SDK
   - Android SDK Platform Tools
   - Android Virtual Device (AVD)

4. สร้าง Emulator ใน Device Manager 

---

### ⚙️ 2. ตั้งค่า Environment Variables (Windows)

#### ✅ ตั้งค่า ANDROID_HOME:

1. เปิด System Environment Variables
2. เพิ่ม **System Variable**:
   - `ANDROID_HOME`  
     ตัวอย่าง path:  
     ```
     C:\Users\<YourUsername>\AppData\Local\Android\Sdk
     ```
3. เพิ่มค่าเหล่านี้ใน `Path`:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. ปิด-เปิด Terminal ใหม่ หรือ Restart เครื่อง

5. ตรวจสอบด้วยคำสั่ง:

```bash
adb --version
```

ถ้าขึ้นเวอร์ชัน แสดงว่าติดตั้งสำเร็จ

---

### 📂 3. สร้างโฟลเดอร์โปรเจกต์ (ถ้ามีอยู่แล้วข้ามได้)

```bash
mkdir my-project
cd my-project
```

---

### 🔄 4. Clone โปรเจกต์จาก GitHub

```bash
gh repo clone Kittiphod-ka/65114540055-Selected.git

```

---

### 🐳 5. สั่งรัน Docker Compose เพื่อรัน frontend, backend, mongo และ admin dashboard
```bash
cd 65114540055-Selected
```
```bash
docker-compose up -d --build
```
จากนั้นรันคำสั่งต่อไปนี้เพื่อรัน Android Studio เนื่องจาก Docker ไม่สามารถ Android Studio เปิดเองได้ :
```bash
 cd frontend
```
```bash
 npx expo start --tunnel --android  
```
---
### 🌐 6. คำสั่งสำหรับ Restore ข้อมูลใน Database
```
docker exec -it slicercar-mongo bash
```
จากนั้นใช้คำสั่ง :
```
docker exec slicercar-mongo mongorestore /data/restore
```
Ctrl+D เพื่อออก
---

### 🌐 7. เปิดแอดมิน Dashboard ที่เบราว์เซอร์

```
http://localhost:3000
```
username:
```
test21
```
password :
```
qqq112233
```
---


### 🛑 หากต้องการหยุดระบบ

```bash
docker-compose down
```

---

## ❗️ หาก Docker ใช้งานไม่ได้

ให้เปิด PowerShell ด้วยสิทธิ์ Administrator แล้วรัน:

```bash
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
```
