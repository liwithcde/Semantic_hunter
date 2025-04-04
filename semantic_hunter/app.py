from flask import Flask, render_template, request, jsonify
import random
from sentence_transformers import SentenceTransformer, util
import torch
import os

app = Flask(__name__)

# Load model
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

# Load word pool
with open("../words.txt", "r", encoding="utf-8") as f:
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
    app.run(debug=True) 