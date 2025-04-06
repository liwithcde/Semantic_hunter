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

# Game state
game_state = {
    "secret_word": "",
    "secret_vec": None,
    "guesses": [],
    "latest_guess": None
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/new-game', methods=['POST'])
def new_game():
    global game_state
    # Reset game state
    game_state["secret_word"] = random.choice(word_pool)
    game_state["secret_vec"] = model.encode(game_state["secret_word"], convert_to_tensor=True)
    game_state["guesses"] = []
    game_state["latest_guess"] = None
    
    return jsonify({"status": "success", "message": "New game started"})

@app.route('/guess', methods=['POST'])
def guess():
    data = request.json
    guess_word = data.get('guess', '').strip()
    
    if not guess_word:
        return jsonify({"status": "error", "message": "No guess provided"})
    
    # Encode the guess
    guess_vec = model.encode(guess_word, convert_to_tensor=True)
    
    # Calculate similarity
    similarity = util.pytorch_cos_sim(game_state["secret_vec"], guess_vec)
    percent = round(float(similarity[0][0]) * 100, 2)
    
    # Check if correct
    is_correct = (game_state["secret_word"] == guess_word)
    
    # Update latest guess
    game_state["latest_guess"] = guess_word
    
    # Store guess
    game_state["guesses"].append({
        "word": guess_word,
        "similarity": percent,
        "is_correct": is_correct,
        "is_latest": True
    })
    
    # Update previous guesses to not be latest
    for i in range(len(game_state["guesses"]) - 1):
        if "is_latest" in game_state["guesses"][i]:
            game_state["guesses"][i]["is_latest"] = False
    
    # Sort guesses by similarity (descending)
    sorted_guesses = sorted(game_state["guesses"], key=lambda x: x["similarity"], reverse=True)
    
    response = {
        "status": "success",
        "similarity": percent,
        "is_correct": is_correct,
        "guesses": game_state["guesses"],
        "latest_guess": guess_word
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