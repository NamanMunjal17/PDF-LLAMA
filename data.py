import json 
import wikipedia
import numpy as np
import csv

with open("squad.json",'r') as file:
    data=json.load(file)

data=data['data']

d=[]
c=0
for i in range(0,len(data)):
    title=data[i]['title']
    print(title)
    try:
        content_of_page=wikipedia.page(title).summary #fetching wikipedia article as its not there in the squad dataset
        questions=data[i]['paragraphs'][0]['qas']
        print(len(questions))
        for j in range(0,len(questions)):
            q=questions[j]['question']
            print(q)
            a=questions[j]['answers'][0]['text']
            d.append(["BELOW IS A PARAGRAPH GO THROUGH IT CAREFULLY AND MAKE QUESTIONS OUT OF IT",content_of_page,q])
            d.append(["BELOW IS A PARAGRAPH GO THROUGH IT CAREFULLY AND ANSWER THE QUESTION ASKED AT THE END",content_of_page+f'QUESTION:{q}',a])
        d.append(["SUMMARISE THE TEXT",wikipedia.page(title).content,wikipedia.page(title).summary])
    except Exception as e:
        print(e)
d=np.array(d)
np.random.shuffle(d)
d=list(d)

with open("squad_processed.csv","w") as file:
    writer=csv.writer(file)
    writer.writerows(d)