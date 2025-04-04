# 词猎人 | Semantic Hunter

一个基于语义相似度的猜词游戏，灵感来源于 Wordle，但更加注重语义空间的探索。

## 功能特点

- 从词库中随机选择一个秘密词语
- 基于 Sentence Transformers 计算语义相似度
- 实时展示猜词历史，按相似度排序
- 美观的用户界面

## 技术栈

- 后端：Flask + Sentence Transformers
- 前端：HTML5 + CSS3 + JavaScript

## 安装与运行

1. 安装依赖：

```bash
pip install -r requirements.txt
```

2. 启动服务器：

```bash
python app.py
```

3. 打开浏览器访问：`http://localhost:5000`

## 游戏玩法

1. 系统会随机选择一个秘密词语
2. 玩家输入猜测的词语
3. 系统会计算猜测词语与秘密词语的语义相似度并显示
4. 猜词历史会按照相似度排序，帮助玩家缩小猜测范围
5. 当猜中秘密词语时游戏结束

## 注意事项

- 请确保已安装 Python 3.7+ 和必要的依赖
- 游戏使用中文词库，需要支持中文输入
- 首次启动可能需要下载 Sentence Transformers 模型 