'use client'; // クライアントコンポーネントにする

import { useEffect, useState } from 'react';

// TypeScript用の型定義
interface PostData {
  text: string;
  details: string;
  dates: string;
  time: string;
  location: string;
}

export default function Home() {
  const [posts, setPosts] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // コンポーネントが読み込まれたらAPIを叩く
    fetch('/api') 
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("データの取得に失敗しました:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (!posts) return <p>データがありません</p>;

  return (
    <ul>
      <li>
        <h2>{posts.text}</h2>
        <h3>{posts.details}</h3>
        <p>日時: {posts.dates} {posts.time}</p>
        <p>場所: {posts.location}</p>
      </li>
    </ul>
  );
}