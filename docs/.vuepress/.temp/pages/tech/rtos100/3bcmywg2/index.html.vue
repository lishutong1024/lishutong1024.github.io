<template><div><p>对于喜欢探究原理的你来说，当深入分析RTOS的实现之后，你可能会发现：</p>
<blockquote>
<p>几乎所有的RTOS（RT-Thread、FreeRTOS、uC/OS等），都会在系统启动时，自动创建一个叫做&quot;空闲任务&quot;的东西。</p>
</blockquote>
<p>有的同学可能会想：<strong>这个空闲任务到底是做什么的？能不能把它删掉节省资源（TCB和栈）？既然它叫&quot;空闲&quot;任务，是不是意味着它什么都不做？</strong></p>
<p>在这篇文章中，让我们深入了解这个看似&quot;没用&quot;但实际上非常重要的空闲任务。</p>
<h2 id="什么是空闲任务" tabindex="-1"><a class="header-anchor" href="#什么是空闲任务"><span>什么是空闲任务</span></a></h2>
<p>简单来说，<strong>空闲任务（Idle Task）是RTOS在系统启动时自动创建的一个特殊任务，它的优先级是全系统最低的，并且永远处于就绪状态。</strong></p>
<p>例如，RT-Thread在初始化过程中，会通过rt_thread_idle_init()初始化空闲任务：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 初始化空闲任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_idle_init</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 初始化空闲任务的TCB */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_init</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">idle</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">                   "</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">tidle</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">                          /* 任务名称 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                   rt_thread_idle_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">             /* 入口函数 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                   RT_NULL</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">                          /* 入口参数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">                   &#x26;</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">rt_thread_stack</span><span style="--shiki-light:#999999;--shiki-dark:#666666">[</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">],</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">              /* 栈起始地址 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">                   sizeof</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">rt_thread_stack</span><span style="--shiki-light:#999999;--shiki-dark:#666666">),</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">          /* 栈大小 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                   RT_THREAD_PRIORITY_MAX </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">-</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">       /* 最低优先级 */</span></span>
<span class="line"><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">                   10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">                              /* 时间片 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 启动空闲任务，加入就绪队列 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_startup</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">idle</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，该任务的优先级设置为RT_THREAD_PRIORITY_MAX - 1，也就是系统允许的最低优先级。</p>
<p>也就是说：</p>
<blockquote>
<p>当系统中有其他任务就绪时，因为其他任务的优先级都比空闲任务高，空闲任务将得不到运行机会。
只有当系统中所有其他任务都阻塞了（比如都在等待信号量或者处于延时状态），没有任何就绪任务时，空闲任务才运行。</p>
</blockquote>
<p>下面展示了空闲任务与其他任务的调度关系：
<img src="@source/notes/tech/rtos100/kernel/images/q88/空闲任务调度流程图.jpg" alt="空闲任务调度流程图"></p>
<p>空闲任务就像是一个&quot;替补队员&quot;，该队员平时不上场，只有当所有主力队员都下场了，它才上场。而一旦有主力队员回来，它立刻被替换下场。</p>
<h2 id="为什么不能删除空闲任务" tabindex="-1"><a class="header-anchor" href="#为什么不能删除空闲任务"><span>为什么不能删除空闲任务</span></a></h2>
<p>有的同学可能还是会问：那我能不能把它删掉呢？反正它看起来大部分时间都不运行，删掉还能省一点内存。</p>
<p>答案是：<strong>不能删除。</strong></p>
<p>不能删除的原因很简单：</p>
<blockquote>
<p>当系统中所有任务都阻塞（延时）了，此时RTOS内部的就绪队列就会变空，调度器就找不到可运行的任务了。
这时候CPU该干什么呢？它没有指令可以执行，很多RTOS并没有针对这种情况做特殊处理。此时，系统就会跑飞或者进入异常。</p>
</blockquote>
<p>因此，空闲任务的存在就是为了避免出现这种情况。</p>
<p>由于空闲任务永远处于就绪状态，且优先级最低，所以就绪队列永远不会为空。<strong>当没有其他任务就绪时，调度器就运行空闲任务，CPU至少有事可做</strong>。一旦有其他任务就绪，调度器立即抢占空闲任务，运行新就绪的任务。</p>
<h2 id="空闲任务在做什么" tabindex="-1"><a class="header-anchor" href="#空闲任务在做什么"><span>空闲任务在做什么</span></a></h2>
<p>虽然叫&quot;空闲&quot;任务，但实际上，在很多RTOS中，空闲任务并不是什么都不做。</p>
<p>以RT-Thread为例，空闲任务的任务函数实现代码如下（其中rt_thread_idle_hook是一个全局函数指针，用于保存用户注册的空闲钩子函数）：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 空闲任务入口函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_idle_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 第一步：执行空闲钩子函数（如果用户注册了） */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">rt_thread_idle_hook </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">!=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_NULL</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">            rt_thread_idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">#</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">ifdef</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> RT_USING_HEAP</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 第二步：回收已删除任务的资源 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_defunct_cleanup</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">#</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">endif</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通常情况下，空闲任务主要承担以下几项工作，下面分别详细说明。</p>
<h3 id="执行钩子函数" tabindex="-1"><a class="header-anchor" href="#执行钩子函数"><span>执行钩子函数</span></a></h3>
<p><strong>用户可以向RTOS注册一个回调函数（叫做空闲钩子函数），当空闲任务运行时，这个函数就会被调用。</strong></p>
<p>通过空闲钩子函数，用户可以在系统空闲时执行一些自定义的操作，比如喂看门狗、统计CPU使用率、进入低功耗模式等。</p>
<p>在RT-Thread中，通过rt_thread_idle_sethook()函数来设置空闲钩子函数，源码如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 设置空闲钩子函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_idle_sethook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">))</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    rt_thread_idle_hook </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个函数很简单，就是把用户传入的函数指针保存到rt_thread_idle_hook变量中。使用方法如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 定义空闲钩子函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> my_idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 在这里执行自定义操作 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 在初始化中注册空闲钩子 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> main</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_idle_sethook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">my_idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>设置好之后，每当空闲任务运行时，my_idle_hook()就会被调用。下面给出几个常见的应用例子。</p>
<h4 id="例子一-cpu使用率统计" tabindex="-1"><a class="header-anchor" href="#例子一-cpu使用率统计"><span>例子一：CPU使用率统计</span></a></h4>
<p>在空闲钩子中对一个计数器累加，同时用一个定时器记录总时间。通过比较空闲计数和总计数，就能算出CPU的使用率：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_uint32_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> idle_count </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* 空闲计数 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 空闲钩子：每次空闲任务运行时累加 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    idle_count</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">++</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 定时器：每秒计算一次CPU使用率 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> cpu_usage_timer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">param</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    static</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_uint32_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> total_count </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 1000</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* 假设每秒总计数为1000 */</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_uint32_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> usage</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* CPU使用率 = (总时间 - 空闲时间) / 总时间 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    usage </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">total_count </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">-</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> idle_count</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 100</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> /</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> total_count</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_kprintf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">CPU usage: </span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">%d%%\n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> usage</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    idle_count </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* 清零，重新计数 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当系统越忙，空闲任务运行的次数越少，idle_count的值就越小，CPU使用率就越高；系统越闲，空闲任务运行的次数越多，idle_count的值就越大，CPU使用率就越低。</p>
<h4 id="例子二-喂看门狗" tabindex="-1"><a class="header-anchor" href="#例子二-喂看门狗"><span>例子二：喂看门狗</span></a></h4>
<p>在一些对可靠性要求高的系统中，会使用硬件看门狗来监控系统是否正常运行。</p>
<p>喂看门狗的操作可以放在空闲钩子中，因为如果系统太忙导致空闲任务得不到运行，说明系统可能已经异常。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 喂看门狗 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    IWDG_ReloadCounter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="回收已删除任务的资源" tabindex="-1"><a class="header-anchor" href="#回收已删除任务的资源"><span>回收已删除任务的资源</span></a></h3>
<p>当一个任务被删除时，它的TCB和栈空间（如果是动态分配的）并不会立即被释放，而是被标记为&quot;待回收&quot;。<strong>空闲任务在运行时会检查是否有待回收的任务资源，如果有，就将其释放回内存堆</strong>。</p>
<p>之所以这样做，是可以简化任务删除实现上的一些问题。例如，在RT-Thread的空闲任务函数中，调用了rt_thread_defunct_cleanup()进行任务的回收操作。</p>
<h3 id="进入低功耗模式" tabindex="-1"><a class="header-anchor" href="#进入低功耗模式"><span>进入低功耗模式</span></a></h3>
<p>在支持低功耗的系统中，<strong>空闲任务会在运行时进入低功耗模式（比如睡眠模式、停机模式），以节省电能</strong>。当有中断或其他任务就绪时，系统被唤醒，继续正常运行。这是嵌入式设备实现低功耗的常用方式。</p>
<p>最常见的做法是在空闲钩子中进入低功耗模式。当系统空闲时，让CPU进入睡眠状态，节省电能：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 进入睡眠模式，等待中断唤醒 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    __WFI</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* Wait For Interrupt，ARM Cortex-M指令 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="能否在空闲任务中挂起或调用阻塞函数" tabindex="-1"><a class="header-anchor" href="#能否在空闲任务中挂起或调用阻塞函数"><span>能否在空闲任务中挂起或调用阻塞函数</span></a></h2>
<p>那么，<strong>能不能在空闲钩子函数（或空闲任务本身）中调用阻塞函数，比如rt_thread_mdelay()等？</strong></p>
<p>答案是：<strong>绝对不能。</strong></p>
<p>正如前面已经提到的：空闲任务是系统的&quot;兜底&quot;任务，它永远处于就绪状态，保证就绪队列永远不为空。</p>
<blockquote>
<p>如果在空闲任务中调用了阻塞函数，将使得空闲任务从就绪队列中移除，进入阻塞状态。
此时，如果其他任务也都阻塞了，那么将导致就绪队列就空了，CPU再次陷入&quot;无事可做&quot;的状态。</p>
</blockquote>
<p>因此，<strong>在空闲钩子函数中，只能执行非阻塞的操作</strong>，比如：</p>
<ul>
<li>操作硬件寄存器</li>
<li>执行__WFI()进入低功耗</li>
<li>累加计数器、喂看门狗</li>
</ul>
<p>不能调用rt_thread_mdelay()等阻塞函数，更不能调用rt_thread_suspend()挂起空闲任务自己。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，<strong>空闲任务是RTOS在系统启动时自动创建的一个特殊任务，优先级最低，必须永远处于就绪状态</strong>。</p>
<p>它的<strong>存在保证了调度器的就绪队列永远不为空，系统在任何情况下都不会出现&quot;无任务可运行&quot;的异常</strong>。</p>
<p>用户可以通过<strong>空闲钩子函数</strong>在系统空闲时执行自定义操作，比如低功耗、CPU使用率统计等。需要特别注意的是，钩子函数中只能执行非阻塞操作，绝对不能阻塞或挂起空闲任务，否则可能导致系统崩溃。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


