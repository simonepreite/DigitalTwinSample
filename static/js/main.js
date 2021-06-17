var ctx = undefined;
var ctx1 = undefined;
var ctx2 = undefined;
var ctx3 = undefined;
var ctx4 = undefined;
var ctx5 = undefined;
var ctx6 = undefined;
var ctx7 = undefined;
var myChart = undefined;
var myChart1 = undefined;
var myChart2 = undefined;
var myChart3 = undefined;
var myChart4 = undefined;
var myChart5 = undefined;
var myChart6 = undefined;
var myChart7 = undefined;

const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
  azzurro: "rgb(0, 255, 255)",
  black: "rgb(0,0,0)"
};

$(document).ready(function(){
ctx = $('#canv');
ctx1 = $('#canv1');
ctx2 = $('#canv2');
ctx3 = $('#canv3');
ctx4 = $('#canv4');
ctx5 = $('#canv5');
ctx6 = $('#canv6');
ctx7 = $('#canv7')
})


function get_values(run, key){
  var values;
  var request_data = {
      run: run,
      key: key
  }
  $.ajax({
      type: "GET",
      url: "http://localhost:5000/_get_param",
      data: request_data,
      async: false,
      success: function(res){
        values=res["result"];
      },
      error: function(err){
        console.log("error");
      },
    });

  return values
}

function set_data_graph(time, label, data, color){
  data={
    labels: time,
    datasets:[
      {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        stepped: true,
      }
    ]
  };

  return data;
}

function set_config_graph_small(type, data, label, animation){
  data={
    type: type,
    data: data,
    options: {
      animation,
      responsive: true,
      interaction: {
        intersect: false,
        axis: 'x'
      },
      plugins: {
        title: {
          display: false,
          text: (ctx) => label,
        }
      }
    }
  };

  return data;
}

function set_config_graph(type, data, labels, colors, animation){
  var data_list=[]
  for (i = 0, len = data.length; i < len; i++) {
    var tmp={
      label:labels[i],
      borderColor:colors[i],
      borderWidth:1,
      radius:0,
      data:data[i]
    };
    data_list.push(tmp);
  }

  data={
    type: type,
    data: {
      datasets: data_list
    },
    options: {
      animation,
      interaction: {
        intersect: false
      },
      plugins: {
        legend: true
      },
      scales: {
        x: {
          type: 'linear'
        }
      }
    }
  };

  return data;
}

function set_animation_graph(delayBetweenPoints, ctx, previousY){
  animation = {
      x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) {
            return 0;
          }
          ctx.xStarted = true;
          return ctx.index * delayBetweenPoints;
        }
      },
      y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) {
            return 0;
          }
          ctx.yStarted = true;
          return ctx.index * delayBetweenPoints;
        }
      }
  };
  return animation;
}


function check_and_print(char, context, config){
  if(char) char.destroy();
  if(config) return new Chart(context,config);
}

function PrintGraph(id){

  var time;
  var product;
  var temperature;
  var ph;
  var sr;
  var glutamina_input;
  var glucose_input;
  var dead_cell;
  var cell;
  const data_product = [];
  const data_viable_cell = []
  const data_dead_cell = []
  var data_time = [];


  time=get_values(id, "Cultivation Time:");
  product=get_values(id, "Product concentration in BR:");
  temperature=get_values(id, "Temperature:");
  ph=get_values(id, "pH:");
  sr=get_values(id, "Stirring rate:");
  cell=get_values(id, "Viable Cell Density:");
  dead_cell=get_values(id, "Dead Cell Density:");
  glucose_input=get_values(id, "Glucose concentration in Feed stream:");
  glutamina_input=get_values(id, "Glutamine concentration in Feed stream:");

  console.log(Math.max(...product))

  for (i = 0, len = time.length; i < len; i++) {
    data_product.push({x:time[i], y: product[i]});
    data_viable_cell.push({x:time[i], y: cell[i]});
    data_dead_cell.push({x:time[i], y: dead_cell[i]});
  }

  data_time=set_data_graph(time, "Temperature", temperature, CHART_COLORS.blue);
  data_ph=set_data_graph(time, "pH", ph, CHART_COLORS.green);
  data_sr=set_data_graph(time, "Stirring Rate", sr, CHART_COLORS.azzurro);
  data_glucose=set_data_graph(time, "Glucose in Feed Rate", glucose_input, CHART_COLORS.yellow);
  data_glutamina=set_data_graph(time, "Glutamine in Feed Rate", glutamina_input, CHART_COLORS.orange);
  const totalDuration = 10000;
  const delayBetweenPoints = totalDuration / data_product.length;
  const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
  const animation=set_animation_graph(delayBetweenPoints, ctx, previousY);
  const config_product=set_config_graph('line', [data_product], ['Product Concentration'], [CHART_COLORS.red], animation);
  const config_cell=set_config_graph('line', [data_viable_cell, data_dead_cell], ['Viable Cell Concentration', 'died Cell Concentration'], [CHART_COLORS.purple, CHART_COLORS.black], animation);
  const config_temp = set_config_graph_small('line', data_time, 'Temperature', animation);
  const config_ph = set_config_graph_small('line', data_ph, 'pH', animation);
  const config_sr = set_config_graph_small('line', data_sr, 'sr', animation);
  const config_glucose=set_config_graph_small('line', data_glucose, "Glucose Input", animation);
  const config_glutamina=set_config_graph_small('line', data_glutamina, "Glutamine Input", animation);


  myChart=check_and_print(myChart, ctx, config_temp);
  myChart1=check_and_print(myChart1, ctx1, config_ph);
  myChart2=check_and_print(myChart2, ctx2, config_sr);
  myChart3=check_and_print(myChart3, ctx3, config_glucose);
  myChart4=check_and_print(myChart4, ctx4, config_glutamina);
  myChart5=check_and_print(myChart5, ctx5, config_product);
  myChart6=check_and_print(myChart6, ctx6, config_cell);

}

