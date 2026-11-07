export interface TempleLevel {
  level: number;
  name: string;
  minSen: number;
  maxSen: number;
  badge: string;
  description: string;
}

export const TEMPLE_LEVELS: TempleLevel[] = [
  { level: 1, name: "Sơ Tâm", minSen: 0, maxSen: 20, badge: "🌱", description: "Mới phát tâm hướng thiện, tâm hồn thanh tịnh." },
  { level: 2, name: "Tinh Tấn", minSen: 21, maxSen: 60, badge: "🌿", description: "Chuyên cần tu tập, gieo trồng hạt giống an vui." },
  { level: 3, name: "An Lạc", minSen: 61, maxSen: 120, badge: "🪷", description: "Tâm an tĩnh, hoa sen trí tuệ bắt đầu hé nở." },
  { level: 4, name: "Tịnh Tâm", minSen: 121, maxSen: 250, badge: "✨", description: "Trút bỏ muộn phiền, ánh sáng từ bi tỏa rạng." },
  { level: 5, name: "Bồ Đề", minSen: 251, maxSen: Infinity, badge: "🕊️", description: "Viên mãn công đức, tâm bồ đề kiên cố sáng ngời." }
];

export const TEMPLE_CONFIG = {
  incense: {
    rewardSen: 2,
    cooldownSec: 3,
    burnDurationSec: 60,
    dailyLimit: 5,
  },
  offering: {
    rewardSen: 3,
    dailyLimitPerType: 3,
    types: [
      { id: 'lotus', name: 'Hoa Sen Thanh Khiết', icon: '🪷', desc: 'Dâng cúng hoa sen biểu tượng cho sự giác ngộ, vượt khỏi bùn lầy phiền não.' },
      { id: 'fruit', name: 'Mâm Ngũ Quả Tươi', icon: '🍎', desc: 'Dâng phẩm quả tươi tốt, tượng trưng cho hoa trái công đức lành.' },
      { id: 'lamp', name: 'Ngọn Đèn Dầu Tuệ Giác', icon: '🪔', desc: 'Thắp sáng ngọn đèn trí tuệ, xua tan bóng tối vô minh.' }
    ]
  },
  bowing: {
    rewardSen: 3,
    totalBowsPerSet: 3,
    cooldownSec: 1.5,
    dailyLimitSets: 3,
  },
  meditation: {
    rewardPerMinute: 1,
    durations: [
      { label: '30 giây (Thử nghiệm)', seconds: 30, sen: 1 },
      { label: '1 phút (Tĩnh lặng)', seconds: 60, sen: 1 },
      { label: '3 phút (Chánh niệm)', seconds: 180, sen: 3 },
      { label: '5 phút (Đại định)', seconds: 300, sen: 5 }
    ]
  },
  chants: [
    {
      id: 'nam_mo_a_di_da',
      title: 'Niệm Danh Hiệu Phật A Di Đà',
      description: 'Gửi gắm tâm niệm hướng về cõi Tịnh Độ bình an, khai mở từ bi.',
      durationSec: 45,
      rewardSen: 10,
      verses: [
        'Nam Mô A Di Đà Phật...',
        'Tâm thanh tịnh, cội phúc sinh...',
        'Hết thảy lo âu đều tan biến...',
        'Ánh từ quang chiếu soi muôn nẻo...',
        'Nguyện cho muôn loài thoát khổ...',
        'An trú trong chánh niệm từng phút giây...',
        'Nam Mô A Di Đà Phật...',
        'Viên thành Phật đạo, vạn sự cát tường.'
      ]
    },
    {
      id: 'nguyen_cau_binh_an',
      title: 'Kinh Nguyện An Lành Bốn Phương',
      description: 'Cầu nguyện cho gia quyến khỏe mạnh, thế giới hòa bình, tâm an trí sáng.',
      durationSec: 50,
      rewardSen: 10,
      verses: [
        'Cúi đầu kính lễ Mười phương Phật...',
        'Nguyện cho trời đất mãi thanh bình...',
        'Gia đình an khang, muôn nhà no ấm...',
        'Oan trái tiêu trừ, từ bi lan tỏa...',
        'Mỗi bước chân đi trên mặt đất an lành...',
        'Mỗi hơi thở vào là nuôi dưỡng yêu thương...',
        'Nguyện trọn đời hướng thiện, gieo nhân lành...',
        'Khắp chốn bình an, vạn duyên hòa hợp.'
      ]
    }
  ]
};
