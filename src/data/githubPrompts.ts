export interface GitHubPromptTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  filename: string;
  content: string;
}

export const GITHUB_MASTER_PROMPT = `# Prompt Claude / GitHub Copilot: Khởi tạo dự án Chùa 3D Online (Repository Blueprint)

> **Mục tiêu**: Xây dựng ứng dụng web 3D "Đi Chùa Online" với Three.js trong một GitHub repository hoàn chỉnh. Người chơi điều khiển nhân vật từ cổng tam quan, qua sân chùa thanh tịnh, vào chánh điện và thực hiện 5 hành động: thắp hương, dâng lễ, lạy Phật, thiền định, tụng kinh. Có 10 bồ đoàn (với 4-6 NPC mô phỏng), hệ thống điểm Sen và tích hợp sẵn quy trình CI/CD GitHub Pages.

---

## 1. Thông tin môi trường & Quy chuẩn làm việc trên GitHub
Dự án được phát triển và quản lý trên GitHub. Khi thực hiện:
- **Git & Commit**: Chia nhỏ công việc thành các commit rõ ràng (Conventional Commits: \`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`).
- **Không phụ thuộc asset bên ngoài (Zero-Asset Dependency)**: Tất cả mô hình 3D dựng bằng procedural geometry của Three.js (low-poly), texture tạo bằng HTML5 Canvas, âm thanh tổng hợp bằng Web Audio API. Tuyệt đối không dùng file \`.glb\`, \`.gltf\`, \`.mp3\` hoặc ảnh ngoài để tránh lỗi 404 và bản quyền.
- **Tương thích thiết bị**: Responsive 100% trên cả Desktop (Phím WASD / Mũi tên / Click-to-move) và Mobile (Virtual Joystick ảo + vuốt camera).
- **Ngôn ngữ**: Toàn bộ giao diện hiển thị bằng tiếng Việt chuẩn có dấu, trang nghiêm, thanh tịnh.
- **Tuyên bố trách nhiệm**: Cuối trang hiển thị thông điệp: *"Trang web mang tính giải trí, chiêm bái và tĩnh tâm trực tuyến, không thay thế việc hành lễ thực tế."*

---

## 2. Kiến trúc & Cấu trúc thư mục (Repository Structure)

Chọn một trong 2 cấu trúc bên dưới (Khuyến nghị **Option A: Vite + Three.js** để tiện test và deploy tự động lên GitHub Pages):

\`\`\`
chua-online-3d/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions tự động build & deploy GitHub Pages
├── public/
│   └── favicon.svg             # Biểu tượng hoa sen
├── src/
│   ├── audio/
│   │   └── soundSynth.js       # Bộ tổng hợp âm thanh Web Audio (chuông, mõ, gió)
│   ├── config/
│   │   └── gameConfig.js       # Cấu hình điểm Sen, bài kinh, thời gian thiền, cooldown
│   ├── entities/
│   │   ├── player.js           # Nhân vật người chơi, bước đi, va chạm
│   │   └── npcs.js             # 4-6 Phật tử mô phỏng tại 10 bồ đoàn
│   ├── environment/
│   │   ├── templeGarden.js     # Cổng tam quan, sân, hồ sen, lư hương ngoài trời, cây xanh
│   │   └── mainHall.js         # Chánh điện, tượng Phật, hào quang, bàn lễ, chuông mõ
│   ├── actions/
│   │   └── rituals.js          # Logic 5 hành động: thắp hương, dâng lễ, lạy Phật, thiền, tụng kinh
│   ├── storage/
│   │   └── progressStorage.js  # Lưu localStorage (Sen, cấp độ, lượt dâng lễ, reset theo ngày)
│   ├── ui/
│   │   ├── hudOverlay.js       # HUD điểm Sen, cấp độ, thông báo, joystick mobile
│   │   └── dialogs.js          # Modal thiền, dâng lễ, tụng kinh
│   ├── index.css
│   └── main.js                 # Vòng lặp Three.js, camera, ánh sáng, khởi động
├── index.html
├── package.json
├── vite.config.js
├── CLAUDE.md                   # Hướng dẫn kiến trúc cho Claude Code / AI Agents
└── README.md                   # Giới thiệu dự án, hướng dẫn chơi và cách deploy
\`\`\`

---

## 3. Chi tiết Cảnh quan 3D (Procedural Low-Poly Three.js)

### A. Khuôn viên bên ngoài (Sân chùa):
1. **Cổng Tam Quan**: 3 vòm cửa, mái ngói cong đỏ sẫm, cột đỏ, biển hiệu "Chùa An Lạc". Nhân vật xuất hiện trước cổng.
2. **Đường lát đá hoa văn**: Dẫn từ cổng thẳng tới bậc tam cấp chánh điện.
3. **Lư hương đá ngoài trời**: Đặt ở giữa sân, có bát nhang đồng và khói trầm tỏa nhẹ bằng hệ thống particle.
4. **Hồ sen thanh tịnh**: Mặt nước xanh ngọc có hiệu ứng sóng lăn tăn nhẹ, 5-8 cụm lá sen nổi và hoa sen hồng nở.
5. **Cảnh sắc tự nhiên**: 4-6 cây bồ đề/tùng xanh mát (thân gỗ trụ, tán lá cầu/nón nhiều tầng), hàng đèn lồng đỏ ấm áp, tường rào gạch bao quanh khuôn viên.
6. **Ánh sáng & Không khí**: Tông màu ấm ban mai hoặc hoàng hôn thanh tịnh (\`HemisphereLight\` kết hợp \`DirectionalLight\` ấm, sương mù nhẹ \`scene.fog\` tiệp màu chân trời).

### B. Chánh Điện trang nghiêm:
7. **Kiến trúc chánh điện**: Mái cong đa tầng màu ngói cổ, cột gỗ lim đỏ, sàn gỗ nâu ấm bóng nhẹ. Cửa chính mở rộng nhìn ra sân.
8. **Tượng Phật Bổn Sư Thích Ca Mâu Ni**: Dựng bằng hình khối trang nghiêm, toạ thiền kiết già trên đài sen hoàng kim. Phía sau có quầng sáng hào quang (halo) xoay nhẹ nhàng.
9. **Bàn lễ trước tượng**: Bày lư hương đồng nhỏ, mâm ngũ quả, bình sen, chân đèn dầu, chuông đồng và mõ gỗ.
10. **10 Bồ đoàn (Chỗ ngồi thiền/tụng kinh)**: Xếp thành 2 hàng đối xứng (mỗi hàng 5 chỗ), chừa lối đi trang nghiêm ở giữa.
    - Đánh số từ 1 đến 10.
    - Ngẫu nhiên 4 đến 6 chỗ có NPC Phật tử mô phỏng đang ngồi tọa thiền.
    - Bắt buộc gắn nhãn chữ rõ ràng: **"[Mô phỏng] Đồng tu"** khi lại gần, đảm bảo tính minh bạch.

---

## 4. Cơ chế Điều khiển & Camera

- **Camera**: Góc nhìn thứ ba (Third-person follow camera) sau lưng nhân vật, trơn tru mượt mà (\`MathUtils.damp\`), tránh xuyên tường. Xoay góc tự do bằng cách kéo chuột hoặc vuốt màn hình.
- **Desktop**:
  - Di chuyển bằng phím \`W, A, S, D\` hoặc các phím mũi tên.
  - Hỗ trợ Click-to-Move: bấm chuột vào mặt đất để nhân vật tự chạy đến đó.
- **Mobile / Màn hình cảm ứng**:
  - Tự động hiển thị Joystick ảo góc trái dưới màn hình.
  - Vuốt vùng còn lại để xoay camera quan sát chùa.
- **Hệ thống va chạm (Collision)**: Đơn giản, ngăn nhân vật đi xuyên qua tường rào, hồ sen, cột chánh điện, bàn lễ và tượng Phật.

---

## 5. Quy chế 5 Hành Động Tâm Linh

Nút hành động nổi bật sẽ tự động xuất hiện khi nhân vật bước vào vùng tương tác:

| Hành động | Vị trí thực hiện | Chi tiết tương tác & Hoạt ảnh | Điểm Sen thưởng |
|---|---|---|---|
| **1. Thắp hương** | Lư hương sân / Lư hương điện | Nhân vật cúi nhẹ dâng 3 nén hương cắm vào bát. Hạt khói trầm bay lên trong 60 giây. Cooldown 3 giây giữa các lần. | +2 Sen (Tối đa 5 lần/ngày) |
| **2. Dâng lễ** | Bàn lễ chánh điện | Mở modal chọn: *Hoa sen tươi, Mâm ngũ quả, Đèn dầu giác ngộ*. Lễ vật xuất hiện trang trọng trên bàn lễ và lưu lại. | +3 Sen (Mỗi loại tối đa 3 lần/ngày) |
| **3. Lạy Phật** | Trước tượng Phật | Hoạt ảnh quỳ lạy trang nghiêm, hiển thị đếm lần: "Lạy 1/3", "Lạy 2/3", "Lạy 3/3". Cooldown 1.5 giây mỗi lạy. | +3 Sen khi đủ 3 lạy (Tối đa 3 đợt/ngày) |
| **4. Thiền định** | Ngồi trên bồ đoàn trống | Chọn thời lượng: 1 phút, 3 phút hoặc 5 phút. Màn hình hạ độ sáng, camera mở rộng góc tĩnh lặng, có tiếng chuông ngân đầu & cuối buổi. Tính giờ theo thời gian thực (\`Date.now()\`). | +1 Sen mỗi phút hoàn thành |
| **5. Tụng kinh** | Ngồi trên bồ đoàn trống | Chọn 1 trong 2 bài kinh nguyện bình an (tự biên soạn lời văn trang nhã, không sao chép bản quyền): từng câu kinh hiện theo nhịp gõ mõ khoan thai, có thanh tiến trình. | +10 Sen khi hoàn thành bài kinh |

---

## 6. Điểm Sen, Cấp Độ & Lưu Trữ (LocalStorage)

- **Điểm Sen**: Đơn vị tích lũy công đức và sự chuyên cần.
- **5 Cấp độ tiến tu**:
  1. *Sơ Tâm* (0 - 20 Sen)
  2. *Tinh Tấn* (21 - 60 Sen)
  3. *An Lạc* (61 - 120 Sen)
  4. *Tịnh Tâm* (121 - 250 Sen)
  5. *Bồ Đề* (251+ Sen)
- **Cơ chế lưu trữ**:
  - Lưu trữ trong \`localStorage\`: Tên nhân vật (tối đa 20 ký tự), Điểm Sen, Cấp độ, Lịch sử lễ vật đã dâng, Bộ đếm hành động trong ngày.
  - Tự động làm mới giới hạn thưởng khi bước sang ngày mới theo giờ địa phương.

---

## 7. Âm Thanh Tổng Hợp (Web Audio API - Zero Asset)
Không nạp file MP3 từ bên ngoài. Sử dụng Web Audio API để tổng hợp:
- **Tiếng chuông chùa**: Dao động hình sin kết hợp giảm dần theo hàm mũ với hòa âm ngân sâu lắng (decay 4-6 giây).
- **Tiếng mõ tụng kinh**: Xung ngắn lọc thông dải mô phỏng tiếng gỗ rỗng trầm ấm (*cốc... cốc...*).
- **Tiếng gió thoảng & tiếng bước chân**: Nhiễu trắng lọc tần số thấp nhẹ nhàng.
- Nút bật/tắt âm thanh (Mute/Unmute) luôn hiển thị ở góc màn hình. Tuân thủ chính sách trình duyệt (kích hoạt AudioContext sau cử chỉ chạm đầu tiên).

---

## 8. Kế hoạch triển khai theo từng Pull Request (PR Roadmap)

Claude hãy triển khai từng bước, tạo commit và test qua từng giai đoạn:

- **Phase 1 (PR #1 - Foundation)**: Khởi tạo project Vite, cấu hình Three.js canvas, hệ thống ánh sáng hoàng hôn ấm, sương mù, mặt đất và lưới trục.
- **Phase 2 (PR #2 - Environment)**: Dựng Cổng tam quan, đường đá, hồ sen, cây xanh, lư hương lớn và chánh điện với tượng Phật toạ đài sen.
- **Phase 3 (PR #3 - Player & Controls)**: Mô hình nhân vật Phật tử, camera góc nhìn thứ 3, bàn phím WASD, click-to-move, joystick cảm ứng, hệ thống va chạm.
- **Phase 4 (PR #4 - Seating & NPCs)**: Dựng 10 bồ đoàn, sinh ngẫu nhiên 4-6 NPC Phật tử với nhãn "[Mô phỏng]", cơ chế lại gần và bấm "Ngồi / Đứng dậy".
- **Phase 5 (PR #5 - 5 Spiritual Rituals)**: Hoàn thiện logic 5 hành động (thắp hương khói trầm, dâng lễ, lạy Phật 3 lạy, đếm giờ thiền định, tụng kinh gõ mõ).
- **Phase 6 (PR #6 - Audio, Storage & CI/CD)**: Tích hợp Web Audio API, lưu localStorage, kiểm tra hiệu năng di động và tạo file \`.github/workflows/deploy.yml\` cho GitHub Pages.

Hãy bắt đầu bằng việc tóm tắt kế hoạch tổng quan và bắt tay vào triển khai!
`;

