# tensu-keisan-bot
麻雀の点数計算を行うLINE BOTです。
バグはあります。

## デプロイ
now

now alias

## BOTの使い方
以下のルールでLINEに話しかけると、点数を計算して結果を返してくれます。

* 親/子：親の場合は「親」をワードに含めます。デフォルトでは子の和了として計算します。

* 翻数：翻数をワードに含めます。(ex.二翻)

* 符数：符数をワードに含めます。(ex.40符)

## 注意

* 翻の対応範囲は1～13翻です。14翻以上は対応していません。

* 符の対応範囲は20～110符で、10符単位です。25符のみが例外です。

* 満貫以上でも符の入力が省略できません。。。

* 20符の出あがり、1翻25符といった存在しない点数計算もしちゃいます。。。
