print("Starting...")
from flask import Flask, render_template, request, jsonify
import random
from sentence_transformers import SentenceTransformer, util
import torch
import os
import sys
import pkg_resources
import platform

# 打印版本信息函数
def print_version_info():
    print("=" * 50)
    print(f"Python 版本: {platform.python_version()}")
    print(f"Python 实现: {platform.python_implementation()}")
    print(f"系统信息: {platform.system()} {platform.release()}")
    print("-" * 50)
    print("已安装的依赖包版本:")
    
    # 检查主要依赖库的版本
    packages = [
        'flask', 
        'sentence-transformers', 
        'torch', 
        'numpy',
        'transformers'  # sentence-transformers 依赖的库
    ]
    
    for package in packages:
        try:
            version = pkg_resources.get_distribution(package).version
            print(f"  - {package}: {version}")
        except pkg_resources.DistributionNotFound:
            print(f"  - {package}: 未安装")
    
    print("=" * 50)

# 启动时打印版本信息
print_version_info()

app = Flask(__name__)

HF_CACHE = "./hf_cache"
os.makedirs(HF_CACHE, exist_ok=True)
# Load model
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', cache_folder=HF_CACHE)

# Load word pool
with open("words.txt", "r", encoding="utf-8") as f:
    word_pool = [line.strip() for line in f if line.strip()]

# 初始化游戏状态函数
def initialize_game_state():
    secret_word = random.choice(word_pool)
    secret_vec = model.encode(secret_word, convert_to_tensor=True)
    print(f"新游戏已开始，秘密词语: {secret_word}")
    return {
        "secret_word": secret_word,
        "secret_vec": secret_vec,
        "guesses": []
    }

# 服务启动时初始化游戏状态
game_state = initialize_game_state()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/game-status', methods=['GET'])
def game_status():
    """获取当前游戏状态，包括猜测历史，但不包含秘密词语"""
    # 对猜测列表按相似度降序排序
    sorted_guesses = sorted(game_state["guesses"], key=lambda x: x["similarity"], reverse=True)
    
    # 检查是否有人已经猜对了
    has_correct_guess = any(guess["is_correct"] for guess in game_state["guesses"])
    
    return jsonify({
        "status": "success",
        "guesses": sorted_guesses,
        "has_correct_guess": has_correct_guess,
        "is_game_active": True
    })

@app.route('/new-game', methods=['POST'])
def new_game():
    global game_state
    # 重置游戏状态
    game_state = initialize_game_state()
    return jsonify({"status": "success", "message": "新游戏已开始"})

@app.route('/guess', methods=['POST'])
def guess():
    data = request.json
    guess_word = data.get('guess', '').strip()
    
    if not guess_word:
        return jsonify({"status": "error", "message": "请输入猜测词语"})
    
    # Encode the guess
    guess_vec = model.encode(guess_word, convert_to_tensor=True)
    
    # Calculate similarity
    similarity = util.pytorch_cos_sim(game_state["secret_vec"], guess_vec)
    percent = round(float(similarity[0][0]) * 100, 2)
    
    # Check if correct
    is_correct = (game_state["secret_word"] == guess_word)
    
    # 检查猜测的词是否已存在于历史记录中
    word_exists = any(g["word"] == guess_word for g in game_state["guesses"])
    
    # 仅当词语不在历史记录中时，才添加到猜测历史
    if not word_exists:
        # Store guess
        game_state["guesses"].append({
            "word": guess_word,
            "similarity": percent,
            "is_correct": is_correct
        })
    
    # Sort guesses by similarity (descending)
    sorted_guesses = sorted(game_state["guesses"], key=lambda x: x["similarity"], reverse=True)
    
    response = {
        "status": "success",
        "similarity": percent,
        "is_correct": is_correct,
        "guesses": sorted_guesses
    }
    
    if is_correct:
        response["message"] = "猜对啦！"
    
    return jsonify(response)

@app.route('/give-up', methods=['POST'])
def give_up():
    return jsonify({
        "status": "success",
        "secret_word": game_state["secret_word"]
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 7860))
    print(f"启动服务器在端口: {port}")
    app.run(host='0.0.0.0', port=port) 