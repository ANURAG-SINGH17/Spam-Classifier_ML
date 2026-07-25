from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import nltk
import string

from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ps = PorterStemmer()

# Load model and vectorizer
model = pickle.load(open('model.pkl', 'rb'))
vectorizer = pickle.load(open('vectorize.pkl', 'rb'))

#input Schema
class MessageInput(BaseModel):
    message:str


#text preprocessing function

def transform_text(text):

    text = text.lower()

    # Tokenization
    text = nltk.word_tokenize(text)

    # Remove special characters
    y = []

    for i in text:
        if i.isalnum():
            y.append(i)

    text = y[:]
    y.clear()

    # Remove stopwords
    for i in text:
        if i not in stopwords.words('english') and i not in string.punctuation:
            y.append(i)

    text = y[:]
    y.clear()

    # Stemming
    for i in text:
        y.append(ps.stem(i))

    return " ".join(y)



@app.get('/')
def root():
    return {'message':'Spam Detection'}

@app.post('/predict')
def predict(data:MessageInput):

    transform_messsage = transform_text(data.message)

    vector_input = vectorizer.transform([transform_messsage])

    prediction = model.predict(vector_input)[0]

    result = "spam" if prediction == 1 else "Not spam"

    return {
        "input":data.message,
        "prediction":result
    }