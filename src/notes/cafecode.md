# CafeCode Document

## 使う記号

- Offs(et)
- Cnt_(Count)

### S(ize)

| value | description |
| :---: | :---------: |
|   0   |    8bit     |
|   1   |    16bit    |
|   2   |    32bit    |

## 命令リスト

| Opcode | Short description              |
| :----- | :----------------------------- |
| 00     | RAM Write                      |
| 01     | String Write                   |
| 03     | If: ==                         |
| 04     | If: !=                         |
| 05     | If: >                          |
| 06     | If: <                          |
| 07     | If: >=                         |
| 08     | If: <=                         |
| 09     | If: &                          |
| 0A     | If: \|                         |
| 0B     | If: <>                         |
| 0C     | Timer Block                    |
| 0D     | Reset timer                    |
| 10     | Integer Load                   |
| 11     | Integer Store                  |
| 12     | Float Load                     |
| 13     | Float Store                    |
| 14     | Integer Operation              |
| 15     | Float Operation                |
| 20     | Fill                           |
| 30     | Load Pointer                   |
| 31     | Add Offset                     |
| 32     | [Hidden] `. r31 & r30`         |
| C0     | Persist Assembly               |
| C1     | Call System Call               |
| C2     | Patch Assembly                 |
| C3     | [Hidden] String Patch Assembly |
| D0     | Pointer/Conditional Terminator |
| D1     | NOP                            |
| D2     | Timer Terminator               |
| F0     | Replace                        |
---

### RAM

#### アドレス指定メモリ書き込み (00)

```plain
000S0000 Address_
Value___ 00000000
```

#### ポインタ指定メモリ書き込み (00)

```plain
001SOffs Value___
```

(アドレス指定とさほど代わりません)

#### バーってやるやつ (01)

- ポインタ化するにはPを1にする

```plain
01P0Cnt_ Address_
    Values...
if NNNN % 8 == 0  ; キリが良いと
  00000000 000000FF
else
  ........ 000000ff ; 0000で埋めて最後をffにする
                    ; もちろんちょうどよければffで終わる（VVVVVVff）
```

##### 例

```plain
01000008 10000000 | 01000005 10000000
AAAAAAAA AAAAAAAA | AAAAAAAA AA0000FF
00000000 000000FF
```

#### 埋め立て (20)

```plain
20P00000 Value___
Address_ Length__
```

- ポインタ化するにはPを1にする
- `Length` はおそらくバイト数

#### 置換 (F0)

- 危ないからあんまり使わないかも

```plain
F0000000 Address1
Address2 Value1__
Value2__ 00000000
```

- 範囲は `Address1` と `Address2` の間です
- `Value1__` が `Value2__` へ置換されます

### システム

#### アセンブラ実行 (C0)

```plain
C000NNNN 60000000
...
3C40010F 60426AE0
7C4903A6 4E800420
```

- 最後の2行はおそらく `ExecuteAssemblyReturn` のような役割を果たしている命令
- `NNNN` は 最後の2行を含めた機械語の行数

#### システムコール実行 (C1)

`C100XXXX 00000000` \
`XXXX` 番のシステムコールを呼ぶ命令
[System Calls](http://wiiubrew.org/wiki/Cafe_OS_Syscalls)

#### アセンブリパッチ (C2)

```plain
C2000000 LLLLLLLL
VVVVVVVV 00000000
```

0x1000'0000 以下の LLLLLLLL に VVVVVVVV を書き込みます

#### アセンブリばーってやるやつ(C3)

```plain
C300Cnt_ LLLLLLLL
Values...
```

### ポインタ

#### 読み込み (30)

```plain
30P00000 Address_
Range_st Range_en
...
D0000000 DEADCAFE
```

- 多重ポインタ化するときは一番上を `P = 0` それより下を `P = 1` とする

#### オフセット追加 (31)

`31000000 Offset__` \
`Offset` を内部ポインタに加算する命令です

### タイマー

#### タイマー系コードの最初に置くやつ (0C)

`0C000000 Frames__` \

`Frames__` フレーム経過すると動かなくなります

#### タイマー系コードの終端に置くやつ (D2)

`D2000000 CAFEBABE`

#### タイマー系コードをリセットするやつ (0D)

`0D00Valu Address_` \
`[16bits, A] == V` のときにタイマーがリセットされる \
全部のタイマー系コードが動くようになるから気をつけないと

### レジスタ

- ポインタ化はいつもの通り `P = 1` でできる
- R は `0 - 7` の範囲

#### ストア/ロード (10~13)

`CcPS000R Address_`
|     Type      |  Cc   |
| :-----------: | :---: |
| Integer Load  |  10   |
| Integer Store |  11   |
|  Float Load   |  12   |
|  Float Store  |  13   |

#### 演算 (14,15)

`Cc0T0R0S VVVVVVVV`
| Target |  Cc   |
| :----: | :---: |
|  Int   |  14   |
| Float  |  15   |

`Register[R] = Register[R] <operator> Register[S]` \
`Register[R] = Register[R] <operator> VVVVVVVV`

##### `T` について

`T` は演算の仕方を定義します
|   T   | Operator | Is immidiate? |
| :---: | :------: | :-----------: |
|   0   |   `+`    |      No       |
|   1   |   `-`    |      No       |
|   2   |   `*`    |      No       |
|   3   |   `/`    |      No       |
|   4   |   `+`    |      Yes      |
|   5   |   `-`    |      Yes      |
|   6   |   `*`    |      Yes      |
|   7   |   `/`    |      Yes      |

- `T == 8` の場合
  - `float[R] -> int[S]` に該当する処理をします

##### `VVVVVVVV` について

これは `T >= 4` のときに `Register[S]` の代わりに使用されるものです

### 条件分岐

- ifの終わりに Terminator (D0) 入れてね
- ポインタにするときはPを1にするだけでOK

#### 基本形

```plain
CcPS0000 Address_
Value___ 00000000
```

#### Cc(Code type)一覧

|    MineCode     | Code type |
| :-------------: | :-------: |
|   `[A] == V`    |    03     |
|   `[A] != V`    |    04     |
|    `[A] > V`    |    05     |
|    `[A] < V`    |    06     |
|   `[A] >= V`    |    07     |
|   `[A] <= V`    |    08     |
| `[A] & V != 0`  |    09     |
| `[A] \| V != 0` |    0A     |

#### 範囲チェック

```plain
0bPS0000 Address_
Value1__ Value2__
```

- `Value1__` < `[Address_]` < `Value2__`  のとき

### その他

|  CC   |        Code         | Short Description                    |
| :---: | :-----------------: | :----------------------------------- |
|  D0   | `D0000000 DEADCAFE` | ポインタや条件分岐用のターミネータ() |
|  D1   | `D1000000 DEADC0DE` | 何もしないやつ()                     |
|  D2   | `D2000000 DEADBABE` | タイマー用のターミネータ()           |

---

### 更新履歴

| Revision | Detail                           |
| :------: | :------------------------------- |
|    R8    | 「その他」をテーブル化           |
|    R7    | Markdown としての形式修正        |
|    R6    | 形式の修正                       |
|    R5    | 演算定義のミス修正               |
|    R4    | 命令リストを追加                 |
|    R3    | 大量の微調整（？）               |
|    R2    | レジスタ演算のドキュメントを修正 |
|    R1    | 配布                             |
