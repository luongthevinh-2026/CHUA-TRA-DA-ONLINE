import React, { useState } from 'react';
import {
  Github,
  Globe,
  Copy,
  Check,
  MousePointerClick,
  Pencil,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Laptop,
  Flame,
  FileCode,
  ArrowRight,
} from 'lucide-react';

export const GitHubGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [repoUser, setRepoUser] = useState<string>('');
  const [repoName, setRepoName] = useState<string>('chua-online-3d');

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generatedUrl = repoUser
    ? `https://${repoUser.trim().toLowerCase()}.github.io/${repoName.trim() || 'chua-online-3d'}/`
    : 'https://<username>.github.io/<tên-repo>/';

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 text-stone-100 font-sans space-y-6">
      {/* Super Prominent Help for "KHÔNG TÌM THẤY CHỖ PUSH" */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl border-2 border-amber-300/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow">
            🖱️
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">
              Không Biết Chỗ "Push"? Sửa Trực Tiếp Bằng Chuột Trên Web GitHub!
            </h2>
            <p className="text-amber-100 text-xs md:text-sm">
              Bạn <strong>không cần mở Terminal</strong> và <strong>không cần gõ lệnh git push</strong>.
              Bạn có thể sửa và lưu trực tiếp ngay trên trình duyệt web chỉ với 3 cú nhấp chuột:
            </p>
          </div>
        </div>

        {/* 3 Steps Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Step 1 */}
          <div className="bg-stone-950/60 border border-amber-300/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="font-bold text-sm text-amber-200 mb-1">Bấm vào file cần sửa</h4>
            <p className="text-xs text-stone-200 leading-relaxed">
              Mở trình duyệt vào trang repo GitHub của bạn ➔ tìm và bấm vào file{' '}
              <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-mono">
                vite.config.js
              </code>{' '}
              (hoặc <code className="text-amber-300 font-mono">vite.config.ts</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-stone-950/60 border border-amber-300/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="font-bold text-sm text-amber-200 mb-1">Bấm biểu tượng cây bút chì ✏️</h4>
            <p className="text-xs text-stone-200 leading-relaxed">
              Ở góc trên bên phải nội dung file, bấm vào nút hình <strong>cây bút chì ✏️ (Edit this file)</strong>.
              Thêm dòng:
              <br />
              <code className="text-emerald-300 font-mono font-bold">base: './',</code>
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-stone-950/60 border border-amber-300/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="font-bold text-sm text-amber-200 mb-1">Bấm nút xanh "Commit changes..."</h4>
            <p className="text-xs text-stone-200 leading-relaxed">
              Ở góc trên cùng bên phải, bấm nút xanh{' '}
              <strong className="text-emerald-300">"Commit changes..."</strong> ➔ bấm tiếp{' '}
              <strong>"Commit changes"</strong> trong bảng hiện ra.
              <br />
              <span className="text-amber-300 font-bold">
                👉 Đây chính là lệnh PUSH! GitHub sẽ tự động cập nhật web ngay!
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Code to copy directly into vite.config.js */}
      <div className="bg-stone-900 border border-amber-600/40 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-amber-300 text-sm md:text-base">
              Nội dung chuẩn để bạn dán vào file vite.config.js trên GitHub
            </h3>
          </div>
          <button
            onClick={() =>
              copyCode(
                `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Dòng này sửa triệt để lỗi màn hình trắng trên GitHub Pages!
  plugins: [react()],
});`,
                'vite_full'
              )
            }
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
          >
            {copiedIndex === 'vite_full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedIndex === 'vite_full' ? 'Đã sao chép!' : 'Sao chép toàn bộ'}</span>
          </button>
        </div>

        <p className="text-xs text-stone-300 mb-3">
          Bạn chỉ cần bấm nút <strong>"Sao chép toàn bộ"</strong> ở trên, sau đó dán đè vào file{' '}
          <code className="text-amber-300 font-mono">vite.config.js</code> trên GitHub rồi bấm nút xanh{' '}
          <strong>"Commit changes..."</strong>.
        </p>

        <pre className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
{`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Dòng này sửa triệt để lỗi màn hình trắng trên GitHub Pages!
  plugins: [react()],
});`}
        </pre>
      </div>

      {/* Alternative: Using GitHub Web VS Code (Press '.' on keyboard) */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2.5 mb-2">
          <Laptop className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-amber-300 text-sm md:text-base">
            Mẹo cực nhanh: Nhấn phím dấu chấm [ . ] ngay trên bàn phím
          </h3>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          Khi đang mở trang repository của bạn trên GitHub (ví dụ: <code className="text-amber-300">github.com/duongkhang7576/chua-online-3d</code>),
          hãy <strong>nhấn phím dấu chấm <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-200 font-mono font-bold">.</kbd> trên bàn phím</strong>.
          <br />
          GitHub sẽ lập tức biến thành một giao diện soạn thảo VS Code ngay trên trình duyệt web của bạn:
        </p>
        <ol className="list-decimal list-inside space-y-1.5 mt-2.5 text-xs text-stone-300 pl-2">
          <li>Bấm vào file <code className="text-amber-300 font-mono">vite.config.js</code> ở cột danh sách file bên trái.</li>
          <li>Thêm <code className="text-emerald-300 font-mono font-bold">base: './',</code> rồi bấm <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono">Ctrl + S</kbd> (hoặc Command + S) để lưu.</li>
          <li>Bấm vào biểu tượng <strong>Source Control (nhánh cây bên trái)</strong> ➔ Gõ chữ "fix base" ➔ Bấm nút xanh <strong>Commit & Push</strong>.</li>
        </ol>
      </div>

      {/* URL Checker Utility */}
      <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl p-5 shadow-lg">
        <h3 className="font-serif font-bold text-amber-300 text-sm mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          Kiểm tra cấu trúc Link GitHub Pages của bạn
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] text-stone-400 mb-1 font-semibold">
              GitHub Username của bạn:
            </label>
            <input
              type="text"
              placeholder="ví dụ: duongkhang7576"
              value={repoUser}
              onChange={(e) => setRepoUser(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-stone-400 mb-1 font-semibold">
              Tên Repository:
            </label>
            <input
              type="text"
              placeholder="ví dụ: chua-online-3d"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="text-xs">
            <span className="text-stone-400">Link chính xác của bạn sẽ là: </span>
            <span className="font-mono text-emerald-300 font-bold">{generatedUrl}</span>
          </div>
          <button
            onClick={() => copyCode(generatedUrl, 'url')}
            className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1 shrink-0"
          >
            {copiedIndex === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Chép link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
