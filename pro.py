from sentence_transformers import SentenceTransformer, util

# Correct full model path
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
import random

with open("words.txt", "r", encoding="utf-8") as f:
    word_pool = [line.strip() for line in f if line.strip()]




while True:
    secret_word = random.choice(word_pool)
    secret_vec = model.encode(secret_word, convert_to_tensor=True)
    while True:
        guess = input("你的猜词：").strip()
        if guess == "退出":
            print(f"你放弃了，秘密词语是：{secret_word}")
            break

        guess_vec = model.encode(guess, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(secret_vec, guess_vec)
        percent = round(float(similarity[0][0]) * 100, 2)

        print(f"相似度：{percent}%")

        if secret_word == guess:
            print("猜对啦！")
            break