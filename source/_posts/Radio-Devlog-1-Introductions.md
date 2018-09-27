---
layout: post
title: "Radio Devlog #1: Introductions"
date: 2018-09-16 01:42:52
tags: 
    - dsp
    - ham
    - electronics
    - rf
    - devlog
    - radio_devlog
icon: fa-microchip
---

## Where I Began

I think my first contact with electrical engineering might have been the Portal
ARG. To tease the sequel to Portal, Portal 2, Valve's software developers retrofitted 
some neat artifacts into the original Portal game to hint what is coming up. 

The initial artifacts were strange "radio" transmissions within the game Portal,
revealed by taking the bedside radio to certain locations. Take a look at a 
[video here](https://www.youtube.com/watch?v=91LB9ssE__k) showing what's going on.
There's some Morse code and this weird thing called SSTV--a cool ham radio tech
that lets you send pictures at a very slow rate over radio. I've never seen this
before, and it instantly captured my attention. How the heck can you use audio
to transmit images? That sounded like straight up magic to me.

![An SSTV image from the Portal ARG. This was encoded using audio.](/blob/pictures/Dinosaur2.png)

This, as far as I can tell, was my first peek behind the massive curtain of 
abstractions that is electronics, with SSTV being a synecdoche. I understood
nothing, but I did know that using a radio and being able to communicate without
using any existing infrastructure is just cool as heck. That seeded an interest
in electronics and technology into me, and I promised to myself that I'll take
a look at ham radio when I get the opportunity.

Fast forward to college. The first club I joined in college was unsurprisingly 
the ham radio club, to finally dip my feet in the hobby that started it all. 
My first "recreational" code written was a 
[pitifully simple modification](https://github.com/hatsunearu/pisstvpp)
to an existing SSTV transmission program written for the Raspberry Pi. 
I got myself an Amateur Extra license. I've done a few contacts with the club 
radio, and went to interesting club events like our Field Day.
I knew the next logical step and a really cool challenge to myself would be
to create my own radio.

My electronics skills aren't terrible, but they aren't amazing (yet!) either. I knew that
RF engineering was cool ever since I started seriously learning electronics because
of its intricacy and difficulty, but precisely because of that, it flew right over my head. 
But I think I've gained just enough knowledge to tackle designing my very own radio, 
a challenge that was seeded when I took a look at the fateful SSTV pictures.

I know I'm not immediately ready to design all the parts and write all the necessary
software to crank this radio design out. There are many, many things to learn 
before that happens. Instead of doing it myself quietly, I want to share my 
experience with the world. Hopefully this helps someone design their own radio, or
perhaps this will be the Portal ARG for them. I also think that it will be really
fun to look back on this series and see what my thoughts were. I hope this
becomes an enjoyable read for those of you who are interested (including my future self!)

## The Game Plan

First of all, I have to mention that I am in a really weird spot to work on 
personal projects. If you know me IRL, you might know what I'm talking about, but
I currently have very limited access to my personal computer, and using various 
software is cumbersome and awkward. I can't reveal why right now, but I will 
let you guys know when this state is lifted, which isn't until May 2019. 
Meanwhile, I plan to do the basic architecture, parts selection, necessary
learning, and execution planning to get it working once my full capabilities are 
restored. 

My EDA/CAD package of choice is KiCAD. KiCAD has been the package of choice
for me ever since I designed circuits, and I'm very comfortable with it.
I had a brief thought about using more industry standard EDA packages
like Altium or Cadence so I can get more marketable skills, but I don't want to 
blow my budget before I even begin. Maybe I'll learn when I save up some money.

I'll be using LTSpice for my circuit simulations. It's free and I'm used to it.

I like using Python for basically everything. I've used it for a long time and 
I think it's pretty darn good for what I expect to do, and it's more accessible
than for instance MATLAB. I don't have a license for MATLAB so let's hope I am not 
forced to use it. 

As for test equipment, I have a Rigol DS1054Z scope, hacked of course to get
that 100MHz bandwidth, and that's all I have right now. I plan to get a cheap 
DDS signal generator, a logic analyzer, and a power supply. 

## Design Goals

Here are some of the design goals I'd like to meet in my design.

Since handheld VHF/UHF ham radios are quite common and extremely cheap because of
their commodity status outside of ham radio, most dirt-poor hams like myself most 
definitely have one. Unfortuately that's all the equipment I have.

Therefore, giving myself MF/HF capabilities, which I don't have unless I use
club equipment, would be really neat. 

{% blockquote %}
I want my radio to have 160m - 10m all-mode receive-transmit capabilities.
{% endblockquote %}

There do exist homebrew radio designs that already fill this particular space. 
The [SoftRock RXTX Ensemble](http://fivedash.com/index.php?main_page=product_info&products_id=7)
is one of those. This particular kit cannot switch bands without modifying the filters, though
one could easily modify the design to allow the filters to be switched using
RF switches.

I initially intended to take the SoftRock design and improve upon it, but the 
one problem I have with it is the amount of manual tweaking I'd have to do to
get the filters just right. From my basic analysis, omitting these filters can
harm the recieve spur performance. Not only that, the filters require manual
winding of the magnetics. 

Handmade magnetics isn't a huge problem, but I'm wondering if I can make a radio 
that requires minimal manual labor *making* components. I realize that using 
commodity parts instead of handmade parts may cost more or harm performance,
but I am willing to accept that downside.

{% blockquote %}
I want my radio to require minimal component tweaking and manual work.
{% endblockquote %}

I have no problems soldering SMD. It seems like a lot of the ham radio kits
avoid SMD components because of their difficulty. SMD components that are 
reasonably hand solderable is fair game for my design. I'll set the bar as the
following: this includes TSSOP/QFP packages but excludes DFN/BGA packages. 

{% blockquote %}
SMD components are allowed, provided they are reasonably easy to hand-solder.
{% endblockquote %}

Of course, the radio must conform to ham radio standards.

{% blockquote %}
The radio should comply with ham radio regulations imposed by the FCC.
{% endblockquote %}

These aren't tall requirements, nor are they concrete; however if things go south and
I can't meet them, I want to mention that there is a possiblity that these 
goals may be relaxed in the future.

## Conclusions

Since this is my first devlog, I'll just keep it nice and short. I hope this 
series continues to motivate me to make this radio, and I hope all you readers
accompany me in this journey.