import pandas as pd
import os
from collections import defaultdict
import numpy as np

root = "wikipedia-biography-dataset"

TARGET_FIELDS = {
    "name",
    "birth_date",
    "birth_place",
    "death_date", 
    "death_place",
    "nationality",
    "occupation",
}
def parse_infobox(line):
    fields = defaultdict(list)
    tokens = line.strip().split()
    for tok in tokens: 
        if ":" not in tok: 
            continue
        key_pos, value = tok.split(":", 1)
        if not value or value == "<none>":
            continue
        if "_" in key_pos: 
            key, _ = key_pos.rsplit("_", 1)
        else: 
            key = key_pos
        
        if key in TARGET_FIELDS: 
            fields[key].append(value)
    
    return {k: " ".join(v) for k, v in fields.items()}
        
def load_train_subset():
    path = os.path.join(root, "train")

    ids = open(os.path.join(path, "train.id"), encoding="utf-8").read().splitlines()
    titles = open(os.path.join(path, "train.title"), encoding="utf-8").read().splitlines()
    boxes = open(os.path.join(path, "train.box"), encoding="utf-8").read().splitlines()
    nb = list(map(int, open(os.path.join(path, "train.nb"), encoding="utf-8").read().splitlines()))
    sentences = open(os.path.join(path, "train.sent"), encoding="utf-8").read().splitlines()
    paragraphs = []
    idx = 0
    for n in nb:
        paragraphs.append(" ".join(sentences[idx:idx+n]))
        idx += n
    rows = []
    for i in range(len(ids)):
        infobox = parse_infobox(boxes[i])
        row = {
            "text": paragraphs[i],
        }
        for field in TARGET_FIELDS:
            row[field] = infobox.get(field, np.nan)
        rows.append(row)
    return rows


data = load_train_subset()

df = pd.DataFrame(data)

df.to_csv("wikibio_train_filtered2.csv", index=False)