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

