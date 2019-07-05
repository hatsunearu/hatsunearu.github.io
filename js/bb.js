/* global limit */
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var src = null;

window.onload = function () {
    var audio = document.querySelector("audio");
    src = audioCtx.createMediaElementSource(audio);
    src.connect(audioCtx.destination);
    
    brickwallLimiter = audioCtx.createScriptProcessor(4096, 1, 1);
    brickwallLimiter.onaudioprocess = limit;
    
    // draw some initial states for the bass oscilloscope
    var canvas = document.querySelector('#bassCanvas');
    var canvasCtx = canvas.getContext("2d");
    
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    canvasCtx.moveTo(0, canvas.height/2);
    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
    
    setup_harmonicsview();
    
}

window.onresize = function() {
    Plotly.Plots.resize(gd);
};

function filechanged(e) {  
    var target = e.currentTarget;
    var file = target.files[0];
    
    if (target.files && file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('playersrc').setAttribute('src', window.URL.createObjectURL(file));
            document.getElementById('audioname').innerText = file.name;
            document.getElementById('audiorestoremiku').style.display = "inline-block";
            var p = document.getElementById('player');
            p.load();
            p.pause();
            p.currentTime = 0;
        }
        reader.readAsDataURL(file);
    }
}

function restoremiku(e) {
    document.getElementById('audioname').innerText = "Using sample audio";
    document.getElementById('audiorestoremiku').style.display = "none";
    document.getElementById('playersrc').setAttribute('src', "/blob/sound.mp3");
    document.getElementById("file").value = "";
    var p = document.getElementById('player');
    p.load();
    p.pause();
    p.currentTime = 0;
}


function setup_src() {
    var audio = document.querySelector("audio");
    if (src==null) {
        src = audioCtx.createMediaElementSource(audio);
    }
    src.disconnect();
    
    if (audio.paused || audio.currentTime == 0) {
        audio.play();
    }
    
    return src;
}


function bh(btn, filter) {
    var is_selected = btn.classList.contains('selected');
    
    document.querySelectorAll(".demogroup button").forEach(function (b) {
       b.classList.remove('selected') 
    });
    
    window.cancelAnimationFrame(drawVisual);
    
    if (is_selected) {
        document.querySelector("audio").pause();
        set_harmonic_gain = function (gain) { };
    }
    else {
        btn.classList.add('selected');
        filter();
    }
    
}


function gndtruth() {
    var src = setup_src();
    src.connect(audioCtx.destination);
}

function filter_helper(input_node, type, freq, num) {
    
    var prev_node = input_node;
    
    for (var i = 0; i < num; i++) {
        var biquadFilter = audioCtx.createBiquadFilter();
        biquadFilter.type = type;
        biquadFilter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        prev_node.connect(biquadFilter);
        prev_node = biquadFilter;
    }
    return prev_node;
}

function ssemul() {
    var src = setup_src();
    
    filter_helper(src, 'highpass', 300, 1).connect(compressor_dest());
    
}
function bassonly() {
    var src = setup_src();
    
    filter_helper(src, 'lowpass', 300, 3).connect(compressor_dest());
}



var drawVisual;
var draw;

function bassanalysis() {
    
    window.cancelAnimationFrame(drawVisual);

    var src = setup_src();
    
    var filtered = filter_helper(src, 'lowpass', 300, 3);
    
    var compressed = brickwallLimiter;
    filtered.connect(compressed);
    
    var analyzer = audioCtx.createAnalyser();
    compressed.connect(analyzer);
    analyzer.connect(audioCtx.destination);
    
    var canvas = document.querySelector('#bassCanvas');
    var canvasCtx = canvas.getContext("2d");
    
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    analyzer.fftSize = 2048;
    var bufferLength = analyzer.fftSize;
    var dataArray = new Uint8Array(bufferLength);
    
    // TODO use closure here
    draw = function(timestamp) {

      drawVisual = requestAnimationFrame(draw);

      last = timestamp;

      analyzer.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

      canvasCtx.beginPath();

      var sliceWidth = canvas.width * 1.0 / bufferLength;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * canvas.height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
     
    };
    
    draw();
    
    
}

