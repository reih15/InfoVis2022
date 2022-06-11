import pandas as pd

CSV_FILE = "data.csv"
OUTPUT_CSV_FILE = "data_formatted.csv"

df = pd.read_csv(CSV_FILE, index_col=0)
df = df.drop(df.columns[[1, 3, 4, 5, 6]], axis=1)
df = df.dropna(how="any")

# print(df[df.isnull().any(axis=1)])

df.to_csv(OUTPUT_CSV_FILE)
