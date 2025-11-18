import pandas as pd
import numpy as np
import re

path = "wikibio_train_filtered2.csv"

df = pd.read_csv(path, dtype =str)

def clean_text(s):
    if pd.isna(s):
        return s
    s = re.sub(r"-lrb-", "(", s, flags=re.IGNORECASE)
    s = re.sub(r"-rrb-", ")", s, flags=re.IGNORECASE)
    s = re.sub(r"-lsb-", "[", s, flags=re.IGNORECASE)
    s = re.sub(r"-rsb-", "]", s, flags=re.IGNORECASE)
    s = re.sub(r"-lcb-", "{", s, flags=re.IGNORECASE)
    s = re.sub(r"-rcb-", "}", s, flags=re.IGNORECASE)
    return s

df["text"] = df["text"].apply(clean_text)
# df["birth_date"] = pd.to_datetime(df["birth_date"], errors="coerce")

print(repr(df.loc[df["name"] == "linda hayden", "birth_date"].iloc[0]))
print(df.head())

df.to_csv("wikibio_train_filtered_final.csv", index=False)