var gd; 
function setup_harmonicsview() {

    var d3 = Plotly.d3;

    var gd3 = d3.select("#harmonics_view")
    
    gd = gd3.node();
    
    var x = new Array(1024);
    var y = new Array(1024);
    
    for (var i=0; i<x.length; i++) {
        x[i] = 2* i / x.length;
        y[i] = Math.sin(x[i] * 2 * Math.PI);
    }


    var MAX_HARMS = 15;
    
    
    var frames = [
        {
            name: "0",
            data: [{x: x, y: y.slice(0)}]
        }];
    for (var j = 1; j <= MAX_HARMS; j++) {
        var cur_harm = new Array(1024);
        for (var i=0; i<y.length; i++) {
            y[i] += Math.sin(x[i] * 2 * Math.PI * (2*j+1)) / (2*j+1)
            cur_harm[i] = y[i];
        }
        frames.push({
          name: j.toString(),
          data: [{x: x, y: cur_harm}]
        })
    }
    
    
    var sliderSteps = [];
      for (var i = 0; i <= MAX_HARMS; i++) {
        sliderSteps.push({
          method: 'animate',
          label: i,
          args: [[i], {
            mode: 'immediate',
            transition: {duration: 100},
            frame: {duration: 100, redraw: false},
          }]
        });
      }
    
    var data = [{
        x: x, 
        y: x.map(x => Math.sin(x * 2 * Math.PI)), 
        type: 'scatter',
        line: {simplify: false}
    }];
    
    
    var layout = {  
    sliders: [{
      pad: {l: 0, t: 55},
      currentvalue: {
        visible: true,
        prefix: 'Number of Harmonics:',
        xanchor: 'right',
        font: {size: 20, color: '#666'}
      },
      steps: sliderSteps
                        
    }],
    margin: {
        l: 40,
        r: 10,
        b: 40,
        t: 40,
        pad: 0,
        autoexpand:true
    },
    xaxis: {
        title: 'Time',
        zeroline: true
    },
    yaxis: {
        title: 'Amplitude',
        showline: true
    }
    };
    Plotly.newPlot(gd, data,layout).then(
        function () {
            Plotly.addFrames(gd, frames);
        });
}

function update_harmonicsview(num_harmonics) {
    

    Plotly.animate(gd, [], {mode: 'next'});

    
    var x = new Array(1024);
    var y = new Array(1024);
    for (var i=0; i < x.length; i++) {
        x[i] = 2 * i / x.length;
        y[i] = 0;
        
        for (var j=0; j < num_harmonics; j++) {
            y[i] += Math.sin(x[i] * 2 * Math.PI * (2*j+1)) / (2*j+1);
        }
    }
    
    document.getElementById('harmonics_number').textContent = num_harmonics; 
    
    Plotly.animate('harmonics_view', {
    data: [{x: x, y: y}],
    traces: [0],
    layout: {}
    }, {
    transition: {
      duration: 100,
      easing: 'cubic-in-out'
    }
    })
}

function create_atsr() {
    
    var waveshaper_len = 4096;
    
    var curve = new Float32Array(waveshaper_len);
    var x;
    
    for (var i = 0; i < waveshaper_len; i++) {
        
        x = 2 * i / waveshaper_len - 1; 
        
        curve[i] = 2.5 * Math.atan(0.9 * x) + 2.5 * Math.sqrt(1 - Math.pow(0.9 * x, 2)) - 2.5;
        
    }
    
    var max = Math.max.apply(Math, curve.map(Math.abs));
    curve = curve.map(x => x / max);
    
    return curve;
    
}

function create_exp2() {
    var waveshaper_len = 4096;
    
    var curve = new Float32Array(waveshaper_len);
    var x;
    
    for (var i = 0; i < waveshaper_len; i++) {
        
        x = 2 * i / waveshaper_len - 1; 
        
        curve[i] = (Math.E - Math.exp(1-x)) / (Math.E - 1); 
        
    }
    var max = Math.max.apply(Math, curve.map(Math.abs));
    curve = curve.map(x => x / max);
    return curve;
}

