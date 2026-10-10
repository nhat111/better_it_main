# ManFit · Kegel và xà đơn

PWA luyện tập cho quý ông: đồng hồ Kegel 8 cấp độ và lộ trình xà đơn 8 tuần cho người mới.
Miễn phí, không cần tài khoản, dữ liệu lưu trên máy, dùng được offline sau lần mở đầu tiên.

## Tính năng
- **Kegel**: vòng tròn hướng dẫn từng pha Siết / Thả, 2 hiệp (giữ lâu + nhịp nhanh), 8 cấp, tự lên cấp sau 3 buổi.
- **Xà đơn (beginner)**: 4 giai đoạn × 2 tuần (treo xà → kéo bả vai → hạ chậm → có hỗ trợ → pull-up đầu tiên),
  đếm hiệp, đếm ngược khi giữ và khi nghỉ, tự mở giai đoạn sau 6 buổi.
- **Tiến độ**: lịch 28 ngày, chuỗi ngày, ghi số pull-up tối đa mỗi 2 tuần.
- **Cài đặt**: bật/tắt âm báo, sao lưu / khôi phục dữ liệu ra file JSON, kiểm tra bản cập nhật.
- PWA: cài lên màn hình chính (iPhone: Chia sẻ → Thêm vào MH chính), giữ màn hình sáng khi tập.

## Phát triển
```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # lint + test + build (Vercel chạy lệnh này khi deploy)
npm run icons    # vẽ lại icon PWA (cần Python + Pillow)
```

## Deploy
Import repo vào Vercel, mọi cấu hình đã có trong `vercel.json`. Không cần biến môi trường.

> ManFit chỉ hỗ trợ luyện tập, không thay thế chẩn đoán hay điều trị y khoa.
