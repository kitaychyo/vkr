import joblib
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
import tensorflow as tf
from tensorflow import keras
from pathlib import Path

class Model:
    def __init__(self):
        base_dir = Path(__file__).resolve().parent

        self.LSTM_model = tf.keras.models.load_model(
            base_dir / "LSTM_model_growing_sequences2.keras",
            compile=False
        )

        self.features_to_keep = joblib.load(base_dir / "features_to_keep.pkl")
        self.scaler = joblib.load(base_dir / "scaler.pkl")

        self.MAX_MINUTE = 35
        self.n_features = len(self.features_to_keep)

    def probs_LSTM(self, data_for_predict):
        N = data_for_predict
        df = pd.DataFrame(data_for_predict)
        df["dire_fort_alive"] = 1
        df["radiant_fort_alive"] = 1

        X_lstm_raw = df[self.features_to_keep].values.astype(float)
        X_scaled = self.scaler.transform(X_lstm_raw)

        # Паддим до MAX_MINUTE
        padded_seq = np.zeros((self.MAX_MINUTE, self.n_features), dtype=float)
        seq_len = min(len(X_scaled), self.MAX_MINUTE)
        padded_seq[:seq_len] = X_scaled[-seq_len:]  # теперь ошибки нет

        X_lstm_input = np.expand_dims(padded_seq, axis=0)
        probs_LSTM = self.LSTM_model.predict(X_lstm_input)

        return probs_LSTM[0, seq_len-1, 0]