# Interview Pipeline Tracker

面接スケジュールを一元管理するための軽量デスクトップアプリです。面接やカジュアル面談を見逃さないよう、エントリーは日時順に並び替えられ、ステージごとにフィルタリング可能。バックグラウンドのリマインダーエンジンが、イベント前にネイティブOS通知を送信します。

完全ローカル動作：クラウドアカウント不要・サーバー不要・メール不要。データはすべて手元のSQLiteデータベースに保存されます。

---

## 機能

- **追加 / 編集 / 削除** — 企業名・選考ステージ・日時・リマインダー時間・メモを管理
- **リストビュー** — 直近の日時順に並び替え、色分けされたステージバッジとライブカウントダウン表示（「2日後」「明日 14:00」「今日 09:30」）
- **カレンダービュー** — 月単位のグリッドで各日の面接を時刻・ステージバッジ付きで表示。日付をクリックすると、その日のエントリーの閲覧・追加・編集・削除が可能
- **ステージフィルター** — 1つ以上のステージでリストを絞り込み
- **過去エントリー** — 予定日時を過ぎたエントリーは折りたたみ可能なアーカイブセクションに自動移動
- **バックグラウンドリマインダー** — 60秒ごとにDBをポーリングし、`現在時刻 >= 予定時刻 - リマインダー時間` になるとOS通知を送信。日時を変更すると自動的にリセット

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| デスクトップシェル | Tauri 2（Rust） |
| フロントエンド | React 19 + TypeScript |
| バンドラー | Vite 8 |
| スタイリング | Tailwind CSS v4 |
| ストレージ | SQLite（`tauri-plugin-sql`、起動時に自動マイグレーション） |
| 通知 | `tauri-plugin-notification`（ネイティブOS通知） |
| 日時処理 | `chrono`（Rust） · `Date` / `Intl`（TypeScript） |
| 直接DB参照 | `rusqlite`（バックグラウンドリマインダースレッド） |

---

## 必要環境

