FROM python:3.10

ENV TRANSFORMERS_CACHE=/app/hf_cache
ENV HF_HOME=/app/hf_cache

WORKDIR /app
COPY . /app

RUN mkdir -p /app/hf_cache && chmod -R 777 /app/hf_cache

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 7860
ENV PORT=7860

CMD ["python", "app.py"]
