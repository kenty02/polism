# polism

## 概要
DiscordやSlackのサーバー（ワークスペース）を、Regoポリシーで管理するためのツールです。

一つのポリシーをDiscord,Slackの両方に適用することができます。

例えば以下のようなポリシーを書き、適用することができます。
- サーバー上で好ましくない行動を取った人に警告する
- サーバー上で怪しい行動を取った人をモデレーターに知らせる
- サーバー上で特定の行動を取った人をBANする

現在はプロトタイプです。使い方は全く整備されていません。

## システム構成
- Supabase
  - データベースです。
- enforcer
  - DiscordやSlackのAPIと通信し、ポリシーを適用します。
  - TypeScript, Node.js
- evaluator
  - OPAのライブラリを使用し、ポリシーを評価します。
  - Go, OPA
- web-ui
  - ポリシーを管理するためのWeb UIです。
  - Refine, Ant Design, Vite
