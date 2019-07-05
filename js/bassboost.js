var audioCtx;
var playing = false;

window.addEventListener('load', init, false);
function init() {
  try {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  catch(e) {
    document.getElementById("webaudio_not_available").style.display = "";
    console.log(e);
  }
}

function setup_periodic(freq, coeff) {
  if (!playing) {
    playing = true;

    var oscillator = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
    
    var re = new Float32Array(coeff.length + 1);
    var im = new Float32Array(coeff.length + 1);
    
    re[0] = im[0] = 0;
    
    for (var i=0; i<coeff.length; i++) {
      re[i+1] = coeff[i];
      im[i+1] = 0;
    }
    
    var wave = new PeriodicWave(audioCtx, {real: re, imag: im, disableNormalization: false});
    
    oscillator.setPeriodicWave(wave);
    
    oscillator.connect(gain);
    gain.connect(audioCtx.destination)
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 5.0);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.5)
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + 4.5);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 5.0)
    
    oscillator.onended = function () { playing = false; } 
  }
}


function setup_periodic_adjustable(freq) {
  if (!playing) {
    playing = true;

    var master_gain = audioCtx.createGain();

    
    
    var ranges = [];
    var oscillators = [];
    var gains = [];
    
    for (var i=0; i<6; i++) {
      
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      gains.push(gain)
      var r = document.getElementById("harmonic_" + i);
      gain.gain.setValueAtTime(r.value == 0 ? 1e-10 : r.value / 100.0, audioCtx.currentTime)
      
      r.oninput = (function() {
        var g = gain
        var j = i
        return function(event) {
          
          var el = (event.target || event.srcElement);
          g.gain.setValueAtTime(g.gain.value, audioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime( el.value == 0 ? 1e-10 : el.value / 100.0, audioCtx.currentTime + 0.05);

        }
      }) ();
      
      osc.frequency.setValueAtTime(freq * (i+1), audioCtx.currentTime);
      osc.start(audioCtx.currentTime)
      osc.connect(gain)
      gain.connect(master_gain)
      osc.stop(audioCtx.currentTime + 5.0)
      
      osc.onended = (function () {
        var r_ = r;
        return function () {
          playing = false;  
          r_.oninput = null;
        }
      }) ();
      
    }
    
    master_gain.connect(audioCtx.destination)
    master_gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    master_gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.5)
    master_gain.gain.setValueAtTime(0.2, audioCtx.currentTime + 4.5);
    master_gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 5.0)
    
  }
}