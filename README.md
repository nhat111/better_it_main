# Kegel Coach

Web app luyện cơ sàn chậu (Kegel) cho nam, lấy cảm hứng từ ứng dụng Better Man.

## Tính năng
- Đồng hồ hướng dẫn từng pha **Siết / Thả**, vòng tiến trình và âm báo đổi pha
- Mỗi buổi 2 hiệp: giữ lâu (sức bền) và nhịp nhanh (kiểm soát)
- Lộ trình 8 cấp, tự mở cấp mới sau 3 buổi hoàn thành
- Nhật ký 28 ngày và chuỗi ngày tập (lưu bằng `localStorage`)
- Hướng dẫn kỹ thuật, kỳ vọng và khi nào nên đi khám
- Giao diện sáng/tối theo hệ thống, tối ưu cho điện thoại; giữ màn hình sáng khi tập (Wake Lock)

## Chạy thử
Chỉ là một file tĩnh, mở trực tiếp `index.html` hoặc:

```bash
npx serve .
```

## Deploy
Import repo vào Vercel / Netlify / GitHub Pages — không cần build step.

> Ứng dụng chỉ hỗ trợ luyện tập, không thay thế chẩn đoán hay điều trị y khoa.
