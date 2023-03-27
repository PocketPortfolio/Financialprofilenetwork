import json
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from sklearn.metrics import f1_score, recall_score, precision_score, accuracy_score
from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import KFold


class TransactionDataset(Dataset):
    def __init__(self, data):
        self.inputs = torch.Tensor(data.iloc[:, 1:].values.astype(np.float32))
        self.labels = torch.Tensor(data.iloc[:, 0].values.astype(np.float32)).view(-1, 1)
        
    def __getitem__(self, index):
        return self.inputs[index], self.labels[index]
    
    def __len__(self):
        return len(self.inputs)


data = pd.read_csv("/Users/abbalawal/Documents/NNPC1/myenv/Financialprofilenetwork/customer_transactions_train.csv")
data = pd.get_dummies(data, columns=["customer_name"])
data = data.apply(pd.to_numeric, errors='coerce')
data = data.fillna(0)

learning_rate = 0.001
hidden_size = 64
num_epochs = 10
batch_size = 32
n_splits = 5
reg_lambda = 0.01

model = nn.Sequential(
    nn.Linear(len(data.columns)-1, hidden_size),
    nn.ReLU(),
    nn.Linear(hidden_size, 1)
)

criterion = nn.BCEWithLogitsLoss()
optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=reg_lambda)
lr_scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=10, factor=0.1)

# Define dictionary to store results
results = {
    'training_f1': [],
    'training_recall': [],
    'training_precision': [],
    'validation_f1': [],
    'validation_recall': [],
    'validation_precision': [],
    'test_f1': 0.0
}

kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
for fold, (train_index, val_index) in enumerate(kf.split(data)):
    print(f"Fold {fold+1}:")

    train_data = data.iloc[train_index]
    val_data = data.iloc[val_index]

    train_dataset = TransactionDataset(train_data)
    val_dataset = TransactionDataset(val_data)
    train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_dataloader = DataLoader(val_dataset, batch_size=batch_size)

    for epoch in range(num_epochs):
        for i, (inputs, labels) in enumerate(train_dataloader):
            optimizer.zero_grad()

            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            # Backward and optimize
            loss.backward()
            optimizer.step()

            if (i+1) % 100 == 0:
                print("Epoch [{}/{}], Step [{}/{}], Loss: {:.4f}"
                      .format(epoch+1, num_epochs, i+1, len(train_dataloader), loss.item()))

        train_outputs = model(train_dataset.inputs)
        train_preds = (train_outputs > 0).float()
        train_f1 = f1_score(train_dataset.labels.numpy(), train_preds.numpy(), average='micro')
        train_recall = recall_score(train_dataset.labels.numpy(), train_preds.numpy(), average='micro')
        train_precision = precision_score(train_dataset.labels.numpy(), train_preds.numpy(), average='micro')

        # Store training metrics
        results['training_f1'].append(train_f1)
        results['training_recall'].append(train_recall)
        results['training_precision'].append(train_precision)