| ツール | バージョン | インストール |
|--------|-----------|-------------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Rust + Cargo | ≥ 1.77 | [rustup.rs](https://rustup.rs) |
| Tauri CLI | ≥ 2.x | `cargo install tauri-cli` |
| WebView2 ランタイム | 任意 | Windows 10/11 の Microsoft Edge に同梱 |

---

## セットアップ

```bash
# JS依存パッケージのインストール
npm install

# 開発モードで起動（フロントエンドホットリロード + Rustバックエンド）
npm run tauri:dev

# 本番インストーラーのビルド
npm run tauri:build
```

本番ビルドが完了すると、`src-tauri/target/release/bundle/` に2種類のインストーラーが生成されます。

| インストーラー | パス |
|---------------|------|
| NSISセットアップウィザード | `nsis/Interview Pipeline Tracker_0.1.0_x64-setup.exe` |
| MSIパッケージ | `msi/Interview Pipeline Tracker_0.1.0_x64_en-US.msi` |

どちらかのインストーラーを一度実行すれば、スタートメニューからアプリを起動できます。VS CodeもターミナルもすべてOKです。

---

## プロジェクト構成

```
interview-pipeline-tracker/
├── src-tauri/                          # Rustバックエンド
│   ├── src/
│   │   ├── main.rs                     # エントリーポイント — lib::run() を呼び出す
│   │   ├── lib.rs                      # Tauriビルダー、プラグイン登録、マイグレーション
│   │   └── reminder.rs                 # バックグラウンドスレッド: DBポーリング・通知送信
│   ├── migrations/
│   │   └── 0001_initial.sql            # interviewsテーブルスキーマ
│   ├── capabilities/
│   │   └── default.json                # 権限設定（sql・notification・core）
│   ├── Cargo.toml
│   ├── tauri.conf.json                 # ウィンドウ設定・CSP・バンドル対象
│   └── build.rs
│
├── src/                                # Reactフロントエンド
│   ├── main.tsx
│   ├── App.tsx                         # レイアウト + リスト/カレンダー切り替え
│   │
│   ├── db/
│   │   ├── client.ts                   # シングルトンDB接続
│   │   └── interviews.ts               # CRUDクエリ
│   │
│   ├── types/
│   │   └── interview.ts                # Interviewインターフェース・Stageエナム・行マッパー
│   │
│   ├── features/
│   │   ├── interview-list/
│   │   │   ├── InterviewList.tsx
│   │   │   ├── InterviewListItem.tsx   # 行: バッジ・カウントダウン・編集/削除
│   │   │   └── useInterviews.ts        # フェッチ・ソート・フィルター・CRUD状態管理
│   │   ├── interview-form/
│   │   │   ├── InterviewForm.tsx       # 追加 / 編集モーダルフォーム
│   │   │   └── StageSelect.tsx
│   │   ├── stage-filter/
│   │   │   └── StageFilterBar.tsx
│   │   ├── archive/
│   │   │   └── PastInterviews.tsx      # 折りたたみ可能な過去エントリー
│   │   └── calendar/
│   │       ├── CalendarView.tsx        # 月グリッド・ナビゲーション
│   │       ├── CalendarDay.tsx         # 日付セル: 時刻・バッジ・企業名
│   │       └── DayModal.tsx            # 日付詳細: リスト表示・エントリー追加
│   │
│   ├── components/
│   │   ├── Badge.tsx                   # ステージカラーバッジ
│   │   ├── Button.tsx                  # primary / ghost / danger バリアント
│   │   ├── Modal.tsx                   # アクセシブルオーバーレイ（Escキー・背景クリックで閉じる）
│   │   └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   └── useCountdown.ts             # ライブ更新の相対時刻ラベル（30秒ごと更新）
│   │
│   ├── lib/
│   │   └── dateUtils.ts                # formatCountdown・isPast・toDatetimeLocal など
│   │
│   └── styles/
│       └── globals.css                 # Tailwind v4 インポート + ベースレイヤー
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## データモデル

### SQLite — `interviews` テーブル

| カラム | 型 | 備考 |
|--------|----|------|
| `id` | `INTEGER` PK | 自動採番 |
| `company` | `TEXT NOT NULL` | 企業名 |
| `stage` | `TEXT NOT NULL` | `casual` · `first` · `second` · `final` · `offer` · `rejected` · `closed` |
| `scheduled_at` | `DATETIME NOT NULL` | ISO 8601 |
| `notes` | `TEXT` | NULL可 |
| `reminder_minutes_before` | `INTEGER` | デフォルト `60` |
| `reminder_fired` | `INTEGER` | `0` / `1` — 重複通知を防止、日時変更時にリセット |
| `created_at` | `DATETIME` | 挿入時に自動設定 |
| `updated_at` | `DATETIME` | 編集ごとに更新 |

### TypeScript型定義（`src/types/interview.ts`）

```ts
type Stage = "casual" | "first" | "second" | "final" | "offer" | "rejected" | "closed";

interface Interview {
  id: number;
  company: string;
  stage: Stage;
  scheduledAt: string;           // ISO 8601
  notes: string | null;
  reminderMinutesBefore: number;
  reminderFired: boolean;
  createdAt: string;
  updatedAt: string;
}

// 作成時（id・タイムスタンプはDBが生成）
type NewInterview = Omit<Interview, "id" | "reminderFired" | "createdAt" | "updatedAt">
  & { reminderMinutesBefore?: number };

// 更新時（idは必須、その他は任意）
type InterviewUpdate = Partial<Omit<Interview, "id" | "createdAt" | "updatedAt">>
  & { id: number };
```

---

## リマインダーの仕組み

Rustのバックグラウンドスレッド（`src-tauri/src/reminder.rs`）が60秒ごとに以下を実行します。

1. `rusqlite` でSQLiteデータベースに直接接続（非同期オーバーヘッドなし）
2. `reminder_fired = 0` かつ `scheduled_at > 現在時刻` の全行を取得
3. 各行に対して `現在時刻 >= scheduled_at − reminder_minutes_before × 60秒` であればOS通知を送信し、`reminder_fired = 1` に更新

UIから `scheduled_at` を変更すると `reminder_fired` が `0` にリセットされ、新しい日時で再度通知が送信されます。

---

## ウィンドウ設定

| 設定 | 値 |
|------|----|
| デフォルトサイズ | 1400 × 900 |
| 最小サイズ | 900 × 600 |
| リサイズ | 可 |
| 起動時の位置 | 画面中央 |
| CSP | `default-src 'self'`（外部ネットワークアクセス不可） |
