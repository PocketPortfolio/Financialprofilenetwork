import random
import pandas as pd
from datetime import datetime, timedelta

# Set parameters
num_users = 5000
start_date = datetime(2022, 1, 1)
end_date = datetime(2022, 6, 30)

# Define function to generate random transactions
def generate_transactions(start_date, end_date):
    num_transactions = random.randint(50, 100)
    transaction_dates = pd.date_range(start_date, end_date, periods=num_transactions)
    transaction_dates = [date.date() for date in transaction_dates]
    transaction_types = ['DEBIT', 'CREDIT']
    transaction_amounts = [random.randint(1, 10000) for i in range(num_transactions)]
    transaction_types = [random.choice(transaction_types) for i in range(num_transactions)]
    transaction_descriptions = ['Transaction {}'.format(i+1) for i in range(num_transactions)]
    transactions = pd.DataFrame({
        'Date': transaction_dates,
        'Type': transaction_types,
        'Amount': transaction_amounts,
        'Description': transaction_descriptions
    })
    return transactions

# Generate transactions for each user
user_statements = []
for i in range(num_users):
    user_id = 'User {}'.format(i+1)
    transactions = generate_transactions(start_date, end_date)
    transactions['User'] = user_id
    user_statement = transactions.groupby(['User', 'Type']).agg({
        'Amount': ['sum', 'count']
    })
    user_statement.columns = ['Total Amount', 'Number of Transactions']
    user_statement = user_statement.reset_index()
    user_statements.append(user_statement)

# Combine user statements into a single statement
statement = pd.concat(user_statements)

# Export statement to CSV
statement.to_csv('bank_statement.csv', index=False)
