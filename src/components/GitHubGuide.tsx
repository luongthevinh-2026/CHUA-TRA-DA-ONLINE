import React, { useState } from 'react';
import {
  Terminal,
  Github,
  Globe,
  CheckCircle,
  Copy,
  Check,
  Code2,
  FolderTree,
  ExternalLink,
} from 'lucide-react';

export const GitHubGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Tạo Repository mới trên GitHub',
      desc: 'Truy cập GitHub và tạo một repository mới (ví dụ: chua-online-3d). Chọn Public và tích chọn "Add a README file".',
      code: `# Clone repo về máy tính của bạn
git clone https://github.com/your-username/chua-online-3d.git
cd chua-online-3d`,
    },
    {
      title: '2. Thêm file CLAUDE.md vào thư mục gốc',
      desc: 'Tạo file CLAUDE.md ngay tại thư mục gốc của dự án. File này giúp Claude Code CLI hoặc Claude GitHub App luôn hiểu kiến trúc Three.js, quy tắc zero-asset và quy chuẩn văn hóa mà không cần nhắc lại.',
      code: `# Tạo file CLAUDE.md
touch CLAUDE.md
# (Dán nội dung từ tab CLAUDE.md ở trên vào)`,
    },
    {
      title: '3. Ra lệnh cho Claude Code CLI thực hiện theo Prompt',
      desc: 'Nếu bạn dùng Claude Code CLI trong terminal, chỉ cần gọi claude và dán Master Prompt vào. Claude sẽ tự động tạo cấu trúc file, cài Three.js và chạy dev server.',
      code: `# Khởi động Claude Code
claude

# Sau đó dán toàn bộ nội dung trong tab "Bản Full (Master Prompt)" và nhấn Enter!`,
    },
    {
      title: '4. Bật GitHub Pages để xuất bản game miễn phí',
      desc: 'Vào mục Settings của repository trên GitHub -> Chọn thẻ Pages -> Ở mục "Build and deployment", chọn Source là "GitHub Actions". GitHub sẽ tự động build và cấp link web dạng https://your-username.github.io/chua-online-3d/',
      code: `# Thêm file workflow vào repo:
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
# (Dán nội dung workflow từ tab GitHub Actions vào rồi git push)`,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-stone-100 font-sans">
      <div className="bg-stone-900 border border-amber-600/30 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Github className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-serif font-bold text-amber-200">
            Hướng Dẫn Triển Khai Chùa 3D Lên GitHub
          </h2>
        </div>
        <p className="text-xs md:text-sm text-stone-300">
          Chỉ với 4 bước đơn giản, bạn có thể biến prompt này thành một ứng dụng web 3D thực tế được
          lưu trữ vĩnh viễn trên GitHub và chơi trực tiếp trên mọi thiết bị.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition-all shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-amber-300 text-sm md:text-base">
                {s.title}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                Bước {idx + 1}/4
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-3">{s.desc}</p>

            <div className="relative rounded-xl bg-stone-950 p-3.5 border border-stone-800 font-mono text-xs text-amber-200/90 overflow-x-auto">
              <button
                onClick={() => copyCode(s.code, idx)}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-white text-[10px] flex items-center gap-1 border border-stone-750"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Sao chép
                  </>
                )}
              </button>
              <pre className="pr-16 whitespace-pre-wrap">{s.code}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
