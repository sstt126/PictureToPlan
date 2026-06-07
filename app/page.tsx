"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [data, setData] = useState<CalendarData | null>(null);
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

  const [pieceData, setPieceData] = useState<CalendarData>({
    text: "",
    details: "",
    year_start: "",
    month_start: "",
    date_start: "",
    year_end: "",
    month_end: "",
    date_end: "",
    hours_start: "",
    minutes_start: "",
    hours_end: "",
    minutes_end: "",
    location: "",
  });

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
      setPieceData({
        text: result.text,
        details: result.details,
        year_start: result.year_start,
        month_start: result.month_start,
        date_start: result.date_start,
        year_end: result.year_end,
        month_end: result.month_end,
        date_end: result.date_end,
        hours_start: result.hours_start,
        minutes_start: result.minutes_start,
        hours_end: result.hours_end,
        minutes_end: result.minutes_end,
        location: result.location,
      });
    } catch (error) {
      console.error("エラー:", error);
    } finally {
      setIsLoading(false);
    }

    
  };

  const makeUrl = () => {
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
    } = pieceData;

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
    const url = makeUrl();

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
          
          <span>件名：</span>
            <input
              value={pieceData.text}
              onChange={(e) => setPieceData({...pieceData,text: e.target.value})}
              placeholder='件名'
              style={{
                width: '90%',
              }}
            />
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span>詳細：</span>
              <textarea
                value={pieceData.details}
                onChange={(e) => setPieceData({ ...pieceData, details: e.target.value })}
                placeholder='詳細'
                style={{
                  width: '90%',
                }}
              />
              </div>
          <div>
              <span>開始日：</span>
              <input
                value={pieceData.year_start}
                onChange={(e) => setPieceData({ ...pieceData, year_start: e.target.value })}
                placeholder='開始年'
                style={{
                  width: '40px',
                  textAlign: 'center',
                }}
              />
              <span>/</span>
              <input
                value={pieceData.month_start}
                onChange={(e) => setPieceData({ ...pieceData, month_start: e.target.value })}
                placeholder='開始月'
                style={{
                  width: '20px',
                  textAlign: 'center',
                }}
              />
              <span>/</span>
              <input
                value={pieceData.date_start}
                onChange={(e) => setPieceData({ ...pieceData, date_start: e.target.value })}
                placeholder='開始日'
                style={{
                  width: '20px',
                  textAlign: 'center',
                }}
              />
                <span>　　　終了日：</span>
                <input
                  value={pieceData.year_end}
                  onChange={(e) => setPieceData({ ...pieceData, year_end: e.target.value })}
                  placeholder='終了年'
                  style={{
                    width: '45px',
                    textAlign: 'center',
                  }}
                />
                <span>/</span>
                <input
                  value={pieceData.month_end}
                  onChange={(e) => setPieceData({ ...pieceData, month_end: e.target.value })}
                  placeholder='終了月'
                  style={{
                    width: '20px',
                    textAlign: 'center',
                  }}
                />
                <span>/</span>
                <input
                  value={pieceData.date_end}
                  onChange={(e) => setPieceData({ ...pieceData, date_end: e.target.value })}
                  placeholder='終了日'
                  style={{
                    width: '20px',
                    textAlign: 'center',
                  }}
                />
          </div>
          <div>
            <span>開始時間：</span>
            <input
              value={pieceData.hours_start}
              onChange={(e) => setPieceData({ ...pieceData, hours_start: e.target.value })}
              placeholder='開始時'
              style={{
                width: '20px',
                textAlign: 'center',
              }}
            />
            <span>:</span>
            <input
              value={pieceData.minutes_start}
              onChange={(e) => setPieceData({ ...pieceData, minutes_start: e.target.value })}
              placeholder='開始分'
              style={{
                width: '20px',
                textAlign: 'center',
              }}
            />
            <span>　　　終了時間：</span>
            <input
              value={pieceData.hours_end}
              onChange={(e) => setPieceData({ ...pieceData, hours_end: e.target.value })}
              placeholder='終了時'
              style={{
                width: '20px',
                textAlign: 'center',
              }}
            />
            <span>:</span>
            <input
              value={pieceData.minutes_end}
              onChange={(e) => setPieceData({ ...pieceData, minutes_end: e.target.value })}
              placeholder='終了分'
              style={{
                width: '20px',
                textAlign: 'center',
              }}
            />
          </div>
          <span>場所：</span>
          <input
            value={pieceData.location}
            onChange={(e) => setPieceData({ ...pieceData, location: e.target.value })}
            placeholder='場所'
            style={{
              width: '90%',
            }}
          />
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
