import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "업킨지앤 컴퍼니 | AI 시장조사 시뮬레이터",
  description:
    "한국인 페르소나 기반 AI 시장조사 시뮬레이터. 30분 만에 한국인 100명에게 물어본 듯한 반응을 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-900">
              업킨지앤 컴퍼니
            </h1>
            <span className="text-sm text-gray-500">
              AI 시장조사 시뮬레이터
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-white py-4 text-center text-xs text-gray-400">
          본 결과는 합성 페르소나와 AI 모델을 기반으로 생성된 시뮬레이션이며, 실제
          소비자 조사를 대체하지 않습니다.
        </footer>
      </body>
    </html>
  );
}