export const GITHUB_CLAUDE_MD = `# CLAUDE.md - Chùa Online 3D Guidelines

Hướng dẫn dành riêng cho Claude Code CLI và AI Agents khi làm việc trong repository này.

## Quy tắc thiết kế 3D (Three.js Low-Poly Procedural)
- **KHÔNG sử dụng file asset ngoài**: Tuyệt đối không import file \`.glb\`, \`.gltf\`, \`.obj\`, hình ảnh \`.png\` unhosted hay file âm thanh \`.mp3\`.
- Tất cả vật thể chùa chiền, tượng Phật, hoa sen, lư hương, nhân vật được cấu tạo từ các hình khối cơ bản của Three.js (\`THREE.Group\`, \`BoxGeometry\`, \`CylinderGeometry\`, \`SphereGeometry\`, \`ExtrudeGeometry\`).
- Texture sàn gỗ, ngói, đá tạo trực tiếp qua HTML5 Canvas với \`CanvasTexture\`.
- Âm thanh chuông và mõ tạo 100% bằng Web Audio API (\`OscillatorNode\`, \`GainNode\`, \`BiquadFilterNode\`).

## Nguyên tắc văn hóa & Nội dung
- Ngôn từ trang nghiêm, chuẩn tiếng Việt có dấu.
- Các nhân vật NPC ngồi trên bồ đoàn bắt buộc phải có tiền tố hiển thị **"[Mô phỏng]"**, tuyệt đối không tạo cảm giác giả mạo người thật online.
- Không đưa yếu tố cờ bạc, rút quẻ bói toán mê tín, thanh toán hay thương mại hóa.
- Giữ thông điệp: "Trang web giải trí và tĩnh tâm trực tuyến, không thay thế việc hành lễ thực tế."

## Lệnh kiểm tra & Build
\`\`\`bash
# Chạy môi trường dev
npm run dev

# Kiểm tra cú pháp & type
npm run lint

# Build cho GitHub Pages
npm run build
\`\`\`

## Cấu trúc tương tác
- \`src/actions/rituals.js\`: Xử lý 5 hành động: Thắp hương, Dâng lễ, Lạy Phật, Thiền định, Tụng kinh.
- \`src/entities/player.js\`: Quản lý vị trí, vận tốc, trạng thái (Đi bộ, Đứng, Ngồi bồ đoàn, Lạy).
- \`src/config/gameConfig.js\`: Tập trung toàn bộ chỉ số cooldown, điểm thưởng Sen và danh sách bài kinh để dễ bảo trì.
`;

