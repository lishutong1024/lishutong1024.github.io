<template><div><p>当项目中使用RTOS后，程序出现问题时，排查分析的工作量有时会大幅增加。</p>
<p>例如，有同学遇到过这样的问题：</p>
<blockquote>
<p>程序正常跑了几天，然后突然死机，复位后又正常。经过反复地调试分析，才发现是任务栈溢出，导致系统崩溃死机。</p>
</blockquote>
<p>这种问题是最让人头疼的，尤其是问题很难复现，它往往在程序运行过程中不定时发生。</p>
<p>在这篇文章中，我将分析为什么栈溢出会导致程序崩溃、以及为什么程序不会立即崩溃，最后会给出几种检查方法。</p>
<h2 id="栈的作用" tabindex="-1"><a class="header-anchor" href="#栈的作用"><span>栈的作用</span></a></h2>
<p>简单来说，<strong>任务栈就是创建任务时分配的一段连续RAM，数据按后入先出（LIFO）的方式进出栈。</strong></p>
<p>CPU里通常有一个栈指针寄存器SP指向当前栈顶。在ARM Cortex-M架构中，采用满递减栈操作，压栈时先将SP减4，再将数据存入SP指向的位置，即SP指向压入栈中的最后一个数据单元。每次压入的栈数据单元大小为32位。</p>
<p>下面这张图展示了Cortex-M架构中递减栈的内存布局。</p>
<p><img src="@source/notes/tech/rtos100/task/images/q28/Cortex-M递减栈示意图.jpg" alt="Cortex-M递减栈示意图"></p>
<p><strong>栈常用来保存程序运行的返回地址、局部变量、临时数据。对于任务栈而言，还会在任务切换时保存任务的上下文</strong>。</p>
<p>再来看一下任务栈的整体内存布局。</p>
<p><img src="@source/notes/tech/rtos100/task/images/q28/栈内存布局图.jpg" alt="栈内存布局图"></p>
<p>由于栈从高地址向低地址生长，每调用一层函数就会压入一个栈帧。</p>
<p>SP指针始终指向当前栈顶的位置。如果栈继续向低地址生长，越过了栈区域的边界，就会发生栈溢出。</p>
<h2 id="栈溢出时会发生什么" tabindex="-1"><a class="header-anchor" href="#栈溢出时会发生什么"><span>栈溢出时会发生什么</span></a></h2>
<p>这里来看一个栈溢出的具体例子。</p>
<p>假设创建了一个任务A，并为该任务分配了1024字节的栈空间，代码如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 创建任务A，栈大小1024字节 */</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_thread_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> task_a </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_create</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">task_a</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                                       task_a_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                                       RT_NULL</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">                                       1024</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">   /* 栈大小 */</span></span>
<span class="line"><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">                                       10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">     /* 优先级 */</span></span>
<span class="line"><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">                                       10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 时间片 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">rt_thread_startup</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">task_a</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通常情况下，其任务函数平时只用几百字节栈。但是，在某些特殊情况下（如传感器读到0xAA），会分配一个很大的局部数组buffer：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task_a_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">param</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">        int</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> flag </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> read_sensor</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">        if</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">flag </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">==</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> 0x</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">AA</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* 很少执行到的分支 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        {</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">            char</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> buffer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">[</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">800</span><span style="--shiki-light:#999999;--shiki-dark:#666666">];</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* 大局部数组，一下吃掉800字节栈 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">            process_data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">buffer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> sizeof</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">buffer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">100</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>任务栈空间只有1024字节，加上函数调用栈帧和其他局部变量，再分配这个800字节的buffer，栈空间就不够用了。但编译器并不会检查这点，而是”傻傻地”在栈上为buffer分配空间。</p>
<p><img src="@source/notes/tech/rtos100/task/images/q28/栈溢出示意图.jpg" alt="栈溢出示意图"></p>
<p>此时，SP一路向低地址走，最后越过了栈区域的最低地址，将栈边界相邻的部分区域也作为buffer的空间。</p>
<p>这样一来，当buffer写到接近栈边界的位置时，就会将数据写到任务栈之外的空间。这些空间通常存放着其他重要的数据，比如：<strong>其他任务的栈</strong>、<strong>全局变量或消息队列缓冲区</strong>、<strong>某个任务的任务控制块</strong>等。</p>
<h2 id="为什么程序不会立即崩溃" tabindex="-1"><a class="header-anchor" href="#为什么程序不会立即崩溃"><span>为什么程序不会立即崩溃</span></a></h2>
<p>你可能会想：既然已经写到栈外空间了，很明显就是有问题啊，为什么程序不立即崩溃？</p>
<p>实际上，CPU并不知道任务栈是什么，它只是机械地进行压栈出栈。当溢出的那一刻，CPU当下执行的指令还是正常的，所以程序不会立刻出错。</p>
<p><strong>问题往往等到误写的那些内存被读取的时候才会爆发，而这中间可能隔了几毫秒，也可能隔了好几天。</strong></p>
<h2 id="如何尽早发现栈溢出" tabindex="-1"><a class="header-anchor" href="#如何尽早发现栈溢出"><span>如何尽早发现栈溢出</span></a></h2>
<p>为了有效地预防栈溢出问题，很多RTOS都提供了栈溢出检查的功能，方便我们在开发阶段对栈的使用情况进行检查。</p>
<p>以RT-Thread为例，最常用的方法是：注册栈溢出钩子函数。内核在每次任务切换时会检查栈指针是否还落在合法范围内，一旦越界就立刻调用这个钩子函数。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">#</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">include</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77"> &#x3C;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">rtthread.h</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">></span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 栈溢出钩子函数 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_stack_overflow_hook</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_thread_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_kprintf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">栈溢出: </span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">%s\n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">name</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">   /* 停在这里，用调试器看现场 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此外，我们还可以在代码中主动检查某个任务的栈使用情况。RT-Thread提供了rt_thread_check_stack函数，它会返回栈的历史最大使用量。我们可以通过该数值来判断给任务分配的栈空间是否够大。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">#</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">include</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77"> &#x3C;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">rtthread.h</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">></span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> check_stack_usage</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_thread_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> thread </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_self</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_uint32_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> used </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_check_stack</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_kprintf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">任务 </span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">%s</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D"> 栈已使用 </span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">%u</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D"> 字节</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">\n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">name</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> used</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，栈溢出的本质是任务栈空间不够用，导致栈指针越过边界覆盖了旁边的数据。</p>
<p>被覆盖的区域可能是别的任务栈、全局变量或任务控制块。当这些区域被读到时，就会出现返回地址错乱、指针失效等问题，最终导致程序崩溃死机。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


