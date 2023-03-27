import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from sklearn.metrics import f1_score, recall_score, precision_score, accuracy_score
from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import KFold


#import subprocess

# Spawn a new Node.js process
#node_process = subprocess.Popen(['node', './app.js'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)

# Send a message to the Node.js process
#message = 'Hello from Python!'
#node_process.stdin.write(message.encode('utf-8'))

# Read the response from the Node.js process
#response = node_process.stdout.readline().decode('utf-8')
#print(response)


# Define dataset class
class TransactionDataset(Dataset):
    def __init__(self, data):
        self.inputs = torch.Tensor(data.iloc[:, 1:].values.astype(np.float32))
        self.labels = torch.Tensor(data.iloc[:, 0].values.astype(np.float32)).view(-1, 1)
        
    def __getitem__(self, index):
        return self.inputs[index], self.labels[index]
    
    def __len__(self):
        return len(self.inputs)

# Load the CSV file using pandas
data = pd.read_csv("/Users/abbalawal/Documents/NNPC1/myenv/Financialprofilenetwork/customer_transactions_train.csv")

# Convert customer names to numerical values using one-hot encoding
data = pd.get_dummies(data, columns=["customer_name"])

# Check data types and convert any non-numeric columns to numeric
data = data.apply(pd.to_numeric, errors='coerce')
data = data.fillna(0)

# Define hyperparameters
learning_rate = 0.001
hidden_size = 64
# num_epochs = 1000
num_epochs = 10
batch_size = 32
n_splits = 5
reg_lambda = 0.01

# Initialize the model
model = nn.Sequential(
    nn.Linear(len(data.columns)-1, hidden_size),
    nn.ReLU(),
    nn.Linear(hidden_size, 1)
)

# Define the loss function and optimizer
criterion = nn.BCEWithLogitsLoss()
optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=reg_lambda)
lr_scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=10, factor=0.1)

# Use k-fold cross-validation to evaluate the model's performance
kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
for fold, (train_index, val_index) in enumerate(kf.split(data)):
    print(f"Fold {fold+1}:")

    # Split data into training and validation sets
    train_data = data.iloc[train_index]
    val_data = data.iloc[val_index]

    # Create dataloaders for training and validation sets
    train_dataset = TransactionDataset(train_data)
    val_dataset = TransactionDataset(val_data)
    train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_dataloader = DataLoader(val_dataset, batch_size=batch_size)

    # Train the model
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

    # Evaluate on train set after each epoch
    train_outputs = model(train_dataset.inputs)
    train_preds = (train_outputs > 0).float()
    train_f1 = f1_score(train_dataset.labels.numpy(), train_preds.numpy(), average='micro')
    train_recall = recall_score(train_dataset.labels.numpy(), train_preds.numpy(), average='micro')
    train_precision = precision_score(train_dataset.labels.numpy(), train_preds.numpy(), average='micro')

    # Evaluate on validation set after each epoch


# Evaluate on validation set after each epoch
    val_outputs = model(val_dataset.inputs)
    val_preds = (val_outputs > 0).float()
    val_f1 = f1_score(val_dataset.labels.numpy(), val_preds.numpy(), average='micro')
    val_recall = recall_score(val_dataset.labels.numpy(), val_preds.numpy(), average='micro')
    val_precision = precision_score(val_dataset.labels.numpy(), val_preds.numpy(), average='micro')
    
    print(f"Training F1 score: {train_f1:.4f}")
    print(f"Training recall score: {train_recall:.4f}")
    print(f"Training precision score: {train_precision:.4f}")
    print(f"Validation F1 score: {val_f1:.4f}")
    print(f"Validation recall score: {val_recall:.4f}")
    print(f"Validation precision score: {val_precision:.4f}")
    lr_scheduler.step(val_f1)
    
# Evaluate the final model on the test set
test_data = pd.read_csv("customer_transactions_test.csv")
test_data = pd.get_dummies(test_data, columns=["customer_name"])
test_data = test_data.apply(pd.to_numeric, errors='coerce')
test_data = test_data.fillna(0)
test_dataset = TransactionDataset(test_data)
test_dataloader = DataLoader(test_dataset, batch_size=batch_size)
test_outputs = model(test_dataset.inputs)
test_preds = (test_outputs > 0).float()
test_f1 = f1_score(test_dataset.labels.numpy(), test_preds.numpy(), average='micro')
test_recall = recall_score(test_dataset.labels.numpy(), test_preds.numpy(), average='micro')
test_precision = precision_score(test_dataset.labels.numpy(), test_preds.numpy(), average='micro')
test_accuracy = accuracy_score(test_dataset.labels.numpy(), test_preds.numpy())

print(f"Test F1 score: {test_f1:.4f}")
print(f"Test recall score: {test_recall:.4f}")
print(f"Test precision score: {test_precision:.4f}")
print(f"Test accuracy score: {test_accuracy:.4f}")

# Check the test output 
test_outputs = model(test_dataset.inputs)
test_preds = (test_outputs > 0).float()
test_data['future_transaction'] = np.where(test_preds.numpy() == 1, 'positive', 'negative')
print(test_data)

def make_prediction(model, test_loader):
    model.eval()
    predictions = []
    with torch.no_grad():
        for i, (inputs, _) in enumerate(test_loader):
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            predictions.append(predicted.numpy())
    predictions = np.concatenate(predictions)
    print("Predicted transactions:", predictions)
    return predictions


