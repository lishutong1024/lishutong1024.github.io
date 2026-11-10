<template><div><p>在调试RTOS程序时，如果你正在专注地单步跟踪某个函数的执行流程，突然发生了一件“让人讨厌的事情”：</p>
<blockquote>
<p>刚刚调试到一半时，单步调试下一条语句时，程序突然就跳到了另一个任务的代码运行！
这种现像让人感觉非常“恼火”，极大降低了调试效率！</p>
</blockquote>
<p>为什么会出现这种现像？是程序跑飞了吗？</p>
<p>显然不是，而是<strong>RTOS的调度器进行了任务切换，把CPU执行权从当前任务手里拿走，交给了另一个任务</strong>。</p>
<p>那么，一个正在正常执行的任务，究竟在什么情况下会被切换出去呢？在这篇文章中，我将详细介绍四种情况。</p>
<h2 id="任务主动放弃cpu" tabindex="-1"><a class="header-anchor" href="#任务主动放弃cpu"><span>任务主动放弃CPU</span></a></h2>
<p>最常见的情况，是任务自己主动放弃了CPU。</p>
<p>当任务调用了延时函数进行延时，或者等待一个还不可用的信号量，又或者等待消息队列中的消息。这些操作都会让当前任务进入阻塞状态，主动把CPU让出来。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q34/任务主动放弃CPU切换时序图.jpg" alt="任务主动放弃CPU切换时序图"></p>
<p>例如，在RT-Thread中，当某个任务调用rt_thread_mdelay()进行延时，当前任务会进入阻塞状态，高优先级任务开始运行。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 读取传感器数据 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        read_sensor</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 延时100ms, 任务在此处主动放弃CPU */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">100</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="更高优先级的任务就绪" tabindex="-1"><a class="header-anchor" href="#更高优先级的任务就绪"><span>更高优先级的任务就绪</span></a></h2>
<p><strong>如果出现了一个更高优先级的就绪任务，也会发生任务切换，也就是抢占式调度。</strong></p>
<p>这种情况通常发生在中断处理过程中。如下图所示，一个低优先级任务正在运行，此时产生了中断，中断处理程序里调用了释放信号量、发送消息等接口，而正在等待的任务优先级比当前运行的任务更高。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q34/中断中高优先级抢占时序图.jpg" alt="中断中高优先级抢占时序图"></p>
<p>此时，即使低优先级任务没有主动放弃CPU，RTOS也会在中断返回前进行一次调度检查。一旦发现有更高优先级的任务就绪，就会立即把CPU切换给高优先级任务。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> uart_isr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 读取接收到的数据 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    uint8_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> data </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> uart_read_byte</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 释放信号量, 唤醒等待数据的任务 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_sem_release</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">uart_sem</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="时钟节拍中断" tabindex="-1"><a class="header-anchor" href="#时钟节拍中断"><span>时钟节拍中断</span></a></h2>
<p>RTOS依赖一个周期性的时钟中断来维护系统时间。</p>
<p>在每个时钟节拍中断里，除了检查有没有延时到期的任务外，还会执行时间片轮转调度。</p>
<p>也就是说，<strong>当系统中有多个相同优先级的任务时，RTOS可以让它们轮流使用CPU，每个任务运行一个固定的时间片，时间片用完了就强制切换到下一个同优先级任务</strong>。这样可以保证同优先级的任务都能获得CPU时间，不会出现一个任务一直占着CPU不放的情况。
<img src="@source/notes/tech/rtos100/schedule/images/q34/时间片轮转顺序示意图.jpg" alt="时间片轮转顺序示意图"></p>
<p>因此，一个正在运行的任务，即使它没有主动放弃CPU，也没有更高优先级的任务就绪，它的时间片一旦用完，同样会被切换出去。</p>
<h2 id="任务退出或被删除" tabindex="-1"><a class="header-anchor" href="#任务退出或被删除"><span>任务退出或被删除</span></a></h2>
<p>最后一种情况，任务执行完毕退出，或者被其他任务删除。</p>
<p>在这种情况下，任务主动或被动放弃CPU执行权，其所占用的资源会被回收。</p>
<p>例如，在下面的代码中，监控任务调用rt_thread_delete()删除工作任务。当工作任务被删除后，内核立即切换其他任务运行。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> monitor_task</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">error_count </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">></span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">            /* 错误次数过多, 删除工作任务 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">            rt_thread_delete</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">worker_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1000</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> worker_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">	while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">		do_work</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">	}</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，一个正常执行的任务被切换出去，主要有以下几种情况：</p>
<ul>
<li><strong>任务主动放弃CPU</strong>：调用延时、等待信号量等阻塞型API时，当前任务进入阻塞态。</li>
<li><strong>更高优先级的任务就绪</strong>：中断释放信号量、发送消息等操作，可能让更高优先级任务就绪，发生抢占。</li>
<li><strong>时钟节拍中断</strong>：当前任务的执行时间片用完，切换至其他任务运行。</li>
</ul>
<p>此外，当任务执行完毕退出，或被其他任务删除，也会发生任务切换。</p>
<p>现在你可能理解了：本文开头提到的其实是一种“正常”现像，有可能是当前任务的时间片用完或者发生了高优先级抢占导致。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


