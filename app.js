const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const _ = require('lodash');
const torch = require('torch');
const nn = require('torch/nn');
const optim = require('torch/optim');
const DataLoader = require('torch/utils/data');
const KFold = require('sklearn/model_selection').KFold;
const f1_score = require('sklearn/metrics').f1_score;
const recall_score = require('sklearn/metrics').recall_score;
const precision_score = require('sklearn/metrics').precision_score;
const accuracy_score = require('sklearn/metrics').accuracy_score;

const port = 3000;

// Define dataset class
class TransactionDataset extends DataLoader.Dataset {
    constructor(data) {
        super();
        this.inputs = torch.tensor(data.iloc[:, 1:].values.astype('float32'));
        this.labels = torch.tensor(data.iloc[:, 0].values.astype('float32')).view(-1, 1);
    }

    __getitem__(index) {
        return [this.inputs[index], this.labels[index]];
    }

    __len__() {
        return this.inputs.length;
    }
}

// Load the CSV file using fs and csv-parser
const data = [];
fs.createReadStream('../Financialprofilenetwork/customer_transactions_train.csv')
    .pipe(csv())
    .on('data', (row) => {
        data.push(row);
    })
    .on('end', () => {
        // Convert customer names to numerical values using one-hot encoding
        const data_df = _.chain(data)
            .map((row) => {
                const encoded_name = `customer_name_${row.customer_name}`;
                return { ...row, [encoded_name]: 1 };
            })
            .value();

        // Check data types and convert any non-numeric columns to numeric
        const columns = _.keys(data_df[0]);
        const numeric_cols = _.filter(columns, (col) => !col.startsWith('customer_name_'));
        const data_np = _.map(data_df, (row) => _.map(numeric_cols, (col) => parseFloat(row[col]) || 0));
        const data_t = torch.tensor(data_np);

        // Define hyperparameters
        const learning_rate = 0.001;
        const hidden_size = 64;
        const num_epochs = 10;
        const batch_size = 32;
        const n_splits = 5;
        const reg_lambda = 0.01;

        // Initialize the model
        const model = new nn.Sequential(
            new nn.Linear(columns.length - 1, hidden_size),
            new nn.ReLU(),
            new nn.Linear(hidden_size, 1),
        );

        // Define the loss function and optimizer
        const criterion = new nn.BCEWithLogitsLoss();
        const optimizer = new optim.Adam(model.parameters(), learning_rate, reg_lambda);
        const lr_scheduler = new optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', 10, 0.1);

        // Use k-fold cross-validation to evaluate the model's performance
        const kf = new KFold(n_splits, true, 42);
        const f1_scores = [];
        const recall_scores = [];
        const precision_scores = [];
        const accuracy_scores = [];

        for (const [train_index, test_index] of kf.split(data
