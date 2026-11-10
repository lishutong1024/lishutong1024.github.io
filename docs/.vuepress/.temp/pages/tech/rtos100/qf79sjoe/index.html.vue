<template><div><p>假设在RT-Thread中，有A、B、C三个任务，它们在不同的时间先后去等待同一个信号量。这个时候，另外一个任务D连续三次释放了这个信号量。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q45/引入场景.jpg" alt="引入场景"></p>
<p>那么，请问，A、B、C这三个任务，谁会先被唤醒？谁会后被唤醒？它们的唤醒次序是按照什么策略来决定的呢？</p>
<p>要回答这个问题，我们就需要了解：信号量内部的等待队列是怎么组织任务的、唤醒机制和策略是什么？</p>
<h2 id="信号量的等待队列" tabindex="-1"><a class="header-anchor" href="#信号量的等待队列"><span>信号量的等待队列</span></a></h2>
<p>为了让任务能够在信号量上等待，每个信号量内部都会维护一个等待队列。</p>
<p><strong>当任务调用等待函数发现信号量不可用的时候，内核就会把这个任务从就绪队列移到信号量的等待队列里，然后让任务进入阻塞状态。</strong></p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q45/信号量内部的等待队列.jpg" alt="信号量内部的等待队列"></p>
<p>因此，当A、B、C任务都在等待同一个信号量时，这些任务都在该等待队列里排队。当D释放信号量的时候，内核就从等待队列里选一个任务出来唤醒。</p>
<p>那到底选哪个呢？这取决于等待队列的组织方式，主要有两种策略：FIFO策略和优先级策略。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q45/两种唤醒策略.jpg" alt="两种唤醒策略"></p>
<p>下面将分别介绍这两种策略。</p>
<h2 id="fifo策略-先等的先醒" tabindex="-1"><a class="header-anchor" href="#fifo策略-先等的先醒"><span>FIFO策略：先等的先醒</span></a></h2>
<p>第一种策略是FIFO，也就是先进先出。</p>
<p><strong>在这种策略下，等待队列就是一个普通的链表，任务按照进入等待队列的先后顺序排列</strong>。<strong>释放信号量的时候，内核就从队列头部取出第一个任务</strong>，也就是等得最久的那个任务，将该任务唤醒。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q45/FIFO策略的唤醒机制.jpg" alt="FIFO策略的唤醒机制"></p>
<p>正如上图所示，任务A最先进入等待队列，然后是任务B，最后是任务C。当任务D连续三次释放信号量的时候，第一次唤醒的是任务A，第二次唤醒的是任务B，第三次唤醒的是任务C。</p>
<p>因此，在FIFO策略下，唤醒顺序是：A→B→C，该顺序仅与谁先进入等待队列有关。</p>
<p>这种策略的好处是：<strong>公平，先来后到</strong>，坏处是：<strong>低优先级任务可能相对高优先级任务先唤醒，这可能影响系统实时性</strong>。</p>
<h2 id="优先级策略-优先级高的先醒" tabindex="-1"><a class="header-anchor" href="#优先级策略-优先级高的先醒"><span>优先级策略：优先级高的先醒</span></a></h2>
<p>第二种策略是优先级策略。</p>
<p>在这种策略下，<strong>等待队列中的任务是按照优先级排序的，优先级高的任务排在队列前面。释放信号量的时候，内核就取出队列头部任务（优先级最高）来唤醒</strong>。</p>
<p><img src="@source/notes/tech/rtos100/schedule/images/q45/优先级策略的唤醒机制.jpg" alt="优先级策略的唤醒机制"></p>
<p>正如上图所示，虽然任务A最先进入等待队列，但是任务B的优先级最高（优先级数值5），任务C次之（优先级数值8），任务A最低（优先级数值10）。所以等待队列会按照优先级重新排序，任务B排在最前面，然后是任务C，最后是任务A。</p>
<p>当任务D连续三次释放信号量的时候，唤醒顺序是：B→C→A，该顺序仅与任务的优先级有关。</p>
<p>这种策略的好处是：<strong>保证高优先级任务能优先获得资源，符合实时系统的设计目标</strong>，坏处是：<strong>可能出现总是唤醒高优先级任务、低优先级任务可能一直等不到，出现&quot;饥饿&quot;现象</strong>。</p>
<h2 id="不同rtos的实现" tabindex="-1"><a class="header-anchor" href="#不同rtos的实现"><span>不同RTOS的实现</span></a></h2>
<p>很多RTOS同时支持这两种策略，在RT-Thread中，创建信号量的时候，可以通过flag参数指定等待队列的组织方式：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_sem_t</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_sem_create</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">const</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> char</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">name</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_uint32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> value</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_uint8_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> flag</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>其中flag参数可以取以下两个值：</p>
<ol>
<li><strong>RT_IPC_FLAG_FIFO</strong>：采用FIFO策略，按照任务进入等待队列的先后顺序唤醒。</li>
<li><strong>RT_IPC_FLAG_PRIO</strong>：采用优先级策略，按照任务优先级高低唤醒。</li>
</ol>
<p>在将任务插入等待列表中时，RTOS会调用_ipc_list_suspend()函数，其实现代码大致如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">rt_inline </span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_err_t</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> _ipc_list_suspend</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_list_t</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">        *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">                                     struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_thread </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">                                     rt_uint8_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">        flag</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_suspend</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    switch</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">flag</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    case</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_IPC_FLAG_FIFO</span><span style="--shiki-light:#999999;--shiki-dark:#666666">:</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_list_insert_before</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">thread</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">-></span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">tlist</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        break</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD"> /* RT_IPC_FLAG_FIFO */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    case</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_IPC_FLAG_PRIO</span><span style="--shiki-light:#999999;--shiki-dark:#666666">:</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        {</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">            struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_list_node </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">n</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">            struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_thread </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">sthread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">            for</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">n </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">next</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> n </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">!=</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> n </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> n</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">next</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">            {</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                sthread </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_list_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">n</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> struct</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> rt_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> tlist</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">                if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">current_priority</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x3C;</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> sthread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">current_priority</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">                {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">                    rt_list_insert_before</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">&#x26;</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">sthread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">tlist</span><span style="--shiki-light:#999999;--shiki-dark:#666666">),</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">tlist</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">                    break</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">                }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">            }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">            if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">n </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">==</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">                rt_list_insert_before</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">tlist</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        break</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* RT_IPC_FLAG_PRIO */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_EOK</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从这段代码可以看到，RT-Thread会根据创建信号量时指定的flag来组织等待队列。</p>
<ul>
<li>如果是RT_IPC_FLAG_FIFO，插入队列尾部。</li>
<li>如果是RT_IPC_FLAG_PRIO，按优先级插入排序；</li>
</ul>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，多个任务同时等待同一个信号量时，谁先被唤醒取决于等待队列的管理策略。</p>
<p>FIFO策略讲究先等待先唤醒，优点是公平，不会出现饥饿；优先级策略保证高优先级任务优先唤醒，优点是符合实时系统的设计目标，但可能出现低优先级任务饥饿的问题。在实际开发中，应根据项目的需求选择合适的策略。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


