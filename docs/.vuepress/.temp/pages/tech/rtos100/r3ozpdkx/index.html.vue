<template><div><p>昨天有位学习RT-Thread的同学咨询了这样一个问题：</p>
<p>他的项目中有两个任务，其功能大致如下。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 任务A */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task_a_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_sem_release</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">sem</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        do_something</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 任务B */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task_b_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_sem_take</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">sem</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_WAITING_FOREVER</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        handle_event</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当任务A调用rt_sem_release()释放了信号量，唤醒正在等待的任务B后，为什么任务B有时会立即执行handle_event()，有时却要等一会儿？</p>
<p>实际上，任务B被唤醒后，何时开始运行，主要取决于任务优先级、调度时机以及当前内核是否允许进行任务切换等多方面的因素。</p>
<h2 id="当前任务的优先级更高" tabindex="-1"><a class="header-anchor" href="#当前任务的优先级更高"><span>当前任务的优先级更高</span></a></h2>
<p>通常，<strong>RTOS支持基于优先级的抢占式调度：只有当就绪队列里出现了比当前任务优先级更高的任务时，才会触发切换</strong>。</p>
<p>也就是说，如果刚唤醒的任务优先级比当前运行的任务低，那它就只能在就绪队列里等着，直至当前任务主动放弃CPU，比如延时、等待信号量。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q40/高优先级任务正在运行.jpg" alt="高优先级任务正在运行"></p>
<p>如上图所示，如果任务A的优先级比任务B高，那么任务A释放信号量后，任务B虽然被唤醒了，但任务A会继续运行，直到任务A主动让出CPU，任务B才有机会运行。</p>
<h2 id="当前处于中断服务程序中" tabindex="-1"><a class="header-anchor" href="#当前处于中断服务程序中"><span>当前处于中断服务程序中</span></a></h2>
<p>除了前面提到的例子，在中断服务程序中也存在类似现象。</p>
<p>例如，我们经常会在串口、定时器或其他外设的中断服务程序中通知任务处理数据。<strong>常见的做法是，在中断处理程序中释放信号量，唤醒负责解析数据的任务。</strong></p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q40/中断服务程序中.jpg" alt="中断服务程序中">
<strong>为了不影响系统的实时性、处理嵌套中断等问题，内核一般会在中断退出、恢复任务上下文的过程中处理必要的调度</strong>。</p>
<p>这就使得即使被唤醒的任务优先级很高，通常也不能直接在中断处理尚未结束时像普通任务一样开始执行。</p>
<h2 id="调度器被锁定" tabindex="-1"><a class="header-anchor" href="#调度器被锁定"><span>调度器被锁定</span></a></h2>
<p>RTOS通常会提供一种特殊接口，用来临时关闭调度器，比如RT-Thread里的rt_enter_critical()。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">rt_enter_critical</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">rt_exit_critical</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div></div></div><p>当关闭调度器后，将不再允许进行任务切换。这样一来，<strong>即使有更高优先级的任务就绪，该任务只能在就绪队列中继续等待，直至调度器重新打开才能运行</strong>。</p>
<h2 id="时间片未到" tabindex="-1"><a class="header-anchor" href="#时间片未到"><span>时间片未到</span></a></h2>
<p>如果刚唤醒的任务和当前运行的任务优先级相同，也不一定会立即切换。</p>
<p>当优先级相同时，RTOS往往采用时间片轮转调度，即每个任务运行一个固定的时间片，时间到了才切换到下一个同优先级任务。<strong>如果当前任务的时间片还没用完，那它就会继续运行，等时间片到了才会轮到刚唤醒的任务</strong>。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q40/同优先级任务.jpg" alt="同优先级任务"></p>
<p>当然，这不代表任务B必须等到任务A的时间片完全耗尽才有机会运行。如果任务A主动让出CPU（调用rt_thread_yield()）、进入阻塞状态等，任务B也可能获得运行机会。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，任务被唤醒后并不一定会立即运行，而是取决于多种因素。常见的因素有四种：当前有更高优先级的任务在运行、正在中断处理中、调度器被锁定、同优先级任务的时间片还没到。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


