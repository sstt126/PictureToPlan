"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const selectFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください！");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("10MB以下の画像を選択してください！");
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ① 画像が選択されたら、ブラウザ上にプレビューを表示する処理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      selectFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      selectFile(file);
    }
  };

  // ② ボタンを押したら、FastAPIサーバーに画像をアップロードする処理
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("画像を選択してください！");
      return;
    }

    setIsLoading(true);

    // ★重要: FormDataを使ってファイルを包む
    const formData = new FormData();
    formData.append("file", selectedFile); // 第1引数の 'file' は、FastAPI側の引数名と合わせる！

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData, // bodyにformDataをそのまま入れる
        // 注意: Content-Typeヘッダーは手動で書かない（ブラウザが自動で設定してくれます）
      });

      if (!response.ok) throw new Error("アップロードに失敗しました");

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
    <main className="app-page">
      <header className="app-header">
        <div className="app-brand">
          <div className="brand-icon">▦</div>
          <span>Image to Google Calendar</span>
        </div>

        <div className="header-actions">
          <span className="help-link">？ 使い方</span>
          <div className="user-icon">●</div>
        </div>
      </header>

      <section className="app-container">
        <div className="panel upload-panel">
          <div className="section-title">
            <span className="section-icon">↥</span>
            <h2>画像をアップロード</h2>
          </div>

          <div
            className={`upload-box${isDragging ? " is-dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="upload-cloud">☁</div>
            <p className="upload-main-text">ここに画像をドラッグ＆ドロップ</p>
            <p className="upload-sub-text">または</p>

            <label className="file-button">
              ファイルを選択
              <input
                className="file-input"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </label>

            <p className="format-text">JPG, PNG, GIF, WEBP（最大 10MB）</p>
          </div>

          <div className="divider" />

          <div className="preview-area">
            <div className="preview-heading">
              <span>◎</span>
              <h3>プレビュー</h3>
            </div>

            <div className="preview-card">
              {preview ? (
                <img src={preview} alt="Preview" className="preview-image" />
              ) : (
                <div className="preview-placeholder">画像未選択</div>
              )}

              <div className="preview-info">
                <p className="preview-file-name">
                  {selectedFileName || "画像ファイルを選択してください"}
                </p>
                <p className="preview-file-meta">
                  {preview ? "画像を確認できます" : "選択後にプレビューが表示されます"}
                </p>
              </div>
            </div>
          </div>

          <button
            className="primary-button predict-button"
            onClick={handleUpload}
            disabled={isLoading}
          >
            <span>✦</span>
            {isLoading ? "送信中..." : "サーバーに送って予測する"}
          </button>

          <p className="security-note">▣ 画像は安全に処理され、保存されません</p>
        </div>

        <div className="panel form-panel">
          <div className="section-title">
            <span className="section-icon">▣</span>
            <h2>予定情報を確認</h2>
          </div>

          <div className="form-stack">
            <label className="field full-field">
              <span>件名</span>
              <input
                value={pieceData.text}
                onChange={(e) => setPieceData({ ...pieceData, text: e.target.value })}
                placeholder="件名"
              />
            </label>

            <label className="field full-field">
              <span>詳細</span>
              <textarea
                value={pieceData.details}
                onChange={(e) => setPieceData({ ...pieceData, details: e.target.value })}
                placeholder="詳細"
              />
            </label>

            <div className="split-grid">
              <div className="field">
                <span>開始日</span>
                <div className="date-inputs">
                  <input
                    value={pieceData.year_start}
                    onChange={(e) => setPieceData({ ...pieceData, year_start: e.target.value })}
                    placeholder="YYYY"
                  />
                  <span>/</span>
                  <input
                    value={pieceData.month_start}
                    onChange={(e) => setPieceData({ ...pieceData, month_start: e.target.value })}
                    placeholder="MM"
                  />
                  <span>/</span>
                  <input
                    value={pieceData.date_start}
                    onChange={(e) => setPieceData({ ...pieceData, date_start: e.target.value })}
                    placeholder="DD"
                  />
                </div>
              </div>

              <div className="field">
                <span>終了日</span>
                <div className="date-inputs">
                  <input
                    value={pieceData.year_end}
                    onChange={(e) => setPieceData({ ...pieceData, year_end: e.target.value })}
                    placeholder="YYYY"
                  />
                  <span>/</span>
                  <input
                    value={pieceData.month_end}
                    onChange={(e) => setPieceData({ ...pieceData, month_end: e.target.value })}
                    placeholder="MM"
                  />
                  <span>/</span>
                  <input
                    value={pieceData.date_end}
                    onChange={(e) => setPieceData({ ...pieceData, date_end: e.target.value })}
                    placeholder="DD"
                  />
                </div>
              </div>

              <div className="field">
                <span>開始時間</span>
                <div className="time-inputs">
                  <input
                    value={pieceData.hours_start}
                    onChange={(e) => setPieceData({ ...pieceData, hours_start: e.target.value })}
                    placeholder="HH"
                  />
                  <span>:</span>
                  <input
                    value={pieceData.minutes_start}
                    onChange={(e) => setPieceData({ ...pieceData, minutes_start: e.target.value })}
                    placeholder="mm"
                  />
                </div>
              </div>

              <div className="field">
                <span>終了時間</span>
                <div className="time-inputs">
                  <input
                    value={pieceData.hours_end}
                    onChange={(e) => setPieceData({ ...pieceData, hours_end: e.target.value })}
                    placeholder="HH"
                  />
                  <span>:</span>
                  <input
                    value={pieceData.minutes_end}
                    onChange={(e) => setPieceData({ ...pieceData, minutes_end: e.target.value })}
                    placeholder="mm"
                  />
                </div>
              </div>
            </div>

            <label className="field full-field">
              <span>場所</span>
              <input
                value={pieceData.location}
                onChange={(e) => setPieceData({ ...pieceData, location: e.target.value })}
                placeholder="場所"
              />
            </label>
          </div>

          <button className="calendar-button" onClick={handleOpen} disabled={!data}>
            <span className="calendar-icon">31</span>
            Googleカレンダーに追加
          </button>

          <p className="security-note">▣ Googleカレンダーの認証ページへ移動します</p>
        </div>
      </section>
    </main>
  );
}
