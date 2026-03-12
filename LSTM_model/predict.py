import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model
import tensorflow as tf
from pathlib import Path
from LSTM_model.dataset import MultiGroupLSTM
import torch
import pickle
from torch.nn.utils.rnn import pad_sequence

class Model:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.LSTM_model = MultiGroupLSTM()
        self.LSTM_model.load_state_dict(torch.load("LSTM_model/multi_group_lstm_weights1.pth"))
        self.LSTM_model.eval()
        with open("LSTM_model/scalergroup1.pkl", "rb") as f:
            self.scaler = pickle.load(f)

    def collate_fn(self, batch):
        X, y = zip(*batch)
        lengths = torch.tensor([len(x) for x in X])
        return (
            pad_sequence(X, batch_first=True),
            pad_sequence(y, batch_first=True),
            lengths
        )

    def probs_LSTM(self, data_for_predict):
        N = data_for_predict
        df = pd.DataFrame(data_for_predict)
        df["dire_fort_alive"] = 1
        df["radiant_fort_alive"] = 1

        # 1. Берём порядок признаков из scaler
        scaler_features = list(self.scaler.feature_names_in_)

        # 2. Проверяем наличие всех признаков
        missing = [col for col in scaler_features if col not in df.columns]
        if missing:
            raise ValueError(f"В X_match отсутствуют колонки: {missing}")

        # 3. Масштабируем признаки
        X_scaled = df.copy()
        X_scaled[scaler_features] = self.scaler.transform(X_scaled[scaler_features])

        # 4. Подготовка данных для модели
        data_item = (
            torch.tensor(X_scaled.values, dtype=torch.float32),
            torch.tensor(np.zeros(len(X_scaled)), dtype=torch.float32)
        )
        X_pad, _, lengths = self.collate_fn([data_item])
        X_pad = X_pad.to(self.device)
        lengths = lengths.to(self.device)

        mask_groups = {
            'econ+comp': [1, 1, 0],
            'econ+obj': [1, 0, 1],
            'comp+obj': [0, 1, 1],
            'all': [1, 1, 1]
        }

        probs_dict = {}

        for mask_name, mask_group in mask_groups.items():
            mask = torch.tensor(mask_group, dtype=torch.float32).to(self.device)

            # Предсказание
            self.LSTM_model.eval()
            with torch.no_grad():
                logits = self.LSTM_model(X_pad, lengths, mask)
                probs = torch.sigmoid(logits)

            # берём последний элемент строки
            value = probs.reshape(-1)[-1].item()

            probs_dict[mask_name] = value

        return probs_dict