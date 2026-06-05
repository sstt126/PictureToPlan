import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => {
    return [
      {
        // フロントエンドから /api/ で始まるリクエストが来たら
        source: '/api/:path*',
        // ローカル開発時は FastAPI(ポート5328) に転送、本番環境(Vercel)ではそのままVercelのAPI機能に流す
        destination: process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:8000/api/:path*'
          : '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
