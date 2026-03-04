import torch.nn as nn

def idx(cols):
    return [feature_names.index(c) for c in cols]

class MultiGroupLSTM(nn.Module):
    def __init__(self, hidden_dim=128):
        super().__init__()


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
        B, T, _ = x.shape

        # ECONOMY
        econ = x[:, :, self.econ_idx]
        econ, _ = self.econ_lstm(econ)

        # OBJECTIVES
        obj = x[:, :, self.obj_idx]
        obj, _ = self.obj_lstm(obj)

        # COMPOSITION
        comp_num = x[:, :, self.comp_num_idx]
        heroes = self.hero_emb(x[:, :, self.hero_idx].long())
        items = self.item_emb(x[:, :, self.item_idx].long())

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
