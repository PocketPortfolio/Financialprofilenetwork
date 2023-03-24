import csv
import random
import datetime

# define the number of customers and number of months of history
num_customers = 5000
num_months_history = 6

# define the start and end dates of the history period
start_date = datetime.date.today() - datetime.timedelta(days=num_months_history*30)
end_date = datetime.date.today()

# define the list of products
products = ['product_1', 'product_2', 'product_3', 'product_4', 'product_5']

# define the output file name and path
output_file = 'customer_transactions_train.csv'

# write the header row to the output file
header = ['customer_name', 'transaction_date', 'product', 'quantity', 'price']
with open(output_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)

# generate random transaction data for each customer and write to the output file
with open(output_file, 'a', newline='') as f:
    writer = csv.writer(f)
    for i in range(num_customers):
        customer_name = f'C{i+1:04}'
        num_transactions = random.randint(num_months_history, num_months_history*10)
        transaction_dates = sorted([start_date + datetime.timedelta(days=random.randint(0, num_months_history*30)) for _ in range(num_transactions)])
        for j, transaction_date in enumerate(transaction_dates):
            product = random.choice(products)
            quantity = random.randint(1, 10)
            price = random.normalvariate(50, 10)
            transaction_data = [customer_name, transaction_date, product, quantity, price]
            writer.writerow(transaction_data)
