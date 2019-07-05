---
title: CIC Decimator Truncation
draft: post
date: 2019-06-26 20:40:24
tags:
 - dsp
 - radio
 - theory
 - electronics
icon: fa-microchip
---

First post in a long time. I've been designing the SDR (now named Astraea) and a CIC Decimator is chosen to be used in my design. This article explains some insights on optimal truncation in a CIC Decimator. A Python based calculator software is also provided.

## Introduction

I'll skip over the in depth explanation on what a CIC Decimator is. I plan to cover this eventually. Basically a CIC Decimator is a cheap way to reduce the sampling rate of a signal, without the use of any multiplication--it just uses addition and subtraction. This makes it exceptionally useful in performing direct downconversion. Without getting into too much detail, the CIC filter is built with a series of "Integrator" stages and "Comb" stages.

The full explanation of the CIC filter can be obtained by reading ["An Economical Class of Digital Filters for Decimation and Interpolation" by E. Hogenauer](https://www.researchgate.net/publication/3176890_An_economical_class_of_digital_filters_for_decimation_and_interpolation). 

One problem with the CIC technique is that the input grows in size tremendously. For instance, if 16 bits go in, 28 bits may pop out of the filter. Obviously the filter doesn't actually add any new data, and the extra 12 bits can be safely discarded. Doing this will yield okay results, but it has a disadvantage in that it carries the baggage of unnecessary precision all the way until the end. Instead of doing the decimation at the final step, the decimation can fit between each stage of the filter, reducing the bit width of each of the filter stages. 

This is explained in the Hogenauer literature, and it is explained a bit in detail online. There's a MATLAB calculator for this floating around in the web. I don't have MATLAB, and I don't intend to get MATLAB anytime soon, so I made some code that does the same thing in Python.

## CIC Bit Truncation in Simple Words

A single thorough pass of the Hogenauer paper is recommended before reading this part, and I recommend that you open Section IV. B. "Register Growth" before you continue reading.

The section establishes two facts:

>Rounding is not necessary to obtain better performance, unless it is on the first and last stage.

>One can optimally distribute the amount of truncation between CIC stages by making the error incurred by the distributed truncation equal to the error that would be incurred by truncating at the end.

The first part is interesting, but if you just want to get to the results and nod your head at the derivation (like me), it can be taken as granted.

The second part is the real meat of the entire paper because it can lead to large savings in implementation area when implemented on FPGA. Because the explanation for this is interlaced between discussions about whether to round or not, it was quite difficult for me to understand initially, so I hope my explanation helps some other engineer out when they encounter the same problem.

### The Impulse Response

A function \\(h_j[k]\\) is introduced in Equation (9b). This is the "[impulse response coefficients to the] system function from the \\(j\\)th stage up to and including the last stage". That's a mouthful. In other words, instead of the impulse response coefficient from the input to the entire CIC Decimator block to the output of the entire CIC decimator block, Hogenauer decided to split up the impulse response. 

The impulse response of the system from the input of the second stage (or the output of the first stage) to the output of the entire CIC Decimator block is designated as \\(h_1[k]\\), and the impulse response from the input of the third is \\(h_2[k]\\) and so on.

Obviously, the entire system response is equivalent to an N-point moving average filter, but the partial system impulse response look quite different. The expression for the partial system impulse response looks gnarly, but you can just take it for granted.

Also, just as a passing note: the domain of \\(k\\) of \\(h_j[k]\\) is \\([0, (RM-1)N+j-1]\\) for the first case of the piecewise equation and is written in Appendix I near the end.

### Truncation Errors

As mentioned earlier, the goal of the distributed truncation idea is to truncate the bits between each stage such that the resulting error accumulation is equivalent to the error you would get by truncating at the last stage.

To do this, obtaining the error you would get by truncating the last stage would be useful.

Hogenauer assumes that by truncating \\(B_j\\) lowest significant bits (in the paper, at the \\(j\\)th position), you incur an error, with respect to the input LSB, that has a probability distribution equal to the following, which is Equation (12) in the paper:

{% math %}

E_j=\left\{
  \begin{array}{@{}ll@{}}
    0, & \text{if no truncation or rounding} \\
    {2}^{B_j}, & \text{otherwise}
  \end{array}\right.

{% endmath %}

As an example in base-10, if you had an input value of \\(12345\\) and you wanted to truncate 2 digits (analogous to 2 bits in binary), the output value would be \\(12300\\). In this case, we lost \\(45\\) in this process. Furthermore, for all inputs values from \\(12300\\) to \\(12399\\), it would truncate down to \\(12300\\). This means that the maximum error bound is \\(100\\), or \\({10}^{D_j}\\) where \\({D_j}\\) represents the digits we discard (in our case, 2). If the input value is uniformly distributed between those two values, we can say that the error has a uniform probability distribution of \\({10}^{D_j}\\).

A uniform probability distribution means that the variance of the error distribution is equivalent to the following, which is also Equation (13) in the paper:

{% math %}

\sigma_j^2 = \frac{1} {12} E_j^2

{% endmath %}

This is useful for calculating the total error for the case where you do all the truncation at the end, but in the general case where you want to find out the error incurred by truncating an arbitrary amount of bits \\(B_j\\) at the \\(j\\)th stage, you have to take into account the fact that the data with the truncation error is "carried over" with the associated impulse response through each stage.

### Variance Error Gain

The "Variance Error Gain" is introduced, which is simply the multiplicative factor representing the increase of variance as the error from the \\(j\\)th stage propages through the subsequent stages.

Recall that the subsequent stages are represented as a impulse response function \\(h_j[k]\\). 

From the definition of convolution:

{% math %}
\begin{align}
y[k] &= x_j[k] * h_j[k]
\\
y[0] &= x[0] h_j[0] + x[-1] h_j[1] + x[-2] h_j[2] + ... 
\end{align}
{% endmath %}

You can clearly see each sample of \\(x[k]\\) at different points in time, which are inflicted with the same, but indepedent truncation noise are added together with a multiplicative factor equal to the impulse response coefficient. This is equivalent to adding the same truncation noise distribution, except with multiplicative factors.

The formula for adding variances together can be seen here, which was adopted from Wikipedia:

{% math %}
\newcommand{\Var}{\operatorname{Var}}
\Var [aX + bX] = ( a^2 + b^2 ) \Var [X]
{% endmath %}

This basically means that the amount of variance increase by passing through the impulse response, the Variance Error Gain, is equal to the sum of squares of the impulse response coefficients. The total variance of the noise at the \\(j\\)th output of the CIC filter from the contribution of the \\(j\\)th truncation has the Variance Error Gain can be seen in equation (16b) of the paper, reproduced here:

{% math %}

F_j^2=\left\{
  \begin{array}{@{}ll@{}}
    \sum\limits_{k} h_j[k]^2, & j=1,2,...,2N \\
    1, & j=2N+1
  \end{array}\right.

{% endmath %}
 
With the function \\(F_j^2\\), we can get the variance of the noise distribution "contributed by" the \\(j\\)th truncation error source as represented by the symbol \\({\sigma_{T_j}}^{2}\\). The equation (16a) of the paper is reproduced here:

$$
{\sigma_{T_j}}^{2} = {\sigma_{j}}^{2} F_j^2
$$

### Final Steps

Now that we have all the symbols taken care of, we can find the total noise distribution by adding all the noise contributions from each truncation. This is simply the sum of \\({\sigma_{T_j}}^{2}\\) across \\(j\\), as seen in equation 19 of the paper.

There isn't a single solution to distribute the truncation across the stages while meeting the requirements. The paper describes one way, which yields the final equation--Equation (21).

The symbol \\(\sigma_{T_{2N+1}}\\) appears out of the blue though. It represents the standard deviation of the noise you would get if you did all the truncation at the end. It is equivalent to the following:

{%math%}
\begin{align}
\sigma_{T_{2N+1}} &= \sqrt{\frac {1} {12}} E_{\text{total}}
\\
E_{\text{total}} &= 2^{\text{bits to remove}}
\end{align}
{%endmath%}

where \\(E_{\text{total}}\\) represents the total error one would get if all the truncation was done at the end, and the bits to remove represents the amount of bits you want removed in the end.

## Python Implementation

An implementation of the calculation was made using Python. The code can be accessed [here, under my new repository `astraea-tools`](https://github.com/hatsunearu/astraea-tools/blob/master/cic_truncation_calc.py). 