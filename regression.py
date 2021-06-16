import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle
import matplotlib.pyplot as plt


def extract_dataset(dataset, list_key):
	keys=["Cultivation Time:","Temperature:","pH:","Stirring rate:","Glucose concentration in Feed stream:"]#, "Glucose concentration in BR:", "Glutamine concentration in BR:", "Ammonium concentration in BR:"]
	#keys=["Cultivation Time:","Temperature:","pH:","Stirring rate:", "Feeding Rate:", "Perfusion Rate:", "Bleed Rate:", "Glucose concentration in Feed stream:", "Glucose concentration in Feed stream:"]
	dataset_to_return=[]
	for elem in list_key:
		tmp = []
		df=pd.read_excel(dataset, elem)
		for key in keys:
			tmp.append(df[key][1:-1])
		nplist=np.array(tmp).T.tolist()
		for elem in nplist:
			dataset_to_return.append(elem)
	return np.array(dataset_to_return)

def split_dataset(dataset, list_train, list_test):
	train_dataset=extract_dataset(dataset, list_train)
	test_dataset=extract_dataset(dataset, list_test)
	return train_dataset, test_dataset


sheets_list=['Run1','Run2','Run3','Run4','Run5','Run6','Run7','Run8','Run9','Run10']
xls = pd.ExcelFile('ExperimentalDataSet.xlsx')
df1 = pd.read_excel(xls, 'Run1')

train_list=['Run3','Run4','Run5','Run6','Run7','Run8']
test_list=['Run9','Run10']

train_dataset, test_dataset=split_dataset(xls, train_list, test_list)
y=[]
for key in train_list:
	df=pd.read_excel(xls, key)
	y=y+(df["Product concentration in BR:"][1:-1].tolist())

reg = LinearRegression().fit(train_dataset, y)
reg.score(train_dataset, y)
reg.coef_
reg.intercept_
filename="model.sav"
pickle.dump(reg, open(filename, 'wb'))
print(reg.score(train_dataset,y))
simulation_list=[[36.5, 7.25, 240, 10], [36.5, 7, 210, 10], [36.5, 7, 240, 10], [37, 7, 240, 10]]
simulation=[]
for i in range(0, 1440, 8):
	if i < 368:
		simulation.append([i]+simulation_list[0])
	elif i >= 368 and i < 728:
		simulation.append([i]+simulation_list[1])
	elif i >= 728 and i < 1088:
		simulation.append([i]+simulation_list[2])
	else:
		simulation.append([i]+simulation_list[3])

simulation_prediction=[]
for elem in simulation:
	simulation_prediction.append(reg.predict(np.array([elem])))

plt.plot(range(0, 1440, 8), simulation_prediction, label="Simulation Product Concentration")
plt.legend()
plt.show()

print(reg.predict(np.array([[1440, 36, 7.25, 210, 10]])))

