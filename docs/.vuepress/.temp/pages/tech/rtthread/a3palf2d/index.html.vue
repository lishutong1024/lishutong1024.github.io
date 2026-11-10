<template><div><blockquote>
<p>为了更好地使用RTOS，我们需要深入理解RTOS工作原理，最好的方法是动手写一个RTOS。</p>
<p>如果你希望写一个类似RT-Thread/FreeRTOS的系统，欢迎关注这门课程：<a href="https://zw8ls.xetlk.com/s/H2F1Y" target="_blank" rel="noopener noreferrer">【RTOS内核开发】从0手写嵌入式操作系统</a></p>
</blockquote>
<h2 id="祼机开发的概念" tabindex="-1"><a class="header-anchor" href="#祼机开发的概念"><span>祼机开发的概念</span></a></h2>
<p>祼机开发是一种在没有操作系统支持的情况下，直接对硬件进行编程的嵌入式开发方式。其核心特点包括高实时性、低资源占用和直接硬件控制。这种方式的特点表现为：</p>
<ul>
<li>没有任务调度器</li>
<li>没有线程、进程概念</li>
<li>所有功能和流程都由开发者自己管理</li>
</ul>
<font style="color:#2F4BDA;">简单来说，就是无操作系统支持，我们需要编写所有代码直接控制硬件来实现设计目标。</font>这种方式也是大多数同学学习嵌入式最早接触到的一种开发方式。<p>这种方式的典型逻辑结构框图如下所示：</p>
<p><img src="/image/docs/notes/tech/rtthread/use/c2/bare/image.png" alt="alt text"></p>
<font style="color:#2F4BDA;">从该框图可以看出：除初始化以外的所有操作，均在main函数中的主循环内顺序反复执行。</font><h2 id="裸机开发示例-点灯-接收串口数据" tabindex="-1"><a class="header-anchor" href="#裸机开发示例-点灯-接收串口数据"><span>裸机开发示例：点灯 + 接收串口数据</span></a></h2>
<p>下面是一个典型的裸机代码片段。该代码的功能为：根据按键，来控制LED灯的亮灭。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">#</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">include</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77"> "</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">../base.h</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> main</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    hardware_init</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665">key_pressed</span><span style="--shiki-light:#999999;--shiki-dark:#666666">())</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">            led_set</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">LED0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375"> else</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">            led_set</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">LED0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于祼机开发而言，所有的逻辑都在 while(1) 或for(;😉)主循环中轮询处理。这种开发方式的优点有：简单、直观、资源占用小，比较适合简单功能的项目，但一旦系统复杂，就会遇到瓶颈和挑战。</p>
</div></template>


