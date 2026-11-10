<template><div><p>在项目中，我们有时候会希望RTOS在内核运行过程中，执行一些特定的工作，这时候就需要用到钩子函数（Hook）了。</p>
<blockquote>
<p>例如，RTOS里有一个空闲任务，当系统里没有其他任务就绪的时候才运行。
那能不能在系统空闲的时候，让它顺便喂一下看门狗呢？当然可以，这时候就可以用空闲任务钩子。</p>
</blockquote>
<p>那这个钩子函数到底是什么？RTOS里还有哪些钩子？这篇文章将以RT-Thread为例，介绍钩子函数的使用方法。</p>
<h2 id="钩子函数是什么" tabindex="-1"><a class="header-anchor" href="#钩子函数是什么"><span>钩子函数是什么</span></a></h2>
<p>简单来说，<strong>钩子函数就是RTOS内核预留的一些&quot;扩展点&quot;</strong>。</p>
<blockquote>
<p>打个比方，就像你买了一套房子，开发商在客厅、卧室、厨房都预留了电源插座。你想插个电视、插个冰箱，直接往插座上插就行，不需要自己去砸墙布线。钩子函数就是内核给你预留的&quot;插座&quot;。</p>
</blockquote>
<p>同样地，在设计RTOS的时候，开发者会在一些关键的运行位置留一个回调入口。当系统运行到那个位置时，就会检查用户有没有注册对应的钩子函数，如果注册了，就调用一下。</p>
<p><img src="@source/notes/tech/rtos100/kernel/images/q90/钩子函数原理.jpg" alt="钩子函数原理"></p>
<p>这样做的好处是：<strong>不需要修改内核的源码，就能把自己的功能插到内核的运行流程里。</strong></p>
<h2 id="常见的钩子函数" tabindex="-1"><a class="header-anchor" href="#常见的钩子函数"><span>常见的钩子函数</span></a></h2>
<p>不同的RTOS提供的钩子函数不同，这里以RT-Thread为例，介绍两种钩子函数的使用方法及其调用机制。</p>
<h3 id="空闲任务钩子" tabindex="-1"><a class="header-anchor" href="#空闲任务钩子"><span>空闲任务钩子</span></a></h3>
<p>空闲任务钩子是最常用的一种。</p>
<p>在RT-Thread里，空闲任务钩子需要先调用rt_thread_idle_sethook()函数进行注册，完整的使用方式如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 先实现自己的钩子函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> my_idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 系统空闲的时候，就会跑到这里来 */</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 可以在这里喂看门狗、做一些低优先级的后台工作 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> main</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 注册空闲任务钩子 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_idle_sethook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">my_idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注册之后，每当系统进入空闲任务rt_thread_idle_entry()中运行时，内核就会自动调用注册的my_idle_hook()函数。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">// 空闲任务</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_idle_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 略 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">        rt_size_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> i</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">        void</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        for</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">i </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> i </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x3C;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_IDLE_HOOK_LIST_SIZE</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> i</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">++</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        {</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">            idle_hook </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> idle_hook_list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">[</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">i</span><span style="--shiki-light:#999999;--shiki-dark:#666666">];</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">            if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">idle_hook </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">!=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_NULL</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">            {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">                idle_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">            }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 略 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个钩子特别适合做一些低优先级的后台工作，比如统计CPU使用率、喂看门狗、或者做一些不着急的清理工作。</p>
<h3 id="任务切换钩子" tabindex="-1"><a class="header-anchor" href="#任务切换钩子"><span>任务切换钩子</span></a></h3>
<p>任务切换钩子是在每次发生上下文切换的时候调用的。当调度器进行任务切换时，内核会调用任务切换钩子，把当前任务和下一个任务的信息传入钩子函数。</p>
<p>在RT-Thread里，任务切换钩子通过rt_scheduler_sethook()进行注册，完整的使用方法如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 先实现自己的钩子函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> my_scheduler_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_thread </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">from</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_thread </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">to</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 从from任务切到to任务时调用 */</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 可以在这里记录任务切换轨迹、统计每个任务的运行时间 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> main</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 设置调度器钩子 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_scheduler_sethook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">my_scheduler_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>之后，每当系统发生任务切换，内核就会调用my_scheduler_hook()函数，并把切换前的任务和切换后的任务信息都传进来。相关调用示例代码如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_scheduler</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 略 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">from_thread </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">!=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> to_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 调用调度器钩子 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">rt_scheduler_hook </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">!=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_NULL</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">            rt_scheduler_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">from_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> to_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 略 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 执行上下文切换 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_hw_context_switch</span><span style="--shiki-light:#999999;--shiki-dark:#666666">((</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_uint32_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">from_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">sp</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">                            (</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_uint32_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">to_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">sp</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到，在真正执行上下文切换之前，内核会先检查有没有注册调度器钩子，如果有就调用一下，把当前任务和下一个任务都传进去。</p>
<p>这个钩子主要用于调试和性能分析，比如记录每次切换的任务和时间、获取任务栈信息等。</p>
<h2 id="注意事项" tabindex="-1"><a class="header-anchor" href="#注意事项"><span>注意事项</span></a></h2>
<p>由于钩子函数并不是在用户创建的任务中调用执行的，因此在使用钩子函数的时候，有几点需要特别注意。</p>
<p><strong>第一，不能调用可能导致阻塞的API</strong>。例如，空闲钩子不能调用rt_sem_wait()，这将导致空闲任务阻塞，系统就真的没事可干了。</p>
<p><strong>第二，不能执行太耗时的操作</strong>。例如，任务切换钩子是在上下文切换的过程中调用的，如果在里面做复杂的计算，将使得切换时间变长，影响整个系统的实时性。</p>
<h2 id="综上所述" tabindex="-1"><a class="header-anchor" href="#综上所述"><span>综上所述</span></a></h2>
<p>综上所述，钩子函数是RTOS内核预留的扩展点。</p>
<p>它让我们可以在不修改内核源码的情况下，把自定义功能插到内核的关键运行位置。不同的RTOS提供的钩子种类不同，但其核心思路都是类似的。我们在使用的时候，要注意不能调用阻塞API，也不能执行太耗时的操作，否则会影响系统的实时性。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