function play_nonlinear_filter(curve, ftype) {
    
    return () => {
        var src = setup_src();  
        
        var pregain = audioCtx.createGain();
        src.connect(pregain);
        
        var biquadFilter = filter_helper(pregain, 'lowpass', 300, 3);
        
        var distortion = audioCtx.createWaveShaper();
        
        distortion.curve = curve;
        distortion.oversample = "4x";
        
        biquadFilter.connect(distortion);
        
        var postgain = audioCtx.createGain();
        distortion.connect(postgain);
        
        var v = document.getElementById('player').volume;
        
        if ( v == 0.0 ) {
            pregain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
            return;
        }
        
        // undo the volume set by <audio>
        pregain.gain.linearRampToValueAtTime(1.0 / v, audioCtx.currentTime + 0.01);
        // redo the volume set by <audio>
        postgain.gain.linearRampToValueAtTime(v, audioCtx.currentTime + 0.01);
        
        
        // hack to make the nonlinear function gain-invariant
        // the HTML5 audio player volume changes the input signal amplitude
        // into the nonlinear block
        var p = document.getElementById('player');
        p.onvolumechange = function (e) {
            var v = (e.target || e.srcElement).volume;
            
            if ( v == 0.0 ) {
                pregain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
                return;
            }
            
            // undo the volume set by <audio>
            pregain.gain.linearRampToValueAtTime(1.0 / v, audioCtx.currentTime + 0.01);
            // redo the volume set by <audio>
            postgain.gain.linearRampToValueAtTime(v, audioCtx.currentTime + 0.01);
        }
        
        if (ftype === '') {
            postgain.connect(compressor_dest());
        }
        
        else if (ftype === 'hp') {
            var hpFilter = filter_helper(postgain, 'highpass', 300, 3);
            hpFilter.connect(compressor_dest());
        }
        
        else if (ftype === 'hplp') {
            var hpFilter = filter_helper(postgain, 'highpass', 300, 3);
            
            var lpFilter = filter_helper(hpFilter, 'lowpass', 3000, 1);
            lpFilter.connect(compressor_dest());
        }
        
    };
}

var postgain;

function bb_final(curve) {
    
    return () => {
        var src = setup_src();  
        
        // low frequency path
        var pregain = audioCtx.createGain();
        src.connect(pregain);
        
        var lpfilter = filter_helper(pregain, 'lowpass', 300, 3);
        
        pregain.connect(lpfilter);
        
        var distortion = audioCtx.createWaveShaper();
        
        distortion.curve = curve;
        distortion.oversample = "4x";
        
        lpfilter.connect(distortion);
        
        postgain = audioCtx.createGain();
        distortion.connect(postgain);
        
        var v = document.getElementById('player').volume;
        
        if ( v == 0.0 ) {
            pregain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
            return;
        }
        
        // undo the volume set by <audio>
        pregain.gain.linearRampToValueAtTime(1.0 / v, audioCtx.currentTime + 0.01);
        // redo the volume set by <audio>
        postgain.gain.linearRampToValueAtTime(v, audioCtx.currentTime + 0.01);
        
        // hack to make the nonlinear function gain-invariant
        // the HTML5 audio player volume changes the input signal amplitude
        // into the nonlinear block
        
        var p = document.getElementById('player');
        p.onvolumechange = function (e) {
            var v = e.target.volume;
            
            if ( v == 0.0 ) {
                pregain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
                return;
            }
            
            // undo the volume set by <audio>
            pregain.gain.linearRampToValueAtTime(1.0 / v, audioCtx.currentTime + 0.01);
            // redo the volume set by <audio>
            postgain.gain.linearRampToValueAtTime(v, audioCtx.currentTime + 0.01);
        }
        
        
        var hpFilter = filter_helper(postgain, 'highpass', 300, 3)
        
        var lpFilter = filter_helper(hpFilter, 'lowpass', 3000, 1)
        hpFilter.connect(lpFilter);

        
        var harmonicGain = audioCtx.createGain();
        
        var init_harmonic_gain = Math.pow(10, parseInt(document.getElementById('harmonic_gain').value) / 20)
        harmonicGain.gain.linearRampToValueAtTime(init_harmonic_gain, audioCtx.currentTime + 0.001)
        set_harmonic_gain = (gain) => { harmonicGain.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 0.01) };
        
        lpFilter.connect(harmonicGain);

        
        //high frequency path
        var highFilter = filter_helper(postgain, 'highpass', 300, 1)
    
        src.connect(highFilter);
        

        
        
        var dest = compressor_dest();
        harmonicGain.connect(dest);
        highFilter.connect(dest);
        
    };
}

var brickwallLimiter;


function compressor_dest(dest) {
    
    brickwallLimiter.connect(audioCtx.destination);
    
    return brickwallLimiter;
        
}

var set_harmonic_gain = function (gain) { };

function update_harmonic_gain(e) {
  var gaindb = parseInt((e.target || e.srcElement).value);
  document.getElementById("harmonic_gain_label").innerHTML = gaindb + " dB";
  
  set_harmonic_gain(Math.pow(10, gaindb / 20.0));
}