function PrintProductAll(){
  var run_list=['Run1','Run2','Run3','Run4','Run5','Run6','Run7','Run8','Run9','Run10'];

  var color_list=[CHART_COLORS.red, CHART_COLORS.red, CHART_COLORS.red, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.azzurro, CHART_COLORS.yellow, CHART_COLORS.blue, CHART_COLORS.grey];
  time=get_values('Run1', "Cultivation Time:");

  var prod_list = []
  for (i = 0, len = 10; i < len; i++) {
    product=get_values(run_list[i], "Product concentration in BR:");
    const data_product = [];
    for (j = 0, len2 = time.length; j < len2; j++) {
      data_product.push({x:time[j], y: product[j]});
    }
    console.log(i);
    prod_list.push(data_product);
  }

  const totalDuration = 9000;
  const delayBetweenPoints = totalDuration / prod_list[0].length;
  const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
  const animation=set_animation_graph(delayBetweenPoints, ctx, previousY);
  const config_all=set_config_graph('line', prod_list, run_list, color_list, animation);
  myChart7=check_and_print(myChart7, ctx7, config_all);
}

function PrintSimulation(){
  const data_product=[];
  var sim_data_0 = $("#sim_data_0").val();
  var sim_data_1 = $("#sim_data_1").val();
  var sim_data_2 = $("#sim_data_2").val();
  var sim_data_3 = $("#sim_data_3").val();
  console.log(sim_data_0, sim_data_1,sim_data_2,sim_data_3)
  var request_data = {
    data0: sim_data_0,
    data1: sim_data_1,
    data2: sim_data_2,
    data3: sim_data_3
  }

  $.ajax({
      type: "GET",
      url: "http://localhost:5000/_run_simulation",
      data: request_data,
      async: false,
      success: function(res){
        result=res["result"];
        prediction=result[0];
        simulation=result[1];
        console.log(simulation)
        time=result[2];
        glutamine=result[3];

        for (i = 0, len = time.length; i < len; i++) {
          data_product.push({x:time[i], y: prediction[i]});
        }

        data_time=set_data_graph(time, "Temperature", simulation[0], CHART_COLORS.blue);
        data_ph=set_data_graph(time, "pH", simulation[1], CHART_COLORS.green);
        data_sr=set_data_graph(time, "Stirring Rate", simulation[2], CHART_COLORS.azzurro);
        data_glucose=set_data_graph(time, "Glucose in Feed Rate", simulation[3], CHART_COLORS.yellow);
        data_glutamina=set_data_graph(time, "Glutamine in Feed Rate", glutamine, CHART_COLORS.orange);

        const totalDuration = 10000;
        const delayBetweenPoints = totalDuration / data_product.length;
        const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
        const animation=set_animation_graph(delayBetweenPoints, ctx, previousY);

        const config_temp = set_config_graph_small('line', data_time, 'Temperature', animation);
        const config_ph = set_config_graph_small('line', data_ph, 'pH', animation);
        const config_sr = set_config_graph_small('line', data_sr, 'sr', animation);
        const config_glucose=set_config_graph_small('line', data_glucose, "Glucose Input", animation);
        const config_glutamina=set_config_graph_small('line', data_glutamina, "Glutamine Input", animation);
        const config_product=set_config_graph('line', [data_product], ['Product Concentration'], [CHART_COLORS.red], animation);

        myChart=check_and_print(myChart, ctx, config_temp);
        myChart1=check_and_print(myChart1, ctx1, config_ph);
        myChart2=check_and_print(myChart2, ctx2, config_sr);
        myChart3=check_and_print(myChart3, ctx3, config_glucose);
        myChart4=check_and_print(myChart4, ctx4, config_glutamina);
        myChart5=check_and_print(myChart5, ctx5, config_product);
        myChart6=check_and_print(myChart6, ctx6, null);
      },
      error: function(err){
        $("#modal_error").show();
        console.log("error");
      },
    });


}
