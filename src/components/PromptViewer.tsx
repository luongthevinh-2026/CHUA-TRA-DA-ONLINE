import React, { useState } from 'react';
import {
  GITHUB_MASTER_PROMPT,
  GITHUB_CLAUDE_MD,
  GITHUB_WORKFLOW_YML,
  GITHUB_ISSUE_TEMPLATE,
} from '../data/githubPrompts';
import {
  Copy,
  Check,
  Download,
  FileCode,
  GitPullRequest,
  Workflow,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const PromptViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'master' | 'claude_md' | 'workflow' | 'issue' | 'compare'>('master');
  const [copied, setCopied] = useState<boolean>(false);

  const getActiveContent = () => {
    switch (activeTab) {
      case 'master':
        return { text: GITHUB_MASTER_PROMPT, filename: 'ChuaOnline3D_GitHub_Prompt.md' };
      case 'claude_md':
        return { text: GITHUB_CLAUDE_MD, filename: 'CLAUDE.md' };
      case 'workflow':
        return { text: GITHUB_WORKFLOW_YML, filename: 'deploy.yml' };
      case 'issue':
        return { text: GITHUB_ISSUE_TEMPLATE, filename: 'github_issue_template.md' };
      default:
        return { text: GITHUB_MASTER_PROMPT, filename: 'prompt.md' };
    }
  };

  const handleCopy = () => {
    const { text } = getActiveContent();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleDownload = () => {
    const { text, filename } = getActiveContent();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 text-stone-100 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-600/30 rounded-2xl p-5 md:p-6 mb-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Chuẩn hóa cho GitHub & Claude Code
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <span className="text-stone-400 text-xs">Chùa 3D Online (Three.js)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-amber-200">
              Prompt Chùa 3D Online cho GitHub
            </h1>
            <p className="text-xs md:text-sm text-stone-400 mt-1 max-w-2xl">
              Đã chuyển đổi từ bản Claude Desktop cũ sang bản chuẩn GitHub: chia nhỏ lộ trình theo Pull
              Requests, tích hợp quy chuẩn commit, file chỉ dẫn <code className="text-amber-300">CLAUDE.md</code>, và
              tự động triển khai lên GitHub Pages bằng GitHub Actions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs shadow-lg transition-transform active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép Prompt'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold shadow transition-transform active:scale-95"
              title="Tải xuống file Markdown"
            >
              <Download className="w-4 h-4" />
              <span>Tải .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'master'
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Bản Full (Master Prompt)</span>
        </button>

        <button
          onClick={() => setActiveTab('claude_md')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'claude_md'
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>File CLAUDE.md</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'workflow'
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>GitHub Actions (deploy.yml)</span>
        </button>

        <button
          onClick={() => setActiveTab('issue')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'issue'
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Mẫu Issue / PR Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'compare'
              ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>So sánh: Claude Desktop vs GitHub</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'compare' ? (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <h3 className="font-serif font-bold text-amber-300 text-base mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Điểm khác biệt khi chuyển đổi Prompt sang GitHub
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Bản gốc được viết riêng cho <em>Claude Desktop (tab Code, không dùng terminal, importmap CDN)</em>.
              Khi chuyển sang <strong>GitHub</strong>, Claude / Copilot hoạt động trong ngữ cảnh của một Git repository,
              do đó cần điều chỉnh các điểm cốt lõi sau:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400">
                    <th className="py-2.5 px-3">Tiêu chí</th>
                    <th className="py-2.5 px-3 bg-stone-950/40">Bản cũ (Claude Desktop)</th>
                    <th className="py-2.5 px-3 bg-amber-950/20 text-amber-200 font-semibold">
                      Bản mới (GitHub & Claude)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  <tr>
                    <td className="py-3 px-3 font-medium text-stone-200">Môi trường & Công cụ</td>
                    <td className="py-3 px-3 bg-stone-950/40">Không terminal, dùng Preview nút bấm của Desktop app</td>
                    <td className="py-3 px-3 bg-amber-950/20 text-amber-100">
                      Chuẩn Git repo: hỗ trợ cả Claude Code CLI, GitHub Codespaces, PR review
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-stone-200">Quản lý mã nguồn</td>
                    <td className="py-3 px-3 bg-stone-950/40">Lưu trong một thư mục tĩnh cục bộ</td>
                    <td className="py-3 px-3 bg-amber-950/20 text-amber-100">
                      Commit theo chuẩn Conventional Commits (<code className="text-amber-300">feat:</code>,{' '}
                      <code className="text-amber-300">fix:</code>)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-stone-200">Lộ trình triển khai</td>
                    <td className="py-3 px-3 bg-stone-950/40">Chia 8 bước báo cáo bằng chữ trong chat</td>
                    <td className="py-3 px-3 bg-amber-950/20 text-amber-100">
                      Chia 6 Pull Request (PR Roadmap) rõ ràng, dễ review và merge
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-stone-200">File chỉ dẫn Agent</td>
                    <td className="py-3 px-3 bg-stone-950/40">Không có (phải dán lại prompt dài mỗi lần chat)</td>
                    <td className="py-3 px-3 bg-amber-950/20 text-amber-100">
                      Tạo file <code className="text-amber-300">CLAUDE.md</code> trong repo để Claude tự đọc hiểu kiến trúc
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-stone-200">Xuất bản lên mạng</td>
                    <td className="py-3 px-3 bg-stone-950/40">Kéo thả thủ công lên Netlify/Vercel</td>
                    <td className="py-3 px-3 bg-amber-950/20 text-amber-100">
                      GitHub Actions tự động deploy lên <strong>GitHub Pages miễn phí</strong> mỗi khi push
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl bg-stone-950 border border-stone-800 p-4 md:p-6 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800/80 pb-3 mb-4">
            <span className="font-mono text-amber-300/80">{getActiveContent().filename}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500">Markdown Format</span>
              <button
                onClick={handleCopy}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Chép nội dung'}</span>
              </button>
            </div>
          </div>

          <pre className="font-mono text-xs md:text-sm text-stone-300 whitespace-pre-wrap leading-relaxed max-h-[580px] overflow-y-auto pr-2 selection:bg-amber-600/40">
            {getActiveContent().text}
          </pre>
        </div>
      )}
    </div>
  );
};