export const GITHUB_WORKFLOW_YML = `name: Deploy Chùa 3D Online to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout mã nguồn
        uses: actions/checkout@v4

      - name: Cài đặt Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Cài đặt thư viện
        run: npm ci

      - name: Build ứng dụng web
        run: npm run build

      - name: Upload artifact GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy lên GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

export const GITHUB_ISSUE_TEMPLATE = `---
name: Feature Request / PR Prompt: Chùa 3D Online
about: Gợi ý prompt mẫu để đưa vào GitHub Issue hoặc Pull Request cho Claude/Copilot
title: "[Feat] Dựng hoàn thiện khuôn viên Chùa 3D Online với Three.js"
labels: ["enhancement", "threejs", "game-3d"]
assignees: []
---

## 📌 Bối cảnh công việc
Chúng ta cần xây dựng trải nghiệm Chùa 3D Online theo phong cách low-poly tĩnh tâm với Three.js, đáp ứng chạy mượt trên cả điện thoại và máy tính.

## 🎯 Danh sách tính năng cần hoàn thành
- [ ] Dựng cổng tam quan, đường đá, hồ sen, lư hương ngoài trời có hạt khói particle.
- [ ] Dựng chánh điện uy nghiêm, tượng Phật Thích Ca toạ thiền trên đài sen hoàng kim có hào quang xoay nhẹ.
- [ ] 10 bồ đoàn xếp 2 hàng với 4-6 NPC mô phỏng tĩnh tọa có nhãn "[Mô phỏng]".
- [ ] Điều khiển nhân vật: Phím WASD / Mũi tên / Click chuột / Joystick ảo trên mobile.
- [ ] 5 hành động tâm linh:
  - Thắp hương (khói trầm 60s, cooldown 3s)
  - Dâng lễ (hoa sen, trái cây, đèn dầu)
  - Lạy Phật (đếm 1/3, 2/3, 3/3)
  - Thiền định (đếm giờ thực 1/3/5 phút, chuông ngân)
  - Tụng kinh (lời văn trang nhã theo nhịp mõ)
- [ ] Điểm Sen, 5 cấp độ tiến tu, lưu dữ liệu vào localStorage (reset giới hạn theo ngày).
- [ ] Âm thanh chuông, mõ, gió tổng hợp bằng Web Audio API (Zero external audio).

## 🚀 Kiểm thử & Tiêu chuẩn nghiệm thu
- Không có lỗi console hay asset 404.
- Chạy mượt mà trên trình duyệt di động (hỗ trợ điều khiển cảm ứng đầy đủ).
`;
