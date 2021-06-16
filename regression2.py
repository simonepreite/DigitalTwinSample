import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle
import matplotlib.pyplot as plt

def pre_models_dataset(dataset, list_key):
	keys=["Cultivation Time:","Temperature:","pH:","Stirring rate:","Glucose concentration in Feed stream:"]
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


def extract_dataset(dataset, list_key):
	keys=["Cultivation Time:","Temperature:","pH:","Stirring rate:","Glucose concentration in Feed stream:", "Viable Cell Density:", "Ammonium concentration in BR:", "Lactate concentration in BR:"]
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

pre_model_dataset=pre_models_dataset(xls, train_list)
train_dataset, test_dataset=split_dataset(xls, train_list, test_list)
y_prod=[]
for key in train_list:
	df=pd.read_excel(xls, key)
	y_prod=y_prod+(df["Product concentration in BR:"][1:-1].tolist())

y_ammo=[]
for key in train_list:
	df=pd.read_excel(xls, key)
	y_ammo=y_ammo+(df["Ammonium concentration in BR:"][1:-1].tolist())

y_lacta=[]
for key in train_list:
	df=pd.read_excel(xls, key)
	y_lacta=y_lacta+(df["Lactate concentration in BR:"][1:-1].tolist())

y_v_cell=[]
for key in train_list:
	df=pd.read_excel(xls, key)
	y_v_cell=y_v_cell+(df["Viable Cell Density:"][1:-1].tolist())

model_ammo=LinearRegression().fit(pre_model_dataset, y_ammo)
model_lacta=LinearRegression().fit(pre_model_dataset, y_lacta)
model_v_cell=LinearRegression().fit(pre_model_dataset, y_v_cell)

reg = LinearRegression().fit(train_dataset, y_prod)


reg.score(train_dataset, y_prod)
reg.coef_
reg.intercept_
#filename="model.sav"
#pickle.dump(reg, open(filename, 'wb'))
print(reg.score(train_dataset,y_prod))
RUN3=[[36, 6.75, 210, 10], [37, 7.25, 270, 5], [36, 7, 240, 5], [36, 7.25, 210, 10]]
RUN4=[[37, 6.75, 270, 10], [36, 7, 270, 5], [37, 7.25, 210, 17.5], [36, 7.25, 210, 10]]
RUN5=[[37, 7.25, 240, 17.5], [36, 6.75, 240, 10], [36.5, 6.75, 270, 17.5], [37, 6.75, 210, 5]]
RUN6=[[36, 6.75, 240, 5], [37, 7.25, 270, 10], [37, 7.25, 270, 10], [36, 6.75, 240, 5]]
RUN7=[[37, 7, 210, 17.5], [36, 7.25, 240, 17.5], [36, 7, 270, 10], [36.5, 7.25, 270, 17.5]]
RUN8=[[36.5, 6.75, 210, 17.5], [36.5, 7, 240, 17.5], [37, 6.75, 210, 10], [37, 6.75, 240, 17.5]]
RUN9=[[36.5, 7.25, 210, 5], [36.5, 6.75, 270, 10], [36.5, 7.25, 210, 5], [36.5, 7, 270, 5]]
RUN10=[[36.5, 7.25, 240, 10], [36.5, 7, 210, 10], [36.5, 7, 210, 10], [37, 7, 240, 10]]

simulation_list=RUN10
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

ammo_prediction=[]
for elem in simulation:
	ammo_prediction.append(model_ammo.predict(np.array([elem])))
lacta_prediction=[]
for elem in simulation:
	lacta_prediction.append(model_lacta.predict(np.array([elem])))
v_cell_prediction=[]
for elem in simulation:
	v_cell_prediction.append(model_v_cell.predict(np.array([elem])))

simulation_final=[]
for i in range(0, len(ammo_prediction)):
	flat_list=[]
	for j in simulation[i]:
		flat_list.append(j)
	flat_list.append(v_cell_prediction[i].tolist()[0])
	flat_list.append(ammo_prediction[i].tolist()[0])
	flat_list.append(lacta_prediction[i].tolist()[0])
	simulation_final.append(flat_list)



simulation_prediction=[]
for elem in simulation_final:
	simulation_prediction.append(reg.predict(np.array([elem])))

plt.plot(range(0, 1440, 8), simulation_prediction, label="Simulation Product Concentration")
plt.legend()
plt.show()


