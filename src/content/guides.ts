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
    title: 'Một buổi gồm những gì?',
    bullets: [
      'Giữ lâu: siết và giữ vài giây. Luyện sức bền của cơ.',
      'Thang máy (từ cấp 3): siết dần 3 tầng (khoảng 1/3, 2/3 rồi hết sức), sau đó thả từng tầng. Luyện khả năng điều chỉnh lực siết, quan trọng cho việc kiểm soát.',
      'Nhịp nhanh: siết và thả liên tục mỗi giây. Luyện phản xạ siết kịp lúc.',
      'Thả giãn: 6 nhịp thở bụng chậm, để sàn chậu giãn ra hoàn toàn. Biết thả lỏng cũng là một kỹ năng; cơ chỉ siết mà không biết thả sẽ dễ căng và mỏi.',
    ],
  },
  {
    title: 'Tư thế theo cấp',
    bullets: [
      'Cấp 1–3: nằm ngửa, co gối. Dễ cảm nhận cơ nhất vì không phải chống trọng lực.',
      'Cấp 4–5: ngồi thẳng lưng, hai chân chạm sàn.',
      'Cấp 6–8: đứng thẳng. Khi đã quen, tập siết nhẹ ngay trước lúc ho, hắt hơi hoặc nâng đồ nặng.',
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
      'Tập 2–3 buổi mỗi ngày (từ cấp 6, buổi dài hơn nên 2 buổi là đủ). Đa số nghiên cứu ghi nhận cải thiện khả năng kiểm soát xuất tinh và độ cương sau khoảng 6–12 tuần tập đều. Đừng lên cấp quá nhanh: cơ mỏi sẽ siết sai.',
    ],
  },
  {
    title: 'Dấu hiệu sàn chậu đang căng quá',
    paragraphs: [
      'Không phải ai cũng bị cơ sàn chậu yếu; một số người lại bị căng quá. Nếu bạn thấy đau hoặc tức vùng chậu, đáy chậu, tinh hoàn, đau khi hoặc sau xuất tinh, tiểu khó, dòng tiểu yếu, hoặc rất khó cảm nhận lúc cơ thả ra, hãy tạm ngừng các phần siết.',
      'Lúc đó chỉ tập phần Thả giãn và đi khám bác sĩ tiết niệu, nam khoa hoặc chuyên viên vật lý trị liệu sàn chậu. Không tăng cấp khi đang có các dấu hiệu này.',
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
    title: 'Plank cuối buổi giúp gì?',
    paragraphs: [
      'Mỗi buổi xà đơn kết thúc bằng 2–3 phút cơ lõi. Cơ bụng chắc giúp thân người giữ thẳng khi kéo xà, không đung đưa. Làm sau bài kéo xà để cơ bụng không bị mỏi trước.',
      'Cơ bụng sâu, cơ hoành, cơ lưng dưới và cơ sàn chậu cùng giữ áp lực ổ bụng. Vì vậy khi plank cần thở đều, không nín thở hay rặn, vì rặn sẽ dồn áp lực xuống sàn chậu. Từ giai đoạn 3, tập thêm cách thở: thở ra siết nhẹ sàn chậu, hít vào thả.',
    ],
    bullets: [
      'Giai đoạn 1: plank chống gối · 2: plank cẳng tay · 3: plank nghiêng · 4: hollow hold.',
      'Giữ đúng tư thế quan trọng hơn giữ lâu. Run nhẹ là bình thường, võng lưng thì dừng hiệp đó.',
      'Đau lưng dưới khi plank: hạ xuống chống gối và gặp bác sĩ hoặc chuyên viên vật lý trị liệu nếu đau kéo dài.',
    ],
  },
  {
    title: 'Lịch tập cho người mới',
    bullets: [
      '3 buổi mỗi tuần, nghỉ ít nhất 1 ngày giữa các buổi (ví dụ thứ 2, 4, 6). Cơ lưng và gân tay cần thời gian hồi phục.',
      'Mỗi giai đoạn khoảng 2 tuần. Làm sạch hết số hiệp và số lần mới lên giai đoạn sau.',
      'Kegel tập riêng mỗi ngày, kể cả ngày nghỉ xà. Không cần ghép Kegel vào lúc đang plank khi mới tập.',
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
