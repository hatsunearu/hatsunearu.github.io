---
title: The Missing Fundamental
date: 2018-04-08 14:00:00 +0000
tags: 
    - dsp 
    - audio 
    - electronics 
    - software
icon: fa-headphones
---

<script src="/js/bassboost.js"></script>

<span id="webaudio_not_available" style='color:#ff6247; display:none'>
You seem to not have WebAudio support on your browser. <br/>
This blog post uses WebAudio, a relatively new feature on your browser to 
demonstrate the subject matter.<br/>
Consider replacing your browser with a modern one, like <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
</span>

## Before We Start

This blog post utilizes WebAudio to dynamically create audio demos to demonstrate
the subject matter. 

It is highly recommended you check your volume because things might get a little loud. 

Finally, it is highly recommended that you use high quality headphones or speakers. Enjoy!

## Introduction

Just as the human vision system can be fooled with the 
help of special edge cases that we call "optical illusions," so can the 
human acoustic system in the form of acoustic illusions. The study of the 
acoustic processing and how we *perceive* sound (as opposed to the physical
audio signal) is called psychoacoustics. 

I will explain (and demonstrate!) the psychoacoustic phenomena called 
the **Missing Fundamental** in this blog post.

## Establishing Fundamentals

Before we discuss the missing fundamental phenomena, we should learn a bit about the basics of 
psychoacoustics. Specifically, let's talk about pitch.

### The Pure Tone

Let's first have a listen at a pure tone, otherwise known as a sinusoid.

<button onclick='setup_periodic(440.0, [1])'>Play Sound</button>

As the name implies, the sinusoid is made up of a repeating sine wave at a specific
frequency, which in this demo is 440Hz, or A4 in the musical scale.

That sounds pretty uninteresting. But do take note about the *pitch* of the sound
you just heard. I can't really describe what pitch is in words, but it's how 
"high" or "low" it sounds, and is the human perception of the frequency of the signal.

### Adding Harmonics

Now try listening to this sound. 

<button onclick='setup_periodic(440.0, [1, 0.5, 0.2])'>Play Sound</button>

That sounded a little different! Feel free to play the two tones back and forth.

The part that's different about those two signals is called
[timbre](https://en.wikipedia.org/wiki/Timbre) in musical terms. It's why
a guitar sounds different to what a piano sounds like even if they play the same
note. 

However, the two sounds are not completely different. You should be able to tell that
the pitch of the two sounds is the same. The timbre is different, but it
somehow *feels* like the same pitch, and you're right.

The sound you heard is actually made up of not only the sinusoid at 440Hz (just like the pure tone)
but also a sinusoid at 880Hz and a sinusoid at 1320Hz all added up together.

You don't hear the constituant sinusoids all on their own, but rather a single sound that 
seems to have a well defined pitch of the fundamental.

Note that the two other tones (880Hz and 1320Hz) have frequencies that are
integer multiples of the lowest tone (440Hz)--two times and three times respectively.

We call the lowest tone the *fundamental* and the two other tones the *harmonics*. The harmonic that
has a frequency double that of the fundamental is called the second harmonic, and the harmonic that's triple
is called the third harmonic, and so on.

## The Missing Fundamental

The previous sound example was made up of three different sinusoids, but the harmonics 
were not the same amplitude as the fundamental. The fundamental had an amplitude of 1.0, 
the second harmonic had an amplitude of 0.5, and the third harmonic had an amplitude of 0.2. 

These numbers are totally arbitrary--pretty much any set of amplitudes will 
make you perceive a pitch of the fundamental.

Try playing with the next bit of code--it lets you modify the relative strength 
of the harmonics. I also added a few more harmonics for you to play with.

For now, keep the fundamental fixed at maximum.

<input id="harmonic_0" type="range" min="0" max="100" value="100"><br/>
<input id="harmonic_1" type="range" min="0" max="100" value="50"><br/>
<input id="harmonic_2" type="range" min="0" max="100" value="20"><br/>
<input id="harmonic_3" type="range" min="0" max="100" value="0"><br/>
<input id="harmonic_4" type="range" min="0" max="100" value="0"><br/>
<input id="harmonic_5" type="range" min="0" max="100" value="0"><br/>

<button onclick='setup_periodic_adjustable(440.0)'>Play Sound</button>

You'll quickly see that they all seem to have the same pitch as the original pure 440Hz tone.

It is as if the brain knows that the harmonics are related to the fundamental 
in integer multiples, and calculates the fundamental all subconsciously. 

Here's the kicker: it turns out you can actually get rid of the fundamental 
and still hear the "missing fundamental."

Try it! Try cranking the harmonics up, and crank the fundamental down to 0. You can
still hear the "missing fundamental" as the pitch!

### Missing Fundamental in the Wild

The missing fundamental is actually used behind the curtains in a lot of applications, but
I think the coolest application of this psychoacoustic phenomena is using it to 
seemingly enhance the bass response of speakers. 

Small speakers tend to have poor bass response--lower frequencies are not reproduced
as well as they should. This is pretty much unavoidable because of just plain old physics. 
Small speaker diaphragms just can't create enough low frequency air waves.

One can exploit the the missing fundamental phenomena by intentionally
creating a lot of harmonics of the bass portions of the audio. The listener would 
then perceive the missing fundamental of the bass harmonics, which is the bass itself.

Stay tuned for a future blog post in which a bass boost demo utilizing the 
missing fundamental will be presented!











