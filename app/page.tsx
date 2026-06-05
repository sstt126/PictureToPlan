"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  type CalendarData = {
    text: string;
    details: string;
    year_start: string;
    month_start: string;
    date_start: string;
    year_end: string;
    month_end: string;
    date_end: string;
    hours_start: string;
    minutes_start: string;
    hours_end: string;
    minutes_end: string;
    location: string;
  };

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
  const formatDate = (data: CalendarData) => {
    if (
      data.year_start === data.year_end &&
      data.month_start === data.month_end &&
      data.date_start === data.date_end
    ){
      return `${data.year_start}/${data.month_start}/${data.date_start}`;
    }else {
      return `${data.year_start}/${data.month_start}/${data.date_start} ～ ${data.year_end}/${data.month_end}/${data.date_end}`;
    };
  };
  const formatTime = (data: CalendarData) => {
    return `${data.hours_start}:${data.minutes_start} ～ ${data.hours_end}:${data.minutes_end}`;
  };

  const makeUrl = (data: CalendarData) => {
    const {
      text,
      details,
      year_start,
      month_start,
      date_start,
      year_end,
      month_end,
      date_end,
      hours_start,
      minutes_start,
      hours_end,
      minutes_end,
      location,
    } = data;

    const start = `${year_start}${month_start}${date_start}T${hours_start}${minutes_start}00`;
    const end = `${year_end}${month_end}${date_end}T${hours_end}${minutes_end}00`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text,
      dates: `${start}/${end}`,
      ctz: "Asia/Tokyo",
      details,
      location,
    });

    return `https://calendar.google.com/calendar/render?${params}`;
  };
  const handleOpen = () => {
    const url = makeUrl(data);

    window.open(url, "_blank");
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
        <div style={{ marginTop: "20px", color: "white" }}>
          <h3>件名: {data.text}</h3>
          <h3>詳細: {data.details}</h3>
          <h3>日付: {formatDate(data)}</h3>
          <h3>時間: {formatTime(data)}</h3>
          <h3>場所: {data.location}</h3>
        </div>
      )}

      {/* Googleカレンダーに登録するためのURL */}
      {data && (
        <button onClick={handleOpen}>
          Googleカレンダーに登録！
        </button>
      )}
    </div>
  );
}