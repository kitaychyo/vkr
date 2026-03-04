import pandas as pd
import numpy as np
from pyexpat import features
from sklearn.preprocessing import StandardScaler

class Dataset1():
    def __init__(self):
        data = pd.read_csv('LSTM_model/final_data.csv')

        # bool → int
        for col in data.select_dtypes(include='bool').columns:
            data[col] = data[col].astype(int)

        self.data = data.fillna(0)

        # --- Economy ---
        self.economy_cols = (
            ["minute"] +
            [f"p{i}_is_radiant" for i in range(10)] +
            [f"p{i}_gold" for i in range(10)] +
            [f"p{i}_xp" for i in range(10)] +
            [f"p{i}_kda" for i in range(10)]
        )

        # --- Composition ---
        self.hero_cols = [f"p{i}_hero_id" for i in range(10)]
        self.item_cols = [f"p{i}_slot_{j}" for i in range(10) for j in range(1, 7)]

        self.composition_numeric_cols = (
            ["minute"] +
            [f"p{i}_is_radiant" for i in range(10)]
        )

        # --- Objectives ---
        self.objectives_cols = [
            "minute",
            "radiant_bot_melee_rax_alive", "radiant_bot_range_rax_alive",
            "radiant_bot_t1_alive", "radiant_bot_t2_alive", "radiant_bot_t3_alive",
            "radiant_mid_melee_rax_alive", "radiant_mid_range_rax_alive",
            "radiant_mid_t1_alive", "radiant_mid_t2_alive", "radiant_mid_t3_alive",
            "radiant_top_melee_rax_alive", "radiant_top_range_rax_alive",
            "radiant_top_t1_alive", "radiant_top_t2_alive", "radiant_top_t3_alive",
            "radiant_unknown_t4_alive",
            "roshan_alive"
        ]

        # --- Объединяем колонки для стандартизации ---
        self.all_numeric_cols = self.economy_cols + self.composition_numeric_cols + self.objectives_cols

        # --- Оставляем только колонки, которые реально есть в data, исключаем "minute" ---
        numeric_cols = []
        for c in self.all_numeric_cols:
            if c != "minute" and c in data.columns and c not in numeric_cols:
                numeric_cols.append(c)

        # --- Стандартизируем только если есть данные и колонки ---
        if not data.empty and numeric_cols:
            scaler = StandardScaler()
            self.data[numeric_cols] = scaler.fit_transform(self.data[numeric_cols])



import torch
from torch.utils.data import Dataset, DataLoader
from torch.nn.utils.rnn import pad_sequence

def collate_fn(batch):
    X, y = zip(*batch)
    lengths = torch.tensor([len(x) for x in X])
    return (
        pad_sequence(X, batch_first=True),
        pad_sequence(y, batch_first=True),
        lengths
    )

import torch.nn as nn
import json
def idx(cols):
    with open("LSTM_model/feature_names.json") as f:
        feature_names = json.load(f)
    return [feature_names.index(c) for c in cols]

class MultiGroupLSTM(nn.Module):
    def __init__(self, hidden_dim=128):
        super().__init__()

        dataset_instance = Dataset1()

        data = dataset_instance.data
        hero_cols = dataset_instance.hero_cols
        item_cols = dataset_instance.item_cols
        economy_cols = dataset_instance.economy_cols
        objectives_cols = dataset_instance.objectives_cols
        composition_numeric_cols = dataset_instance.composition_numeric_cols


        max_hero_id = int(data[hero_cols].max().max())
        max_item_id = int(data[item_cols].max().max())

        self.hero_emb = nn.Embedding(
            max_hero_id + 2, 16, padding_idx=0
        )
        self.item_emb = nn.Embedding(
            max_item_id + 2, 8, padding_idx=0
        )

        self.econ_lstm = nn.LSTM(len(economy_cols), hidden_dim, batch_first=True)
        self.obj_lstm  = nn.LSTM(len(objectives_cols), hidden_dim, batch_first=True)

        comp_dim = (
            len(composition_numeric_cols)
            + 10 * 16          # heroes
            + 60 * 8           # items
        )
        self.comp_lstm = nn.LSTM(comp_dim, hidden_dim, batch_first=True)

        self.fc = nn.Linear(hidden_dim, 1)

        self.econ_idx = idx(economy_cols)
        self.obj_idx = idx(objectives_cols)
        self.comp_num_idx = idx(composition_numeric_cols)
        self.hero_idx = idx(hero_cols)
        self.item_idx = idx(item_cols)

    def forward(self, x, lengths, mask):
        if mask.dim() == 1:
            mask = mask.unsqueeze(0).expand(x.size(0), -1)
        B, T, _ = x.shape

        # ECONOMY
        econ = x[:, :, self.econ_idx]
        econ, _ = self.econ_lstm(econ)

        # OBJECTIVES
        obj = x[:, :, self.obj_idx]
        obj, _ = self.obj_lstm(obj)

        # COMPOSITION
        comp_num = x[:, :, self.comp_num_idx]
        hero_ids = x[:, :, self.hero_idx].long()
        hero_ids = hero_ids.clamp(0, self.hero_emb.num_embeddings - 1)
        heroes = self.hero_emb(hero_ids)
        item_ids = x[:, :, self.item_idx].long()
        item_ids = item_ids.clamp(0, self.item_emb.num_embeddings - 1)
        items = self.item_emb(item_ids)

        comp = torch.cat([
            comp_num,
            heroes.view(B, T, -1),
            items.view(B, T, -1)
        ], dim=-1)

        comp, _ = self.comp_lstm(comp)

        fused = (
            econ * mask[:, 0][:, None, None] +
            comp * mask[:, 1][:, None, None] +
            obj  * mask[:, 2][:, None, None]
        )

        return self.fc(fused).squeeze(-1)


model = MultiGroupLSTM()
print(model)