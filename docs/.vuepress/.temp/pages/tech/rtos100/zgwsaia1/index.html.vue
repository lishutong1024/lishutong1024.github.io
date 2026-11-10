<template><div><p>很多人刚从裸机转到RTOS的时候，会提出这样一个疑问：</p>
<blockquote>
<p>在裸机里，要实现延时就是写一个循环空转，让CPU在那里干等着，无法做其他事情。
可在RTOS里，需要调用RTOS的延时接口。这时候CPU在干什么呢？是也在空转吗？如果不是，它在做什么？</p>
</blockquote>
<p>在这篇文章中，我就来揭开这个谜底，看看任务延时时，CPU究竟在忙些什么。</p>
<h2 id="任务延时不是空转" tabindex="-1"><a class="header-anchor" href="#任务延时不是空转"><span>任务延时不是空转</span></a></h2>
<p>首先，我们要了解一个基本事实：<strong>RTOS中的任务延时，CPU不是在空转</strong>。</p>
<p><strong>本来，我们使用RTOS是为了提高系统的运行效率，如果CPU仍然在空转，那使用RTOS的意义就降低了。</strong></p>
<p>在裸机编程中，为实现延时，通常的做法是：写一个for循环，循环很多次，等循环结束。也就是说，在这种方式下，CPU将时间花在执行空指令上，什么有用的事情都没做。
<img src="@source/notes/tech/rtos100/schedule/images/q51/裸机延时空转流程图.jpg" alt="裸机延时空转流程图"></p>
<p>而在RTOS中，任务调用延时函数之后，这个任务会主动放弃CPU，进入延时状态。此时，<strong>CPU转去运行其他就绪的任务</strong>。相比之下，RTOS比裸机更加高效：等待的时间用来做别的事情，而不是白白浪费掉。
<img src="@source/notes/tech/rtos100/schedule/images/q51/RTOS任务延时CPU调度流程图.jpg" alt="RTOS任务延时CPU调度流程图"></p>
<h2 id="延时的底层实现过程" tabindex="-1"><a class="header-anchor" href="#延时的底层实现过程"><span>延时的底层实现过程</span></a></h2>
<p>为了真正理解任务延时，我们可以深入RT-Thread的延时函数rt_thread_mdelay()的源码。该函数的代码简化如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_err_t</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_int32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> ms</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_tick_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> tick</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 把毫秒转换成tick数 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    tick </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_tick_from_millisecond</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">ms</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 让当前任务睡眠指定的tick数 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_sleep</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">tick</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_err_t</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_sleep</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_tick_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> tick</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    register</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_base_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> temp</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">    struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_thread </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    temp </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_hw_interrupt_disable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    thread </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_self</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 1. 挂起当前任务，从就绪队列移除 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_suspend</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 2. 设置定时器，时间到了唤醒任务 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_timer_control</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread_timer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">),</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                     RT_TIMER_CTRL_SET_TIME</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">tick</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_timer_start</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread_timer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_hw_interrupt_enable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">temp</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 3. 触发调度，切换到其他任务 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_schedule</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_EOK</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从源码可以看到，当任务调用rt_thread_mdelay()时，首先将延时时间转换成tick数，再调用rt_thread_sleep()。</p>
<p>之后，rt_thread_sleep()进行以下工作：</p>
<ol>
<li>调用rt_thread_suspend()：把当前任务挂起，即从就绪队列中移出。</li>
<li>调用rt_timer_control()：设置一个定时器，记录它需要延时的tick数。</li>
<li>调用rt_schedule()：触发一次任务切换，切换至其他任务运行。</li>
</ol>
<p>也就是说，只有当延时时间到时，任务才会被唤醒并重新获得运行机会，完成延时。<strong>在整个延时过程中，CPU并没有在空转浪费时间</strong>。</p>
<h2 id="运行哪些任务" tabindex="-1"><a class="header-anchor" href="#运行哪些任务"><span>运行哪些任务</span></a></h2>
<p>前面提到，进入延时后，CPU转而去运行其它任务。</p>
<p>那么，有的同学可能就会提出疑问：</p>
<blockquote>
<p>如果系统里所有任务都在延时或者阻塞，这时候CPU运行什么？
答案是：运行空闲任务。</p>
</blockquote>
<p>空闲任务是RTOS启动时创建的一个特殊任务，它的优先级是系统最低的。也就是说，<strong>只有当系统中没有其他任何就绪任务的时候，空闲任务才会运行</strong>。</p>
<p>在RT-Thread中，空闲任务的工作代码（简化版本）如下所示：</p>
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
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>空闲任务除了优先级最低之外，<strong>它总是保持着就绪状态，不会进入阻塞或者延时状态</strong>。</p>
<p>如果确实没有什么事情可做，通常会让CPU进入低功耗模式。比如在ARM Cortex-M中，空闲任务可以执行WFI（Wait For Interrupt）指令，让CPU进入睡眠状态。这样在系统空闲的时候，CPU的功耗可以降到很低。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，我们得知RTOS延时和裸机延时的不同：</p>
<ol>
<li><strong>裸机延时</strong>：CPU在执行空转指令，白白浪费时间，其它什么有用的事情都做不了，功耗也降不下来。</li>
<li><strong>RTOS延时</strong>：CPU转去运行其他任务，让其他任务有运行的机会；甚至进入低功耗模式，降低功耗。</li>
</ol>
<p>通过对比可知：由于RTOS延时能够将CPU切换到其他任务运行，进一步提升了系统的运行效率。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


