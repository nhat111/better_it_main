// Guide content shown under each trainer. Plain paragraphs or bullet lists.

import { MUSCLES } from '../programs/muscles';

export interface GuideItem {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const KEGEL_GUIDE: GuideItem[] = [
  {
    title: 'Tìm đúng nhóm cơ',
    paragraphs: [
      'Cơ sàn chậu là nhóm cơ bạn dùng để nín tiểu giữa chừng hoặc nín xì hơi. Khi siết đúng, bạn thấy vùng giữa bìu và hậu môn kéo lên vào trong, dương vật hơi nhích lên.',
      'Chỉ dùng mẹo nín tiểu để nhận biết cơ một hai lần. Không tập thường xuyên khi đang đi tiểu.',
    ],
  },
  {
    title: 'Kỹ thuật đúng',
    bullets: [
      'Giữ bụng, mông và đùi thả lỏng. Chỉ cơ sàn chậu làm việc.',
      'Thở bình thường, không nín thở khi siết.',
      'Pha Thả quan trọng như pha Siết. Thả hết hoàn toàn trước lần tiếp theo.',
      'Mới tập nên nằm. Khi quen, chuyển sang ngồi rồi đứng.',
    ],
  },
  {
    title: 'Lộ trình và kỳ vọng',
    paragraphs: [
      'Tập 2–3 buổi mỗi ngày. Đa số nghiên cứu ghi nhận cải thiện khả năng kiểm soát xuất tinh và độ cương sau khoảng 6–12 tuần tập đều. Đừng lên cấp quá nhanh: cơ mỏi sẽ siết sai.',
    ],
  },
  {
    title: 'Khi nào nên đi khám',
    paragraphs: [
      'Dừng tập và gặp bác sĩ nam khoa hoặc tiết niệu nếu bị đau vùng chậu, đau khi tiểu, tiểu khó, hoặc rối loạn cương kéo dài. Rối loạn cương có thể là dấu hiệu sớm của bệnh tim mạch, tiểu đường.',
    ],
  },
];

export const PULL_GUIDE: GuideItem[] = [
  {
    title: 'Kéo xà tập những nhóm cơ nào?',
    paragraphs: [
      'Kéo xà là bài kéo thân người lên, chủ yếu do cơ lưng và tay đảm nhận. Trên hình minh họa, cơ chính tô màu đậm, cơ phụ tô màu nhạt.',
    ],
    bullets: Object.values(MUSCLES).map((m) => `${m.name} (${m.latin}): ${m.role}`),
  },
  {
    title: 'Lịch tập cho người mới',
    bullets: [
      '3 buổi mỗi tuần, nghỉ ít nhất 1 ngày giữa các buổi (ví dụ thứ 2, 4, 6). Cơ lưng và gân tay cần thời gian hồi phục.',
      'Mỗi giai đoạn khoảng 2 tuần. Làm sạch hết số hiệp và số lần mới lên giai đoạn sau.',
      'Kéo xà và tập Kegel có thể làm cùng ngày, không ảnh hưởng nhau.',
    ],
  },
  {
    title: 'Tư thế đúng',
    bullets: [
      'Nắm xà rộng hơn vai một chút, lòng bàn tay hướng ra trước. Ngón cái vòng quanh xà.',
      'Mỗi lần kéo bắt đầu bằng việc kéo bả vai xuống, rồi mới gập khuỷu tay.',
      'Siết bụng và mông, hai chân khép, hạn chế đung đưa.',
      'Kéo lên thở ra, hạ xuống hít vào. Hạ hết tay mỗi lần.',
    ],
  },
  {
    title: 'Không có dây hỗ trợ hay xà thấp?',
    paragraphs: [
      'Thay kéo xà thấp bằng kéo người dưới gầm bàn chắc chắn. Thay kéo có dây hỗ trợ bằng nhảy kéo (jumping pull-up): đứng ghế, nhảy nhẹ để lên, rồi hạ thật chậm.',
    ],
  },
  {
    title: 'An toàn',
    paragraphs: [
      'Kiểm tra xà gắn chắc trước mỗi buổi. Dừng nếu đau nhói ở vai, khuỷu hay cổ tay; mỏi cơ là bình thường, đau khớp thì không. Người thừa cân nhiều nên ưu tiên kéo xà thấp và giảm cân song song.',
    ],
  },
];
