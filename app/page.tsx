"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ① 画像が選択されたら、ブラウザ上にプレビューを表示する処理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file); // 画像をデータURLに変換してプレビューできるようにする
    }
  };

  // ② ボタンを押したら、FastAPIサーバーに画像をアップロードする処理
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("画像を選択してください！");
      return;
    }

    setIsLoading(true);

    // ★重要: FormDataを使ってファイルを包む
    const formData = new FormData();
    formData.append('file', file); // 第1引数の 'file' は、FastAPI側の引数名と合わせる！

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData, // bodyにformDataをそのまま入れる
        // 注意: Content-Typeヘッダーは手動で書かない（ブラウザが自動で設定してくれます）
      });

      if (!response.ok) throw new Error('アップロードに失敗しました');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div style={{ padding: '20px' }}>
      <h2>ローカルから画像アップロード</h2>

      {/* ファイル選択ボタン */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      {/* 選択されたらプレビューを表示 */}
      {preview && (
        <div style={{ marginTop: '20px' }}>
          <img src={preview} alt="Preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />
        </div>
      )}

      {/* 送信ボタン */}
      <button 
        onClick={handleUpload} 
        disabled={isLoading} 
        style={{ marginTop: '20px', display: 'block', padding: '10px' }}
      >
        {isLoading ? '送信中...' : 'サーバーに送って予測する'}
      </button>

      {/* バックエンドからの結果表示 */}
      {data && (
        <div style={{ marginTop: '20px', color: 'white' }}>
          <h3>件名: {data.text}</h3>
          <h3>詳細: {data.details}</h3>
          <h3>日付: {data.dates}</h3>
          <h3>時間: {data.time}</h3>
          <h3>場所: {data.location}</h3>
        </div>
      )}
    

    </div>
  );
}