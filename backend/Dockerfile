FROM python:3.11-slim-buster

WORKDIR /app

COPY ./requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8080

CMD [ "flask", "--app", "main", "run" ,"--host=0.0.0.0", "--port=8080"] 

