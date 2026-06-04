from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from datetime import datetime
import time
from pydantic import BaseModel, PositiveInt


# APIKEY取得
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("GOOGLE_API_KEY environment variable not set")

# 今日の日付の確認
today_str = datetime.now().strftime('%Y-%m-%d')

# AIに送るプロンプト
PROMPT = f"""
    添付された画像から、スケジュール登録に必要な情報を読み取ってください。
        
        【基準日（今日）】: {today_str}
        
        条件：
        - スケジュールの件名、スケジュールの詳細、開催される日付、開催される時間、開催される場所をJSONで返してください。
        - 画像内に「年」や「月」がない場合は、基準日から最も近い日付を推測して「YYYY-MM-DD」形式に補完してください。
        - 時間の記載がない場合は、開始・終了ともに空文字（""）にしてください。
        - 場所の記載がない場合は、空文字（""）にしてください。
        - メモには、参加費、持参物、その他の補足事項などがあれば簡潔に箇条書きでまとめてください。なければ空文字にしてください。

"""
        # 出力は、以下のキーを持つ完全なJSON形式（Markdown記法なし）のみを出力してください。
        # {{
        #     "text": "件名",
        #     "details": "詳細",
        #     "dates": "YYYY-MM-DD",
        #     "time": "HH:MM - HH:MM または HH:MM",
        #     "location": "場所の名前",
        # }}



# スキーマ定義
class JSONFormat(BaseModel):
    text: str
    details: str
    dates: str
    time: str
    location: str



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = "http://localhost:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
def picture_to_plan():
    # Gemini APIの操作クライアントを作成
    client = genai.Client(api_key=GOOGLE_API_KEY)

    # 読み込ませる画像をGoogleサーバーにアップロード
    plan_picture = client.files.upload(file="/Users/maineko./picturetoplan/api/sample.png")

    # モデル指定
    AI_MODEL = "gemini-3.1-flash-lite"

    # モデル、画像、プロンプトを指定
    response = client.models.generate_content(
        model = AI_MODEL,
        contents = [plan_picture, PROMPT],
        config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema = JSONFormat
            )
    )

    print(response.text)

    return {response.text}
