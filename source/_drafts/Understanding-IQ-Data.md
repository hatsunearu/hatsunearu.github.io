---
title: Understanding IQ Data
tags: 
 - dsp
 - radio
 - theory
 - electronics
icon: fa-broadcast-tower
---

IQ data, otherwise known in many names like quadrature data, complex data, and 
"[in-phase and quadrature components](https://en.wikipedia.org/wiki/In-phase_and_quadrature_components)",
is ubiquotous in radio engineering, digital signal processing, and in related fields.
However, when I was doing my studies, I took a hilariously unreasonable amount
of time understanding this concept; looking back, I feel like the way this
concept is taught in various places is suboptimal. 

I hope I'm not the only one with the problem, and I want to share what I think
is the correct way to think about IQ data.

## The Old Way

The vast majority of the explanations for IQ data opens with a bit of math. 
It's simply extending the concept of sinusoids into complex exponentials, which
I feel like it's fairly straightforward as long as you understand (or just accept)
Euler's Identity. 

Here's an article that uses this type of explanation from NI: [What is I/Q Data](http://www.ni.com/tutorial/4805/en/)

Some try to show the concept with pictures and graphs, which I agree that it helps,
but still feels incomplete: [I/Q Data for Dummies](http://whiteboard.ping.se/SDR/IQ)

Once you understand the concept, you'll realize these explantions make a ton of
sense and has a lot of really good meat behind it. However, if you were like me,
you still might not understand *why* it's needed, and therefore, you don't feel 
confident that you'll be able to use it effectively.

For example, from the second article, there's this paragraph:

{% blockquote %}
First, it is impossible to determine the frequency of this signal. Sure, it looks simple enough, just look at the period length? True, but you have no clue if it's a positive or negative frequency since they both generate the same curve. I.e. cos(x) = cos(-x). This becomes a problem working with the signal. Mixing (multiplying) two signals and it'll cause multiple solutions due to the uncertainty of the sign: f1 ⊗ f2 equals f1 + f2 as well as f1 - f2.
{% endblockquote %}

When I first saw this, I was overwhelmed with confusion. Here were some thoughts
I had back then:

{% blockquote %}
* How can there be a negative frequency *in real life*? I get that you can put a
negative number in place of frequency in the canonical sinusoidal equation of 
$\cos(2 \pi f t)$, but in what circumstance does that appear? 
* How do negative frequencies present themselves when mixing? 
* What happens if I don't use IQ data when mixing?
{% endblockquote %}

These questions might seem awfully silly once you understand the concept well,
but I feel like this is a pain point in learning IQ data. I want to show an 
alternative way of learning this concept, with real-life examples as the central
crux.