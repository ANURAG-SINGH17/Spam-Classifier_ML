from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import nltk
import string

from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from fastapi.middleware.cors import CORSMiddleware

# Force download NLTK data on boot
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ps = PorterStemmer()

# Safe loading
try:
    model = pickle.load(open('model.pkl', 'rb'))
    vectorizer = pickle.load(open('vectorize.pkl', 'rb'))
except Exception as e:
    print(f"Pickle Loading Error: {e}")

class MessageInput(BaseModel):
    message: str

def transform_text(text):
    text = text.lower()
    text = nltk.word_tokenize(text)

    y = []
    for i in text:
        if i.isalnum():
            y.append(i)

    text = y[:]
    y.clear()

    stop_words = set(stopwords.words('english'))
    for i in text:
        if i not in stop_words and i not in string.punctuation:
            y.append(i)

    text = y[:]
    y.clear()

    for i in text:
        y.append(ps.stem(i))

    return " ".join(y)

@app.get('/')
def root():
    return {'message': 'Spam Detection API Working'}

@app.post('/predict')
def predict(data: MessageInput):
    try:
        transform_message = transform_text(data.message)
        vector_input = vectorizer.transform([transform_message])
        prediction = model.predict(vector_input)[0]

        result = "Spam" if prediction == 1 else "Not Spam"

        return {
            "input": data.message,
            "prediction": result
        }
    except Exception as e:
        print(f"Prediction Error Details: {e}")
        # Custom Error detail return karo taaki 500 na bane
        raise HTTPException(status_code=400, detail=str(e))