---
title: Semantic Hunter
emoji: 😻
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
short_description: Semantic Hunter Game
---

Try this: https://huggingface.co/spaces/sunnyball23/Semantic_Hunter 

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference



# Semantic Hunter (词猎人)

A semantic word guessing game using Hugging Face Transformers. The game chooses a random word, and players try to guess it based on semantic similarity.

## How to Play

1. The game selects a random word from the word list
2. You try to guess the word
3. After each guess, you get a semantic similarity percentage
4. Try to find the secret word with the fewest guesses!

## Deploy to Hugging Face Spaces

This application is configured to run on Hugging Face Spaces with Docker:

1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/spaces)
2. Select Docker as the SDK
3. Link your GitHub repository or upload files directly
4. The Space will automatically build and deploy your app

## Development

To run the application locally:

```bash
pip install -r requirements.txt
python app.py
```

The application will be available at http://localhost:7860
