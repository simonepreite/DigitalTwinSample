from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import pickle

app = Flask(__name__)

CORS(app, resources={r'/*': {'origins': '*'}})

xls = pd.ExcelFile('ExperimentalDataSet.xlsx')

@app.route('/_get_param')
def get_param():
    run=request.args.get('run')
    key=request.args.get('key')
    df=pd.read_excel(xls,run)
    return jsonify(result=df[key][1:-1].tolist())

@app.route('/_run_simulation')
def run_simulation():
    filename="model.sav"
    data0=[float(i) for i in request.args.get('data0').split(",")]
    data1=[float(i) for i in request.args.get('data1').split(",")]
    data2=[float(i) for i in request.args.get('data2').split(",")]
    data3=[float(i) for i in request.args.get('data3').split(",")]


    simulation_list=[data0, data1, data2, data3]
    simulation=[]
    simulation_notime=[]
    glutamine=[]
    for i in range(0, 1440, 8):
        if i < 368:
            simulation.append([i]+simulation_list[0])
            simulation_notime.append(simulation_list[0])
        elif i >= 368 and i < 728:
            simulation.append([i]+simulation_list[1])
            simulation_notime.append(simulation_list[1])
        elif i >= 728 and i < 1088:
            simulation.append([i]+simulation_list[2])
            simulation_notime.append(simulation_list[2])
        else:
            simulation.append([i]+simulation_list[3])
            simulation_notime.append(simulation_list[3])
        glutamine.append(3)


    reg = pickle.load(open(filename, 'rb'))

    simulation_prediction=[]
    for elem in simulation:
        simulation_prediction.append(reg.predict(np.array([elem])).tolist())

    simulation_notime=np.array(simulation_notime).T.tolist()
    return jsonify(result=(simulation_prediction, simulation_notime, list(range(0, 1440, 8)), glutamine))

@app.route('/old')
def index_2():
    return render_template('./index.html')

@app.route('/')
def index():
    return render_template('./dashboard/index.html')

app.run(debug=True, host='0.0.0.0')
